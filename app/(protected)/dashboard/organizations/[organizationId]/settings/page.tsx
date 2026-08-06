import { clerkClient } from "@clerk/nextjs/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const client = await clerkClient();
  const organization = await client.organizations.getOrganization({
    organizationId,
  });

  return (
    <SettingsForm
      organizationId={organizationId}
      name={organization.name}
      slug={organization.slug ?? ""}
      imageUrl={
        organization.imageUrl && !organization.imageUrl.includes("default")
          ? organization.imageUrl
          : undefined
      }
    />
  );
}