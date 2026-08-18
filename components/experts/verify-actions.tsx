"use client";

import { useState, useTransition } from "react";
import { verifyExpertAction } from "@/lib/actions/experts";
import { Button } from "@/components/ui/button";
import { FieldGroup, Label, Textarea } from "@/components/ui/field";

export function VerifyActions({ expertProfileId }: { expertProfileId: string }) {
  const [pending, startTransition] = useTransition();
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="space-y-3">
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
          onClick={() => setShowRejectReason((v) => !v)}
        >
          Từ chối
        </Button>
      </div>

      {showRejectReason && (
        <FieldGroup>
          <Label htmlFor="reject-reason">Lý do từ chối</Label>
          <Textarea
            id="reject-reason"
            rows={2}
            placeholder="Nêu rõ lý do để chuyên gia biết cần bổ sung/sửa gì..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={pending || reason.trim().length === 0}
            onClick={() =>
              startTransition(() => verifyExpertAction(expertProfileId, "REJECTED", reason.trim()))
            }
          >
            {pending ? "Đang gửi..." : "Gửi từ chối"}
          </Button>
        </FieldGroup>
      )}
    </div>
  );
}
