"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { ROLE_LABEL } from "@/lib/role-labels";
import type { Role } from "@/lib/generated/prisma/enums";

export function UpdateRoleForm({
  userId,
  currentRole,
  options,
}: {
  userId: string;
  currentRole: Role;
  options: Role[];
}) {
  const [role, setRole] = useState<Role>(currentRole);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        disabled={pending}
        className="w-auto"
      >
        {options.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={pending || role === currentRole}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              await updateUserRoleAction(userId, role);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
            }
          })
        }
      >
        {pending ? "Đang lưu..." : "Lưu"}
      </Button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
