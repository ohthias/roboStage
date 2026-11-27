import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

/** Clerk já em pt-BR. */
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <BaseClerkProvider localization={ptBR}>{children}</BaseClerkProvider>;
}
