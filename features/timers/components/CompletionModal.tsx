"use client";

import React from "react";
import { ArrowLeft, BellOff, RotateCcw, Trophy } from "lucide-react";
import { Button, Modal, Starburst } from "@/components/stage";

interface CompletionModalProps {
  isOpen: boolean;
  title: string;
  subTitle?: string;
  onReset: () => void;
  onMenu: () => void;
  /** Fechar no X/Esc. Padrão: igual a "Reiniciar". */
  onClose?: () => void;
  /** Linhas extras de resumo (ex.: etapas, desistências). */
  details?: { label: string; value: React.ReactNode }[];
  /** Mostra "Parar alarme" quando o alarme está tocando. */
  onSilence?: () => void;
}

/**
 * Fim de timer no padrão Stage UI: faixa colorida com textura e Starburst,
 * resumo opcional e dois botões (reiniciar / voltar ao menu).
 */
export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  title,
  subTitle = "Timer finalizado.",
  onReset,
  onMenu,
  onClose,
  details,
  onSilence,
}) => (
  <Modal
    open={isOpen}
    onClose={onClose ?? onReset}
    dismissible={false}
    title={title}
    kicker="Fim do tempo"
    icon={<Trophy size={22} />}
    iconTone="accent"
    size="sm"
    sticker={false}
    footer={
      <>
        <Button tone="outline" iconLeft={<ArrowLeft size={16} />} onClick={onMenu}>
          Voltar ao menu
        </Button>
        <Button tone="primary" iconLeft={<RotateCcw size={16} />} onClick={onReset} data-autofocus>
          Reiniciar
        </Button>
      </>
    }
  >
    <div className="stage-texture stage-grid-on-color relative -mx-6 -mt-6 mb-5 overflow-hidden border-b border-base-300 bg-primary px-6 py-8 text-center text-primary-content">
      <span className="absolute -right-3 -top-3 rotate-12" aria-hidden>
        <Starburst size={84} tone="accent" motion="spin">
          <span className="text-[11px] font-black leading-none">0:00</span>
        </Starburst>
      </span>
      <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-80">Tempo esgotado</p>
      <p className="stage-display mt-1 text-6xl leading-none tabular-nums">0:00</p>
      <p className="mt-3 text-sm opacity-90">{subTitle}</p>
    </div>

    {details && details.length > 0 && (
      <dl className="mb-2 divide-y divide-dashed divide-base-300">
        {details.map((d) => (
          <div key={d.label} className="flex items-baseline justify-between gap-4 py-2 text-sm">
            <dt className="text-base-content/65">{d.label}</dt>
            <dd className="font-black tabular-nums">{d.value}</dd>
          </div>
        ))}
      </dl>
    )}

    {onSilence && (
      <Button tone="ghost" size="sm" iconLeft={<BellOff size={15} />} onClick={onSilence} className="w-full">
        Parar alarme
      </Button>
    )}
  </Modal>
);
