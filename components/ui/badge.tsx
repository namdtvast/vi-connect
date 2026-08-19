import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-background text-muted border border-border",
        brand: "bg-brand/10 text-brand",
        success: "bg-accent/10 text-accent",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        cyan: "bg-cyan/10 text-cyan",
        gold: "bg-gold/20 text-brand-dark",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
