import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { LayoutPanelLeft, ShieldCheck, Database, Eraser, UserRound, type LucideIcon } from "lucide-react";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireAuthenticatedUser } from "@/utils/stagebook/scope";
import { getPreferencesFor } from "@/utils/stagebook/preferences-core";
import { getUserUsage } from "@/utils/stagebook/usage";
import { getAccountDeletionBlockers } from "@/utils/stagebook/actions/account";
import { PERSONA_META, isPersonaType } from "@/utils/stagebook/persona";
import type { CleanupCategory } from "@/utils/stagebook/cleanup-categories";
import { PersonAvatar } from "../team/_components/team-avatar";
import { EmailSection, ProfileSection } from "./_components/profile-section";
import { PersonaSection } from "./_components/persona-section";
import { PreferencesSection } from "./_components/preferences-section";
import { SecuritySection } from "./_components/security-section";
import { UsagePanel } from "./_components/usage-panel";
import { DataSection } from "./_components/data-section";

const TABS = [
  { id: "perfil", label: "Perfil", Icon: UserRound },
  { id: "preferencias", label: "Preferências", Icon: LayoutPanelLeft },
  { id: "seguranca", label: "Segurança", Icon: ShieldCheck },
  { id: "uso", label: "Uso", Icon: Database },
  { id: "dados", label: "Dados", Icon: Eraser },
] as const satisfies readonly { id: string; label: string; Icon: LucideIcon }[];

type TabId = (typeof TABS)[number]["id"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab: TabId = TABS.find((t) => t.id === rawTab)?.id ?? "perfil";

  const userId = await requireAuthenticatedUser();
  const [clerkUser, row] = await Promise.all([
    currentUser(),
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { personaType: true } }),
  ]);
  const persona = isPersonaType(row?.personaType) ? row.personaType : null;
  const displayName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "Sua conta";

  return (
    <div className="min-h-full bg-base-200">
      <header className="border-b border-base-300 bg-base-100">
        <div className="flex flex-wrap items-center gap-4 px-4 pb-3 pt-5 sm:px-6">
          <PersonAvatar name={displayName} imageUrl={clerkUser?.imageUrl ?? null} size="size-14" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold leading-tight">Configurações</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-base-content/55">
              <span className="truncate">{displayName}</span>
              {persona && <span className="badge badge-ghost badge-xs">{PERSONA_META[persona].label}</span>}
            </p>
          </div>
        </div>

        <nav role="tablist" aria-label="Seções das configurações" className="tabs tabs-border overflow-x-auto px-2 sm:px-4">
          {TABS.map(({ id, label, Icon }) => (
            <Link
              key={id}
              role="tab"
              aria-selected={id === tab}
              href={`/dashboard/settings?tab=${id}`}
              className={`tab gap-2 whitespace-nowrap ${id === tab ? "tab-active font-semibold" : ""}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
        {tab === "perfil" && (
          <>
            <ProfileSection />
            <EmailSection />
            <PersonaSection current={persona} />
          </>
        )}
        {tab === "preferencias" && <PreferencesSection initial={await getPreferencesFor(userId)} />}
        {tab === "seguranca" && <SecuritySection />}
        {tab === "uso" && <UsagePanel usage={await getUserUsage(userId)} />}
        {tab === "dados" && <DataTab userId={userId} />}
      </div>
    </div>
  );
}

async function DataTab({ userId }: { userId: string }) {
  const [usage, blockers] = await Promise.all([getUserUsage(userId), getAccountDeletionBlockers()]);
  const personal = (key: string) => usage.categories.find((c) => c.key === key)?.personalCount ?? 0;

  const counts: Record<CleanupCategory, number> = {
    documents: personal("documents"),
    kanban: personal("boards"),
    thinklab: personal("thinklab"),
    tests: personal("tests"),
    calendar: personal("events"),
    labels: personal("tags") + personal("milestones"),
    notifications: personal("notifications"),
  };

  return <DataSection counts={counts} blockers={blockers} />;
}
