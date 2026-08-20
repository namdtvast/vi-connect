"use client";

import { useActionState, useTransition } from "react";
import { addProjectMemberAction, removeProjectMemberAction } from "@/lib/actions/team";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select } from "@/components/ui/field";
import { ROLE_LABEL } from "@/lib/role-labels";
import type { Role } from "@/lib/generated/prisma/enums";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; role: Role; organizationId: string | null };
};

type EligibleUser = { id: string; name: string; organizationId: string | null };

const initialState: ActionState = {};

function MemberRow({
  projectId,
  member,
  canManage,
}: {
  projectId: string;
  member: Member;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-t border-border first:border-t-0">
      <div>
        <span className="text-sm font-medium">{member.user.name}</span>
        <span className="text-xs text-muted ml-2">
          {member.role} · {ROLE_LABEL[member.user.role]}
        </span>
      </div>
      {canManage && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(() => removeProjectMemberAction(projectId, member.id))
          }
        >
          Gỡ
        </Button>
      )}
    </div>
  );
}

export function TeamPanel({
  projectId,
  members,
  eligibleUsers,
  canManage,
}: {
  projectId: string;
  members: Member[];
  eligibleUsers: EligibleUser[];
  canManage: boolean;
}) {
  const action = addProjectMemberAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const addedIds = new Set(members.map((m) => m.user.id));
  const availableUsers = eligibleUsers.filter((u) => !addedIds.has(u.id));

  return (
    <div className="space-y-4">
      <div>
        {members.map((m) => (
          <MemberRow key={m.id} projectId={projectId} member={m} canManage={canManage} />
        ))}
        {members.length === 0 && <p className="text-sm text-muted">Chưa có thành viên nào.</p>}
      </div>

      {canManage && availableUsers.length > 0 && (
        <form action={formAction} className="flex items-end gap-2 pt-2 border-t border-border">
          <FieldGroup>
            <Label htmlFor="userId">Thêm thành viên</Label>
            <Select id="userId" name="userId" defaultValue={availableUsers[0]?.id}>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="role">Vai trò trong dự án</Label>
            <Input id="role" name="role" placeholder="VD: Kỹ sư triển khai" required />
          </FieldGroup>
          <Button type="submit" size="sm" disabled={pending}>
            Thêm
          </Button>
        </form>
      )}
      {canManage && availableUsers.length === 0 && (
        <p className="text-xs text-muted">
          Không còn ai trong 2 tổ chức liên quan để thêm.
        </p>
      )}
      <FormError>{state.error}</FormError>
    </div>
  );
}
