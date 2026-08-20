"use client";

import { useActionState } from "react";
import { createSupplyAction } from "@/lib/actions/matching";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { FieldsCheckboxGrid } from "@/components/ui/fields-checkbox-grid";

const initialState: ActionState = {};

const TYPE_LABEL: Record<string, string> = {
  TECHNOLOGY: "Công nghệ",
  SOLUTION: "Giải pháp",
  EXPERT_SERVICE: "Dịch vụ chuyên gia",
  PATENT: "Sáng chế",
};

export function CreateSupplyForm() {
  const [state, formAction, pending] = useActionState(createSupplyAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="title">Tên công nghệ / giải pháp</Label>
        <Input id="title" name="title" placeholder="VD: Cảm biến IoT giám sát chất lượng nước" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Mô tả tính năng, ưu điểm, mức độ sẵn sàng ứng dụng..."
          required
        />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <Label htmlFor="type">Loại</Label>
          <Select id="type" name="type" defaultValue="TECHNOLOGY">
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="trl">TRL (1-9, không bắt buộc)</Label>
          <Input id="trl" name="trl" type="number" min={1} max={9} placeholder="VD: 7" />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Lĩnh vực</Label>
        <FieldsCheckboxGrid />
      </FieldGroup>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang đăng..." : "Đăng công nghệ / giải pháp"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã đăng.</span>}
    </form>
  );
}
