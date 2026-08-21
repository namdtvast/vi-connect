/**
 * Embedding ngữ nghĩa (gemini-embedding-001) qua Google Gemini API — free tier
 * qua Google AI Studio (aistudio.google.com). Chủ repo tự đăng ký lấy
 * GEMINI_API_KEY, không phải AI (tạo tài khoản ngoài nằm ngoài phạm vi cho
 * phép, cùng nguyên tắc với lib/integrations/tax-lookup.ts). Chưa cấu hình
 * thì lib/matching.ts vẫn chạy đúng như trước — module này chỉ là tín hiệu
 * BỔ SUNG, không phải điều kiện bắt buộc để ghép nối hoạt động.
 *
 * embedText không bao giờ throw: mọi lỗi mạng/timeout/HTTP/parse đều trả về
 * null để lib/actions/matching.ts có thể fallback im lặng về điểm số xác
 * định (deterministic) hiện có.
 */

export const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;

export function isEmbeddingsConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

/** Bóc tách JSON phản hồi embedContent thành vector số — hàm thuần, test được không cần mạng. */
export function parseEmbeddingResponse(raw: unknown): number[] | null {
  const r = asRecord(raw);
  const embedding = asRecord(r?.embedding);
  const values = embedding?.values;
  if (!Array.isArray(values) || values.length === 0) return null;
  if (!values.every((v) => typeof v === "number")) return null;
  return values as number[];
}

/** Gọi Gemini để lấy vector embedding của 1 đoạn text. Trả null nếu chưa cấu hình hoặc lỗi. */
export async function embedText(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${EMBEDDING_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return parseEmbeddingResponse(json);
  } catch {
    return null;
  }
}

/** Độ tương đồng cosine giữa 2 vector, trong miền [-1, 1]. Trả 0 thay vì NaN cho input suy biến. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
