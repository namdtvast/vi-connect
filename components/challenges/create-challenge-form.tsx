"use client";

import { useActionState } from "react";
import { createChallengeAction } from "@/lib/actions/challenges";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";

const initialState: ActionState = {};

export function CreateChallengeForm() {
  const [state, formAction, pending] = useActionState(createChallengeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="title">Tên bài toán</Label>
        <Input id="title" name="title" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="problem">Mô tả vấn đề / hiện trạng</Label>
        <Textarea id="problem" name="problem" rows={3} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="goal">Mục tiêu cần đạt</Label>
        <Textarea id="goal" name="goal" rows={2} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="budgetVnd">Ngân sách (VNĐ, để trống nếu chưa có)</Label>
        <Input id="budgetVnd" name="budgetVnd" type="number" min={0} />
      </FieldGroup>
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
        {pending ? "Đang công bố..." : "Công bố bài toán"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã công bố.</span>}
    </form>
  );
}
