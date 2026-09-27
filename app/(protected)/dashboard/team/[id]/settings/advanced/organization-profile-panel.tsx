"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { OrganizationProfile } from "@clerk/nextjs";
import { useEnsureActiveOrganization } from "@/components/stagebook/use-ensure-active-org";

/**
 * Painel completo do Clerk (<OrganizationProfile />) — membros nativos do
 * Clerk, domínios verificados, Billing, SSO. A edição de foto/nome/exclusão
 * "do dia a dia" tem uma página própria, com a cara do app, em
 * /dashboard/team/[id]/settings — esta aqui é o avançado.
 */
export function OrganizationProfilePanel({
  teamId,
  teamName,
  clerkOrgId,
}: {
  teamId: string;
  teamName: string;
  clerkOrgId: string;
}) {
  const { isReady, failed } = useEnsureActiveOrganization(clerkOrgId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href={`/dashboard/team/${teamId}/settings`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content"
      >
        <ArrowLeft size={14} />
        Voltar para configurações
      </Link>

      <div className="mb-2">
        <h1 className="text-xl font-bold">Configurações avançadas — {teamName}</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Membros, domínios verificados, faturamento e SSO — gerenciado direto pela Organização do
          Clerk que dá suporte a este espaço.
        </p>
      </div>

      {failed && (
        <div className="my-6 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          Não foi possível abrir as configurações desta equipe. Tente recarregar a página.
        </div>
      )}

      {!isReady && !failed ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-base-content/50">
          <Loader2 size={16} className="animate-spin" />
          Abrindo configurações...
        </div>
      ) : (
        isReady && (
          <div className="mt-4">
            <OrganizationProfile routing="hash" />
          </div>
        )
      )}
    </div>
  );
}
