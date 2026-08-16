"use client";

import { useTransition } from "react";
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
};

export function MatchCard({ id, score, reasons, stage, label, sublabel }: MatchCardProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function setStage(next: MatchStage) {
    startTransition(async () => {
      await updateMatchStageAction(id, next);
      router.refresh();
    });
  }

  function convertToProject() {
    startTransition(async () => {
      const projectId = await convertMatchToProjectAction(id);
      router.push(`/dashboard/projects/${projectId}`);
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
        <div className="flex gap-2">
          {stage === "SUGGESTED" && (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => setStage("ACCEPTED")}>
              Chấp nhận
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
      </div>
    </div>
  );
}
