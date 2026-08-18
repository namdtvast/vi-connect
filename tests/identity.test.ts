import assert from "node:assert/strict";
import test from "node:test";
import {
  canVerifyCapability,
  canViewField,
  classifyIdentityMatch,
  isBulkSafeAccept,
  isValidOrcidChecksum,
  nameTokenSimilarity,
  resolveFieldVisibility,
  scoreIdentityMatch,
} from "../lib/domain/identity";

test("resolveFieldVisibility dùng mặc định Mục 15.2 khi chưa đặt riêng", () => {
  assert.equal(resolveFieldVisibility(null, "email"), "PRIVATE");
  assert.equal(resolveFieldVisibility(null, "fundingNeed"), "VI_CONNECT");
  assert.equal(resolveFieldVisibility(null, "headline"), "PUBLIC");
  assert.equal(resolveFieldVisibility({ headline: "PRIVATE" }, "headline"), "PRIVATE");
});

test("canViewField: chủ hồ sơ luôn xem được, PRIVATE chặn người khác", () => {
  assert.equal(canViewField({ isSelf: true, isAuthenticated: false, sameOrganization: false }, "PRIVATE"), true);
  assert.equal(canViewField({ isSelf: false, isAuthenticated: true, sameOrganization: true }, "PRIVATE"), false);
});

test("canViewField: ORGANIZATION chỉ cho cùng tổ chức, VI_CONNECT cần đăng nhập", () => {
  const viewer = { isSelf: false, isAuthenticated: true, sameOrganization: false };
  assert.equal(canViewField(viewer, "ORGANIZATION"), false);
  assert.equal(canViewField({ ...viewer, sameOrganization: true }, "ORGANIZATION"), true);
  assert.equal(canViewField(viewer, "VI_CONNECT"), true);
  assert.equal(canViewField({ ...viewer, isAuthenticated: false }, "VI_CONNECT"), false);
  assert.equal(canViewField({ ...viewer, isAuthenticated: false }, "PUBLIC"), true);
});

test("scoreIdentityMatch tổ hợp nhiều tín hiệu và cắt về [0,1]", () => {
  const allSignals = scoreIdentityMatch({
    orcidStatus: "AUTHENTICATED",
    sameEmailDomain: true,
    nameSimilarity: 1,
    sameOrganization: true,
  });
  assert.ok(allSignals.score <= 1);
  assert.equal(allSignals.score, 1);

  const noSignals = scoreIdentityMatch({});
  assert.equal(noSignals.score, 0);

  const orcidOnly = scoreIdentityMatch({ orcidStatus: "ENTERED_OR_MATCHED" });
  assert.equal(orcidOnly.score, 0.5);
});

test("classifyIdentityMatch dùng đúng ngưỡng ADR-0001 Mục 3", () => {
  assert.equal(classifyIdentityMatch(0.9), "LIKELY_SAME");
  assert.equal(classifyIdentityMatch(0.85), "LIKELY_SAME");
  assert.equal(classifyIdentityMatch(0.7), "POTENTIAL_DUPLICATE");
  assert.equal(classifyIdentityMatch(0.6), "POTENTIAL_DUPLICATE");
  assert.equal(classifyIdentityMatch(0.1), "DIFFERENT_PERSON");
});

test("nameTokenSimilarity không phân biệt hoa/thường/dấu", () => {
  assert.equal(nameTokenSimilarity("Dương Thành Nam", "duong thanh nam"), 1);
  assert.equal(nameTokenSimilarity("Nguyễn Văn A", "Trần Văn B"), 1 / 3);
  assert.equal(nameTokenSimilarity("", "Nguyễn Văn A"), 0);
});

test("isBulkSafeAccept từ chối trường nhạy cảm, confidence thấp hoặc có xung đột", () => {
  assert.equal(isBulkSafeAccept({ fieldPath: "headline", confidence: 0.95, conflictFlags: [] }), true);
  assert.equal(isBulkSafeAccept({ fieldPath: "email", confidence: 0.99, conflictFlags: [] }), false);
  assert.equal(isBulkSafeAccept({ fieldPath: "headline", confidence: 0.8, conflictFlags: [] }), false);
  assert.equal(
    isBulkSafeAccept({ fieldPath: "headline", confidence: 0.95, conflictFlags: ["name_mismatch"] }),
    false
  );
});

test("canVerifyCapability yêu cầu ít nhất một evidence", () => {
  assert.equal(canVerifyCapability(0), false);
  assert.equal(canVerifyCapability(1), true);
});

test("isValidOrcidChecksum đúng với ORCID mẫu chính thức, sai khi gõ nhầm", () => {
  assert.equal(isValidOrcidChecksum("0000-0002-1825-0097"), true);
  assert.equal(isValidOrcidChecksum("0000-0002-1825-0098"), false);
  assert.equal(isValidOrcidChecksum("khong-phai-orcid"), false);
});
