/**
 * Tra cứu thông tin người nộp thuế theo mã số thuế qua XInvoice
 * (https://xinvoice.vn/apis/tra-cuu-ma-so-thue) — dịch vụ bên thứ ba, không
 * phải API chính thức của Tổng cục Thuế (cổng chính thức tracuunnt.gdt.gov.vn
 * yêu cầu mã xác nhận/CAPTCHA nên không gọi tự động được). Cần đăng ký tại
 * xinvoice.vn để lấy XINVOICE_CLIENT_ID/XINVOICE_API_KEY — chủ repo tự đăng
 * ký, không phải AI (tạo tài khoản ngoài nằm ngoài phạm vi cho phép). Chưa
 * cấu hình thì các hàm dưới đây báo rõ, không giả vờ đã kết nối.
 */

export function isTaxLookupConfigured(): boolean {
  return Boolean(process.env.XINVOICE_CLIENT_ID && process.env.XINVOICE_API_KEY);
}

export type TaxPayerInfo = {
  taxId: string;
  name: string;
  address: string | null;
  orgType: string | null;
  status: string | null;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

/** Bóc tách JSON XInvoice thành shape nội bộ — hàm thuần, test được không cần mạng. */
export function parseTaxPayerResponse(raw: unknown): TaxPayerInfo | null {
  const r = asRecord(raw);
  if (!r) return null;
  const taxId = typeof r.taxID === "string" ? r.taxID : typeof r.taxId === "string" ? r.taxId : null;
  const name = typeof r.name === "string" ? r.name : null;
  if (!taxId || !name) return null;

  return {
    taxId,
    name,
    address: typeof r.address === "string" ? r.address : null,
    orgType: typeof r.orgType === "string" ? r.orgType : null,
    status: typeof r.status === "string" ? r.status : null,
  };
}

/** Gọi XInvoice thật để tra cứu 1 mã số thuế. Trả null nếu không tìm thấy. */
export async function lookupTaxCode(taxCode: string): Promise<TaxPayerInfo | null> {
  const clientId = process.env.XINVOICE_CLIENT_ID;
  const apiKey = process.env.XINVOICE_API_KEY;
  if (!clientId || !apiKey) {
    throw new Error("Chưa cấu hình XINVOICE_CLIENT_ID/XINVOICE_API_KEY.");
  }

  const res = await fetch(`https://api.xinvoice.vn/gdt-api/tax-payer/${encodeURIComponent(taxCode)}`, {
    headers: { "client-id": clientId, "api-key": apiKey },
    signal: AbortSignal.timeout(8000),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`XInvoice trả lỗi ${res.status} khi tra cứu mã số thuế.`);
  }

  const json = await res.json();
  return parseTaxPayerResponse(json);
}
