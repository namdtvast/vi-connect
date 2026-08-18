"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateMatchesAction } from "@/lib/actions/matching";
import { Button } from "@/components/ui/button";

export function GenerateMatchesButton({ needId }: { needId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await generateMatchesAction(needId);
              setError(null);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Không thể tạo đề xuất ghép nối.");
            }
          })
        }
      >
        {pending ? "Đang tính toán..." : "Chạy lại đề xuất ghép nối (AI)"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
