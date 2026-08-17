import Link from "next/link";
import { Home } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { DemoBanner } from "@/components/demo-banner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ROLE_LABEL } from "@/lib/role-labels";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <DemoBanner />
      <div className="flex-1 flex">
        <aside className="w-64 shrink-0 border-r border-border bg-surface p-4 flex flex-col">
          <div className="flex items-center justify-between mb-6 px-1">
            <Logo className="h-8 w-auto" />
            <Link
              href="/"
              title="Về trang chủ"
              aria-label="Về trang chủ"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-foreground/70 hover:bg-background hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
          <SidebarNav role={session.user.role} />
          <div className="mt-auto pt-4 border-t border-border">
            <div className="px-1 text-sm">
              <div className="font-medium truncate">{session.user.name}</div>
              <div className="text-muted text-xs">
                {ROLE_LABEL[session.user.role]}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <SignOutButton />
              <ThemeToggle />
            </div>
          </div>
        </aside>
        <main className="flex-1 p-6 bg-background overflow-auto">{children}</main>
      </div>
    </div>
  );
}
