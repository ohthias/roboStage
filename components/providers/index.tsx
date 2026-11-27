import { ClerkProvider } from "./ClerkProvider";
import { ConfirmProvider } from "./ConfirmProvider";
import { ToastProvider } from "./ToastContext";

export { ClerkProvider } from "./ClerkProvider";
export { ConfirmProvider, useConfirm } from "./ConfirmProvider";
export { ToastProvider, useToast } from "./ToastContext";

/** Todos os providers globais, na ordem certa. Usado em app/layout.tsx. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </ClerkProvider>
  );
}
