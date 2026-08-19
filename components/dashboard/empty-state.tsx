import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="font-medium text-brand-dark">{title}</div>
        {description && <p className="text-sm text-muted mt-1 max-w-sm mx-auto">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
