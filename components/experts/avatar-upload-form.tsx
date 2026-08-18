"use client";

import { useActionState } from "react";
import { updateAvatarAction } from "@/lib/actions/experts";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label } from "@/components/ui/field";

const initialState: ActionState = {};

export function AvatarUploadForm({ expertProfileId }: { expertProfileId: string }) {
  const [state, formAction, pending] = useActionState(updateAvatarAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="expertProfileId" value={expertProfileId} />
      <div className="flex items-end gap-2">
        <FieldGroup className="flex-1">
          <Label htmlFor="avatar">Ảnh chân dung</Label>
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg"
            required
            className="file:mr-3 file:rounded file:border-0 file:bg-background file:px-3 file:py-1.5 file:text-sm"
          />
        </FieldGroup>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang tải lên..." : "Cập nhật ảnh"}
        </Button>
      </div>
      <FormError>{state.error}</FormError>
    </form>
  );
}
