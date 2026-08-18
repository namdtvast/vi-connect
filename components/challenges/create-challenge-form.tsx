"use client";

import { useActionState } from "react";
import { createChallengeAction } from "@/lib/actions/challenges";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";
import { Paperclip } from "lucide-react";

const initialState: ActionState = {};

export function CreateChallengeForm() {
  const [state, formAction, pending] = useActionState(createChallengeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="title">Tên bài toán</Label>
        <Input id="title" name="title" placeholder="VD: Giảm hao hụt điện năng trong lưới truyền tải" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="problem">Mô tả vấn đề / hiện trạng</Label>
        <Textarea
          id="problem"
          name="problem"
          rows={3}
          placeholder="Mô tả vấn đề đang gặp phải, nguyên nhân, tác động..."
          required
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="goal">Mục tiêu cần đạt</Label>
        <Textarea id="goal" name="goal" rows={2} placeholder="VD: Giảm 15% tổn thất điện năng trong 12 tháng" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="budgetVnd">Ngân sách (VNĐ, để trống nếu chưa có)</Label>
        <Input id="budgetVnd" name="budgetVnd" type="number" min={0} placeholder="VD: 4.000.000" />
      </FieldGroup>
      <FieldGroup>
        <Label>Lĩnh vực</Label>
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
        {pending ? "Đang công bố..." : "Công bố bài toán"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã công bố.</span>}
    </form>
  );
}
