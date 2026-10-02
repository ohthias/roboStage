"use client";

import { OrganizationProfile, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useEffect } from "react";

export function OrganizationSettings({ organizationId }: { organizationId: string }) {
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const { isLoaded: isOrganizationListLoaded, setActive } = useOrganizationList();

  useEffect(() => {
    if (
      isOrganizationListLoaded &&
      setActive &&
      organization?.id !== organizationId
    ) {
      void setActive({ organization: organizationId });
    }
  }, [isOrganizationListLoaded, organization?.id, organizationId, setActive]);

  if (
    !isOrganizationLoaded ||
    !isOrganizationListLoaded ||
    organization?.id !== organizationId
  ) {
    return <div className="min-h-48" aria-hidden="true" />;
  }

  return <OrganizationProfile routing="hash" />;
}