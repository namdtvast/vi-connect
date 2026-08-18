"use client";

import { useActionState } from "react";
import { createOrganizationAction } from "@/lib/actions/organizations";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { ORG_TYPE_LABEL } from "@/lib/org-labels";

const initialState: ActionState = {};

export function CreateOrgForm() {
  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialState
  );

  return (
    <form action={formAction} className="grid md:grid-cols-2 gap-4">
      <FieldGroup>
        <Label htmlFor="name">Tên đầy đủ</Label>
        <Input id="name" name="name" placeholder="VD: Liên hiệp Hội Khoa học và Kỹ thuật TP. Hà Nội" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="shortName">Tên viết tắt</Label>
        <Input id="shortName" name="shortName" placeholder="VD: LHH Hà Nội" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="type">Loại hình</Label>
        <Select id="type" name="type" defaultValue="HOI_THANH_VIEN">
          {Object.entries(ORG_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="province">Tỉnh / thành phố</Label>
        <Input id="province" name="province" placeholder="VD: Hà Nội" />
      </FieldGroup>
      <FieldGroup className="md:col-span-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" name="description" rows={2} placeholder="Chức năng, lĩnh vực hoạt động chính..." />
      </FieldGroup>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Thêm tổ chức"}
        </Button>
        {state.success && (
          <span className="text-sm text-accent">Đã thêm tổ chức.</span>
        )}
      </div>
      <div className="md:col-span-2">
        <FormError>{state.error}</FormError>
      </div>
    </form>
  );
}
