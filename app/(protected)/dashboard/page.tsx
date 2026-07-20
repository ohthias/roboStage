import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-base-200">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold">Bem-vindo ao Dashboard</h1>
        <p className="mt-4 text-lg">
          Aqui você pode gerenciar suas organizações, pastas e projetos.
        </p>
      </main>
    </div>
  );
}