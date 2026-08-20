"use client";

import { useActionState } from "react";
import { createFundingSourceAction } from "@/lib/actions/funding";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FieldsCheckboxGrid } from "@/components/ui/fields-checkbox-grid";

const initialState: ActionState = {};

export function CreateFundingSourceForm() {
  const [state, formAction, pending] = useActionState(
    createFundingSourceAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="name">Tên nguồn lực / chương trình tài trợ</Label>
        <Input id="name" name="name" placeholder="VD: Quỹ Đổi mới công nghệ quốc gia (NATIF)" required />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực ưu tiên</Label>
        <FieldsCheckboxGrid />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="note">Ghi chú (điều kiện, quy mô, đầu mối liên hệ...)</Label>
        <Textarea
          id="note"
          name="note"
          rows={2}
          placeholder="VD: Tài trợ tối đa 30% chi phí dự án, liên hệ: 024-xxxx-xxxx"
        />
      </FieldGroup>
      <FormError>{state.error}</FormError>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Thêm nguồn lực"}
        </Button>
        {state.success && (
          <span className="text-sm text-accent">Đã thêm nguồn lực/tài trợ.</span>
        )}
      </div>
    </form>
  );
}
