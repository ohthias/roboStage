import { ArrowUpRight, History, Play, Sparkles, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TagList } from "@/features/stagebook/components/labels/tag-chip";
import { MilestoneChip } from "@/features/stagebook/components/labels/milestone-chip";
import type { MilestoneDTO, TagDTO } from "@/features/stagebook/types/labels";
import {
  getModeMeta,
  getRunVariant,
  getTestImage,
  type RunVariant,
  normalizeStatus,
  STATUS_META,
  summarizeConfig,
  type TestImage,
} from "@/features/labtest/lib/catalog";

export type LabTestCardData = {
  id: string;
  name: string;
  mode: string;
  status: string;
  description: string | null;
  season: string | null;
  config: unknown;
  createdAt: Date | string;
  /** Data da execução mais recente (null = nunca executado). */
  lastExecutedAt?: Date | string | null;
  executionCount?: number;
  /** Pontos da última execução; null quando o modo não pontua. */
  lastScore?: number | null;
  /** Tags e milestone universais (mesmo catálogo das outras ferramentas). */
  tags?: TagDTO[];
  milestone?: MilestoneDTO | null;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** "há 3 horas", "ontem", "há 2 semanas"… */
function relativeTime(value: Date) {
  const diff = (value.getTime() - Date.now()) / 1000;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 7],
    ["week", 4.35],
    ["month", 12],
    ["year", Infinity],
  ];
  let amount = diff;
  for (const [unit, size] of steps) {
    if (Math.abs(amount) < size) return relativeFormatter.format(Math.round(amount), unit);
    amount /= size;
  }
  return dateFormatter.format(value);
}

const toDate = (v: Date | string | null | undefined) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const STATUS_DOT: Record<string, string> = {
  "badge-warning": "bg-warning",
  "badge-success": "bg-success",
  "badge-error": "bg-error",
  "badge-info": "bg-info",
  "badge-primary": "bg-primary",
};

