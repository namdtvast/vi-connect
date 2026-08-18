"use client";

import { useState, useTransition } from "react";
import { deleteOrganizationAction, setOrganizationStatusAction } from "@/lib/actions/organizations";
import { Button } from "@/components/ui/button";
import type { OrgStatus } from "@/lib/generated/prisma/enums";

export function OrgStatusActions({
  organizationId,
  organizationName,
  status,
}: {
  organizationId: string;
  organizationName: string;
  status: OrgStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (
      !window.confirm(
        `Xoá vĩnh viễn tổ chức "${organizationName}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteOrganizationAction(organizationId);
      setError(result.error ?? null);
    });
  };

  return (
    <div>
      <div className="flex gap-2">
        {status !== "ACTIVE" && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(() => setOrganizationStatusAction(organizationId, "ACTIVE"))
            }
          >
            Kích hoạt
          </Button>
        )}
        {status !== "SUSPENDED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(() => setOrganizationStatusAction(organizationId, "SUSPENDED"))
            }
          >
            Tạm ngưng
          </Button>
        )}
        <Button size="sm" variant="outline" disabled={pending} onClick={handleDelete}>
          Xoá
        </Button>
      </div>
      {error && <p className="text-xs text-danger mt-1.5 max-w-xs">{error}</p>}
    </div>
  );
}
