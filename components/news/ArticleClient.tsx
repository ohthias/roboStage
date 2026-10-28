"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

/** Barra fina no topo que mostra quanto do artigo já foi lido. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(total <= 0 ? (r.top < 0 ? 1 : 0) : Math.min(1, Math.max(0, -r.top / total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
      <div className="h-full origin-left bg-primary transition-transform duration-75" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

/** Compartilha a notícia atual; sem suporte nativo, copia o link. */
export function ShareArticle({ title, className = "" }: { title: string; className?: string }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = window.location.href.split("#")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelado: segue para copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast("Link da notícia copiado!", "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      addToast("Não foi possível compartilhar.", "error");
    }
  };

  return (
    <button type="button" onClick={onClick} className={className}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Link copiado" : "Compartilhar"}
    </button>
  );
}
