// Explainable local matching engine (cấu phần 05, phạm vi hiện tại).
// No external AI/LLM API — deterministic scoring so every suggestion can show
// *why* it was made (yêu cầu 5.2 "giải thích lý do đề xuất"). The interface
// (score 0..1 + structured `reasons`) is designed so a real embedding/LLM
// model can be swapped in later without changing callers.

export type MatchReason = {
  factor: string;
  weight: number;
  detail: string;
};

export type ScoreResult = {
  score: number;
  reasons: MatchReason[];
};

const STOPWORDS = new Set([
  "va",
  "cua",
  "cho",
  "la",
  "de",
  "trong",
  "voi",
  "mot",
  "các",
  "và",
  "của",
  "cho",
  "là",
  "để",
  "trong",
  "với",
  "một",
  "the",
  "and",
  "for",
  "of",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function fieldOverlap(a: string[], b: string[]): { score: number; shared: string[] } {
  const setA = new Set(a);
  const setB = new Set(b);
  const shared = [...setA].filter((f) => setB.has(f));
  const union = new Set([...setA, ...setB]).size;
  return { score: union === 0 ? 0 : shared.length / union, shared };
}

export function scoreNeedAgainstSupply(
  need: { title: string; description: string; fields: string[] },
  supply: { title: string; description: string; fields: string[]; trl: number | null }
): ScoreResult {
  const reasons: MatchReason[] = [];

  const fo = fieldOverlap(need.fields, supply.fields);
  reasons.push({
    factor: "field_overlap",
    weight: 0.55,
    detail:
      fo.shared.length > 0
        ? `Trùng lĩnh vực: ${fo.shared.join(", ")}`
        : "Không có lĩnh vực trùng khớp trực tiếp",
  });

  const kw = jaccard(
    tokenize(`${need.title} ${need.description}`),
    tokenize(`${supply.title} ${supply.description}`)
  );
  reasons.push({
    factor: "keyword_overlap",
    weight: 0.35,
    detail: `Độ tương đồng từ khóa mô tả: ${(kw * 100).toFixed(0)}%`,
  });

  let trlScore = 0.5; // neutral when unknown
  if (supply.trl) {
    trlScore = 1 - Math.min(1, Math.abs(supply.trl - 6) / 8);
    reasons.push({
      factor: "trl_readiness",
      weight: 0.1,
      detail: `Mức độ sẵn sàng công nghệ (TRL) = ${supply.trl}`,
    });
  }

  const score = fo.score * 0.55 + kw * 0.35 + trlScore * 0.1;
  return { score: Math.round(score * 1000) / 1000, reasons };
}

export function scoreNeedAgainstExpert(
  need: { title: string; description: string; fields: string[] },
  expert: {
    bio: string | null;
    fields: string[];
    skills: string[];
    verificationStatus: string;
    experienceYears: number | null;
  }
): ScoreResult {
  const reasons: MatchReason[] = [];

  const fo = fieldOverlap(need.fields, expert.fields);
  reasons.push({
    factor: "field_overlap",
    weight: 0.5,
    detail:
      fo.shared.length > 0
        ? `Trùng lĩnh vực chuyên môn: ${fo.shared.join(", ")}`
        : "Không có lĩnh vực trùng khớp trực tiếp",
  });

  const kw = jaccard(
    tokenize(`${need.title} ${need.description}`),
    tokenize(`${expert.bio ?? ""} ${expert.skills.join(" ")}`)
  );
  reasons.push({
    factor: "keyword_overlap",
    weight: 0.3,
    detail: `Độ tương đồng từ khóa với hồ sơ: ${(kw * 100).toFixed(0)}%`,
  });

  const verifiedBonus = expert.verificationStatus === "VERIFIED" ? 1 : 0.4;
  reasons.push({
    factor: "verification",
    weight: 0.1,
    detail:
      expert.verificationStatus === "VERIFIED"
        ? "Hồ sơ đã được xác minh bởi tổ chức"
        : "Hồ sơ chưa được xác minh — ưu tiên thấp hơn",
  });

  const expScore = Math.min(1, (expert.experienceYears ?? 0) / 15);
  reasons.push({
    factor: "experience",
    weight: 0.1,
    detail: `Kinh nghiệm: ${expert.experienceYears ?? 0} năm`,
  });

  const score =
    fo.score * 0.5 + kw * 0.3 + verifiedBonus * 0.1 + expScore * 0.1;
  return { score: Math.round(score * 1000) / 1000, reasons };
}
