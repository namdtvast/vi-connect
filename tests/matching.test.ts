import assert from "node:assert/strict";
import test from "node:test";
import {
  scoreNeedAgainstExpert,
  scoreNeedAgainstSupply,
} from "../lib/matching";

test("supply cùng lĩnh vực được ưu tiên và có giải thích", () => {
  const result = scoreNeedAgainstSupply(
    {
      title: "Quan trắc chất lượng nước",
      description: "Cần hệ thống cảm biến giám sát nước liên tục",
      fields: ["WATER", "IOT"],
    },
    {
      title: "Cảm biến IoT chất lượng nước",
      description: "Giám sát nước liên tục bằng cảm biến",
      fields: ["WATER", "IOT"],
      trl: 6,
    }
  );

  assert.ok(result.score > 0.7);
  assert.equal(result.reasons.length, 3);
  assert.match(result.reasons[0].detail, /WATER/);
});

test("điểm matching luôn nằm trong miền 0..1", () => {
  const result = scoreNeedAgainstExpert(
    { title: "Pin", description: "Lưu trữ năng lượng", fields: ["ENERGY"] },
    {
      bio: null,
      fields: [],
      skills: [],
      verificationStatus: "UNVERIFIED",
      experienceYears: null,
    }
  );

  assert.ok(result.score >= 0 && result.score <= 1);
  assert.equal(result.reasons.length, 4);
});

test("scoreNeedAgainstSupply kèm semanticSimilarity: thêm 1 reason, trọng số vẫn = 1.0", () => {
  const need = {
    title: "Quan trắc chất lượng nước",
    description: "Cần hệ thống cảm biến giám sát nước liên tục",
    fields: ["WATER", "IOT"],
  };
  const supply = {
    title: "Cảm biến IoT chất lượng nước",
    description: "Giám sát nước liên tục bằng cảm biến",
    fields: ["WATER", "IOT"],
    trl: 6,
  };

  const withoutAi = scoreNeedAgainstSupply(need, supply);
  const withAi = scoreNeedAgainstSupply(need, supply, { semanticSimilarity: 0.8 });

  assert.equal(withAi.reasons.length, withoutAi.reasons.length + 1);
  const semantic = withAi.reasons.find((r) => r.factor === "semantic_similarity");
  assert.ok(semantic);
  assert.match(semantic!.detail, /80%/);

  const totalWeight = withAi.reasons.reduce((sum, r) => sum + r.weight, 0);
  assert.ok(Math.abs(totalWeight - 1) < 1e-9);
});

test("scoreNeedAgainstExpert kèm semanticSimilarity: thêm 1 reason, trọng số vẫn = 1.0", () => {
  const need = { title: "Pin", description: "Lưu trữ năng lượng", fields: ["ENERGY"] };
  const expert = {
    bio: "Chuyên gia pin lithium",
    fields: ["ENERGY"],
    skills: ["pin", "năng lượng"],
    verificationStatus: "VERIFIED",
    experienceYears: 10,
  };

  const withoutAi = scoreNeedAgainstExpert(need, expert);
  const withAi = scoreNeedAgainstExpert(need, expert, { semanticSimilarity: 0.6 });

  assert.equal(withAi.reasons.length, withoutAi.reasons.length + 1);
  const semantic = withAi.reasons.find((r) => r.factor === "semantic_similarity");
  assert.ok(semantic);

  const totalWeight = withAi.reasons.reduce((sum, r) => sum + r.weight, 0);
  assert.ok(Math.abs(totalWeight - 1) < 1e-9);
});
