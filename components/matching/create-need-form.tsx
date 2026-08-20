"use client";

import { useActionState } from "react";
import { createNeedAction } from "@/lib/actions/matching";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FieldsCheckboxGrid } from "@/components/ui/fields-checkbox-grid";
import { Paperclip } from "lucide-react";

const initialState: ActionState = {};

export function CreateNeedForm() {
  const [state, formAction, pending] = useActionState(createNeedAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="title">Tiêu đề nhu cầu / bài toán</Label>
        <Input id="title" name="title" placeholder="VD: Tìm giải pháp AI kiểm tra lỗi bề mặt sản phẩm" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Mô tả bài toán, hiện trạng, yêu cầu kỹ thuật cần giải quyết..."
          required
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="budgetVnd">Ngân sách dự kiến (VNĐ, không bắt buộc)</Label>
        <Input id="budgetVnd" name="budgetVnd" type="number" min={0} placeholder="VD: 4.000.000 (bốn triệu đồng)" />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực liên quan</Label>
        <FieldsCheckboxGrid />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="attachment" className="flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" />
          Đính kèm tài liệu (không bắt buộc)
        </Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
          className="file:mr-3 file:rounded file:border-0 file:bg-background file:px-3 file:py-1.5 file:text-sm"
        />
        <p className="text-xs text-muted mt-1">
          PDF, Word, Excel, PowerPoint hoặc ảnh — tối đa 10MB.
        </p>
      </FieldGroup>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang đăng..." : "Đăng nhu cầu"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã đăng.</span>}
    </form>
  );
}
