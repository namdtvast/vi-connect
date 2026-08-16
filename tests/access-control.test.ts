import assert from "node:assert/strict";
import test from "node:test";
import {
  assertOrgScope,
  ForbiddenError,
} from "../lib/domain/access-control";

test("VAST_ADMIN được thao tác trên mọi tổ chức", () => {
  assert.doesNotThrow(() =>
    assertOrgScope({ role: "VAST_ADMIN", organizationId: null }, "org-2")
  );
});

test("HOI_ADMIN chỉ được thao tác trong tổ chức của mình", () => {
  assert.doesNotThrow(() =>
    assertOrgScope({ role: "HOI_ADMIN", organizationId: "org-1" }, "org-1")
  );
  assert.throws(
    () =>
      assertOrgScope({ role: "HOI_ADMIN", organizationId: "org-1" }, "org-2"),
    ForbiddenError
  );
});
