"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/experts";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FieldsCheckboxGrid } from "@/components/ui/fields-checkbox-grid";

const initialState: ActionState = {};

export function EditProfileForm({
  expertProfileId,
  name,
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
  name: string | null;
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
      {name !== null && (
        <FieldGroup>
          <Label htmlFor="name">Họ và tên</Label>
          <Input id="name" name="name" placeholder="VD: Nguyễn Văn A" defaultValue={name} required />
        </FieldGroup>
      )}
      <FieldGroup>
        <Label htmlFor="title">Học hàm / học vị</Label>
        <Input id="title" name="title" placeholder="VD: TS., PGS. TS." defaultValue={title ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="headline">Chức danh ngắn</Label>
        <Input
          id="headline"
          name="headline"
          placeholder="VD: Trưởng phòng Nghiên cứu & Phát triển"
          defaultValue={headline ?? ""}
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="bio">Giới thiệu</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="Tóm tắt kinh nghiệm, thế mạnh chuyên môn của bạn..."
          defaultValue={bio ?? ""}
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực chuyên môn</Label>
        <FieldsCheckboxGrid defaultChecked={fields} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="skills">Kỹ năng (cách nhau bởi dấu phẩy)</Label>
        <Input
          id="skills"
          name="skills"
          placeholder="VD: xử lý ảnh, học máy, Python"
          defaultValue={skills.join(", ")}
        />
      </FieldGroup>
      <div className="grid grid-cols-3 gap-3">
        <FieldGroup>
          <Label htmlFor="experienceYears">Kinh nghiệm (năm)</Label>
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min={0}
            placeholder="VD: 10"
            defaultValue={experienceYears ?? ""}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="publications">Công bố</Label>
          <Input
            id="publications"
            name="publications"
            type="number"
            min={0}
            placeholder="VD: 5"
            defaultValue={publications ?? 0}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="patents">Sáng chế</Label>
          <Input
            id="patents"
            name="patents"
            type="number"
            min={0}
            placeholder="VD: 1"
            defaultValue={patents ?? 0}
          />
        </FieldGroup>
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
