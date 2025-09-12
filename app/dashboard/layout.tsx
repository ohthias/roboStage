import { ToastProvider } from "@/app/context/ToastContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoboStage | Dashboard",
  description: "Seu painel de controle no RoboStage",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-base-100">
      <ToastProvider>{children}</ToastProvider>
    </main>
  );
}
