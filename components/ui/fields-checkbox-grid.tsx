import { FIELDS } from "@/lib/taxonomy";

/** Lưới checkbox lĩnh vực dùng chung — trước đây lặp lại y hệt ở 7 form khác nhau. */
export function FieldsCheckboxGrid({ defaultChecked }: { defaultChecked?: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      {FIELDS.map((f) => (
        <label key={f.code} className="flex items-center gap-2">
          <input
            type="checkbox"
            name="fields"
            value={f.code}
            defaultChecked={defaultChecked?.includes(f.code)}
          />
          {f.label}
        </label>
      ))}
    </div>
  );
}
