import { ArrowUpRight, Calendar, Layers } from "lucide-react";
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

function TestImage({ image, modeIcon: ModeIcon }: { image: TestImage; modeIcon: typeof Layers }) {
  if (Array.isArray(image)) {
    return image.length > 0 ? (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-px bg-base-300">
        {image.map((source, index) => (
          <div key={source} className="relative min-h-0 overflow-hidden bg-base-200/40">
            <Image
              src={source}
              alt={`Missão ${index + 1}`}
              fill
              sizes="112px"
              className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    ) : null;
  }

  return image ? (
    <>
      <Image
        src={image}
        alt=""
        fill
        sizes="224px"
        className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-base-300/25 to-transparent" />
    </>
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 text-base-content/30">
        <ModeIcon className="size-6" />
      </div>
    </div>
  );
}

export function LabTestCard({ test, viewMode }: { test: LabTestCardData; viewMode: "grid" | "list" }) {
  const modeMeta = getModeMeta(test.mode);
  const statusMeta = STATUS_META[test.status as keyof typeof STATUS_META] ?? {
    label: test.status,
    badgeClass: "badge-ghost",
  };
  const ModeIcon = modeMeta.icon;
  const testImage = getTestImage(test);

  return (
<Link
  href={`/dashboard/labtest/${test.id}`}
  className={`group relative w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${
    viewMode === "grid"
      ? "flex min-h-[380px] flex-col"
      : "flex min-h-[180px]"
  }`}
>
  {/* Imagem */}
  <div
    className={`relative shrink-0 overflow-hidden border-base-300 ${
      viewMode === "grid"
        ? "h-44 w-full border-b"
        : "w-44 border-r sm:w-52"
    } ${testImage ? "bg-base-200/40" : "bg-base-200/30"}`}
  >
    <TestImage image={testImage} modeIcon={ModeIcon} />

    {/* Indicador do modo */}
    <div className="absolute left-3 top-3">
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-base-300/70 bg-base-100/90 px-2.5 py-1 text-[10px] font-medium text-base-content/65 shadow-sm backdrop-blur">
        <ModeIcon className="size-3.5 text-primary" />
        {modeMeta.label}
      </span>
    </div>
  </div>

  {/* Conteúdo */}
  <div className="flex min-w-0 flex-1 flex-col p-5">
    {/* Cabeçalho */}
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 truncate text-[15px] font-semibold tracking-tight text-base-content transition-colors group-hover:text-primary">
            {test.name}
          </h3>

          <ArrowUpRight
            className="
              size-4 shrink-0
              text-base-content/20
              transition-all duration-200
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              group-hover:text-primary
            "
          />
        </div>

        <p className="mt-1 text-[11px] text-base-content/40">
          Criado em {dateFormatter.format(new Date(test.createdAt))}
        </p>
      </div>

      <span
        className={`badge badge-sm shrink-0 font-medium ${statusMeta.badgeClass}`}
      >
        {statusMeta.label}
      </span>
    </div>

    {/* Descrição */}
    <div className="mt-5 min-h-[40px]">
      {test.description ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-base-content/60">
          {test.description}
        </p>
      ) : (
        <p className="text-xs italic text-base-content/30">
          Nenhuma descrição adicionada.
        </p>
      )}
    </div>

    {/* Configuração */}
    <div className="mt-5 rounded-xl border border-base-300 bg-base-200/30 px-3.5 py-3">
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-base-content/35">
        Configuração
      </p>

      <p
        className="truncate text-xs font-medium text-base-content/70"
        title={summarizeConfig(test.mode, test.config)}
      >
        {summarizeConfig(test.mode, test.config)}
      </p>
    </div>

    {/* Rodapé */}
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
      <div className="flex min-w-0 items-center gap-2">
        {test.season ? (
          <span className="badge badge-outline badge-xs font-mono uppercase tracking-wide">
            {test.season}
          </span>
        ) : (
          <span className="text-[10px] text-base-content/25">
            Sem temporada
          </span>
        )}
      </div>

      <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-base-content/40">
        <Calendar className="size-3.5" />
        {dateFormatter.format(new Date(test.createdAt))}
      </span>
    </div>
  </div>

  {/* Linha de interação */}
  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
</Link>
  );
}
