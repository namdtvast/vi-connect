"use client";

import { useActionState } from "react";
import { createEvaluationAction } from "@/lib/actions/evaluations";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";

type Evaluation = {
  id: string;
  score: number;
  criteria: string;
  note: string | null;
  createdAt: Date;
  evaluatedBy: { name: string };
};

const initialState: ActionState = {};

export function EvaluationPanel({
  projectId,
  evaluations,
  canManage,
}: {
  projectId: string;
  evaluations: Evaluation[];
  canManage: boolean;
}) {
  const action = createEvaluationAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {evaluations.map((e) => (
          <div key={e.id} className="rounded-md border border-border p-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={e.score >= 0.7 ? "success" : e.score >= 0.4 ? "warning" : "danger"}>
                {(e.score * 100).toFixed(0)}%
              </Badge>
              <span className="text-xs text-muted">
                {e.evaluatedBy.name} · {formatDate(e.createdAt)}
              </span>
            </div>
            <div className="text-sm font-medium mt-1">{e.criteria}</div>
            {e.note && <p className="text-sm text-muted mt-1">{e.note}</p>}
          </div>
        ))}
        {evaluations.length === 0 && (
          <p className="text-sm text-muted">Chưa có lượt đánh giá nào.</p>
        )}
      </div>

      {canManage && (
        <form action={formAction} className="space-y-3 pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="score">Điểm (0-100)</Label>
              <Input id="score" name="score" type="number" min={0} max={100} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="criteria">Tiêu chí đánh giá</Label>
              <Input
                id="criteria"
                name="criteria"
                placeholder="VD: Tiến độ, chất lượng hợp tác"
                required
              />
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
            <Textarea id="note" name="note" rows={2} />
          </FieldGroup>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Đang lưu..." : "Ghi nhận đánh giá"}
          </Button>
          <FormError>{state.error}</FormError>
        </form>
      )}
    </div>
  );
}
