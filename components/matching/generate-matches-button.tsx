"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateMatchesAction } from "@/lib/actions/matching";
import { Button } from "@/components/ui/button";

export function GenerateMatchesButton({ needId }: { needId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await generateMatchesAction(needId);
          router.refresh();
        })
      }
    >
      {pending ? "Đang tính toán..." : "Chạy lại đề xuất ghép nối (AI)"}
    </Button>
  );
}
