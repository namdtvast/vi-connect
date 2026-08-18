"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ForbiddenError, assertOrgScope, requireRole, requireUser } from "@/lib/rbac";
import {
  canVerifyCapability,
  classifyIdentityMatch,
  isBulkSafeAccept,
  nameTokenSimilarity,
  scoreIdentityMatch,
  type FieldVisibility,
} from "@/lib/domain/identity";
import type {
  CapabilityEvidenceType,
  ExternalSourceType,
  ProfileStatus,
  ProposalDecision,
} from "@/lib/generated/prisma/enums";

/** Trường ExpertProfile mà FieldProposal có thể ghi trực tiếp khi được chấp nhận. */
const APPLICABLE_FIELDS = new Set([
  "headline",
  "bio",
  "title",
  "experienceYears",
  "publications",
  "patents",
]);

function coerceValueForField(fieldPath: string, value: string) {
  if (fieldPath === "experienceYears" || fieldPath === "publications" || fieldPath === "patents") {
    return { [fieldPath]: Number(value) };
  }
  return { [fieldPath]: value };
}

/**
 * Cho phép chủ hồ sơ TỰ thao tác, hoặc admin (VAST_ADMIN toàn hệ thống,
 * HOI_ADMIN đúng tổ chức của hồ sơ) thao tác THAY — theo yêu cầu bổ sung
 * quyền quản trị. `actingAsAdmin` dùng để ghi rõ vào AuditLog ai thực sự
 * bấm nút, tránh lẫn với dữ liệu chủ hồ sơ tự khai (VC-NV-011 Mục 3.4, 13.2).
 */
async function requireProfileOwnerOrAdmin(expertProfileId: string) {
  const user = await requireUser();
  const profile = await db.expertProfile.findUniqueOrThrow({ where: { id: expertProfileId } });

  const isOwner = profile.userId === user.id;
  const isAdmin =
    user.role === "VAST_ADMIN" ||
    (user.role === "HOI_ADMIN" && user.organizationId === profile.organizationId);

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("Chỉ chủ hồ sơ hoặc quản trị viên tổ chức mới thực hiện được thao tác này.");
  }

  return { user, profile, actingAsAdmin: !isOwner };
}

// ---------- Consent (VC-NV-011 Mục 3.2, 01.3) ----------

