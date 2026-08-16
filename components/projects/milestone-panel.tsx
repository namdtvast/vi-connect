"use client";

import { useActionState, useTransition } from "react";
import { addMilestoneAction, setMilestoneStatusAction } from "@/lib/actions/projects";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, FormError, Input, Label } from "@/components/ui/field";
import { MILESTONE_BADGE, MILESTONE_STATUS_LABEL } from "@/lib/project-labels";
import { formatDate } from "@/lib/utils";
import type { MilestoneStatus } from "@/lib/generated/prisma/enums";

type Milestone = {
  id: string;
  title: string;
  dueDate: Date | null;
  status: MilestoneStatus;
};

const initialState: ActionState = {};

const NEXT_STATUS: Partial<Record<MilestoneStatus, MilestoneStatus>> = {
  PLANNED: "IN_PROGRESS",
  IN_PROGRESS: "SUBMITTED",
  SUBMITTED: "ACCEPTED",
};

function MilestoneRow({ projectId, milestone }: { projectId: string; milestone: Milestone }) {
  const [pending, startTransition] = useTransition();
  const next = NEXT_STATUS[milestone.status];

  return (
    <div className="flex items-center justify-between border-t border-border py-2 first:border-t-0">
      <div>
        <div className="text-sm font-medium">{milestone.title}</div>
        {milestone.dueDate && (
          <div className="text-xs text-muted">Hạn: {formatDate(milestone.dueDate)}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={MILESTONE_BADGE[milestone.status]}>
          {MILESTONE_STATUS_LABEL[milestone.status]}
        </Badge>
        {next && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(() => setMilestoneStatusAction(projectId, milestone.id, next))
            }
          >
            → {MILESTONE_STATUS_LABEL[next]}
          </Button>
        )}
      </div>
    </div>
  );
}

export function MilestonePanel({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) {
  const action = addMilestoneAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="space-y-4">
      <div>
        {milestones.map((m) => (
          <MilestoneRow key={m.id} projectId={projectId} milestone={m} />
        ))}
        {milestones.length === 0 && (
          <p className="text-sm text-muted">Chưa có mốc thực hiện nào.</p>
        )}
      </div>

      <form action={formAction} className="flex items-end gap-2 pt-2 border-t border-border">
        <FieldGroup className="flex-1">
          <Label htmlFor="title">Thêm mốc mới</Label>
          <Input id="title" name="title" placeholder="Tên mốc thực hiện" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="dueDate">Hạn</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </FieldGroup>
        <Button type="submit" size="sm" disabled={pending}>
          Thêm
        </Button>
      </form>
      <FormError>{state.error}</FormError>
    </div>
  );
}
