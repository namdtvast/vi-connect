import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { DemoBanner } from "@/components/demo-banner";
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
          <div className="font-semibold text-brand mb-6 px-1">VI CONNECT</div>
          <SidebarNav role={session.user.role} />
          <div className="mt-auto pt-4 border-t border-border">
            <div className="px-1 text-sm">
              <div className="font-medium truncate">{session.user.name}</div>
              <div className="text-muted text-xs">
                {ROLE_LABEL[session.user.role]}
              </div>
            </div>
            <div className="mt-3">
              <SignOutButton />
            </div>
          </div>
        </aside>
        <main className="flex-1 p-6 bg-background overflow-auto">{children}</main>
      </div>
    </div>
  );
}
