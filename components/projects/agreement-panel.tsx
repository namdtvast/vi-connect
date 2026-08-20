"use client";

import { useTransition } from "react";
import { createAgreementAction, signAgreementAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Input, Label, Select } from "@/components/ui/field";
import { AGREEMENT_STATUS_LABEL } from "@/lib/project-labels";
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
}: {
  projectId: string;
  agreement: Agreement;
}) {
  const [pending, startTransition] = useTransition();

  if (!agreement) {
    return (
      <form
        action={(formData: FormData) =>
          startTransition(() =>
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
      </form>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{TYPE_LABEL[agreement.type]}</span>
        <Badge variant={agreement.status === "SIGNED" ? "success" : "warning"}>
          {AGREEMENT_STATUS_LABEL[agreement.status]}
        </Badge>
      </div>
      {agreement.valueVnd && (
        <div className="text-sm text-muted">Giá trị: {formatVnd(agreement.valueVnd)}</div>
      )}
      {agreement.signedAt && (
        <div className="text-xs text-muted">Ký ngày: {formatDate(agreement.signedAt)}</div>
      )}
      {agreement.status === "DRAFT" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => signAgreementAction(projectId))}
        >
          Ghi nhận đã ký
        </Button>
      )}
      <p className="text-xs text-muted/70">
        Lưu ý: hiện chỉ theo dõi trạng thái hợp đồng, chưa xử lý thanh toán/giải
        ngân thật (thuộc cấu phần 08 — backlog).
      </p>
    </div>
  );
}
