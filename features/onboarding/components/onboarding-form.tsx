"use client";
import { asset } from "@/lib/assets";

import Image from "next/image";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Eye,
  Mail,
  Pencil,
  Trophy,
  UserPlus,
} from "lucide-react";
import Logo from "@/components/stage/layout/Logo";
import { LeagueLogo } from "@/components/stage/layout/LeagueLogo";
import { ACCENT_TEXT } from "@/features/home/components/shared";
import { getLeagueBrand } from "@/features/leagues/shared/lib/league-branding";
import type { LeagueRow } from "@/db/schema";
import {
  describeMissing,
  leagueGaps,
  NAME_MIN,
  type OnboardingMissing,
} from "@/features/onboarding/lib/completeness";
import {
  completeOnboarding,
  type LeagueSelectionInput,
  type PersonaValue,
} from "../actions";

/* ============================================================ DADOS */

const PERSONAS: {
  value: PersonaValue;
  name: string;
  desc: string;
  image: string;
  /** Relação sugerida ao tocar numa liga pela primeira vez. */
  defaultRelation: LeagueSelectionInput["relationType"];
}[] = [
  {
    value: "competidor",
    name: "Competidor",
    desc: "Corro missões, calibro o robô e persigo pontuação.",
    image: asset("/images/icons/EquipesAvancadas.svg"),
    defaultRelation: "participante",
  },
  {
    value: "mentor_tecnico",
    name: "Mentor / Técnico",
    desc: "Acompanho a equipe, reviso estratégias e o setup do robô.",
    image: asset("/images/icons/Tecnicos.svg"),
    defaultRelation: "participante",
  },
  {
    value: "entusiasta",
    name: "Entusiasta",
    desc: "Acompanho o universo da robótica sem competir formalmente.",
    image: asset("/images/icons/EquipesIniciantes.svg"),
    defaultRelation: "interessado",
  },
  {
    value: "organizador",
    name: "Organizador",
    desc: "Coordeno eventos, torneios ou várias equipes.",
    image: asset("/images/icons/Organizadores.svg"),
    defaultRelation: "interessado",
  },
];

const STEPS = [
  { kicker: "PERFIL", label: "Você" },
  { kicker: "COMPETIÇÕES", label: "Ligas" },
  { kicker: "PREFERÊNCIAS", label: "Ajustes" },
] as const;

type Step = 0 | 1 | 2;

type LeagueState = {
  relationType: LeagueSelectionInput["relationType"] | null;
  teamName: string;
  season: string;
};

export type OnboardingInitial = {
  name: string;
  email: string;
  avatarUrl: string | null;
  personaType: PersonaValue | null;
  allowTeamInvites: boolean;
  emailProductUpdates: boolean;
  selections: Record<string, LeagueState>;
};

/* ============================================================ ESTILO */

const cardShell =
  "relative rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100";
const primaryBtn =
  "btn btn-primary rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)] disabled:shadow-none disabled:translate-y-0";

/* ============================================================ COMPONENTE */

