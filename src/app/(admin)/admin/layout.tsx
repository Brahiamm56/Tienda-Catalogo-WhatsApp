import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { FloatingQuickActions } from "@/components/admin/floating-quick-actions";
import { getStoreSettings } from "@/lib/catalog";
import { requireAdminSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();
  const settings = await getStoreSettings();

  const userLabel = session.user.name ?? session.user.email ?? "Administrador";

  return (
    <div className="flex min-h-screen w-full relative">
      <AdminSidebar
        logoUrl={settings.logoUrl}
        storeName={settings.name}
        userLabel={userLabel}
      />
      <div className="relative flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8 xl:px-12">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70">
          <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[rgba(222,120,95,0.15)] blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[rgba(76,152,164,0.12)] blur-3xl" />
          <div className="absolute bottom-8 right-16 h-64 w-64 rounded-full bg-[rgba(227,198,138,0.16)] blur-3xl" />
        </div>

        <div className="relative space-y-8">
          <div className="pb-8">{children}</div>
        </div>
      </div>

      <FloatingQuickActions />
    </div>
  );
}