export async function grantConsentAction(
  expertProfileId: string,
  sourceType: ExternalSourceType,
  purpose: string,
  scopeNote?: string
) {
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const consent = await db.consent.create({
    data: { expertProfileId, sourceType, purpose, scopeNote },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CONSENT_GRANTED",
      entity: "Consent",
      entityId: consent.id,
      meta: { expertProfileId, sourceType, purpose, actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return consent;
}

export async function revokeConsentAction(consentId: string) {
  const consent = await db.consent.findUniqueOrThrow({ where: { id: consentId } });
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(consent.expertProfileId);

  await db.consent.update({ where: { id: consentId }, data: { revokedAt: new Date() } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CONSENT_REVOKED",
      entity: "Consent",
      entityId: consentId,
      meta: { actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${consent.expertProfileId}`);
}

// ---------- Enrichment MOCK (ADR-0001 Mục 8 — chưa nối API thật) ----------

export async function runMockEnrichmentAction(expertProfileId: string) {
  const { user, profile, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const activeConsent = await db.consent.findFirst({
    where: { expertProfileId, revokedAt: null },
  });
  if (!activeConsent) {
    throw new Error("Cần cấp consent cho ít nhất một nguồn trước khi làm giàu hồ sơ.");
  }

  const candidates: Array<{ fieldPath: string; proposedValue: string; confidence: number }> = [];

  if (!profile.headline) {
    candidates.push({
      fieldPath: "headline",
      proposedValue: `${profile.title ?? "Chuyên gia"} — ${profile.fields[0] ?? "đa lĩnh vực"}`,
      confidence: 0.92,
    });
  }
  if (!profile.publications) {
    candidates.push({ fieldPath: "publications", proposedValue: "3", confidence: 0.7 });
  }

  if (candidates.length === 0) {
    return [];
  }

  const created = await db.$transaction(
    candidates.map((c) =>
      db.fieldProposal.create({
        data: {
          expertProfileId,
          fieldPath: c.fieldPath,
          proposedValue: c.proposedValue,
          sourceType: activeConsent.sourceType,
          extractionMethod: "MOCK",
          confidence: c.confidence,
          conflictFlags: [],
        },
      })
    )
  );

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "ENRICHMENT_MOCK_RUN",
      entity: "ExpertProfile",
      entityId: expertProfileId,
      meta: { proposalCount: created.length, actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return created;
}

// ---------- Review đề xuất (VC-NV-011 Mục 7.2, 13) ----------

export async function decideFieldProposalAction(
  proposalId: string,
  decision: Extract<ProposalDecision, "ACCEPTED" | "REJECTED" | "EDITED">,
  editedValue?: string
) {
  const proposal = await db.fieldProposal.findUniqueOrThrow({ where: { id: proposalId } });
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(proposal.expertProfileId);

  if (proposal.decision !== "PENDING") {
    throw new Error("Đề xuất này đã được xử lý.");
  }
  if (decision === "EDITED" && !editedValue) {
    throw new Error("Cần nhập giá trị điều chỉnh.");
  }

  const finalValue =
    decision === "EDITED" ? (editedValue as string) : String(proposal.proposedValue);

  await db.$transaction(async (tx) => {
    await tx.fieldProposal.update({
      where: { id: proposalId },
      data: {
        decision,
        decidedValue: decision === "REJECTED" ? undefined : finalValue,
        decidedById: user.id,
        decidedAt: new Date(),
      },
    });

    if (decision !== "REJECTED" && APPLICABLE_FIELDS.has(proposal.fieldPath)) {
      await tx.expertProfile.update({
        where: { id: proposal.expertProfileId },
        data: coerceValueForField(proposal.fieldPath, finalValue),
      });
    }
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: `FIELD_PROPOSAL_${decision}`,
      entity: "FieldProposal",
      entityId: proposalId,
      meta: { actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${proposal.expertProfileId}`);
}

export async function bulkSafeAcceptProposalsAction(expertProfileId: string) {
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const pending = await db.fieldProposal.findMany({
    where: { expertProfileId, decision: "PENDING" },
  });

  const safe = pending.filter((p) =>
    isBulkSafeAccept({ fieldPath: p.fieldPath, confidence: p.confidence, conflictFlags: p.conflictFlags })
  );

  for (const proposal of safe) {
    const finalValue = String(proposal.proposedValue);
    await db.$transaction(async (tx) => {
      await tx.fieldProposal.update({
        where: { id: proposal.id },
        data: { decision: "ACCEPTED", decidedValue: finalValue, decidedById: user.id, decidedAt: new Date() },
      });
      if (APPLICABLE_FIELDS.has(proposal.fieldPath)) {
        await tx.expertProfile.update({
          where: { id: expertProfileId },
          data: coerceValueForField(proposal.fieldPath, finalValue),
        });
      }
    });
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "FIELD_PROPOSAL_BULK_SAFE_ACCEPT",
      entity: "ExpertProfile",
      entityId: expertProfileId,
      meta: { acceptedCount: safe.length, actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return safe.length;
}

// ---------- Claim (VC-NV-011 Mục 6.3, 01.10) ----------

export async function claimProfileAction(expertProfileId: string) {
  const user = await requireUser();

  const profile = await db.expertProfile.findUniqueOrThrow({ where: { id: expertProfileId } });
  if (profile.userId) {
    throw new Error("Hồ sơ này đã có người nhận.");
  }

  const existingClaim = await db.profileClaim.findFirst({
    where: { expertProfileId, status: "PENDING" },
  });
  if (existingClaim) {
    throw new Error("Hồ sơ này đang có yêu cầu nhận chờ xử lý.");
  }

  const claim = await db.profileClaim.create({
    data: { expertProfileId, claimantUserId: user.id },
  });

  await db.auditLog.create({
    data: { userId: user.id, action: "PROFILE_CLAIM_REQUESTED", entity: "ProfileClaim", entityId: claim.id },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return claim;
}

export async function decideClaimAction(claimId: string, approve: boolean) {
  const claim = await db.profileClaim.findUniqueOrThrow({ where: { id: claimId } });
  const profile = await db.expertProfile.findUniqueOrThrow({ where: { id: claim.expertProfileId } });
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN");
  assertOrgScope(user, profile.organizationId);

  if (claim.status !== "PENDING") {
    throw new Error("Yêu cầu nhận hồ sơ này đã được xử lý.");
  }

  if (approve) {
    const claimantProfile = await db.expertProfile.findUnique({
      where: { userId: claim.claimantUserId },
    });
    if (claimantProfile) {
      throw new Error(
        "Người yêu cầu đã có hồ sơ chuyên gia — dùng luồng Identity Match/Merge thay vì claim trực tiếp."
      );
    }
  }

  await db.$transaction(async (tx) => {
    await tx.profileClaim.update({
      where: { id: claimId },
      data: { status: approve ? "APPROVED" : "REJECTED", decidedById: user.id, decidedAt: new Date() },
    });

    if (approve) {
      await tx.expertProfile.update({
        where: { id: claim.expertProfileId },
        data: { userId: claim.claimantUserId, profileStatus: "CLAIMED" },
      });
    }
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: approve ? "PROFILE_CLAIM_APPROVED" : "PROFILE_CLAIM_REJECTED",
      entity: "ProfileClaim",
      entityId: claimId,
    },
  });

  revalidatePath(`/dashboard/experts/${claim.expertProfileId}`);
}

// ---------- Field Visibility (VC-NV-011 Mục 15) ----------

export async function setFieldVisibilityAction(
  expertProfileId: string,
  fieldPath: string,
  visibility: FieldVisibility
) {
  const { user, profile, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const current = (profile.visibility as Record<string, FieldVisibility> | null) ?? {};
  const next = { ...current, [fieldPath]: visibility };

  await db.expertProfile.update({ where: { id: expertProfileId }, data: { visibility: next } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "FIELD_VISIBILITY_SET",
      entity: "ExpertProfile",
      entityId: expertProfileId,
      meta: { fieldPath, visibility, actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
}

// ---------- Affiliation (VC-NV-011 Mục 11) ----------

export async function addAffiliationAction(
  expertProfileId: string,
  organizationId: string,
  input: { department?: string; position?: string; affiliationType?: string; isPrimary?: boolean }
) {
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const affiliation = await db.affiliation.create({
    data: {
      expertProfileId,
      organizationId,
      department: input.department,
      position: input.position,
      affiliationType: input.affiliationType,
      isPrimary: input.isPrimary ?? false,
      source: actingAsAdmin ? "ADMIN_ON_BEHALF" : "SELF",
    },
  });

  if (affiliation.isPrimary) {
    await db.expertProfile.update({ where: { id: expertProfileId }, data: { organizationId } });
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "AFFILIATION_ADDED",
      entity: "Affiliation",
      entityId: affiliation.id,
      meta: { actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return affiliation;
}

export async function verifyAffiliationAction(affiliationId: string) {
  const affiliation = await db.affiliation.findUniqueOrThrow({ where: { id: affiliationId } });
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN");
  assertOrgScope(user, affiliation.organizationId);

  await db.affiliation.update({
    where: { id: affiliationId },
    data: { verificationStatus: "VERIFIED", verifiedById: user.id, verifiedAt: new Date() },
  });

  await db.auditLog.create({
    data: { userId: user.id, action: "AFFILIATION_VERIFIED", entity: "Affiliation", entityId: affiliationId },
  });

  revalidatePath(`/dashboard/experts/${affiliation.expertProfileId}`);
}

// ---------- Expertise & Capability (VC-NV-011 Mục 12) ----------

export async function addExpertiseAction(expertProfileId: string, label: string) {
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const expertise = await db.expertise.create({
    data: { expertProfileId, label, source: "SELF", confirmedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "EXPERTISE_ADDED",
      entity: "Expertise",
      entityId: expertise.id,
      meta: { actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return expertise;
}

export async function addCapabilityAction(expertProfileId: string, label: string) {
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(expertProfileId);

  const capability = await db.capability.create({ data: { expertProfileId, label } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CAPABILITY_ADDED",
      entity: "Capability",
      entityId: capability.id,
      meta: { actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${expertProfileId}`);
  return capability;
}

export async function addCapabilityEvidenceAction(
  capabilityId: string,
  type: CapabilityEvidenceType,
  description: string,
  referenceUrl?: string
) {
  const capability = await db.capability.findUniqueOrThrow({ where: { id: capabilityId } });
  const { user, actingAsAdmin } = await requireProfileOwnerOrAdmin(capability.expertProfileId);

  const evidence = await db.capabilityEvidence.create({
    data: { capabilityId, type, description, referenceUrl },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CAPABILITY_EVIDENCE_ADDED",
      entity: "CapabilityEvidence",
      entityId: evidence.id,
      meta: { actingAsAdmin },
    },
  });

  revalidatePath(`/dashboard/experts/${capability.expertProfileId}`);
  return evidence;
}

export async function verifyCapabilityAction(capabilityId: string) {
  const capability = await db.capability.findUniqueOrThrow({
    where: { id: capabilityId },
    include: { evidence: true, expertProfile: true },
  });
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN");
  assertOrgScope(user, capability.expertProfile.organizationId);

  if (!canVerifyCapability(capability.evidence.length)) {
    throw new Error("Capability cần ít nhất một bằng chứng trước khi được xác nhận.");
  }

  await db.capability.update({ where: { id: capabilityId }, data: { verificationStatus: "VERIFIED" } });

  await db.auditLog.create({
    data: { userId: user.id, action: "CAPABILITY_VERIFIED", entity: "Capability", entityId: capabilityId },
  });

  revalidatePath(`/dashboard/experts/${capability.expertProfileId}`);
}

// ---------- Identity resolution & merge (VC-NV-011 Mục 9, ADR-0001 Mục 3, 5) ----------

export async function computeIdentityMatchesAction(expertProfileId: string) {
  const user = await requireRole("VAST_ADMIN", "HOI_ADMIN");

  const profile = await db.expertProfile.findUniqueOrThrow({
    where: { id: expertProfileId },
    include: { identifiers: true, user: true },
  });
  assertOrgScope(user, profile.organizationId);

  const orcid = profile.identifiers.find((i) => i.type === "ORCID")?.value;

  const candidates = await db.expertProfile.findMany({
    where: {
      id: { not: expertProfileId },
      profileStatus: { not: "MERGED" },
      OR: orcid
        ? [
            { organizationId: profile.organizationId },
            { identifiers: { some: { type: "ORCID", value: orcid } } },
          ]
        : [{ organizationId: profile.organizationId }],
    },
    include: { identifiers: true, user: true },
  });

  const matchIds: string[] = [];

  for (const candidate of candidates) {
    const candidateOrcid = candidate.identifiers.find((i) => i.type === "ORCID")?.value;
    const orcidMatches = Boolean(orcid && candidateOrcid && orcid === candidateOrcid);

    const breakdown = scoreIdentityMatch({
      orcidStatus: orcidMatches ? "ENTERED_OR_MATCHED" : null,
      sameOrganization: candidate.organizationId === profile.organizationId,
      nameSimilarity: nameTokenSimilarity(
        profile.user?.name ?? profile.headline ?? "",
        candidate.user?.name ?? candidate.headline ?? ""
      ),
    });

    const status = classifyIdentityMatch(breakdown.score);
    if (status === "DIFFERENT_PERSON") continue;

    const [profileAId, profileBId] = [expertProfileId, candidate.id].sort();

    const match = await db.identityMatch.upsert({
      where: { profileAId_profileBId: { profileAId, profileBId } },
      create: { profileAId, profileBId, score: breakdown.score, signals: breakdown.signals, status },
      update: { score: breakdown.score, signals: breakdown.signals, status },
    });
    matchIds.push(match.id);
  }

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "IDENTITY_MATCH_COMPUTED",
      entity: "ExpertProfile",
      entityId: expertProfileId,
      meta: { matchCount: matchIds.length },
    },
  });

  return matchIds;
}

type MergeSnapshot = {
  targetSnapshot: {
    bio: string | null;
    headline: string | null;
    title: string | null;
    fields: string[];
    skills: string[];
    experienceYears: number | null;
    publications: number | null;
    patents: number | null;
  };
  movedIdentifierIds: string[];
  movedAffiliationIds: string[];
  previousSourceStatus: ProfileStatus;
};

export async function approveMergeAction(
  sourceProfileId: string,
  targetProfileId: string,
  reason: string
) {
  const user = await requireRole("VAST_ADMIN");

  if (sourceProfileId === targetProfileId) {
    throw new Error("Không thể hợp nhất một hồ sơ với chính nó.");
  }

  const [source, target] = await Promise.all([
    db.expertProfile.findUniqueOrThrow({
      where: { id: sourceProfileId },
      include: { identifiers: true, affiliations: true },
    }),
    db.expertProfile.findUniqueOrThrow({ where: { id: targetProfileId } }),
  ]);

  if (source.profileStatus === "MERGED") {
    throw new Error("Hồ sơ nguồn đã được hợp nhất trước đó.");
  }

  const snapshot: MergeSnapshot = {
    targetSnapshot: {
      bio: target.bio,
      headline: target.headline,
      title: target.title,
      fields: target.fields,
      skills: target.skills,
      experienceYears: target.experienceYears,
      publications: target.publications,
      patents: target.patents,
    },
    movedIdentifierIds: source.identifiers.map((i) => i.id),
    movedAffiliationIds: source.affiliations.map((a) => a.id),
    previousSourceStatus: source.profileStatus,
  };

  await db.$transaction(async (tx) => {
    if (snapshot.movedIdentifierIds.length > 0) {
      await tx.identifier.updateMany({
        where: { id: { in: snapshot.movedIdentifierIds } },
        data: { expertProfileId: targetProfileId },
      });
    }
    if (snapshot.movedAffiliationIds.length > 0) {
      await tx.affiliation.updateMany({
        where: { id: { in: snapshot.movedAffiliationIds } },
        data: { expertProfileId: targetProfileId },
      });
    }

    await tx.expertProfile.update({
      where: { id: targetProfileId },
      data: {
        bio: target.bio ?? source.bio,
        headline: target.headline ?? source.headline,
        title: target.title ?? source.title,
        fields: Array.from(new Set([...target.fields, ...source.fields])),
        skills: Array.from(new Set([...target.skills, ...source.skills])),
        experienceYears: target.experienceYears ?? source.experienceYears,
        publications: (target.publications ?? 0) + (source.publications ?? 0),
        patents: (target.patents ?? 0) + (source.patents ?? 0),
      },
    });

    await tx.expertProfile.update({
      where: { id: sourceProfileId },
      data: { profileStatus: "MERGED" },
    });

    await tx.identityMatch.updateMany({
      where: {
        OR: [
          { profileAId: sourceProfileId, profileBId: targetProfileId },
          { profileAId: targetProfileId, profileBId: sourceProfileId },
        ],
      },
      data: { status: "MERGED" },
    });

    await tx.mergeHistory.create({
      data: { sourceProfileId, targetProfileId, reason, rollbackData: snapshot, approvedById: user.id },
    });
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "PROFILE_MERGED",
      entity: "ExpertProfile",
      entityId: targetProfileId,
      meta: { sourceProfileId },
    },
  });

  revalidatePath(`/dashboard/experts/${targetProfileId}`);
  revalidatePath(`/dashboard/experts/${sourceProfileId}`);
}

export async function rollbackMergeAction(mergeHistoryId: string) {
  const user = await requireRole("VAST_ADMIN");

  const merge = await db.mergeHistory.findUniqueOrThrow({ where: { id: mergeHistoryId } });
  if (merge.rolledBackAt) {
    throw new Error("Lần hợp nhất này đã được rollback trước đó.");
  }

  const snapshot = merge.rollbackData as unknown as MergeSnapshot;

  await db.$transaction(async (tx) => {
    if (snapshot.movedIdentifierIds.length > 0) {
      await tx.identifier.updateMany({
        where: { id: { in: snapshot.movedIdentifierIds } },
        data: { expertProfileId: merge.sourceProfileId },
      });
    }
    if (snapshot.movedAffiliationIds.length > 0) {
      await tx.affiliation.updateMany({
        where: { id: { in: snapshot.movedAffiliationIds } },
        data: { expertProfileId: merge.sourceProfileId },
      });
    }

    await tx.expertProfile.update({
      where: { id: merge.targetProfileId },
      data: { ...snapshot.targetSnapshot },
    });

    await tx.expertProfile.update({
      where: { id: merge.sourceProfileId },
      data: { profileStatus: snapshot.previousSourceStatus },
    });

    await tx.mergeHistory.update({
      where: { id: mergeHistoryId },
      data: { rolledBackAt: new Date(), rolledBackById: user.id },
    });
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "PROFILE_MERGE_ROLLED_BACK",
      entity: "MergeHistory",
      entityId: mergeHistoryId,
    },
  });

  revalidatePath(`/dashboard/experts/${merge.sourceProfileId}`);
  revalidatePath(`/dashboard/experts/${merge.targetProfileId}`);
}
