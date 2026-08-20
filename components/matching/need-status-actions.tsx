"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNeedStatusAction } from "@/lib/actions/matching";
import { Button } from "@/components/ui/button";
import type { NeedStatus } from "@/lib/generated/prisma/enums";

export function NeedStatusActions({ needId, status }: { needId: string; status: NeedStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setStatus = (next: NeedStatus) =>
    startTransition(async () => {
      await updateNeedStatusAction(needId, next);
      router.refresh();
    });

  if (status === "CLOSED") {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("PUBLISHED")}>
        {pending ? "Đang mở lại..." : "Mở lại nhu cầu"}
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("CLOSED")}>
      {pending ? "Đang đóng..." : "Đóng nhu cầu"}
    </Button>
  );
}
