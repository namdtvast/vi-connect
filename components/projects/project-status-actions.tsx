"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatusAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { PROJECT_STATUS_LABEL } from "@/lib/project-labels";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";

export function ProjectStatusActions({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatus;
}) {
  const [next, setNext] = useState<ProjectStatus>(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Select
          className="w-auto"
          value={next}
          onChange={(e) => setNext(e.target.value as ProjectStatus)}
        >
          {Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => (
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
              setError(null);
              try {
                await updateProjectStatusAction(projectId, next);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
              }
            })
          }
        >
          {pending ? "Đang cập nhật..." : "Cập nhật trạng thái"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
