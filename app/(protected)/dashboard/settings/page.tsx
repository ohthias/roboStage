import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireAuthenticatedUser } from "@/features/stagebook/lib/scope";
import { getPreferencesFor } from "@/features/stagebook/lib/preferences-core";
import { getUserUsage } from "@/features/stagebook/lib/usage";
import { getAccountDeletionBlockers } from "@/features/stagebook/actions/account";
import { PERSONA_META, isPersonaType } from "@/features/stagebook/lib/persona";
import { personaLockState } from "@/features/stagebook/lib/persona-lock";
import type { CleanupCategory } from "@/features/stagebook/lib/cleanup-categories";
import { SHOWLIVE_URL } from "@/features/showlive/lib/url";
import { PersonAvatar } from "@/features/stagebook/team/components/team-avatar";
import { ProfileSection } from "@/features/stagebook/settings/components/profile-section";
import { PersonaSection } from "@/features/stagebook/settings/components/persona-section";
import { EmailSection } from "@/features/stagebook/settings/components/email-section";
import { PasswordSection } from "@/features/stagebook/settings/components/password-section";
import { IntegrationsSection, PreferencesSection } from "@/features/stagebook/settings/components/preferences-section";
import { SecuritySection } from "@/features/stagebook/settings/components/security-section";
import { UsagePanel } from "@/features/stagebook/settings/components/usage-panel";
import { DataSection } from "@/features/stagebook/settings/components/data-section";
import { ReverifyProvider } from "@/features/stagebook/settings/components/reverify";

const TABS = [
  { id: "perfil", label: "Meus dados" },
  { id: "email", label: "E-mail" },
  { id: "senha", label: "Senha" },
  { id: "seguranca", label: "Segurança" },
  { id: "preferencias", label: "Preferências" },
  { id: "integracoes", label: "Integrações" },
  { id: "uso", label: "Uso" },
  { id: "dados", label: "Dados" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab: TabId = TABS.find((t) => t.id === rawTab)?.id ?? "perfil";

  const userId = await requireAuthenticatedUser();
  const [clerkUser, row] = await Promise.all([
    currentUser(),
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { personaType: true, createdAt: true } }),
  ]);
  const persona = isPersonaType(row?.personaType) ? row.personaType : null;
  const displayName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "Sua conta";
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  // Conta criada: a linha do banco (webhook) ou, na falta dela, o Clerk.
  const lock = personaLockState(row?.createdAt ?? clerkUser?.createdAt ?? 0);

  return (
    <div className="min-h-full bg-base-100">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft size={16} /> Voltar ao painel
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Configurações</h1>
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="flex items-center justify-end gap-2 truncate text-xs text-base-content/55">
                {email}
                {persona && <span className="badge badge-ghost badge-xs">{PERSONA_META[persona].label}</span>}
              </p>
            </div>
            <PersonAvatar name={displayName} imageUrl={clerkUser?.imageUrl ?? null} size="size-10" />
          </div>
        </div>

        <nav
          aria-label="Seções das configurações"
          className="mt-6 flex gap-1 overflow-x-auto rounded-box border border-base-300 bg-base-100 p-1 [scrollbar-width:none]"
        >
          {TABS.map(({ id, label }) => {
            const active = id === tab;
            return (
              <Link
                key={id}
                href={`/dashboard/settings?tab=${id}`}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-field px-3.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <ReverifyProvider>
          <div className="mt-10 space-y-12">
            {tab === "perfil" && (
              <>
                <ProfileSection />
                <PersonaSection current={persona} locked={lock.locked} msLeft={lock.msLeft} />
              </>
            )}
            {tab === "email" && <EmailSection />}
            {tab === "senha" && <PasswordSection />}
            {tab === "seguranca" && <SecuritySection />}
            {tab === "preferencias" && <PreferencesSection initial={await getPreferencesFor(userId)} />}
            {tab === "integracoes" && (
              <IntegrationsSection initial={await getPreferencesFor(userId)} showliveUrl={SHOWLIVE_URL} />
            )}
            {tab === "uso" && <UsagePanel usage={await getUserUsage(userId)} />}
            {tab === "dados" && <DataTab userId={userId} />}
          </div>
        </ReverifyProvider>
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
