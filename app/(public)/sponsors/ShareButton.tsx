"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

const SHARE = {
  title: "RoboStage",
  text: "Conheça o RoboStage, uma plataforma para equipes de robótica.",
};

// Usa o compartilhamento nativo quando existe; senão copia o link.
export default function ShareButton({ className = "" }: { className?: string }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ ...SHARE, url });
        return;
      } catch {
        /* cancelado: segue para copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(`${SHARE.text} ${url}`);
      setCopied(true);
      addToast("Link copiado! Agora é só colar.", "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      addToast("Não foi possível compartilhar.", "error");
    }
  };

  return (
    <button type="button" onClick={onClick} className={className}>
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      {copied ? "Link copiado" : "Compartilhar"}
    </button>
  );
}

export function CopyLinkButton({ className = "" }: { className?: string }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.origin);
          setCopied(true);
          addToast("Link copiado!", "success");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          addToast("Não foi possível copiar.", "error");
        }
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      Copiar link
    </button>
  );
}
