import { ToastProvider } from "@/app/context/ToastContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "InnoLab",
  description: "Crie e edite diagramas interativos",
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
