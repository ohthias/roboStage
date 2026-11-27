"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lista curada de emojis para ícones de pastas/documentos, com palavras-chave
 * em pt-BR pra busca. Não é exaustiva de propósito — cobre bem o caso de uso
 * de um caderno de equipe (trabalho, ideias, arquivos, pessoas, símbolos...).
 */
const EMOJI_ITEMS: Array<{ emoji: string; keywords: string }> = [
  { emoji: "📁", keywords: "pasta folder arquivo" },
  { emoji: "📂", keywords: "pasta aberta folder open" },
  { emoji: "🗂️", keywords: "pasta indice organizar" },
  { emoji: "📝", keywords: "documento nota anotacao escrever" },
  { emoji: "📄", keywords: "documento pagina arquivo" },
  { emoji: "📋", keywords: "prancheta lista checklist" },
  { emoji: "📌", keywords: "fixar pin importante" },
  { emoji: "📎", keywords: "clipe anexo" },
  { emoji: "🔖", keywords: "marcador bookmark" },
  { emoji: "🗒️", keywords: "bloco nota anotacao" },
  { emoji: "🗓️", keywords: "calendario agenda data" },
  { emoji: "📅", keywords: "calendario data evento" },
  { emoji: "⏰", keywords: "relogio prazo alarme" },
  { emoji: "✅", keywords: "check concluido feito ok" },
  { emoji: "☑️", keywords: "checklist marcado tarefa" },
  { emoji: "🎯", keywords: "meta objetivo alvo foco" },
  { emoji: "🚀", keywords: "lancamento rapido projeto" },
  { emoji: "💡", keywords: "ideia insight" },
  { emoji: "🔥", keywords: "urgente quente prioridade" },
  { emoji: "⭐", keywords: "estrela favorito destaque" },
  { emoji: "🌟", keywords: "estrela brilho destaque" },
  { emoji: "🏆", keywords: "troféu conquista premio" },
  { emoji: "📊", keywords: "grafico dados relatorio" },
  { emoji: "📈", keywords: "crescimento grafico metrica" },
  { emoji: "📉", keywords: "queda grafico metrica" },
  { emoji: "🧮", keywords: "calculo financeiro numeros" },
  { emoji: "💰", keywords: "dinheiro financeiro" },
  { emoji: "💳", keywords: "cartao pagamento" },
  { emoji: "🧾", keywords: "recibo nota fiscal" },
  { emoji: "🛒", keywords: "compras carrinho" },
  { emoji: "📦", keywords: "pacote entrega produto" },
  { emoji: "🚚", keywords: "entrega logistica" },
  { emoji: "🛠️", keywords: "ferramenta manutencao" },
  { emoji: "⚙️", keywords: "configuracao engrenagem sistema" },
  { emoji: "🔧", keywords: "ferramenta ajuste" },
  { emoji: "🧩", keywords: "quebra cabeca integracao" },
  { emoji: "💻", keywords: "computador codigo dev" },
  { emoji: "🖥️", keywords: "computador desktop" },
  { emoji: "⌨️", keywords: "teclado" },
  { emoji: "🐛", keywords: "bug erro" },
  { emoji: "🔐", keywords: "seguranca senha" },
  { emoji: "🔑", keywords: "chave acesso" },
  { emoji: "🌐", keywords: "internet web global" },
  { emoji: "☁️", keywords: "nuvem cloud" },
  { emoji: "📡", keywords: "conexao sinal rede" },
  { emoji: "🧠", keywords: "ideia cerebro estrategia" },
  { emoji: "📚", keywords: "livros estudo documentacao" },
  { emoji: "📖", keywords: "livro leitura manual" },
  { emoji: "🔍", keywords: "buscar pesquisa lupa" },
  { emoji: "🧭", keywords: "direcao bussola estrategia" },
  { emoji: "🗺️", keywords: "mapa roadmap plano" },
  { emoji: "🧪", keywords: "teste experimento" },
  { emoji: "🎨", keywords: "design arte criativo" },
  { emoji: "✏️", keywords: "editar lapis escrever" },
  { emoji: "🖊️", keywords: "caneta escrever assinar" },
  { emoji: "📣", keywords: "anuncio marketing comunicacao" },
  { emoji: "📢", keywords: "anuncio aviso" },
  { emoji: "💬", keywords: "conversa comentario chat" },
  { emoji: "📞", keywords: "telefone contato" },
  { emoji: "📧", keywords: "email correio" },
  { emoji: "👥", keywords: "pessoas equipe time" },
  { emoji: "🧑‍💼", keywords: "pessoa trabalho profissional" },
  { emoji: "🤝", keywords: "acordo parceria reuniao" },
  { emoji: "🏢", keywords: "empresa escritorio organizacao" },
  { emoji: "🏠", keywords: "casa home inicio" },
  { emoji: "🌍", keywords: "mundo global" },
  { emoji: "✈️", keywords: "viagem avião" },
  { emoji: "🚗", keywords: "carro viagem" },
  { emoji: "☀️", keywords: "sol dia" },
  { emoji: "🌙", keywords: "lua noite" },
  { emoji: "🌱", keywords: "planta crescimento inicio" },
  { emoji: "🌳", keywords: "arvore natureza" },
  { emoji: "🍀", keywords: "sorte trevo" },
  { emoji: "☕", keywords: "cafe pausa" },
  { emoji: "🍕", keywords: "comida pizza" },
  { emoji: "🎉", keywords: "festa comemoracao" },
  { emoji: "🎁", keywords: "presente entrega" },
  { emoji: "❤️", keywords: "coracao amor favorito" },
  { emoji: "⚠️", keywords: "atencao alerta aviso" },
  { emoji: "🚧", keywords: "em construcao pendente" },
  { emoji: "❓", keywords: "duvida pergunta" },
  { emoji: "❗", keywords: "importante exclamacao" },
  { emoji: "🔒", keywords: "privado bloqueado" },
  { emoji: "🔓", keywords: "publico aberto" },
];

export function EmojiPicker({
  onSelect,
  onClose,
  onRemove,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJI_ITEMS;
    return EMOJI_ITEMS.filter((item) => item.keywords.includes(q));
  }, [query]);

  return (
    <div
      ref={containerRef}
      onMouseDown={(event) => event.stopPropagation()}
      className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl"
    >
      <input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar emoji…"
        className="input input-bordered input-sm mb-2 w-full"
      />

      <div className="grid max-h-52 grid-cols-7 gap-1 overflow-y-auto">
        {filtered.map((item) => (
          <button
            key={item.emoji}
            type="button"
            onClick={() => onSelect(item.emoji)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-base-200"
          >
            {item.emoji}
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-7 py-4 text-center text-xs text-base-content/40">
            Nenhum emoji encontrado.
          </p>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="btn btn-ghost btn-xs mt-2 w-full text-error"
        >
          Remover ícone
        </button>
      )}
    </div>
  );
}
