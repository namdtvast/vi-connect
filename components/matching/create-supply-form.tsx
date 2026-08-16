"use client";

import { useActionState } from "react";
import { createSupplyAction } from "@/lib/actions/matching";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";

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
        <Input id="title" name="title" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" name="description" rows={3} required />
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
          <Input id="trl" name="trl" type="number" min={1} max={9} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Lĩnh vực</Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {FIELDS.map((f) => (
            <label key={f.code} className="flex items-center gap-2">
              <input type="checkbox" name="fields" value={f.code} />
              {f.label}
            </label>
          ))}
        </div>
      </FieldGroup>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang đăng..." : "Đăng công nghệ / giải pháp"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã đăng.</span>}
    </form>
  );
}
