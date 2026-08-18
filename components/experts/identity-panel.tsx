"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Input, Label, Select } from "@/components/ui/field";
import type {
  CapabilityEvidenceType,
  ExternalConnectionStatus,
  ExternalSourceType,
} from "@/lib/generated/prisma/enums";
import type { FieldVisibility } from "@/lib/domain/identity";
import {
  addAffiliationAction,
  addCapabilityAction,
  addCapabilityEvidenceAction,
  addExpertiseAction,
  addOrcidIdentifierAction,
  approveMergeAction,
  bulkSafeAcceptProposalsAction,
  claimProfileAction,
  computeIdentityMatchesAction,
  decideClaimAction,
  decideFieldProposalAction,
  grantConsentAction,
  revokeConsentAction,
  rollbackMergeAction,
  runMockEnrichmentAction,
  setFieldVisibilityAction,
  verifyAffiliationAction,
  verifyCapabilityAction,
} from "@/lib/actions/identity";

const ORCID_STATUS_LABEL: Record<ExternalConnectionStatus, string> = {
  ENTERED: "Tự nhập, chưa xác thực",
  MATCHED: "Đối sánh được, chưa xác thực",
  AUTHENTICATED: "Đã xác thực qua OAuth",
  DISPUTED: "Đang tranh chấp",
  REVOKED: "Đã thu hồi",
};

const ORCID_STATUS_BADGE: Record<ExternalConnectionStatus, "default" | "success" | "warning" | "danger"> = {
  ENTERED: "warning",
  MATCHED: "warning",
  AUTHENTICATED: "success",
  DISPUTED: "danger",
  REVOKED: "default",
};

const SOURCE_LABEL: Record<ExternalSourceType, string> = {
  ORCID: "ORCID",
  OPENALEX: "OpenAlex",
  CROSSREF: "Crossref/DOI",
  ROR: "ROR",
  ORG_WEBSITE: "Website tổ chức",
  INTERNAL: "Nguồn nội bộ",
  COMMERCIAL: "Nguồn thương mại",
};

const EVIDENCE_LABEL: Record<CapabilityEvidenceType, string> = {
  PUBLICATION: "Công bố",
  PROJECT: "Dự án",
  CERTIFICATE: "Chứng chỉ",
  PATENT: "Sáng chế",
  TECHNOLOGY: "Công nghệ",
  ORGANIZATION_VERIFICATION: "Tổ chức xác nhận",
};

const VISIBILITY_LABEL: Record<FieldVisibility, string> = {
  PRIVATE: "Chỉ mình tôi",
  ORGANIZATION: "Trong tổ chức",
  VI_CONNECT: "Mọi user VI CONNECT",
  PUBLIC: "Công khai",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase text-muted mb-3">{children}</h2>;
}

// ---------- ORCID (Mục 9.1) ----------

