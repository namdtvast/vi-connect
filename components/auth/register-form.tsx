"use client";

import { useActionState } from "react";
import { registerExpertAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";

const initialState: ActionState = {};

export function RegisterForm({
  organizations,
}: {
  organizations: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    registerExpertAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="text-sm">
        <p className="font-medium text-accent">Đăng ký thành công.</p>
        <p className="text-muted mt-1">
          Hồ sơ của bạn đang ở trạng thái <strong>chờ xác minh</strong> — cán bộ đầu mối
          của tổ chức bạn chọn sẽ xác minh trước khi hồ sơ được dùng cho ghép nối. Bạn có
          thể đăng nhập ngay bây giờ.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="name">Họ và tên</Label>
        <Input id="name" name="name" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="organizationId">Hội thành viên / tổ chức KH&amp;CN</Label>
        <Select id="organizationId" name="organizationId" required defaultValue="">
          <option value="" disabled>
            Chọn tổ chức
          </option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="title">Học hàm / học vị (không bắt buộc)</Label>
        <Input id="title" name="title" placeholder="VD: TS., PGS.TS." />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực chuyên môn</Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {FIELDS.map((f) => (
            <label key={f.code} className="flex items-center gap-2">
              <input type="checkbox" name="fields" value={f.code} />
              {f.label}
            </label>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="bio">Giới thiệu ngắn</Label>
        <Textarea id="bio" name="bio" rows={3} />
      </FieldGroup>
      <FormError>{state.error}</FormError>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Đang gửi..." : "Đăng ký hồ sơ"}
      </Button>
    </form>
  );
}
