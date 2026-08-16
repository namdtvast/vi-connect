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