export function OrcidSection({
  expertProfileId,
  orcidValue,
  connectionStatus,
  canEdit,
  oauthConfigured,
  banner,
}: {
  expertProfileId: string;
  orcidValue: string | null;
  connectionStatus: ExternalConnectionStatus | null;
  canEdit: boolean;
  oauthConfigured: boolean;
  banner: { kind: "success" | "error"; message: string } | null;
}) {
  const [pending, startTransition] = useTransition();
  const [orcidInput, setOrcidInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionTitle>ORCID (Mục 9.1)</SectionTitle>

        {banner && (
          <p className={`text-sm ${banner.kind === "success" ? "text-accent" : "text-danger"}`}>
            {banner.message}
          </p>
        )}

        {orcidValue ? (
          <p className="text-sm">
            <span className="font-medium">{orcidValue}</span>{" "}
            {connectionStatus && (
              <Badge variant={ORCID_STATUS_BADGE[connectionStatus]}>
                {ORCID_STATUS_LABEL[connectionStatus]}
              </Badge>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted">Chưa liên kết ORCID.</p>
        )}

        {canEdit && connectionStatus !== "AUTHENTICATED" && (
          <div className="space-y-2">
            {oauthConfigured ? (
              <a href={`/api/integrations/orcid/connect?expertProfileId=${expertProfileId}`}>
                <Button size="sm">Kết nối ORCID qua OAuth thật (khuyến nghị)</Button>
              </a>
            ) : (
              <p className="text-xs text-muted">
                Server chưa cấu hình ORCID_CLIENT_ID/ORCID_CLIENT_SECRET nên chưa bật được OAuth thật —
                xem docs/adr/0001-ho-so-dinh-danh-tam-chot-tham-so.md Mục 8.
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input
                placeholder="0000-0002-1825-0097"
                value={orcidInput}
                onChange={(e) => {
                  setOrcidInput(e.target.value);
                  setError(null);
                }}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={pending || !orcidInput}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await addOrcidIdentifierAction(expertProfileId, orcidInput);
                      setOrcidInput("");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Không lưu được ORCID.");
                    }
                  })
                }
              >
                Nhập ORCID thủ công
              </Button>
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <p className="text-xs text-muted">
              Nhập thủ công chỉ ở trạng thái &quot;chưa xác thực&quot; — dùng nút OAuth ở trên để xác
              thực thật.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Consent ----------

type ConsentItem = {
  id: string;
  sourceType: ExternalSourceType;
  purpose: string;
  grantedAt: Date;
  revokedAt: Date | null;
};

export function ConsentSection({
  expertProfileId,
  consents,
  canEdit,
}: {
  expertProfileId: string;
  consents: ConsentItem[];
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [sourceType, setSourceType] = useState<ExternalSourceType>("ORCID");
  const [purpose, setPurpose] = useState("ENRICHMENT");

  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionTitle>Consent nguồn dữ liệu (Mục 3.2)</SectionTitle>
        {consents.length === 0 && <p className="text-sm text-muted">Chưa cấp consent nguồn nào.</p>}
        <ul className="space-y-2">
          {consents.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <span>
                {SOURCE_LABEL[c.sourceType]} — {c.purpose}{" "}
                {c.revokedAt ? (
                  <Badge variant="default">Đã thu hồi</Badge>
                ) : (
                  <Badge variant="success">Đang hoạt động</Badge>
                )}
              </span>
              {canEdit && !c.revokedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => startTransition(() => revokeConsentAction(c.id))}
                >
                  Thu hồi
                </Button>
              )}
            </li>
          ))}
        </ul>
        {canEdit && (
          <div className="flex items-end gap-2 pt-2 border-t border-border">
            <FieldGroup className="flex-1">
              <Label>Nguồn</Label>
              <Select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as ExternalSourceType)}
              >
                {Object.entries(SOURCE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup className="flex-1">
              <Label>Mục đích</Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="VD: ENRICHMENT"
              />
            </FieldGroup>
            <Button
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  void grantConsentAction(expertProfileId, sourceType, purpose);
                })
              }
            >
              Cấp consent
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Enrichment (mock) + Field proposals ----------

type ProposalItem = {
  id: string;
  fieldPath: string;
  proposedValue: unknown;
  confidence: number;
  sourceType: ExternalSourceType;
  extractionMethod: string | null;
  conflictFlags: string[];
};

export function EnrichmentAndProposalsSection({
  expertProfileId,
  proposals,
  canEdit,
}: {
  expertProfileId: string;
  proposals: ProposalItem[];
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Record<string, string>>({});

  if (!canEdit && proposals.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionTitle>Đề xuất từ nguồn ngoài (Mục 7.2)</SectionTitle>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void runMockEnrichmentAction(expertProfileId);
              })
            }
          >
            Chạy làm giàu hồ sơ (mock — chưa nối API thật, ADR-0001 Mục 8)
          </Button>
        )}

        {proposals.length === 0 ? (
          <p className="text-sm text-muted">Không có đề xuất đang chờ.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {proposals.map((p) => (
                <li key={p.id} className="border border-border rounded-md p-3 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.fieldPath}</span>
                    <span className="text-xs text-muted">
                      {SOURCE_LABEL[p.sourceType]} · confidence {(p.confidence * 100).toFixed(0)}%
                      {p.extractionMethod === "MOCK" && " · MOCK"}
                    </span>
                  </div>
                  <p>
                    Giá trị đề xuất: <span className="font-medium">{String(p.proposedValue)}</span>
                  </p>
                  {p.conflictFlags.length > 0 && (
                    <p className="text-xs text-danger">Xung đột: {p.conflictFlags.join(", ")}</p>
                  )}
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(() => decideFieldProposalAction(p.id, "ACCEPTED"))
                        }
                      >
                        Đồng ý
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          startTransition(() => decideFieldProposalAction(p.id, "REJECTED"))
                        }
                      >
                        Không đồng ý
                      </Button>
                      <Input
                        className="w-40"
                        placeholder="Giá trị điều chỉnh"
                        value={editing[p.id] ?? ""}
                        onChange={(e) => setEditing((s) => ({ ...s, [p.id]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending || !editing[p.id]}
                        onClick={() =>
                          startTransition(() =>
                            decideFieldProposalAction(p.id, "EDITED", editing[p.id])
                          )
                        }
                      >
                        Điều chỉnh
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {canEdit && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void bulkSafeAcceptProposalsAction(expertProfileId);
                  })
                }
              >
                Đồng ý tất cả đề xuất an toàn
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Expertise & Capability ----------

type ExpertiseItem = { id: string; label: string; source: string };
type CapabilityItem = {
  id: string;
  label: string;
  verificationStatus: string;
  evidence: { id: string; type: CapabilityEvidenceType; description: string }[];
};

export function ExpertiseCapabilitySection({
  expertProfileId,
  expertise,
  capabilities,
  canEdit,
  canVerify,
}: {
  expertProfileId: string;
  expertise: ExpertiseItem[];
  capabilities: CapabilityItem[];
  canEdit: boolean;
  canVerify: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [newExpertise, setNewExpertise] = useState("");
  const [newCapability, setNewCapability] = useState("");
  const [evidenceDraft, setEvidenceDraft] = useState<Record<string, string>>({});
  const [evidenceType, setEvidenceType] = useState<CapabilityEvidenceType>("PROJECT");

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <SectionTitle>Chuyên môn (Expertise)</SectionTitle>
          <div className="flex flex-wrap gap-1 mb-2">
            {expertise.map((e) => (
              <Badge key={e.id} variant="brand">
                {e.label}
              </Badge>
            ))}
            {expertise.length === 0 && <span className="text-sm text-muted">Chưa khai báo.</span>}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Input
                placeholder="Thêm lĩnh vực chuyên môn"
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
              />
              <Button
                size="sm"
                disabled={pending || !newExpertise}
                onClick={() =>
                  startTransition(async () => {
                    await addExpertiseAction(expertProfileId, newExpertise);
                    setNewExpertise("");
                  })
                }
              >
                Thêm
              </Button>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border">
          <SectionTitle>Năng lực (Capability) — cần bằng chứng mới được xác nhận</SectionTitle>
          <ul className="space-y-2">
            {capabilities.map((c) => (
              <li key={c.id} className="text-sm border border-border rounded-md p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.label}</span>
                  <Badge variant={c.verificationStatus === "VERIFIED" ? "success" : "default"}>
                    {c.verificationStatus === "VERIFIED" ? "Đã xác nhận" : "Chưa xác nhận"}
                  </Badge>
                </div>
                <ul className="text-xs text-muted list-disc list-inside">
                  {c.evidence.map((ev) => (
                    <li key={ev.id}>
                      {EVIDENCE_LABEL[ev.type]}: {ev.description}
                    </li>
                  ))}
                </ul>
                {canEdit && (
                  <div className="flex gap-2 items-center">
                    <Select
                      className="w-40"
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value as CapabilityEvidenceType)}
                    >
                      {Object.entries(EVIDENCE_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Mô tả bằng chứng"
                      value={evidenceDraft[c.id] ?? ""}
                      onChange={(e) => setEvidenceDraft((s) => ({ ...s, [c.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending || !evidenceDraft[c.id]}
                      onClick={() =>
                        startTransition(async () => {
                          await addCapabilityEvidenceAction(c.id, evidenceType, evidenceDraft[c.id]);
                          setEvidenceDraft((s) => ({ ...s, [c.id]: "" }));
                        })
                      }
                    >
                      Thêm bằng chứng
                    </Button>
                  </div>
                )}
                {canVerify && c.verificationStatus !== "VERIFIED" && (
                  <Button
                    size="sm"
                    disabled={pending || c.evidence.length === 0}
                    onClick={() => startTransition(() => verifyCapabilityAction(c.id))}
                  >
                    Xác nhận capability
                  </Button>
                )}
              </li>
            ))}
            {capabilities.length === 0 && <p className="text-sm text-muted">Chưa khai báo.</p>}
          </ul>
          {canEdit && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Thêm năng lực"
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
              />
              <Button
                size="sm"
                disabled={pending || !newCapability}
                onClick={() =>
                  startTransition(async () => {
                    await addCapabilityAction(expertProfileId, newCapability);
                    setNewCapability("");
                  })
                }
              >
                Thêm
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Affiliation ----------

type AffiliationItem = {
  id: string;
  organization: { id: string; name: string };
  position: string | null;
  isPrimary: boolean;
  verificationStatus: string;
};

export function AffiliationSection({
  expertProfileId,
  affiliations,
  organizations,
  canEdit,
  canVerify,
}: {
  expertProfileId: string;
  affiliations: AffiliationItem[];
  organizations: { id: string; name: string }[];
  canEdit: boolean;
  canVerify: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? "");
  const [position, setPosition] = useState("");

  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionTitle>Quan hệ với tổ chức (Mục 11) — nhiều affiliation, có lịch sử</SectionTitle>
        <ul className="space-y-2">
          {affiliations.map((a) => (
            <li key={a.id} className="text-sm flex items-center justify-between">
              <span>
                {a.organization.name} {a.position ? `— ${a.position}` : ""}{" "}
                {a.isPrimary && <Badge variant="brand">Chính</Badge>}{" "}
                <Badge variant={a.verificationStatus === "VERIFIED" ? "success" : "default"}>
                  {a.verificationStatus === "VERIFIED" ? "Đã xác nhận" : "Chưa xác nhận"}
                </Badge>
              </span>
              {canVerify && a.verificationStatus !== "VERIFIED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => startTransition(() => verifyAffiliationAction(a.id))}
                >
                  Xác nhận
                </Button>
              )}
            </li>
          ))}
          {affiliations.length === 0 && <p className="text-sm text-muted">Chưa có affiliation.</p>}
        </ul>
        {canEdit && organizations.length > 0 && (
          <div className="flex items-end gap-2 pt-2 border-t border-border">
            <FieldGroup className="flex-1">
              <Label>Tổ chức</Label>
              <Select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup className="flex-1">
              <Label>Chức danh</Label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="VD: Trưởng nhóm nghiên cứu"
              />
            </FieldGroup>
            <Button
              disabled={pending || !organizationId}
              onClick={() =>
                startTransition(async () => {
                  await addAffiliationAction(expertProfileId, organizationId, { position });
                  setPosition("");
                })
              }
            >
              Thêm
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Field visibility ----------

const VISIBILITY_FIELDS = ["headline", "bio", "email", "phone", "fundingNeed", "availability"];

export function VisibilitySection({
  expertProfileId,
  visibility,
  canEdit,
}: {
  expertProfileId: string;
  visibility: Record<string, FieldVisibility>;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [fieldPath, setFieldPath] = useState(VISIBILITY_FIELDS[0]);
  const [level, setLevel] = useState<FieldVisibility>("PUBLIC");

  if (!canEdit) return null;

  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionTitle>Quyền riêng tư theo trường (Mục 15)</SectionTitle>
        <ul className="text-sm space-y-1">
          {Object.entries(visibility).map(([field, v]) => (
            <li key={field}>
              {field}: <Badge variant="default">{VISIBILITY_LABEL[v]}</Badge>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <FieldGroup className="flex-1">
            <Label>Trường</Label>
            <Select value={fieldPath} onChange={(e) => setFieldPath(e.target.value)}>
              {VISIBILITY_FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup className="flex-1">
            <Label>Mức hiển thị</Label>
            <Select value={level} onChange={(e) => setLevel(e.target.value as FieldVisibility)}>
              {Object.entries(VISIBILITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(() => setFieldVisibilityAction(expertProfileId, fieldPath, level))
            }
          >
            Đặt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Claim ----------

export function ClaimSection({ expertProfileId }: { expertProfileId: string }) {
  const [pending, startTransition] = useTransition();
  const [requested, setRequested] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-2">
        <SectionTitle>Hồ sơ chưa có người nhận</SectionTitle>
        <p className="text-sm text-muted">
          Nếu đây là hồ sơ của bạn, gửi yêu cầu nhận để quản trị viên xác nhận (Mục 6.3).
        </p>
        <Button
          size="sm"
          disabled={pending || requested}
          onClick={() =>
            startTransition(async () => {
              await claimProfileAction(expertProfileId);
              setRequested(true);
            })
          }
        >
          {requested ? "Đã gửi yêu cầu" : "Đây là tôi — yêu cầu nhận hồ sơ"}
        </Button>
      </CardContent>
    </Card>
  );
}

type ClaimItem = { id: string; claimant: { name: string; email: string } };

export function AdminClaimsSection({ claims }: { claims: ClaimItem[] }) {
  const [pending, startTransition] = useTransition();
  if (claims.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-2">
        <SectionTitle>Yêu cầu nhận hồ sơ đang chờ</SectionTitle>
        <ul className="space-y-2">
          {claims.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <span>
                {c.claimant.name} ({c.claimant.email})
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => startTransition(() => decideClaimAction(c.id, true))}
                >
                  Duyệt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => startTransition(() => decideClaimAction(c.id, false))}
                >
                  Từ chối
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ---------- Identity match & merge ----------

type MatchItem = {
  id: string;
  otherProfile: { id: string; name: string; organizationName: string };
  score: number;
  status: string;
};

export function IdentityMatchSection({
  expertProfileId,
  matches,
  canMerge,
}: {
  expertProfileId: string;
  matches: MatchItem[];
  canMerge: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionTitle>Nghi ngờ trùng danh tính (Mục 9)</SectionTitle>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              void computeIdentityMatchesAction(expertProfileId);
            })
          }
        >
          Tính lại candidate trùng
        </Button>
        <ul className="space-y-2">
          {matches.map((m) => (
            <li key={m.id} className="text-sm border border-border rounded-md p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span>
                  {m.otherProfile.name} — {m.otherProfile.organizationName}
                </span>
                <Badge variant={m.status === "LIKELY_SAME" ? "warning" : "default"}>
                  {m.status} · {(m.score * 100).toFixed(0)}%
                </Badge>
              </div>
              {canMerge && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Lý do hợp nhất"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <Button
                    size="sm"
                    disabled={pending || !reason}
                    onClick={() =>
                      startTransition(() =>
                        approveMergeAction(m.otherProfile.id, expertProfileId, reason)
                      )
                    }
                  >
                    Hợp nhất vào hồ sơ này
                  </Button>
                </div>
              )}
            </li>
          ))}
          {matches.length === 0 && (
            <p className="text-sm text-muted">Chưa tính hoặc không có candidate trùng.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

type MergeHistoryItem = { id: string; sourceProfileName: string; reason: string; rolledBackAt: string | null };

export function MergeHistorySection({ merges }: { merges: MergeHistoryItem[] }) {
  const [pending, startTransition] = useTransition();
  if (merges.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-2">
        <SectionTitle>Lịch sử hợp nhất (có thể rollback)</SectionTitle>
        <ul className="space-y-2">
          {merges.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span>
                Từ {m.sourceProfileName} — {m.reason}{" "}
                {m.rolledBackAt && <Badge variant="danger">Đã rollback</Badge>}
              </span>
              {!m.rolledBackAt && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => startTransition(() => rollbackMergeAction(m.id))}
                >
                  Rollback
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
