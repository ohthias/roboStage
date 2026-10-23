import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

/** Cabeçalho comum das telas "Gerenciar equipe": trilha de navegação + abas Geral/Avançado. */
export function SettingsShell({
  teamId,
  teamName,
  active,
  children,
  wide = false,
}: {
  teamId: string;
  teamName: string;
  active: "geral" | "avancado";
  children: ReactNode;
  wide?: boolean;
}) {
  const base = `/dashboard/team/${teamId}/settings`;
  return (
    <div className={`mx-auto w-full px-4 py-6 sm:px-6`}>
      <div className="breadcrumbs mb-2 text-sm">
        <ul>
          <li>
            <Link href="/dashboard/team?view=all">Equipes</Link>
          </li>
          <li>
            <Link href={`/dashboard/team/${teamId}`}>{teamName}</Link>
          </li>
          <li>Gerenciar</li>
        </ul>
      </div>
      <h1 className="text-xl font-bold">Gerenciar equipe</h1>
      <nav role="tablist" className="tabs tabs-border mb-6 mt-3">
        <Link role="tab" href={base} className={`tab ${active === "geral" ? "tab-active font-semibold" : ""}`}>
          Geral
        </Link>
      </nav>
      {children}
    </div>
  );
}

export function SettingsNoAccess({ message }: { message?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <ShieldAlert size={24} />
      </span>
      <h1 className="text-lg font-bold">Sem acesso</h1>
      <p className="mt-2 text-sm text-base-content/60">
        {message ?? "Ou essa equipe não existe, ou você não é mais membro dela."}
      </p>
    </div>
  );
}
