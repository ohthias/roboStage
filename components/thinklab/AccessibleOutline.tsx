import type { FishboneData } from "@/utils/thinklab/types";

interface AccessibleOutlineProps {
  data: FishboneData;
}

/**
 * Representação em lista aninhada (HTML semântico) da mesma estrutura do SVG.
 * O <svg> já tem <title>/<desc>, mas para conteúdo hierárquico rico uma lista
 * navegável por teclado/leitor de tela é uma alternativa muito mais utilizável
 * do que apenas descrever o gráfico em um parágrafo.
 */
export default function AccessibleOutline({ data }: AccessibleOutlineProps) {
  if (data.causes.length === 0) {
    return (
      <p className="text-sm text-base-content/60">
        Nenhuma causa adicionada ainda. Escreva no editor usando <code>##</code> para começar.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-base-content/80">
        Problema principal: <span className="font-normal">{data.problem || "não definido"}</span>
      </p>
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        {data.causes.map((cause, ci) => (
          <li key={ci}>
            <span className="font-semibold text-[#C9622F]">{cause.name}</span>
            {cause.subcauses.length > 0 && (
              <ol className="mt-1 list-[lower-alpha] space-y-2 pl-5">
                {cause.subcauses.map((sub, si) => (
                  <li key={si}>
                    <span className="font-medium text-[#1F7A6C]">{sub.name}</span>
                    {sub.details.length > 0 && (
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {sub.details.map((detail, di) => (
                          <li key={di} className="text-[#5B5FC7]">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
