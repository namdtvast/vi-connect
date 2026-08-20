import { FIELDS } from "@/lib/taxonomy";

const COLUMNS_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
} as const;

/** Lưới checkbox lĩnh vực dùng chung — trước đây lặp lại y hệt ở 7 form khác nhau. */
export function FieldsCheckboxGrid({
  defaultChecked,
  columns = 3,
}: {
  defaultChecked?: string[];
  columns?: keyof typeof COLUMNS_CLASS;
}) {
  return (
    <div className={`grid ${COLUMNS_CLASS[columns]} gap-2 text-sm`}>
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
