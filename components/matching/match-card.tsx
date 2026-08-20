"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMatchStageAction } from "@/lib/actions/matching";
import { convertMatchToProjectAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MATCH_STAGE_LABEL } from "@/lib/match-labels";
import type { MatchReason } from "@/lib/matching";
import type { MatchStage } from "@/lib/generated/prisma/enums";

type MatchCardProps = {
  id: string;
  score: number;
  reasons: MatchReason[];
  stage: MatchStage;
  label: string;
  sublabel: string;
  /** Chỉ hiện nút hành động khi chắc chắn thao tác được — cùng điều kiện với
   * updateMatchStageAction/convertMatchToProjectAction (assertOrgScope/
   * assertPartyScope), tránh hiện nút rồi ném ForbiddenError im lặng. */
  canManage: boolean;
};

export function MatchCard({ id, score, reasons, stage, label, sublabel, canManage }: MatchCardProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function setStage(next: MatchStage) {
    setError(null);
    startTransition(async () => {
      try {
        await updateMatchStageAction(id, next);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
      }
    });
  }

  function convertToProject() {
    setError(null);
    startTransition(async () => {
      try {
        const projectId = await convertMatchToProjectAction(id);
        router.push(`/dashboard/projects/${projectId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể tạo dự án.");
      }
    });
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-muted">{sublabel}</div>
        </div>
        <Badge variant={score >= 0.5 ? "success" : score >= 0.3 ? "warning" : "default"}>
          {(score * 100).toFixed(0)}% phù hợp
        </Badge>
      </div>

      <ul className="mt-2 space-y-0.5">
        {reasons.map((r, i) => (
          <li key={i} className="text-xs text-muted">
            • {r.detail}{" "}
            <span className="text-muted/60">(trọng số {(r.weight * 100).toFixed(0)}%)</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-3">
        <Badge>{MATCH_STAGE_LABEL[stage]}</Badge>
        {canManage && (
          <div className="flex gap-2">
            {stage === "SUGGESTED" && (
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStage("VIEWED")}>
                Đã xem
              </Button>
            )}
            {(stage === "SUGGESTED" || stage === "VIEWED") && (
              <Button size="sm" variant="outline" disabled={pending} onClick={() => setStage("ACCEPTED")}>
                Chấp nhận
              </Button>
            )}
            {stage === "ACCEPTED" && (
              <Button size="sm" variant="outline" disabled={pending} onClick={() => setStage("CONTACTED")}>
                Đã liên hệ
              </Button>
            )}
            {stage === "CONTACTED" && (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => setStage("COLLABORATING")}
              >
                Đang hợp tác
              </Button>
            )}
            {(stage === "ACCEPTED" || stage === "CONTACTED" || stage === "COLLABORATING") && (
              <Button size="sm" disabled={pending} onClick={convertToProject}>
                Tạo dự án
              </Button>
            )}
            {stage !== "REJECTED" && stage !== "CONVERTED_PROJECT" && (
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStage("REJECTED")}>
                Từ chối
              </Button>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  );
}
