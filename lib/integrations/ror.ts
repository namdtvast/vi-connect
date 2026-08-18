/**
 * Adapter thật tới ROR (https://api.ror.org) — API mở, không cần API key.
 * Dùng để đối sánh tổ chức nghiên cứu (VC-NV-011 Mục 10) — chỉ trả ứng viên
 * kèm tín hiệu, KHÔNG tự liên kết chỉ vì tên gần giống (Mục 6.1).
 */

export type RorOrganization = {
  rorId: string;
  name: string;
  acronyms: string[];
  country: string | null;
  website: string | null;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

function asRecordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => asRecord(v)).filter((v): v is JsonRecord => v !== null);
}

/** Bóc tách JSON ROR search thành shape nội bộ — hàm thuần, test được không cần mạng. */
export function parseRorSearchResults(raw: unknown): RorOrganization[] {
  const root = asRecord(raw);
  const items = asRecordArray(root?.items);

  return items
    .slice(0, 10)
    .map((item): RorOrganization => {
      const names = asRecordArray(item.names);
      const nameOfType = (type: string) =>
        names.find((n) => Array.isArray(n.types) && (n.types as unknown[]).includes(type));

      const primary =
        nameOfType("ror_display") ?? nameOfType("label") ?? names[0] ?? null;
      const acronyms = names
        .filter((n) => Array.isArray(n.types) && (n.types as unknown[]).includes("acronym"))
        .map((n) => n.value)
        .filter((v): v is string => typeof v === "string");

      const locations = asRecordArray(item.locations);
      const geonames = asRecord(locations[0]?.geonames_details);
      const country = typeof geonames?.country_name === "string" ? geonames.country_name : null;

      const links = asRecordArray(item.links);
      const website = links.find((l) => l.type === "website")?.value;

      return {
        rorId: typeof item.id === "string" ? item.id : "",
        name: typeof primary?.value === "string" ? primary.value : "",
        acronyms,
        country,
        website: typeof website === "string" ? website : null,
      };
    })
    .filter((o) => o.rorId.length > 0 && o.name.length > 0);
}

const ROR_BASE = "https://api.ror.org/v2/organizations";

/** Tìm tổ chức thật trên ROR theo tên — trả mảng rỗng nếu lỗi mạng, gọi ở call site phải tự xử lý fallback. */
export async function searchRorOrganizations(query: string): Promise<RorOrganization[]> {
  if (!query.trim()) return [];
  const url = `${ROR_BASE}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    return parseRorSearchResults(await res.json());
  } catch {
    return [];
  }
}
