import Image from "next/image";
import { useRouter } from "next/navigation";
import { ferramentas } from "./ferramentas.data";

interface SeasonLogo {
  name: string;
  image: string;
}

interface FerramentasSectionProps {
  seasons: string[];
  seasonLogos: Record<string, SeasonLogo>;
}

export default function FerramentasSection({
  seasons,
  seasonLogos,
}: FerramentasSectionProps) {
  const router = useRouter();

  const filtradas = ferramentas;

  return (
    <section className="grid gap-6 sm:grid-cols-2 w-full md:grid-cols-3">
      {filtradas.map((ferramenta) => (
        <div
          key={ferramenta.id}
          className="group relative card bg-base-100 border border-base-300 rounded-none rounded-tl-[30px] rounded-br-[30px] overflow-hidden hover:border-primary hover:shadow-[10px_10px_0_theme(colors.primary))] transition-colors cursor-pointer"
          onClick={() => {
            if (ferramenta.link) router.push(ferramenta.link);
          }}
        >
          {/* Badge */}
          {ferramenta.badge && (
            <div className="absolute top-4 right-4 z-10 badge badge-secondary badge-sm">
              {ferramenta.badge}
            </div>
          )}

          {/* Imagem */}
          {ferramenta.image && (
            <figure className="relative">
              <Image
                src={ferramenta.image}
                alt={ferramenta.titulo}
                width={400}
                height={225}
                className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                loading="eager"
              />

              {/* Overlay suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-base-100/70 via-transparent to-transparent -bottom-1" />
            </figure>
          )}

          {/* Corpo */}
          <div className="card-body gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                {ferramenta.icon}
              </span>

              <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                {ferramenta.categoria}
              </span>
            </div>

            <h2 className="text-lg font-bold leading-tight">
              {ferramenta.titulo}
            </h2>

            <p className="text-sm opacity-80 leading-relaxed">
              {ferramenta.descricao}
            </p>

            {/* Conteúdo customizado */}
            {ferramenta.customContent &&
              ferramenta.customContent(seasons, seasonLogos, router)}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 pb-5 pt-0">
            {ferramenta.feitoPor ? (
              <a className="text-xs font-semibold text-secondary hover:text-primary transition-colors"
                href={ferramenta.feitoPor[1]}
                target="_blank"
                rel="noopener noreferrer"
              >
                Desenvolvido por {ferramenta.feitoPor[0]}
              </a>
            ) : (
              <span />
            )}

            {ferramenta.customContent ? null : (
              <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                Abrir ferramenta →
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}