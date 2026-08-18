/**
 * Quy tắc nghiệp vụ thuần cho cấu phần 01 — Hồ sơ & Định danh (VC-NV-011 v2.0).
 * Tham số dưới đây theo docs/adr/0001-ho-so-dinh-danh-tam-chot-tham-so.md — TẠM/DEMO,
 * chưa phải quyết định chính thức của Product Owner.
 */

// ---------- Field Visibility (VC-NV-011 Mục 15) ----------

export type FieldVisibility = "PRIVATE" | "ORGANIZATION" | "VI_CONNECT" | "PUBLIC";

/** Mặc định theo Mục 15.2 khi hồ sơ chưa tự đặt visibility cho trường đó. */
const SENSITIVE_FIELD_DEFAULTS: Record<string, FieldVisibility> = {
  email: "PRIVATE",
  phone: "PRIVATE",
  fundingNeed: "VI_CONNECT",
  availability: "VI_CONNECT",
};

const DEFAULT_FIELD_VISIBILITY: FieldVisibility = "PUBLIC";

export function resolveFieldVisibility(
  visibilityMap: Record<string, FieldVisibility> | null | undefined,
  fieldPath: string
): FieldVisibility {
  if (visibilityMap && fieldPath in visibilityMap) return visibilityMap[fieldPath];
  return SENSITIVE_FIELD_DEFAULTS[fieldPath] ?? DEFAULT_FIELD_VISIBILITY;
}

export type FieldViewer = {
  isSelf: boolean;
  isAuthenticated: boolean;
  sameOrganization: boolean;
};

/**
 * Field Visibility là trục độc lập, cộng gộp với Data Scope của VC-KT-002 —
 * hàm này giả định server đã qua được assertOrgScope/assertPartyScope trước
 * (bản ghi được phép đọc); ở đây chỉ quyết định TRƯỜNG cụ thể có trả về
 * không (VC-NV-011 Mục 15.1).
 */
export function canViewField(viewer: FieldViewer, visibility: FieldVisibility): boolean {
  if (viewer.isSelf) return true;
  switch (visibility) {
    case "PRIVATE":
      return false;
    case "ORGANIZATION":
      return viewer.sameOrganization;
    case "VI_CONNECT":
      return viewer.isAuthenticated;
    case "PUBLIC":
      return true;
  }
}

// ---------- Identity Resolution (VC-NV-011 Mục 9, ADR-0001 Mục 3) ----------

export type IdentitySignals = {
  orcidStatus?: "AUTHENTICATED" | "ENTERED_OR_MATCHED" | null;
  sameEmailDomain?: boolean;
  /** 0..1, đã tính sẵn ở caller — dùng nameTokenSimilarity() bên dưới. */
  nameSimilarity?: number;
  sameOrganization?: boolean;
};

export type IdentityMatchStatus =
  | "POTENTIAL_DUPLICATE"
  | "LIKELY_SAME"
  | "CONFIRMED_SAME"
  | "DIFFERENT_PERSON"
  | "MERGED";

const IDENTITY_WEIGHTS = {
  orcidAuthenticated: 0.9,
  orcidEnteredOrMatched: 0.5,
  sameEmailDomain: 0.3,
  nameSimilarityMax: 0.3,
  sameOrganization: 0.2,
};

export type IdentityScoreBreakdown = {
  score: number;
  signals: Record<string, number>;
};

/** Tổ hợp tuyến tính nhiều tín hiệu, cắt về [0,1] — không dùng 1 tín hiệu duy nhất. */
export function scoreIdentityMatch(signals: IdentitySignals): IdentityScoreBreakdown {
  const contributions: Record<string, number> = {};

  if (signals.orcidStatus === "AUTHENTICATED") {
    contributions.orcid = IDENTITY_WEIGHTS.orcidAuthenticated;
  } else if (signals.orcidStatus === "ENTERED_OR_MATCHED") {
    contributions.orcid = IDENTITY_WEIGHTS.orcidEnteredOrMatched;
  }

  if (signals.sameEmailDomain) {
    contributions.emailDomain = IDENTITY_WEIGHTS.sameEmailDomain;
  }

  if (typeof signals.nameSimilarity === "number") {
    const clamped = Math.max(0, Math.min(1, signals.nameSimilarity));
    contributions.name = clamped * IDENTITY_WEIGHTS.nameSimilarityMax;
  }

  if (signals.sameOrganization) {
    contributions.organization = IDENTITY_WEIGHTS.sameOrganization;
  }

  const raw = Object.values(contributions).reduce((sum, v) => sum + v, 0);
  return { score: Math.max(0, Math.min(1, raw)), signals: contributions };
}

export function classifyIdentityMatch(score: number): IdentityMatchStatus {
  if (score >= 0.85) return "LIKELY_SAME";
  if (score >= 0.6) return "POTENTIAL_DUPLICATE";
  return "DIFFERENT_PERSON";
}

/** So khớp tên theo token, không phân biệt hoa/thường/dấu (ADR-0001 Mục 3). */
export function nameTokenSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

  const tokensA = new Set(normalize(a));
  const tokensB = new Set(normalize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  for (const t of tokensA) if (tokensB.has(t)) overlap += 1;

  return overlap / Math.max(tokensA.size, tokensB.size);
}

// ---------- Field proposal review (VC-NV-011 Mục 7.2, ADR-0001 Mục 2) ----------

const SENSITIVE_PROPOSAL_ROOT_FIELDS = new Set(["email", "phone", "identifier", "affiliation"]);

export type FieldProposalSafety = {
  fieldPath: string;
  confidence: number;
  conflictFlags: string[];
};

/**
 * "Đồng ý tất cả đề xuất an toàn" chỉ áp dụng cho trường không nhạy cảm,
 * confidence cao và không có conflict — không bao giờ cho trường ảnh hưởng
 * quyền/danh tính (VC-NV-011 Mục 7.2).
 */
export function isBulkSafeAccept(proposal: FieldProposalSafety): boolean {
  if (proposal.conflictFlags.length > 0) return false;
  if (proposal.confidence < 0.9) return false;
  const rootField = proposal.fieldPath.split(".")[0];
  if (SENSITIVE_PROPOSAL_ROOT_FIELDS.has(rootField)) return false;
  return true;
}

// ---------- Capability evidence (VC-NV-011 Mục 12, ADR-0001 Mục 4) ----------

/** Capability chỉ được xác nhận (VERIFIED) khi có ít nhất một evidence — không có ngoại lệ ở v1. */
export function canVerifyCapability(evidenceCount: number): boolean {
  return evidenceCount >= 1;
}

// ---------- ORCID (VC-NV-011 Mục 9.1) ----------

/**
 * Kiểm tra checksum ISO 7064 mod 11-2 của ORCID iD (không gọi mạng) — chặn
 * giá trị sai định dạng/gõ nhầm trước khi lưu, không thay thế xác thực OAuth.
 */
export function isValidOrcidChecksum(orcid: string): boolean {
  const digits = orcid.replace(/-/g, "");
  if (!/^\d{15}[\dX]$/.test(digits)) return false;

  let total = 0;
  for (let i = 0; i < 15; i++) {
    total = (total + Number(digits[i])) * 2;
  }
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const expected = result === 10 ? "X" : String(result);
  return digits[15] === expected;
}
