import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  badge,
  description,
}: {
  title: string;
  badge?: string;
  description?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl font-semibold text-brand-dark">{title}</h1>
        {badge && <Badge variant="brand">{badge}</Badge>}
      </div>
      {description && <p className="text-sm text-muted mt-1">{description}</p>}
    </div>
  );
}