export function TestImagePreview({
  image,
  modeIcon: ModeIcon,
}: {
  image: TestImage;
  modeIcon: LucideIcon;
}) {
  if (Array.isArray(image) && image.length > 0) {
    return (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 p-1.5">
        {image.slice(0, 4).map((source, index) => (
          <div
            key={`${source}-${index}`}
            className="relative min-h-0 overflow-hidden rounded-lg bg-base-100/70"
          >
            <Image
              src={source}
              alt={`Missão ${index + 1}`}
              fill
              sizes="112px"
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    );
  }

  if (typeof image === "string" && image) {
    return (
      <>
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 160px, 224px"
          className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-300/20 to-transparent" />
      </>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-base-content/40 transition-colors duration-200 group-hover:border-primary/30 group-hover:text-primary">
        <ModeIcon className="size-5" strokeWidth={1.7} />
      </div>
    </div>
  );
}

/**
 * Prévia dos modos especiais de run: logo da temporada (ou as imagens do
 * teste, quando não há logo) + selo com o ícone do modo.
 */
function RunVariantPreview({
  variant,
  image,
  modeIcon,
}: {
  variant: RunVariant;
  image: TestImage;
  modeIcon: LucideIcon;
}) {
  const Icon = variant.icon;
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {variant.logo ? (
        <Image
          src={variant.logo}
          alt=""
          fill
          sizes="(max-width: 640px) 160px, 224px"
          className="object-contain p-6 opacity-90 transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : (
        <TestImagePreview image={image} modeIcon={modeIcon} />
      )}
      <span
        className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-tl-lg rounded-br-lg bg-primary px-2 py-1 text-[11px] font-semibold text-primary-content shadow-sm"
        title={`${variant.competition} · ${variant.label}`}
      >
        <Icon className="size-3.5" strokeWidth={2.2} />
        <span className="max-sm:sr-only">{variant.label}</span>
      </span>
    </div>
  );
}

function cardData(test: LabTestCardData) {
  const modeMeta = getModeMeta(test.mode);
  const statusMeta = STATUS_META[normalizeStatus(test.status) ?? ("" as keyof typeof STATUS_META)] ?? {
    label: test.status,
    badgeClass: "badge-ghost",
  };
  const lastRun = toDate(test.lastExecutedAt);
  const created = toDate(test.createdAt);
  const count = test.executionCount ?? 0;
  return {
    modeMeta,
    ModeIcon: modeMeta.icon,
    testImage: getTestImage(test),
    runVariant: getRunVariant(test),
    configSummary: summarizeConfig(test.mode, test.config),
    statusLabel: statusMeta.label,
    statusDot: STATUS_DOT[statusMeta.badgeClass] ?? "bg-base-content/40",
    lastRunLabel: lastRun
      ? `Última execução ${relativeTime(lastRun)}`
      : created
        ? `Criado em ${dateFormatter.format(created)} · ainda não executado`
        : "Ainda não executado",
    lastRunTitle: lastRun ? lastRun.toLocaleString("pt-BR") : undefined,
    countLabel: count === 1 ? "1 execução" : `${count} execuções`,
    count,
    hasScore: typeof test.lastScore === "number",
  };
}

function Preview({ data }: { data: ReturnType<typeof cardData> }) {
  return data.runVariant ? (
    <RunVariantPreview variant={data.runVariant} image={data.testImage} modeIcon={data.ModeIcon} />
  ) : (
    <TestImagePreview image={data.testImage} modeIcon={data.ModeIcon} />
  );
}

/** Chips da linha de metadados (modo, temporada, execuções, milestone, tags). */
function MetaChips({
  test,
  data,
  tone = "light",
}: {
  test: LabTestCardData;
  data: ReturnType<typeof cardData>;
  tone?: "light" | "onColor";
}) {
  const chip =
    tone === "onColor"
      ? "bg-white/15 text-white backdrop-blur-sm"
      : "bg-base-200 text-base-content/75";
  const ModeIcon = data.ModeIcon;
  return (
    <div className="relative z-10 flex flex-wrap items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${chip}`}>
        <ModeIcon className="size-3" /> {data.modeMeta.label}
      </span>
      {test.season && (
        <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide ${chip}`}>
          {test.season}
        </span>
      )}
      {data.count > 0 && (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${chip}`}>{data.countLabel}</span>
      )}
      {tone === "light" && test.milestone && <MilestoneChip milestone={test.milestone} size="xs" />}
      {tone === "light" && <TagList tags={test.tags ?? []} />}
    </div>
  );
}

function ScorePill({ score, tone = "dark" }: { score: number; tone?: "dark" | "onColor" }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-sm font-bold tabular-nums ${
        tone === "onColor" ? "bg-black/30 text-white backdrop-blur-sm" : "bg-base-content text-base-100"
      }`}
      title="Pontos na última execução"
    >
      {score}
      <span className="ml-0.5 text-[10px] font-semibold opacity-70">pts</span>
    </span>
  );
}

/**
 * Card do LabTest. Na grade segue o "card de produto" (imagem recortada
 * dentro do card, título com placar em pílula, chips e botão largo); o
 * `featured` é a versão imersiva usada no teste executado mais recentemente.
 * Título é o link principal (esticado sobre o card); o botão de executar fica
 * por cima, com link próprio.
 */
export function LabTestCard({
  test,
  viewMode,
  featured = false,
}: {
  test: LabTestCardData;
  viewMode: "grid" | "list";
  /** Teste executado mais recentemente — destaque na primeira página. */
  featured?: boolean;
}) {
  const data = cardData(test);
  const href = `/dashboard/labtest/${test.id}`;
  const executeHref = `/dashboard/labtest/${test.id}/execute`;

  const titleLink = (className: string) => (
    <Link
      href={href}
      className={`min-w-0 after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none ${className}`}
    >
      {test.name}
    </Link>
  );

  const statusPill = (onColor = false) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md ${
        onColor ? "bg-white/70 text-base-content" : "bg-base-100/85 text-base-content/80 shadow-sm"
      }`}
    >
      <span className={`size-1.5 rounded-full ${data.statusDot}`} aria-hidden />
      {data.statusLabel}
    </span>
  );

  const shell =
    "group relative isolate overflow-hidden rounded-tl-[28px] rounded-br-[28px] rounded-tr-lg rounded-bl-lg transition duration-200 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-primary/50";

  // --- Lista ---------------------------------------------------------------
  if (viewMode === "list") {
    return (
      <article className={`${shell} flex items-stretch gap-4 border border-base-300/70 bg-base-100 p-2.5 shadow-sm hover:shadow-lg`}>
        <div className="relative w-28 shrink-0 overflow-hidden rounded-tl-[20px] rounded-br-[20px] rounded-tr-md rounded-bl-md bg-primary/[0.07] sm:w-44">
          <Preview data={data} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col py-1.5 pr-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                {statusPill()}
                {featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <Sparkles className="size-3" /> Mais recente
                  </span>
                )}
              </div>
              <h3 className="truncate text-base font-bold tracking-tight">
                {titleLink("transition-colors group-hover:text-primary")}
              </h3>
            </div>
            {data.hasScore && <ScorePill score={test.lastScore as number} />}
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-base-content/55">
            {test.description || data.configSummary}
          </p>
          <div className="mt-3">
            <MetaChips test={test} data={data} />
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-base-content/50" title={data.lastRunTitle}>
              <History className="size-3.5" /> {data.lastRunLabel}
            </span>
            <Link
              href={executeHref}
              className="btn btn-sm relative z-10 gap-1.5 rounded-full border-none bg-base-content px-4 text-base-100 hover:bg-base-content/85"
            >
              <Play className="size-3.5" /> Executar
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // --- Grade: destaque imersivo ---------------------------------------------
  if (featured) {
    return (
      <article
        className={`${shell} flex min-h-[420px] flex-col justify-end text-white shadow-lg hover:shadow-2xl md:col-span-2`}
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 9%, var(--color-base-100)) 0%, color-mix(in oklab, var(--color-primary) 22%, var(--color-base-100)) 38%, var(--color-primary) 72%, color-mix(in oklab, var(--color-primary) 80%, black) 100%)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[62%] transition-transform duration-500 group-hover:scale-[1.03]">
          <Preview data={data} />
        </div>
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
          {statusPill(true)}
        </div>
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-primary backdrop-blur-md">
          <Sparkles className="size-3" /> Executado mais recentemente
        </span>

        <div className="relative space-y-3 p-5 pt-10">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-bold leading-tight tracking-tight drop-shadow-sm">{titleLink("")}</h3>
            {data.hasScore && <ScorePill score={test.lastScore as number} tone="onColor" />}
          </div>
          <p className="line-clamp-2 max-w-2xl text-sm text-white/80">{test.description || data.configSummary}</p>
          <MetaChips test={test} data={data} tone="onColor" />
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={executeHref}
              className="btn relative z-10 h-12 flex-1 gap-2 rounded-full border-none bg-white text-base font-semibold text-base-content shadow-sm hover:bg-white/90 sm:flex-none sm:px-10"
            >
              <Play className="size-4" /> Nova execução
            </Link>
            <span className="text-xs text-white/75" title={data.lastRunTitle}>
              {data.lastRunLabel}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // --- Grade: card padrão ---------------------------------------------------
  return (
    <article className={`${shell} flex flex-col border border-base-300/70 bg-base-100 p-2.5 shadow-sm hover:shadow-xl`}>
      <div className="relative h-48 overflow-hidden rounded-tl-[20px] rounded-br-[20px] rounded-tr-md rounded-bl-md bg-primary/[0.07]">
        <Preview data={data} />
        <div className="absolute left-3 top-3 z-10">{statusPill()}</div>
        <ArrowUpRight
          aria-hidden
          className="absolute right-3 top-3 size-4 text-base-content/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-bold tracking-tight">
            {titleLink("transition-colors group-hover:text-primary")}
          </h3>
          {data.hasScore && <ScorePill score={test.lastScore as number} />}
        </div>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-snug text-base-content/55">
          {test.description || data.configSummary}
        </p>
        <div className="mt-3">
          <MetaChips test={test} data={data} />
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-base-content/45" title={data.lastRunTitle}>
          <History className="size-3.5" /> {data.lastRunLabel}
        </p>
        <div className="mt-auto pt-4">
          <Link
            href={executeHref}
            className="btn relative z-10 h-12 w-full gap-2 rounded-full border-none bg-base-content text-base font-semibold text-base-100 hover:bg-base-content/85"
          >
            <Play className="size-4" /> Nova execução
          </Link>
        </div>
      </div>
    </article>
  );
}
