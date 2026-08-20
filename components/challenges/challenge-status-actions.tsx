"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setChallengeStatusAction } from "@/lib/actions/challenges";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { CHALLENGE_STATUS_LABEL } from "@/lib/challenge-labels";
import type { ChallengeStatus } from "@/lib/generated/prisma/enums";

export function ChallengeStatusActions({
  challengeId,
  status,
}: {
  challengeId: string;
  status: ChallengeStatus;
}) {
  const [next, setNext] = useState<ChallengeStatus>(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Select
        className="w-auto"
        value={next}
        onChange={(e) => setNext(e.target.value as ChallengeStatus)}
      >
        {Object.entries(CHALLENGE_STATUS_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={pending || next === status}
        onClick={() =>
          startTransition(async () => {
            await setChallengeStatusAction(challengeId, next);
            router.refresh();
          })
        }
      >
        {pending ? "Đang cập nhật..." : "Cập nhật trạng thái"}
      </Button>
    </div>
  );
}
