import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1]?.[0] ?? "";
  const first = parts.length > 1 ? parts[0]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(SIZE_CLASS[size], "rounded-full object-cover border border-border shrink-0", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        SIZE_CLASS[size],
        "rounded-full bg-brand-light text-brand border border-border flex items-center justify-center font-semibold shrink-0",
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
