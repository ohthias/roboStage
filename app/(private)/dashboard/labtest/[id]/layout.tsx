import { ToastProvider } from "@/app/context/ToastContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LabTest Resultados",
  description: "Visualize os resultados dos testes do robô.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <ToastProvider>{children}</ToastProvider>
    </main>
  );
}
