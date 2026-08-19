import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const COLOR_CLASS = {
  brand: { bg: "var(--brand-light)", fg: "var(--brand)" },
  accent: { bg: "var(--accent-light)", fg: "var(--accent)" },
  gold: { bg: "var(--gold-light)", fg: "var(--brand-dark)" },
  cyan: { bg: "color-mix(in srgb, var(--cyan) 15%, transparent)", fg: "var(--cyan)" },
  red: { bg: "var(--red-light)", fg: "var(--red)" },
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: keyof typeof COLOR_CLASS;
}) {
  const c = COLOR_CLASS[color];
  return (
    <Card>
      <CardContent className="flex items-start gap-3 py-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: c.bg, color: c.fg }}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted truncate">{label}</div>
          <div className="text-xl font-bold text-brand-dark mt-0.5">{value}</div>
          {sub && <div className="text-xs text-muted mt-0.5 truncate">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
