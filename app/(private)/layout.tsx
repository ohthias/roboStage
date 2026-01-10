import { UserProvider } from "@/app/context/UserContext";
import { ToastProvider } from "@/app/context/ToastContext";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ToastProvider>{children}</ToastProvider>
    </UserProvider>
  );
}
