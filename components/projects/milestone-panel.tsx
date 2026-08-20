"use client";

import { useActionState, useState, useTransition } from "react";
import {
  acceptDeliverableAction,
  addDeliverableAction,
  addMilestoneAction,
  setMilestoneStatusAction,
} from "@/lib/actions/projects";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, FormError, Input, Label } from "@/components/ui/field";
import { MILESTONE_BADGE, MILESTONE_STATUS_LABEL } from "@/lib/project-labels";
import { formatDate } from "@/lib/utils";
import type { MilestoneStatus } from "@/lib/generated/prisma/enums";

type Deliverable = {
  id: string;
  title: string;
  fileUrl: string | null;
  accepted: boolean;
};

type Milestone = {
  id: string;
  title: string;
  dueDate: Date | null;
  status: MilestoneStatus;
  deliverables: Deliverable[];
};

const initialState: ActionState = {};

const NEXT_STATUS: Partial<Record<MilestoneStatus, MilestoneStatus>> = {
  PLANNED: "IN_PROGRESS",
  IN_PROGRESS: "SUBMITTED",
  SUBMITTED: "ACCEPTED",
};

function isOverdue(milestone: Milestone): boolean {
  return (
    !!milestone.dueDate &&
    milestone.dueDate.getTime() < Date.now() &&
    milestone.status !== "SUBMITTED" &&
    milestone.status !== "ACCEPTED"
  );
}

function DeliverableRow({
  deliverable,
  canManage,
}: {
  deliverable: Deliverable;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between gap-2 pl-4 py-1 text-sm">
      <div className="min-w-0">
        <span>{deliverable.title}</span>
        {deliverable.fileUrl && (
          <a
            href={deliverable.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline ml-2 text-xs"
          >
            Xem tệp
          </a>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {deliverable.accepted ? (
          <Badge variant="success">Đã nghiệm thu</Badge>
        ) : (
          <>
            <Badge>Chờ nghiệm thu</Badge>
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    try {
                      await acceptDeliverableAction(deliverable.id);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Không thể nghiệm thu.");
                    }
                  })
                }
              >
                Nghiệm thu
              </Button>
            )}
          </>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function AddDeliverableForm({ milestoneId }: { milestoneId: string }) {
  const action = addDeliverableAction.bind(null, milestoneId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex items-end gap-2 pl-4 pt-1">
      <FieldGroup className="flex-1">
        <Input name="title" placeholder="Tên sản phẩm bàn giao" required />
      </FieldGroup>
      <FieldGroup className="flex-1">
        <Input name="fileUrl" placeholder="Đường dẫn tệp (không bắt buộc)" />
      </FieldGroup>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Nộp
      </Button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}

function MilestoneRow({
  projectId,
  milestone,
  canManage,
}: {
  projectId: string;
  milestone: Milestone;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next = NEXT_STATUS[milestone.status];
  const overdue = isOverdue(milestone);

  return (
    <div className="border-t border-border py-2 first:border-t-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{milestone.title}</div>
          {milestone.dueDate && (
            <div className="text-xs text-muted">Hạn: {formatDate(milestone.dueDate)}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={overdue ? "danger" : MILESTONE_BADGE[milestone.status]}>
            {overdue ? "Quá hạn" : MILESTONE_STATUS_LABEL[milestone.status]}
          </Badge>
          {canManage && next && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  try {
                    await setMilestoneStatusAction(projectId, milestone.id, next);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
                  }
                })
              }
            >
              → {MILESTONE_STATUS_LABEL[next]}
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}

      <div className="mt-2 space-y-1">
        {milestone.deliverables.map((d) => (
          <DeliverableRow key={d.id} deliverable={d} canManage={canManage} />
        ))}
        {canManage && <AddDeliverableForm milestoneId={milestone.id} />}
      </div>
    </div>
  );
}

export function MilestonePanel({
  projectId,
  milestones,
  canManage,
}: {
  projectId: string;
  milestones: Milestone[];
  canManage: boolean;
}) {
  const action = addMilestoneAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="space-y-4">
      <div>
        {milestones.map((m) => (
          <MilestoneRow key={m.id} projectId={projectId} milestone={m} canManage={canManage} />
        ))}
        {milestones.length === 0 && (
          <p className="text-sm text-muted">Chưa có mốc thực hiện nào.</p>
        )}
      </div>

      {canManage && (
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
      )}
      <FormError>{state.error}</FormError>
    </div>
  );
}
