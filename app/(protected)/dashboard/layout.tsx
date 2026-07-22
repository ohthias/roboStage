import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-base-200">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}