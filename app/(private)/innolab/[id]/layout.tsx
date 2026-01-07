import { ToastProvider } from "@/app/context/ToastContext";

export default function InnoLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-base-100 overflow-hidden">
      <ToastProvider>
      {children}
      </ToastProvider>
    </div>
  );
}