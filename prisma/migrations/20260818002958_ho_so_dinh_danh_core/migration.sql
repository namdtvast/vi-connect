-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('UNCLAIMED', 'CLAIMED', 'SUSPENDED', 'RETIRED', 'MERGED');

-- CreateEnum
CREATE TYPE "ExternalSourceType" AS ENUM ('ORCID', 'OPENALEX', 'CROSSREF', 'ROR', 'ORG_WEBSITE', 'INTERNAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "ExternalConnectionStatus" AS ENUM ('ENTERED', 'MATCHED', 'AUTHENTICATED', 'DISPUTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ProposalDecision" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EDITED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ExpertiseSource" AS ENUM ('SELF', 'AI_SUGGESTED', 'EVIDENCE');

-- CreateEnum
CREATE TYPE "CapabilityEvidenceType" AS ENUM ('PUBLICATION', 'PROJECT', 'CERTIFICATE', 'PATENT', 'TECHNOLOGY', 'ORGANIZATION_VERIFICATION');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdentityMatchStatus" AS ENUM ('POTENTIAL_DUPLICATE', 'LIKELY_SAME', 'CONFIRMED_SAME', 'DIFFERENT_PERSON', 'MERGED');

-- AlterTable
ALTER TABLE "ExpertProfile" ADD COLUMN     "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'CLAIMED',
ADD COLUMN     "visibility" JSONB,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "affiliationType" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "sourceType" "ExternalSourceType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "scopeNote" TEXT,
    "policyVersion" TEXT NOT NULL DEFAULT '1.0',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalConnection" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "sourceType" "ExternalSourceType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" "ExternalConnectionStatus" NOT NULL DEFAULT 'ENTERED',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ExternalConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldProposal" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "fieldPath" TEXT NOT NULL,
    "proposedValue" JSONB NOT NULL,
    "currentValueSnapshot" JSONB,
    "sourceType" "ExternalSourceType" NOT NULL,
    "sourceRecordId" TEXT,
    "sourceUrl" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractionMethod" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" TEXT,
    "conflictFlags" TEXT[],
    "decision" "ProposalDecision" NOT NULL DEFAULT 'PENDING',
    "decidedValue" JSONB,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FieldProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expertise" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "source" "ExpertiseSource" NOT NULL DEFAULT 'SELF',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityEvidence" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "type" "CapabilityEvidenceType" NOT NULL,
    "description" TEXT NOT NULL,
    "referenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapabilityEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileClaim" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "claimantUserId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityMatch" (
    "id" TEXT NOT NULL,
    "profileAId" TEXT NOT NULL,
    "profileBId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "signals" JSONB NOT NULL,
    "status" "IdentityMatchStatus" NOT NULL DEFAULT 'POTENTIAL_DUPLICATE',
    "algorithmVersion" TEXT NOT NULL DEFAULT 'adr-0001-v1',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MergeHistory" (
    "id" TEXT NOT NULL,
    "sourceProfileId" TEXT NOT NULL,
    "targetProfileId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "rollbackData" JSONB NOT NULL,
    "approvedById" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rolledBackAt" TIMESTAMP(3),
    "rolledBackById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MergeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Affiliation_expertProfileId_idx" ON "Affiliation"("expertProfileId");

-- CreateIndex
CREATE INDEX "Affiliation_organizationId_idx" ON "Affiliation"("organizationId");

-- CreateIndex
CREATE INDEX "Consent_expertProfileId_sourceType_idx" ON "Consent"("expertProfileId", "sourceType");

-- CreateIndex
CREATE INDEX "ExternalConnection_sourceType_externalId_idx" ON "ExternalConnection"("sourceType", "externalId");

-- CreateIndex
CREATE INDEX "ExternalConnection_expertProfileId_sourceType_idx" ON "ExternalConnection"("expertProfileId", "sourceType");

-- CreateIndex
CREATE INDEX "FieldProposal_expertProfileId_decision_idx" ON "FieldProposal"("expertProfileId", "decision");

-- CreateIndex
CREATE UNIQUE INDEX "Expertise_expertProfileId_label_key" ON "Expertise"("expertProfileId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_expertProfileId_label_key" ON "Capability"("expertProfileId", "label");

-- CreateIndex
CREATE INDEX "ProfileClaim_expertProfileId_status_idx" ON "ProfileClaim"("expertProfileId", "status");

-- CreateIndex
CREATE INDEX "IdentityMatch_status_idx" ON "IdentityMatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityMatch_profileAId_profileBId_key" ON "IdentityMatch"("profileAId", "profileBId");

-- CreateIndex
CREATE INDEX "MergeHistory_targetProfileId_idx" ON "MergeHistory"("targetProfileId");

-- CreateIndex
CREATE INDEX "ExpertProfile_profileStatus_idx" ON "ExpertProfile"("profileStatus");

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalConnection" ADD CONSTRAINT "ExternalConnection_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldProposal" ADD CONSTRAINT "FieldProposal_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expertise" ADD CONSTRAINT "Expertise_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capability" ADD CONSTRAINT "Capability_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityEvidence" ADD CONSTRAINT "CapabilityEvidence_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClaim" ADD CONSTRAINT "ProfileClaim_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClaim" ADD CONSTRAINT "ProfileClaim_claimantUserId_fkey" FOREIGN KEY ("claimantUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityMatch" ADD CONSTRAINT "IdentityMatch_profileAId_fkey" FOREIGN KEY ("profileAId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityMatch" ADD CONSTRAINT "IdentityMatch_profileBId_fkey" FOREIGN KEY ("profileBId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeHistory" ADD CONSTRAINT "MergeHistory_sourceProfileId_fkey" FOREIGN KEY ("sourceProfileId") REFERENCES "ExpertProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeHistory" ADD CONSTRAINT "MergeHistory_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "ExpertProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
