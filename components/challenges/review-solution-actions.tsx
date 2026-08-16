"use client";

import { useTransition } from "react";
import { reviewSolutionAction } from "@/lib/actions/challenges";
import { Button } from "@/components/ui/button";

export function ReviewSolutionActions({ solutionId }: { solutionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 mt-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => reviewSolutionAction(solutionId, "SHORTLISTED"))}
      >
        Đưa vào danh sách rút gọn
      </Button>
      <Button
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => reviewSolutionAction(solutionId, "SELECTED"))}
      >
        Chọn giải pháp này
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => startTransition(() => reviewSolutionAction(solutionId, "REJECTED"))}
      >
        Từ chối
      </Button>
    </div>
  );
}
