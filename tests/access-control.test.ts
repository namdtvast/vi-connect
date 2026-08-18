import assert from "node:assert/strict";
import test from "node:test";
import {
  assertOrgScope,
  assertPartyScope,
  ForbiddenError,
  partyOrganizationIdsOfMatch,
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

test("ENTERPRISE chỉ được thao tác trong tổ chức của mình", () => {
  assert.doesNotThrow(() =>
    assertOrgScope({ role: "ENTERPRISE", organizationId: "org-1" }, "org-1")
  );
  assert.throws(
    () =>
      assertOrgScope(
        { role: "ENTERPRISE", organizationId: "org-1" },
        "org-2"
      ),
    ForbiddenError
  );
});

test("EXPERT/VIEWER không có org scope dù organizationId khớp", () => {
  assert.throws(
    () => assertOrgScope({ role: "EXPERT", organizationId: "org-1" }, "org-1"),
    ForbiddenError
  );
  assert.throws(
    () => assertOrgScope({ role: "VIEWER", organizationId: "org-1" }, "org-1"),
    ForbiddenError
  );
});

test("partyOrganizationIdsOfMatch gom đúng tổ chức bên Need, Supply, Expert", () => {
  assert.deepEqual(
    partyOrganizationIdsOfMatch({
      need: { organizationId: "org-need" },
      supply: { organizationId: "org-supply" },
      expertProfile: { organizationId: "org-expert" },
    }),
    ["org-need", "org-supply", "org-expert"]
  );

  assert.deepEqual(
    partyOrganizationIdsOfMatch({
      need: { organizationId: "org-need" },
      supply: null,
      expertProfile: null,
    }),
    ["org-need"]
  );

  assert.deepEqual(partyOrganizationIdsOfMatch(null), []);
});

test("assertPartyScope cho phép tổ chức ở bên cung (Supply/Expert), không chỉ bên Need", () => {
  const partyOrgIds = partyOrganizationIdsOfMatch({
    need: { organizationId: "org-need" },
    supply: { organizationId: "org-supply" },
    expertProfile: null,
  });

  assert.doesNotThrow(() =>
    assertPartyScope({ role: "HOI_ADMIN", organizationId: "org-need" }, partyOrgIds)
  );
  assert.doesNotThrow(() =>
    assertPartyScope(
      { role: "ENTERPRISE", organizationId: "org-supply" },
      partyOrgIds
    )
  );
  assert.throws(
    () =>
      assertPartyScope(
        { role: "HOI_ADMIN", organizationId: "org-khac" },
        partyOrgIds
      ),
    ForbiddenError
  );
  assert.doesNotThrow(() =>
    assertPartyScope({ role: "VAST_ADMIN", organizationId: null }, [])
  );
});
