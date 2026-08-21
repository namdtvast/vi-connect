import assert from "node:assert/strict";
import test from "node:test";
import { cosineSimilarity, parseEmbeddingResponse } from "../lib/integrations/embeddings";

test("cosineSimilarity: vector giống hệt nhau -> 1", () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
});

test("cosineSimilarity: vector vuông góc -> 0", () => {
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test("cosineSimilarity: vector rỗng hoặc magnitude 0 -> 0, không NaN", () => {
  assert.equal(cosineSimilarity([], []), 0);
  assert.equal(cosineSimilarity([0, 0], [1, 2]), 0);
});

test("cosineSimilarity: độ dài lệch nhau -> 0", () => {
  assert.equal(cosineSimilarity([1, 2], [1, 2, 3]), 0);
});

// Fixture rút gọn từ dạng phản hồi thật của Gemini embedContent.
test("parseEmbeddingResponse bóc tách đúng phản hồi hợp lệ", () => {
  const vector = parseEmbeddingResponse({ embedding: { values: [0.1, -0.2, 0.3] } });
  assert.deepEqual(vector, [0.1, -0.2, 0.3]);
});

test("parseEmbeddingResponse trả null khi thiếu/hỏng values", () => {
  assert.equal(parseEmbeddingResponse({}), null);
  assert.equal(parseEmbeddingResponse({ embedding: {} }), null);
  assert.equal(parseEmbeddingResponse({ embedding: { values: [] } }), null);
  assert.equal(parseEmbeddingResponse({ embedding: { values: ["a", "b"] } }), null);
  assert.equal(parseEmbeddingResponse(null), null);
});
