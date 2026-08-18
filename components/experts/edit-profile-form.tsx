"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/experts";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";

const initialState: ActionState = {};

export function EditProfileForm({
  expertProfileId,
  title,
  headline,
  bio,
  fields,
  skills,
  experienceYears,
  publications,
  patents,
}: {
  expertProfileId: string;
  title: string | null;
  headline: string | null;
  bio: string | null;
  fields: string[];
  skills: string[];
  experienceYears: number | null;
  publications: number | null;
  patents: number | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="expertProfileId" value={expertProfileId} />
      <FieldGroup>
        <Label htmlFor="title">Học hàm / học vị</Label>
        <Input id="title" name="title" defaultValue={title ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="headline">Chức danh ngắn</Label>
        <Input id="headline" name="headline" defaultValue={headline ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="bio">Giới thiệu</Label>
        <Textarea id="bio" name="bio" rows={3} defaultValue={bio ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực chuyên môn</Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {FIELDS.map((f) => (
            <label key={f.code} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="fields"
                value={f.code}
                defaultChecked={fields.includes(f.code)}
              />
              {f.label}
            </label>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="skills">Kỹ năng (cách nhau bởi dấu phẩy)</Label>
        <Input id="skills" name="skills" defaultValue={skills.join(", ")} />
      </FieldGroup>
      <div className="grid grid-cols-3 gap-3">
        <FieldGroup>
          <Label htmlFor="experienceYears">Kinh nghiệm (năm)</Label>
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min={0}
            defaultValue={experienceYears ?? ""}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="publications">Công bố</Label>
          <Input id="publications" name="publications" type="number" min={0} defaultValue={publications ?? 0} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="patents">Sáng chế</Label>
          <Input id="patents" name="patents" type="number" min={0} defaultValue={patents ?? 0} />
        </FieldGroup>
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
