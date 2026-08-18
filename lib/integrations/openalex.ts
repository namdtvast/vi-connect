/**
 * Adapter thật tới OpenAlex (https://api.openalex.org) — API mở, không cần
 * API key. Theo khuyến nghị "polite pool" của OpenAlex, gắn `mailto` nếu có
 * biến môi trường OPENALEX_POLITE_POOL_EMAIL để giảm rủi ro bị giới hạn tốc
 * độ (VC-NV-011 Mục 6.1 — tuân thủ điều khoản/giới hạn nguồn ngoài).
 */

export type OpenAlexTopic = {
  displayName: string;
  fieldDisplayName: string;
};

export type OpenAlexAuthor = {
  openAlexId: string;
  displayName: string;
  worksCount: number;
  citedByCount: number;
  hIndex: number | null;
  topics: OpenAlexTopic[];
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

/** Bóc tách JSON OpenAlex thành shape nội bộ — hàm thuần, test được không cần mạng. */
export function parseOpenAlexAuthor(raw: unknown): OpenAlexAuthor | null {
  const r = asRecord(raw);
  if (!r || typeof r.id !== "string" || typeof r.display_name !== "string") return null;

  const topicsRaw = Array.isArray(r.topics) ? r.topics : [];
  const topics: OpenAlexTopic[] = topicsRaw
    .map((t) => asRecord(t))
    .filter((t): t is JsonRecord => t !== null)
    .slice(0, 5)
    .map((t) => {
      const field = asRecord(t.field);
      return {
        displayName: typeof t.display_name === "string" ? t.display_name : "",
        fieldDisplayName: field && typeof field.display_name === "string" ? field.display_name : "",
      };
    })
    .filter((t) => t.displayName.length > 0);

  const summaryStats = asRecord(r.summary_stats);

  return {
    openAlexId: r.id,
    displayName: r.display_name,
    worksCount: typeof r.works_count === "number" ? r.works_count : 0,
    citedByCount: typeof r.cited_by_count === "number" ? r.cited_by_count : 0,
    hIndex: summaryStats && typeof summaryStats.h_index === "number" ? summaryStats.h_index : null,
    topics,
  };
}

const OPENALEX_BASE = "https://api.openalex.org";

/** Gọi OpenAlex thật theo ORCID iD. Trả null nếu không tìm thấy hoặc lỗi mạng — gọi ở call site phải tự xử lý fallback. */
export async function fetchOpenAlexAuthorByOrcid(orcid: string): Promise<OpenAlexAuthor | null> {
  const mailto = process.env.OPENALEX_POLITE_POOL_EMAIL;
  const params = mailto ? `?mailto=${encodeURIComponent(mailto)}` : "";
  const url = `${OPENALEX_BASE}/authors/orcid:${encodeURIComponent(orcid)}${params}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return parseOpenAlexAuthor(await res.json());
  } catch {
    return null;
  }
}