export function OnboardingForm({
  leagues,
  initial,
  pendingFields = [],
}: {
  leagues: LeagueRow[];
  initial: OnboardingInitial;
  /** O que falta para quem foi devolvido do dashboard (cadastro antigo/incompleto). */
  pendingFields?: OnboardingMissing[];
}) {
  const [step, setStep] = useState<Step>(0);
  // Só pinta os campos das ligas de vermelho depois da 1ª tentativa de avançar.
  const [showLeagueErrors, setShowLeagueErrors] = useState(pendingFields.some((f) => f.startsWith("league")));
  const [name, setName] = useState(initial.name);
  const [persona, setPersona] = useState<PersonaValue | null>(initial.personaType);
  const [selections, setSelections] = useState<Record<string, LeagueState>>(initial.selections);
  const [allowTeamInvites, setAllowTeamInvites] = useState(initial.allowTeamInvites);
  const [emailProductUpdates, setEmailProductUpdates] = useState(initial.emailProductUpdates);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const personaMeta = PERSONAS.find((p) => p.value === persona) ?? null;

  const chosen = useMemo(
    () =>
      leagues
        .map((league) => ({ league, state: selections[league.id] }))
        .filter((c): c is { league: LeagueRow; state: LeagueState } => Boolean(c.state?.relationType)),
    [leagues, selections],
  );

  function patchLeague(leagueId: string, patch: Partial<LeagueState>) {
    setSelections((prev) => {
      const current = prev[leagueId] ?? { relationType: null, teamName: "", season: "" };
      return { ...prev, [leagueId]: { ...current, ...patch } };
    });
  }

  function toggleRelation(league: LeagueRow, relationType: LeagueSelectionInput["relationType"]) {
    const current = selections[league.id];
    const next = current?.relationType === relationType ? null : relationType;
    // Ao marcar "Participo" pela primeira vez, já sugere a temporada atual da liga.
    const suggestedSeason =
      next === "participante" && !current?.season ? getLeagueBrand(league).seasons[0] ?? "" : undefined;
    patchLeague(league.id, {
      relationType: next,
      ...(suggestedSeason !== undefined ? { season: suggestedSeason } : {}),
    });
    setError(null);
  }

  /** Ligas marcadas como "Participo" sem equipe ou temporada. */
  const incompleteLeagues = chosen.filter(({ state }) => leagueGaps(state).length > 0);

  function validate(target: Step): { message: string; step: Step } | null {
    if (target >= 1) {
      if (name.trim().length < NAME_MIN) return { message: "Conte como podemos te chamar.", step: 0 };
      if (!persona) return { message: "Escolha o perfil que mais combina com você.", step: 0 };
    }
    if (target >= 2) {
      if (chosen.length === 0) {
        return { message: "Escolha ao menos uma competição — dá para mudar depois.", step: 1 };
      }
      if (incompleteLeagues.length > 0) {
        const names = incompleteLeagues.map(({ league }) => league.code).join(", ");
        return { message: `Preencha equipe e temporada em: ${names}.`, step: 1 };
      }
    }
    return null;
  }

  function focusFirstIncompleteLeague() {
    const first = incompleteLeagues[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const card = document.getElementById(`league-${first.league.id}`);
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
      card?.querySelector<HTMLInputElement>("input[aria-invalid='true']")?.focus({ preventScroll: true });
    });
  }

  function goTo(target: Step) {
    if (target > step) {
      const problem = validate(target);
      if (problem) {
        setError(problem.message);
        if (problem.step === 1) {
          setShowLeagueErrors(true);
          focusFirstIncompleteLeague();
        }
        return;
      }
    }
    setError(null);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit() {
    const problem = validate(2);
    if (problem || !persona) {
      setError(problem?.message ?? "Escolha um perfil.");
      // Volta para a etapa com o campo faltando.
      if (problem && problem.step !== step) {
        setStep(problem.step);
        if (problem.step === 1) {
          setShowLeagueErrors(true);
          focusFirstIncompleteLeague();
        }
      }
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const result = await completeOnboarding({
          name,
          personaType: persona,
          leagues: chosen.map(({ league, state }) => ({
            leagueId: league.id,
            relationType: state.relationType!,
            teamName: state.teamName,
            season: state.season,
          })),
          allowTeamInvites,
          emailProductUpdates,
        });
        if (result && !result.ok) setError(result.error);
      } catch {
        setError("Não foi possível salvar agora. Tente de novo em instantes.");
      }
    });
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* ------------------------------------------------ Topo */}
      <header className="border-b border-base-300 bg-base-100/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Logo logoSize="xl" />
          <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Etapas">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.kicker} className="flex items-center gap-1.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => (i < step ? goTo(i as Step) : undefined)}
                    disabled={i > step || isPending}
                    aria-current={active ? "step" : undefined}
                    className={`flex items-center gap-2 rounded-tl-md rounded-br-md border px-2 py-1 font-mono text-[11px] tracking-wider transition-colors ${
                      active
                        ? "border-base-content bg-base-content text-base-100"
                        : done
                          ? "border-base-300 text-base-content/70 hover:border-base-content"
                          : "border-transparent text-base-content/35"
                    }`}
                  >
                    <span>{done ? <Check className="size-3" /> : `0${i + 1}`}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className={`h-px w-4 sm:w-8 ${i < step ? "bg-base-content" : "bg-base-300"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      {/* ------------------------------------------------ Conteúdo */}
      <div className="flex-1 px-4 pb-32 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-5xl">
          {step === 0 && (
            <>
              <StepTitle
                index={0}
                title="Bem-vindo ao palco"
                highlight="quem é você na robótica?"
                description="Essas respostas montam o seu painel: ferramentas, atalhos e conteúdos aparecem na ordem certa para o seu jeito de participar."
              />

              {pendingFields.length > 0 && (
                <div
                  role="status"
                  className="mt-8 flex items-start gap-3 rounded-tl-2xl rounded-br-2xl border border-warning bg-warning/10 p-4 text-sm"
                >
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" />
                  <p>
                    <strong>Seu cadastro está incompleto.</strong> Para abrir o painel, falta{" "}
                    {describeMissing(pendingFields)}. Suas respostas anteriores já estão preenchidas.
                  </p>
                </div>
              )}

              <section className={`${cardShell} mt-10 p-5 shadow-[8px_8px_0_0_var(--color-secondary)] sm:p-7`}>
                <FieldLabel kicker="NOME" title="Como a equipe vai te ver" />
                <div className="mt-4 flex items-center gap-4">
                  <Avatar url={initial.avatarUrl} name={name} />
                  <div className="min-w-0 flex-1">
                    <input
                      id="onboarding-name"
                      type="text"
                      autoComplete="name"
                      maxLength={80}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                      placeholder="Seu nome"
                      className="input input-bordered input-lg w-full rounded-tl-xl rounded-br-xl"
                      aria-label="Seu nome"
                    />
                    {initial.email && (
                      <p className="mt-1.5 truncate font-mono text-[11px] text-base-content/45">
                        conta: {initial.email}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="mt-12">
                <FieldLabel kicker="PERFIL" title="Como você participa?" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {PERSONAS.map((p) => {
                    const selected = persona === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setPersona(p.value);
                          setError(null);
                        }}
                        className={`${cardShell} group flex items-center gap-4 overflow-hidden p-4 text-left transition-all duration-200 sm:p-5 ${
                          selected
                            ? "-translate-y-0.5 border-base-content shadow-[6px_6px_0_0_var(--color-primary)]"
                            : "hover:-translate-y-0.5 hover:border-base-content/40 hover:shadow-[4px_4px_0_0_var(--color-base-300)]"
                        }`}
                      >
                        <div
                          className={`grid size-20 shrink-0 place-items-center rounded-tl-2xl rounded-br-2xl transition-colors sm:size-24 ${
                            selected ? "bg-accent/40" : "bg-base-200"
                          }`}
                        >
                          <Image src={p.image} alt="" width={96} height={96} className="size-full object-contain p-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold">{p.name}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-base-content/60">{p.desc}</p>
                        </div>
                        <span
                          className={`grid size-6 shrink-0 place-items-center self-start rounded-full border-2 transition-all ${
                            selected ? "border-primary bg-primary text-primary-content" : "border-base-300"
                          }`}
                        >
                          {selected && <Check className="size-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <StepTitle
                index={1}
                title="Suas competições"
                highlight="em qual arena você joga?"
                description="Toque em Participo se você compete ou orienta uma equipe nessa liga, ou em Acompanho para só receber conteúdos e ferramentas dela."
              />

              {leagues.length === 0 ? (
                <div className={`${cardShell} mt-10 p-8 text-center text-base-content/60`}>
                  Nenhuma competição cadastrada ainda.
                </div>
              ) : (
                <div className="mt-10 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {leagues.map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      state={selections[league.id]}
                      suggested={personaMeta?.defaultRelation ?? "participante"}
                      onToggle={(relation) => toggleRelation(league, relation)}
                      onField={(field, value) => {
                        patchLeague(league.id, { [field]: value });
                        setError(null);
                      }}
                      showErrors={showLeagueErrors}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <StepTitle
                index={2}
                title="Últimos ajustes"
                highlight="tudo pronto para começar."
                description="Revise o que vai para o seu perfil. Tudo isso pode ser alterado depois em Configurações."
              />

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <section className="space-y-4">
                  <FieldLabel kicker="PRIVACIDADE" title="Equipes e e-mails" />
                  <ToggleRow
                    icon={<UserPlus className="size-5" />}
                    title="Permitir convites para equipes"
                    description="Técnicos e colegas poderão te adicionar a equipes pelo seu e-mail. Desligado, ninguém consegue te convidar."
                    checked={allowTeamInvites}
                    onChange={setAllowTeamInvites}
                  />
                  <ToggleRow
                    icon={<Mail className="size-5" />}
                    title="Receber novidades do RoboStage"
                    description="No máximo um e-mail por semana com ferramentas novas e temporadas. Descadastro em um clique. Avisos importantes sobre a sua conta chegam de qualquer jeito."
                    checked={emailProductUpdates}
                    onChange={setEmailProductUpdates}
                  />
                </section>

                <section className={`${cardShell} overflow-hidden shadow-[8px_8px_0_0_var(--color-primary)]`}>
                  <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                    <span className="font-mono text-xs tracking-wider text-base-content/60">resumo do perfil</span>
                    <span className="font-mono text-[10px] tracking-widest text-base-content/35">
                      {chosen.length} {chosen.length === 1 ? "LIGA" : "LIGAS"}
                    </span>
                  </div>
                  <div className="space-y-5 p-5">
                    <SummaryRow label="Nome" onEdit={() => goTo(0)}>
                      <span className="font-bold">{name.trim()}</span>
                    </SummaryRow>
                    <SummaryRow label="Perfil" onEdit={() => goTo(0)}>
                      <span className="font-bold">{personaMeta?.name}</span>
                    </SummaryRow>
                    <SummaryRow label="Competições" onEdit={() => goTo(1)}>
                      <ul className="mt-1 space-y-2">
                        {chosen.map(({ league, state }) => (
                          <li key={league.id} className="flex items-center gap-3">
                            <LeagueLogo league={league} size="sm" className="h-10 w-16 shrink-0 rounded-tl-lg rounded-br-lg border border-base-300" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">{league.name}</p>
                              <p className="truncate text-xs text-base-content/55">
                                {state.relationType === "participante"
                                  ? [state.teamName.trim() || "Equipe não informada", state.season.trim()]
                                      .filter(Boolean)
                                      .join(" · ")
                                  : "Acompanhando"}
                              </p>
                            </div>
                            <span
                              className={`badge badge-sm ${
                                state.relationType === "participante" ? "badge-primary" : "badge-ghost"
                              }`}
                            >
                              {state.relationType === "participante" ? "Participo" : "Acompanho"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </SummaryRow>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ Barra de ações */}
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-base-300 bg-base-100/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {error ? (
              <p role="alert" className="flex items-center gap-2 text-sm font-medium text-error">
                <AlertCircle className="size-4 shrink-0" />
                <span className="truncate">{error}</span>
              </p>
            ) : (
              <p className="hidden font-mono text-[11px] tracking-wider text-base-content/45 sm:block">
                / 0{step + 1} · {STEPS[step].kicker}
                {step === 1 && chosen.length > 0 && (
                  <span className={`ml-2 ${ACCENT_TEXT}`}>
                    {chosen.length} {chosen.length === 1 ? "selecionada" : "selecionadas"}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => goTo((step - 1) as Step)}
                disabled={isPending}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </button>
            )}
            {step < 2 ? (
              <button type="button" className={primaryBtn} onClick={() => goTo((step + 1) as Step)}>
                Continuar
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button type="button" className={primaryBtn} onClick={handleSubmit} disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Preparando o palco…
                  </>
                ) : (
                  <>
                    Entrar no RoboStage
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================ PEÇAS */

function StepTitle({
  index,
  title,
  highlight,
  description,
}: {
  index: number;
  title: string;
  highlight: string;
  description: string;
}) {
  return (
    <div className="animate-fade-in-down">
      <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
        / 0{index + 1} · {STEPS[index].kicker}
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
        {title}
        <span className="text-primary">.</span>
      </h1>
      <p className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
        <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">{highlight}</span>
      </p>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-base-content/65">{description}</p>
    </div>
  );
}

function FieldLabel({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary">{kicker}</p>
      <h2 className="mt-1 text-xl font-bold">{title}</h2>
    </div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  return (
    <div className="relative shrink-0">
      <span aria-hidden="true" className="absolute -bottom-1 -right-1 size-full rounded-tl-2xl rounded-br-2xl bg-accent" />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk (domínio externo)
        <img
          src={url}
          alt=""
          className="relative size-16 rounded-tl-2xl rounded-br-2xl border border-base-content object-cover"
        />
      ) : (
        <span className="relative grid size-16 place-items-center rounded-tl-2xl rounded-br-2xl border border-base-content bg-base-100 text-xl font-black italic">
          {initials}
        </span>
      )}
    </div>
  );
}

function LeagueCard({
  league,
  state,
  suggested,
  onToggle,
  onField,
  showErrors,
}: {
  league: LeagueRow;
  state: LeagueState | undefined;
  suggested: LeagueSelectionInput["relationType"];
  onToggle: (relation: LeagueSelectionInput["relationType"]) => void;
  onField: (field: "teamName" | "season", value: string) => void;
  showErrors: boolean;
}) {
  const brand = getLeagueBrand(league);
  const gaps = state && showErrors ? leagueGaps(state) : [];
  const teamMissing = gaps.includes("league_team");
  const seasonMissing = gaps.includes("league_season");
  const isParticipant = state?.relationType === "participante";
  const isFollowing = state?.relationType === "interessado";
  const active = isParticipant || isFollowing;
  const seasonListId = `seasons-${league.id}`;

  const options: { relation: LeagueSelectionInput["relationType"]; label: string; icon: ReactNode }[] = [
    { relation: "participante", label: "Participo", icon: <Trophy className="size-4" /> },
    { relation: "interessado", label: "Acompanho", icon: <Eye className="size-4" /> },
  ];
  // A opção sugerida pelo perfil aparece primeiro.
  if (suggested === "interessado") options.reverse();

  return (
    <article
      id={`league-${league.id}`}
      className={`${cardShell} flex flex-col overflow-hidden transition-all duration-200 ${
        gaps.length > 0
          ? "-translate-y-0.5 border-error"
          : active
            ? "-translate-y-0.5 border-base-content"
            : "hover:border-base-content/40"
      }`}
      style={
        active
          ? { boxShadow: `6px 6px 0 0 ${gaps.length > 0 ? "var(--color-error)" : brand.color}` }
          : undefined
      }
    >
      <div className="relative">
        <LeagueLogo league={league} className="h-32 border-b border-base-300" />
        {active && (
          <span className="absolute left-3 top-3 grid size-7 place-items-center rounded-full border-2 border-base-100 bg-primary text-primary-content shadow">
            <Check className="size-4" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight">{league.name}</h3>
          <span className="shrink-0 rounded-tl-md rounded-br-md border border-base-300 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-base-content/60">
            {league.code}
          </span>
        </div>
        {(league.description || brand.tagline) && (
          <p className="mt-1.5 line-clamp-2 text-sm text-base-content/60">
            {league.description || brand.tagline}
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          {options.map((o) => {
            const on = state?.relationType === o.relation;
            return (
              <button
                key={o.relation}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(o.relation)}
                className={`btn btn-sm rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none ${
                  on
                    ? o.relation === "participante"
                      ? "btn-primary"
                      : "btn-neutral"
                    : "btn-outline border-base-300"
                }`}
              >
                {o.icon}
                {o.label}
              </button>
            );
          })}
        </div>

        {isParticipant && (
          <div className="mt-4 space-y-3 border-t border-dashed border-base-300 pt-4">
            <label className="block">
              <RequiredLabel text="EQUIPE" />
              <input
                type="text"
                required
                maxLength={80}
                value={state.teamName}
                onChange={(e) => onField("teamName", e.target.value)}
                placeholder="Nome ou número da equipe"
                aria-invalid={teamMissing}
                className={`input input-bordered input-sm mt-1 w-full ${teamMissing ? "input-error" : ""}`}
              />
              {teamMissing && <FieldError text="Informe a equipe." />}
            </label>
            <label className="block">
              <RequiredLabel text="TEMPORADA" />
              <input
                type="text"
                required
                maxLength={40}
                aria-invalid={seasonMissing}
                list={brand.seasons.length ? seasonListId : undefined}
                value={state.season}
                onChange={(e) => onField("season", e.target.value)}
                placeholder={brand.seasons[0] ?? "ex.: 2026"}
                className={`input input-bordered input-sm mt-1 w-full ${seasonMissing ? "input-error" : ""}`}
              />
              {seasonMissing && <FieldError text="Informe a temporada." />}
              {brand.seasons.length > 0 && (
                <datalist id={seasonListId}>
                  {brand.seasons.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              )}
            </label>
          </div>
        )}

        {isFollowing && (
          <p className="mt-4 flex items-start gap-2 border-t border-dashed border-base-300 pt-4 text-xs text-base-content/60">
            <Bell className="mt-0.5 size-3.5 shrink-0" />
            Conteúdos, documentos e ferramentas desta liga vão aparecer no seu painel.
          </p>
        )}
      </div>
    </article>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`${cardShell} flex cursor-pointer items-start gap-4 p-4 transition-colors ${
        checked ? "border-base-content" : "hover:border-base-content/40"
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-tl-xl rounded-br-xl ${
          checked ? "bg-secondary text-secondary-content" : "bg-base-200 text-base-content/60"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-base-content/60">{description}</span>
      </span>
      <input
        type="checkbox"
        className="toggle toggle-primary mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function SummaryRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/45">
          {label.toUpperCase()}
        </span>
        <button type="button" onClick={onEdit} className="btn btn-ghost btn-xs gap-1 text-base-content/55">
          <Pencil className="size-3" />
          Editar
        </button>
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function RequiredLabel({ text }: { text: string }) {
  return (
    <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/55">
      {text} <span className="text-primary" aria-hidden="true">*</span>
    </span>
  );
}

function FieldError({ text }: { text: string }) {
  return <span className="mt-1 block text-xs font-medium text-error">{text}</span>;
}
