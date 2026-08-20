"use client";

import { useState, useTransition } from "react";
import {
  createAgreementAction,
  signAgreementAction,
  updateAgreementStatusAction,
} from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Input, Label, Select } from "@/components/ui/field";
import { AGREEMENT_STATUS_BADGE, AGREEMENT_STATUS_LABEL } from "@/lib/project-labels";
import { formatVnd, formatDate } from "@/lib/utils";
import type { AgreementStatus, AgreementType } from "@/lib/generated/prisma/enums";

const TYPE_LABEL: Record<AgreementType, string> = {
  MOU: "Biên bản ghi nhớ (MoU)",
  NDA: "Thỏa thuận bảo mật (NDA)",
  RESEARCH_AGREEMENT: "Thỏa thuận nghiên cứu",
  SERVICE_CONTRACT: "Hợp đồng dịch vụ",
  TECH_TRANSFER: "Hợp đồng chuyển giao công nghệ",
};

type Agreement = {
  type: AgreementType;
  status: AgreementStatus;
  valueVnd: bigint | null;
  signedAt: Date | null;
} | null;

export function AgreementPanel({
  projectId,
  agreement,
  canManage,
}: {
  projectId: string;
  agreement: Agreement;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      setError(null);
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể thực hiện thao tác.");
      }
    });

  if (!agreement) {
    if (!canManage) {
      return <p className="text-sm text-muted">Chưa khởi tạo hợp đồng / thỏa thuận.</p>;
    }
    return (
      <form
        action={(formData: FormData) =>
          run(() =>
            createAgreementAction(
              projectId,
              formData.get("type") as AgreementType,
              (formData.get("valueVnd") as string) || undefined
            )
          )
        }
        className="flex items-end gap-2"
      >
        <FieldGroup>
          <Label htmlFor="type">Loại hợp đồng / thỏa thuận</Label>
          <Select id="type" name="type" defaultValue="SERVICE_CONTRACT">
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="valueVnd">Giá trị (VNĐ)</Label>
          <Input id="valueVnd" name="valueVnd" type="number" min={0} placeholder="VD: 800.000.000" />
        </FieldGroup>
        <Button type="submit" size="sm" disabled={pending}>
          Khởi tạo
        </Button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{TYPE_LABEL[agreement.type]}</span>
        <Badge variant={AGREEMENT_STATUS_BADGE[agreement.status]}>
          {AGREEMENT_STATUS_LABEL[agreement.status]}
        </Badge>
      </div>
      {agreement.valueVnd && (
        <div className="text-sm text-muted">Giá trị: {formatVnd(agreement.valueVnd)}</div>
      )}
      {agreement.signedAt && (
        <div className="text-xs text-muted">Ký ngày: {formatDate(agreement.signedAt)}</div>
      )}
      {canManage && agreement.status === "DRAFT" && (
        <Button size="sm" disabled={pending} onClick={() => run(() => signAgreementAction(projectId))}>
          Ghi nhận đã ký
        </Button>
      )}
      {canManage && agreement.status === "SIGNED" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() => run(() => updateAgreementStatusAction(projectId, "COMPLETED"))}
          >
            Đánh dấu hoàn tất
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => updateAgreementStatusAction(projectId, "TERMINATED"))}
          >
            Chấm dứt
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted/70">
        Lưu ý: hiện chỉ theo dõi trạng thái hợp đồng, chưa xử lý thanh toán/giải
        ngân thật (thuộc cấu phần 08 — backlog).
      </p>
    </div>
  );
}
