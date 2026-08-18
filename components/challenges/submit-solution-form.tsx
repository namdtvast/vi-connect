"use client";

import { useActionState } from "react";
import { submitSolutionAction } from "@/lib/actions/challenges";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Label, Textarea } from "@/components/ui/field";

const initialState: ActionState = {};

export function SubmitSolutionForm({ challengeId }: { challengeId: string }) {
  const action = submitSolutionAction.bind(null, challengeId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <FieldGroup>
        <Label htmlFor="summary">Tóm tắt giải pháp</Label>
        <Textarea id="summary" name="summary" rows={2} placeholder="Tóm tắt ngắn gọn giải pháp đề xuất..." required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="approach">Cách tiếp cận</Label>
        <Textarea
          id="approach"
          name="approach"
          rows={3}
          placeholder="Mô tả phương pháp, công nghệ sử dụng, các bước triển khai..."
          required
        />
      </FieldGroup>
      <FormError>{state.error}</FormError>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Đang gửi..." : "Nộp giải pháp"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã nộp.</span>}
    </form>
  );
}
