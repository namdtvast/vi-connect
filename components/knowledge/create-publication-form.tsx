"use client";

import { useActionState, useState, useTransition } from "react";
import { createPublicationAction, lookupDoiAction } from "@/lib/actions/knowledge";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, FormError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { FIELDS } from "@/lib/taxonomy";

const initialState: ActionState = {};

const TYPE_LABEL: Record<string, string> = {
  JOURNAL_ARTICLE: "Bài báo tạp chí",
  CONFERENCE_PAPER: "Kỷ yếu hội thảo",
  BOOK: "Sách",
  BOOK_CHAPTER: "Chương sách",
  PREPRINT: "Preprint",
  TECHNICAL_REPORT: "Báo cáo kỹ thuật",
  OTHER: "Khác",
};

export function CreatePublicationForm() {
  const [state, formAction, pending] = useActionState(createPublicationAction, initialState);

  const [doi, setDoi] = useState("");
  const [lookupPending, startLookup] = useTransition();
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [containerTitle, setContainerTitle] = useState("");
  const [year, setYear] = useState("");
  const [authors, setAuthors] = useState("");

  const handleLookup = () => {
    setLookupError(null);
    startLookup(async () => {
      const result = await lookupDoiAction(doi);
      if (result.error || !result.data) {
        setLookupError(result.error ?? "Không thể tra cứu DOI.");
        return;
      }
      setTitle(result.data.title);
      setContainerTitle(result.data.containerTitle ?? "");
      setYear(result.data.year ? String(result.data.year) : "");
      setAuthors(result.data.authors.join(", "));
      setDoi(result.data.doi);
    });
  };

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="doi">DOI (không bắt buộc — tra Crossref để tự điền)</Label>
        <div className="flex gap-2">
          <Input
            id="doi"
            name="doi"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            placeholder="VD: 10.1000/xyz123 hoặc https://doi.org/10.1000/xyz123"
            className="max-w-md"
          />
          <Button
            type="button"
            variant="outline"
            disabled={lookupPending || !doi.trim()}
            onClick={handleLookup}
          >
            {lookupPending ? "Đang tra cứu..." : "Tra DOI"}
          </Button>
        </div>
        {lookupError && <p className="text-xs text-danger mt-1.5">{lookupError}</p>}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="title">Tiêu đề công bố</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Explainable matching for innovation ecosystems"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="authors">Tác giả (cách nhau bởi dấu phẩy)</Label>
        <Input
          id="authors"
          name="authors"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          placeholder="VD: Nguyễn Văn A, Trần Thị B"
        />
      </FieldGroup>

      <div className="grid grid-cols-3 gap-4">
        <FieldGroup>
          <Label htmlFor="type">Loại</Label>
          <Select id="type" name="type" defaultValue="JOURNAL_ARTICLE">
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="containerTitle">Tạp chí / kỷ yếu</Label>
          <Input
            id="containerTitle"
            name="containerTitle"
            value={containerTitle}
            onChange={(e) => setContainerTitle(e.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="year">Năm</Label>
          <Input
            id="year"
            name="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="VD: 2025"
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="abstract">Tóm tắt (không bắt buộc)</Label>
        <Textarea id="abstract" name="abstract" rows={3} placeholder="Tóm tắt nội dung công bố..." />
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

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang đăng..." : "Đăng công bố"}
      </Button>
      {state.success && <span className="ml-3 text-sm text-accent">Đã đăng.</span>}
    </form>
  );
}
