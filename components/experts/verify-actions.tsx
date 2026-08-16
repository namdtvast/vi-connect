"use client";

import { useTransition } from "react";
import { verifyExpertAction } from "@/lib/actions/experts";
import { Button } from "@/components/ui/button";

export function VerifyActions({ expertProfileId }: { expertProfileId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => verifyExpertAction(expertProfileId, "VERIFIED"))}
      >
        Xác minh hồ sơ
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => verifyExpertAction(expertProfileId, "REJECTED"))}
      >
        Từ chối
      </Button>
    </div>
  );
}
