"use client";

import { useEffect, useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

/**
 * Vários métodos do Clerk no frontend (organization.update, .setLogo,
 * .destroy) operam sobre a Organização "ativa" do Clerk — não existe uma
 * variante desses métodos que receba um organizationId explícito. Como o
 * Stagebook guarda o contexto ativo no nosso próprio cookie
 * (`stagebook_team_id`), não no estado do Clerk, todo componente client que
 * precisa chamar um desses métodos passa primeiro por aqui pra garantir que
 * a Organização ativa do Clerk é exatamente a equipe certa — sem isso, um
 * técnico com várias equipes correria o risco de editar a equipe errada.
 */
export function useEnsureActiveOrganization(clerkOrgId: string) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { setActive, isLoaded: listLoaded } = useOrganizationList();
  const [failed, setFailed] = useState(false);

  const isReady = orgLoaded && listLoaded && organization?.id === clerkOrgId;

  useEffect(() => {
    if (!listLoaded || !orgLoaded) return;
    if (organization?.id === clerkOrgId) return;
    if (!setActive) return;

    setActive({ organization: clerkOrgId }).catch(() => setFailed(true));
  }, [listLoaded, orgLoaded, organization?.id, clerkOrgId, setActive]);

  return { organization, isReady, failed };
}
