"use client";

import { useTransition } from "react";
import { setOrganizationStatusAction } from "@/lib/actions/organizations";
import { Button } from "@/components/ui/button";
import type { OrgStatus } from "@/lib/generated/prisma/enums";

export function OrgStatusActions({
  organizationId,
  status,
}: {
  organizationId: string;
  status: OrgStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
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
    </div>
  );
}
