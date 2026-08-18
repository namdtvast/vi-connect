"use client";

import { useActionState, useState, useTransition } from "react";
import { createOrganizationAction, lookupTaxCodeAction } from "@/lib/actions/organizations";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { ORG_TYPE_LABEL } from "@/lib/org-labels";
import { PROVINCES } from "@/lib/provinces";

const initialState: ActionState = {};

export function CreateOrgForm() {
  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialState
  );

  const [taxCode, setTaxCode] = useState("");
  const [lookupPending, startLookup] = useTransition();
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleLookup = () => {
    setLookupError(null);
    startLookup(async () => {
      const result = await lookupTaxCodeAction(taxCode);
      if (result.error || !result.data) {
        setLookupError(result.error ?? "Không thể tra cứu mã số thuế.");
        return;
      }
      setName(result.data.name);
      if (result.data.address) {
        setDescription(`Địa chỉ theo mã số thuế: ${result.data.address}`);
      }
    });
  };

  return (
    <form action={formAction} className="grid md:grid-cols-2 gap-4">
      <FieldGroup className="md:col-span-2">
        <Label htmlFor="taxCode">Mã số thuế (không bắt buộc)</Label>
        <div className="flex gap-2">
          <Input
            id="taxCode"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            placeholder="VD: 0101248141"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            disabled={lookupPending || !taxCode.trim()}
            onClick={handleLookup}
          >
            {lookupPending ? "Đang tra cứu..." : "Tra cứu"}
          </Button>
        </div>
        {lookupError && <p className="text-xs text-danger mt-1.5">{lookupError}</p>}
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="name">Tên đầy đủ</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Liên hiệp Hội Khoa học và Kỹ thuật TP. Hà Nội"
          required
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="shortName">Tên viết tắt</Label>
        <Input id="shortName" name="shortName" placeholder="VD: LHH Hà Nội" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="type">Loại hình</Label>
        <Select id="type" name="type" defaultValue="HOI_THANH_VIEN">
          {Object.entries(ORG_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="province">Tỉnh / thành phố</Label>
        <Select id="province" name="province" defaultValue="">
          <option value="">Chọn tỉnh / thành phố</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup className="md:col-span-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Chức năng, lĩnh vực hoạt động chính..."
        />
      </FieldGroup>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Thêm tổ chức"}
        </Button>
        {state.success && (
          <span className="text-sm text-accent">Đã thêm tổ chức.</span>
        )}
      </div>
      <div className="md:col-span-2">
        <FormError>{state.error}</FormError>
      </div>
    </form>
  );
}
