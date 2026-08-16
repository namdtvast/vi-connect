"use client";

import { useActionState } from "react";
import { createNeedAction } from "@/lib/actions/matching";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";

const initialState: ActionState = {};

export function CreateNeedForm() {
  const [state, formAction, pending] = useActionState(createNeedAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="title">Tiêu đề nhu cầu / bài toán</Label>
        <Input id="title" name="title" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea id="description" name="description" rows={3} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="budgetVnd">Ngân sách dự kiến (VNĐ, không bắt buộc)</Label>
        <Input id="budgetVnd" name="budgetVnd" type="number" min={0} />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực liên quan</Label>
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
        {pending ? "Đang đăng..." : "Đăng nhu cầu"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã đăng.</span>}
    </form>
  );
}
