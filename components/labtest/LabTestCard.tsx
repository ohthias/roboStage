import {
  ArrowUpRight,
  CalendarDays,
  Layers,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  getModeMeta,
  getTestImage,
  STATUS_META,
  summarizeConfig,
  type TestImage,
} from "@/utils/labtest/catalog";

export type LabTestCardData = {
  id: string;
  name: string;
  mode: string;
  status: string;
  description: string | null;
  season: string | null;
  config: unknown;
  createdAt: Date | string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function TestImagePreview({
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
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
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

export function LabTestCard({
  test,
  viewMode,
}: {
  test: LabTestCardData;
  viewMode: "grid" | "list";
}) {
  const modeMeta = getModeMeta(test.mode);
  const ModeIcon = modeMeta.icon;
  const testImage = getTestImage(test);
  const configSummary = summarizeConfig(test.mode, test.config);

  const createdAt = new Date(test.createdAt);
  const createdAtLabel = Number.isNaN(createdAt.getTime())
    ? "Data indisponível"
    : dateFormatter.format(createdAt);

  const statusMeta = STATUS_META[test.status as keyof typeof STATUS_META] ?? {
    label: test.status,
    badgeClass: "badge-ghost",
  };

  const statusBadgeClass =
    ({
      "badge-primary": "badge-primary",
      "badge-secondary": "badge-secondary",
      "badge-accent": "badge-accent",
      "badge-info": "badge-info",
      "badge-success": "badge-success",
      "badge-warning": "badge-warning",
      "badge-error": "badge-error",
      "badge-neutral": "badge-neutral",
      "badge-ghost": "badge-ghost",
    } as Record<string, string>)[statusMeta.badgeClass] ?? "badge-ghost";

  return (
    <Link
      href={`/dashboard/labtest/${test.id}`}
      className={`group relative flex w-full overflow-hidden
        rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-md
        border border-base-300 bg-base-100
        transition-all duration-200
        hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary/50 ${
          viewMode === "grid"
            ? "min-h-[350px] flex-col"
            : "min-h-[176px] flex-row"
        }`}
    >
      {/* Prévia visual */}
      <div
        className={`relative shrink-0 overflow-hidden bg-base-200/50 ${
          viewMode === "grid"
            ? "h-40 w-full border-b border-base-300"
            : "min-h-full w-28 border-r border-base-300 sm:w-40"
        }`}
      >
        <TestImagePreview image={testImage} modeIcon={ModeIcon} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight text-base-content transition-colors duration-200 group-hover:text-primary">
                {test.name}
              </h3>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-base-content/30 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-base-content/45">
              Criado em {createdAtLabel}
            </p>
          </div>
          <span
            className={`badge badge-sm shrink-0 font-medium ${statusBadgeClass}`}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="mt-4 min-h-4">
          {test.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-base-content/65">
              {test.description}
            </p>
          ) : (
            <p className="text-xs italic leading-relaxed text-base-content/35">
              Nenhuma descrição adicionada.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-md border border-base-300/80 bg-base-200/40 px-3.5 py-3">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-base-content/45">
            Configuração
          </p>
          <p
            className="truncate text-xs font-medium text-base-content/75"
            title={configSummary}
          >
            {configSummary}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4 mt-5">
          <div className="min-w-0">
            {test.season ? (
              <span className="badge badge-outline badge-sm max-w-full truncate font-mono text-[10px] uppercase tracking-wide">
                {test.season}
              </span>
            ) : (
              <span className="text-[10px] text-base-content/40">
                Teste do robô
              </span>
            )}
          </div>

          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-base-content/45">
            <CalendarDays className="size-3.5" />
            {createdAtLabel}
          </span>
        </div>
      </div>

      {/* Indicador de interação */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"
      />
    </Link>
  );
}
