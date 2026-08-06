import { clerkClient } from "@clerk/nextjs/server";
import { MembersManager } from "./members-manager";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const client = await clerkClient();

  const [membershipList, invitationList] = await Promise.all([
    client.organizations.getOrganizationMembershipList({
      organizationId,
      limit: 100,
    }),
    client.organizations
      .getOrganizationInvitationList({
        organizationId,
        status: ["pending"],
        limit: 100,
      })
      .catch(() => ({ data: [] })),
  ]);

  return (
    <MembersManager
      organizationId={organizationId}
      members={membershipList.data.map((member) => ({
        id: member.id,
        userId: member.publicUserData?.userId ?? "",
        name: getMemberName(member),
        identifier: member.publicUserData?.identifier ?? "",
        imageUrl:
          member.publicUserData?.imageUrl &&
          !member.publicUserData.imageUrl.includes("default")
            ? member.publicUserData.imageUrl
            : undefined,
        role: member.role,
      }))}
      invitations={invitationList.data.map((invitation) => ({
        id: invitation.id,
        email: invitation.emailAddress,
        role: invitation.role,
      }))}
    />
  );
}

type MemberPublicData = {
  publicUserData?: {
    firstName?: string | null;
    lastName?: string | null;
    identifier?: string;
  } | null;
};

function getMemberName(member: MemberPublicData) {
  const first = member.publicUserData?.firstName ?? "";
  const last = member.publicUserData?.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || member.publicUserData?.identifier || "Usuário";
}