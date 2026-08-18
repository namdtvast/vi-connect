/**
 * Adapter thật tới Crossref (https://api.crossref.org) — API mở, không cần
 * API key. Dùng để xác minh một DOI công bố thật khi chủ hồ sơ/admin thêm
 * bằng chứng loại PUBLICATION (VC-NV-011 Mục 12).
 */

export type CrossrefWork = {
  doi: string;
  title: string;
  authors: string[];
  containerTitle: string | null;
  year: number | null;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

/** Rút DOI từ chuỗi tự do (URL doi.org hoặc DOI trần) — hàm thuần. */
export function extractDoi(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/10\.\d{4,9}\/[^\s"<>]+/);
  return match ? match[0].replace(/[.,;]+$/, "") : null;
}

/** Bóc tách JSON Crossref `/works/{doi}` thành shape nội bộ — hàm thuần. */
export function parseCrossrefWork(raw: unknown): CrossrefWork | null {
  const root = asRecord(raw);
  const message = asRecord(root?.message);
  if (!message || typeof message.DOI !== "string") return null;

  const titleArr = Array.isArray(message.title) ? message.title : [];
  const title = typeof titleArr[0] === "string" ? titleArr[0] : "";
  if (!title) return null;

  const authorsArr = Array.isArray(message.author) ? message.author : [];
  const authors = authorsArr
    .map((a) => asRecord(a))
    .filter((a): a is JsonRecord => a !== null)
    .map((a) => [a.given, a.family].filter((p) => typeof p === "string").join(" ").trim())
    .filter((name) => name.length > 0);

  const containerArr = Array.isArray(message["container-title"]) ? message["container-title"] : [];
  const containerTitle = typeof containerArr[0] === "string" ? containerArr[0] : null;

  const published = asRecord(message.published);
  const dateParts = Array.isArray(published?.["date-parts"]) ? published["date-parts"][0] : null;
  const year = Array.isArray(dateParts) && typeof dateParts[0] === "number" ? dateParts[0] : null;

  return { doi: message.DOI, title, authors, containerTitle, year };
}

const CROSSREF_BASE = "https://api.crossref.org/works";

/** Tra cứu một công bố thật theo DOI — trả null nếu không tìm thấy hoặc lỗi mạng. */
export async function fetchCrossrefWorkByDoi(doi: string): Promise<CrossrefWork | null> {
  const mailto = process.env.OPENALEX_POLITE_POOL_EMAIL; // dùng chung email polite-pool nếu có
  const params = mailto ? `?mailto=${encodeURIComponent(mailto)}` : "";
  const url = `${CROSSREF_BASE}/${encodeURIComponent(doi)}${params}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return parseCrossrefWork(await res.json());
  } catch {
    return null;
  }
}
