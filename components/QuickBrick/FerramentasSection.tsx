import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Smartphone } from "lucide-react";
import { ferramentas, ferramentasPorCompeticao, type Ferramenta, type SeasonLogo } from "./ferramentas.data";

interface FerramentasSectionProps {
  seasons: string[];
  seasonLogos: Record<string, SeasonLogo>;
  competition: string;
}

export default function FerramentasSection({
  seasons,
  seasonLogos,
  competition,
}: FerramentasSectionProps) {
  const router = useRouter();

  const allowedTools = ferramentasPorCompeticao[competition] ?? [];
  const filtradas = ferramentas
    .filter((ferramenta) => allowedTools.includes(ferramenta.id))
    .map((ferramenta) => ({
      ...ferramenta,
      link: ferramenta.link?.replace("/fll/", `/${competition}/`),
    }));

  return (
    <section className="grid w-full gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
      {filtradas.map((ferramenta, index) => (
        <FerramentaCard
          key={ferramenta.id}
          ferramenta={ferramenta}
          index={index}
          extra={ferramenta.customContent?.(seasons, seasonLogos, router)}
        />
      ))}
    </section>
  );
}

/**
 * Card de ferramenta: cantos assimétricos (30px no topo-esquerdo e no
 * base-direito) e sombra "dura" na cor primária quando ativo.
 *
 * O card inteiro é clicável pelo título (link "esticado" com `after:inset-0`),
 * então funciona com teclado e leitor de tela; links e botões internos ficam
 * acima dele (`relative z-10`) e não disparam a navegação do card.
 */
function FerramentaCard({
  ferramenta,
  index,
  extra,
}: {
  ferramenta: Ferramenta;
  index: number;
  extra: React.ReactNode;
}) {
  const hasLink = Boolean(ferramenta.link);
  const numero = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-none rounded-tl-[30px] rounded-br-[30px] border border-base-300 bg-base-100 transition-[transform,box-shadow,border-color] duration-200 ease-out ${
        hasLink
          ? "hover:-translate-x-1 hover:-translate-y-1 hover:border-primary hover:shadow-[8px_8px_0_var(--color-primary)] has-[.card-link:focus-visible]:-translate-x-1 has-[.card-link:focus-visible]:-translate-y-1 has-[.card-link:focus-visible]:border-primary has-[.card-link:focus-visible]:shadow-[8px_8px_0_var(--color-primary)] motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0"
          : "hover:border-primary/60"
      }`}
    >
      {/* Capa: imagem da ferramenta ou padrão pontilhado com o ícone */}
      {ferramenta.image ? (
        <figure className="relative overflow-hidden border-b border-base-300 bg-base-200">
          <Image
            src={ferramenta.image}
            alt=""
            width={400}
            height={225}
            className="aspect-video w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-100/60 via-transparent to-transparent" />
        </figure>
      ) : !extra ? (
        <div
          aria-hidden
          className="relative grid aspect-video place-items-center overflow-hidden border-b border-base-300 bg-base-200/60 text-primary"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklab, var(--color-base-content) 14%, transparent) 1px, transparent 1.2px)",
            backgroundSize: "16px 16px",
          }}
        >
          <span className="grid size-16 place-items-center rounded-none rounded-tl-2xl rounded-br-2xl bg-base-100 shadow-[4px_4px_0_var(--color-primary)] ring-1 ring-primary/30 transition-transform duration-300 group-hover:-rotate-6 motion-reduce:group-hover:rotate-0 [&>svg]:size-7">
            {ferramenta.icon}
          </span>
        </div>
      ) : null}

      {/* Corpo */}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary/80">
            <span className="grid size-8 place-items-center rounded-none rounded-tl-lg rounded-br-lg bg-primary/10 text-primary [&>svg]:size-4">
              {ferramenta.icon}
            </span>
            {ferramenta.categoria}
          </span>
          <span className="flex items-center gap-1.5">
            {ferramenta.badge && (
              <span className="badge badge-secondary badge-sm font-semibold">{ferramenta.badge}</span>
            )}
            {ferramenta.mobileSafe && (
              <span className="badge badge-success badge-sm gap-1 md:hidden">
                <Smartphone className="size-3" /> Mobile
              </span>
            )}
            <span className="font-mono text-xs tabular-nums text-base-content/30">{numero}</span>
          </span>
        </div>

        <h2 className="text-lg font-bold leading-tight">
          {hasLink ? (
            <Link
              href={ferramenta.link!}
              className="card-link outline-none after:absolute after:inset-0 after:z-0 after:content-['']"
            >
              {ferramenta.titulo}
            </Link>
          ) : (
            ferramenta.titulo
          )}
        </h2>

        <p className="line-clamp-3 text-sm leading-relaxed text-base-content/70">{ferramenta.descricao}</p>

        {extra && (
          <div className="relative z-10 mt-1">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-base-content/40">
              Escolha a temporada
            </p>
            {extra}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-end justify-between gap-3 pl-6">
        <div className="min-w-0 pb-5">
          {ferramenta.feitoPor && (
            <a
              className="relative z-10 text-xs font-semibold text-secondary underline-offset-2 transition-colors hover:text-primary hover:underline"
              href={ferramenta.feitoPor[1]}
              target="_blank"
              rel="noopener noreferrer"
            >
              Desenvolvido por {ferramenta.feitoPor[0]}
            </a>
          )}
        </div>

        {hasLink && (
          <span
            aria-hidden
            className="flex h-12 shrink-0 items-center gap-2 rounded-none rounded-tl-[18px] border-l border-t border-base-300 bg-base-200/60 pl-4 pr-5 text-xs font-semibold text-base-content/60 transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content group-has-[.card-link:focus-visible]:bg-primary group-has-[.card-link:focus-visible]:text-primary-content"
          >
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-28 group-has-[.card-link:focus-visible]:max-w-28">
              Abrir ferramenta
            </span>
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:rotate-45" />
          </span>
        )}
      </div>
    </article>
  );
}