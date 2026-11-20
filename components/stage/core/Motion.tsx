"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "../lib";

/* ------------------------------------------------------------------ */
/*  Animações                                                          */
/*  Regras da casa:                                                    */
/*  · sem JS (ou com prefers-reduced-motion) tudo aparece no estado    */
/*    final — nada some da tela se a animação não rodar;               */
/*  · durações e curvas vêm dos tokens --duration-* e --ease-* do      */
/*    stage.css;                                                       */
/*  · movimento serve a um motivo: entrada, mudança de valor,          */
/*    resposta a uma ação ou celebração.                               */
/* ------------------------------------------------------------------ */

/** true quando o sistema pede menos movimento. */
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduce(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return reduce;
}

/** Dispara uma vez quando o elemento entra na tela. */
export function useInView<T extends Element>(options: { once?: boolean; margin?: string; threshold?: number } = {}) {
  const { once = true, margin = "0px 0px -10% 0px", threshold = 0.15 } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin: margin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin, threshold]);
  return [ref, inView] as const;
}

/* =========================================================== REVEAL */

export type RevealEffect = "fade" | "fade-up" | "fade-down" | "slide-left" | "slide-right" | "pop" | "blur" | "drop";

/**
 * Reveal — entra quando aparece na rolagem.
 * Renderiza visível no servidor; só "arma" (esconde) depois de montar,
 * então funciona sem JS e com prefers-reduced-motion.
 */
export function Reveal({
  as: As = "div",
  effect = "fade-up",
  delay = 0,
  duration,
  once = true,
  className,
  style,
  children,
}: {
  as?: ElementType;
  effect?: RevealEffect;
  /** ms */
  delay?: number;
  /** ms (padrão: --duration-slow) */
  duration?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLElement>({ once });
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!reduce) setArmed(true);
  }, [reduce]);
  const state = !armed ? undefined : inView ? "shown" : "armed";
  return (
    <As
      ref={ref}
      data-reveal={state}
      data-effect={effect}
      className={className}
      style={{
        ...style,
        ["--reveal-delay" as string]: `${delay}ms`,
        ...(duration ? { ["--reveal-duration" as string]: `${duration}ms` } : {}),
      }}
    >
      {children}
    </As>
  );
}

/** Stagger — revela os filhos um depois do outro. */
export function Stagger({
  children,
  effect = "fade-up",
  step = 80,
  delay = 0,
  className,
  itemClassName,
}: {
  children: ReactNode;
  effect?: RevealEffect;
  /** Intervalo entre itens (ms). */
  step?: number;
  delay?: number;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <Reveal key={i} effect={effect} delay={delay + i * step} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/* ========================================================= NÚMEROS */

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * CountUp — conta de 0 até o valor quando entra na tela.
 * O HTML do servidor já traz o valor final (SEO, sem JS, leitores de tela).
 */
export function CountUp({
  value,
  from = 0,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (reduce) return setShown(null);
    setShown(from);
  }, [reduce, from]);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setShown(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setShown(null);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, from, duration]);

  const n = shown ?? value;
  return (
    <span ref={ref} className={cn("tabular-nums", className)} aria-label={`${prefix}${fmt(value, decimals)}${suffix}`}>
      <span aria-hidden>
        {prefix}
        {fmt(n, decimals)}
        {suffix}
      </span>
    </span>
  );
}

/**
 * FlipNumber — placar: cada dígito desliza quando o valor muda
 * (subindo quando aumenta, descendo quando diminui).
 */
export function FlipNumber({ value, minDigits = 1, className }: { value: number; minDigits?: number; className?: string }) {
  const prev = useRef(value);
  const dir = value >= prev.current ? 1 : -1;
  useEffect(() => {
    prev.current = value;
  }, [value]);
  const digits = String(Math.abs(Math.round(value))).padStart(minDigits, "0").split("");
  return (
    <span className={cn("inline-flex tabular-nums", className)} aria-live="polite" aria-label={String(value)}>
      {value < 0 && <span aria-hidden>−</span>}
      {digits.map((d, i) => (
        <span key={digits.length - i} aria-hidden className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none">
          <span
            key={d}
            className="absolute inset-0 grid place-items-center motion-safe:animate-[stage-flip-in_var(--duration-base)_var(--ease-out)_both]"
            style={{ ["--flip-from" as string]: dir > 0 ? "100%" : "-100%" }}
          >
            {d}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ============================================================ TEXTO */

/**
 * Typewriter — digita e apaga uma lista de palavras.
 * Sem JS mostra a primeira palavra inteira; leitores de tela leem todas.
 */
export function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  pause = 1400,
  className,
  caretClassName,
}: {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
  className?: string;
  caretClassName?: string;
}) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(words[0] ?? "");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reduce || words.length < 2) return;
    let i = 0;
    let len = words[0].length;
    let deleting = true;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      const w = words[i];
      if (deleting) {
        len--;
        setText(w.slice(0, len));
        if (len === 0) {
          deleting = false;
          i = (i + 1) % words.length;
        }
        t = setTimeout(step, deleteSpeed);
      } else {
        const next = words[i];
        len++;
        setText(next.slice(0, len));
        if (len === next.length) {
          deleting = true;
          t = setTimeout(step, pause);
        } else t = setTimeout(step, typeSpeed);
      }
    };
    t = setTimeout(step, pause);
    return () => clearTimeout(t);
  }, [mounted, reduce, words, typeSpeed, deleteSpeed, pause]);

  return (
    <span className={className}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden>
        {text}
        <span className={cn("ml-0.5 inline-block w-[0.08em] translate-y-[0.08em] bg-current motion-safe:animate-blink", caretClassName)} style={{ height: "0.9em" }} />
      </span>
    </span>
  );
}

/* ======================================================= INTERAÇÃO */

/** TiltCard — inclina em 3D seguindo o mouse, com brilho. Desliga no toque e em reduced motion. */
export function TiltCard({ children, max = 8, glare = true, className }: { children: ReactNode; max?: number; glare?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [s, setS] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, on: false });
  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setS({ rx: (0.5 - y) * max * 2, ry: (x - 0.5) * max * 2, gx: x * 100, gy: y * 100, on: true });
  };
  return (
    <div className={cn("[perspective:900px]", className)}>
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={() => setS((p) => ({ ...p, rx: 0, ry: 0, on: false }))}
        className="relative h-full transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${s.rx}deg) rotateY(${s.ry}deg)` }}
      >
        {children}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: s.on ? 1 : 0,
              background: `radial-gradient(circle at ${s.gx}% ${s.gy}%, rgb(255 255 255 / 0.28), transparent 55%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}

/** Magnetic — o elemento "puxa" levemente para o cursor (CTAs). */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [p, setP] = useState({ x: 0, y: 0 });
  return (
    <span
      ref={ref}
      className={cn("inline-block transition-transform duration-200 ease-out", className)}
      style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setP({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
      }}
      onPointerLeave={() => setP({ x: 0, y: 0 })}
    >
      {children}
    </span>
  );
}

/** Shake — balança quando `trigger` muda (erro de validação, código errado). */
export function Shake({ trigger, children, className }: { trigger: unknown; children: ReactNode; className?: string }) {
  const [n, setN] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setN((v) => v + 1);
  }, [trigger]);
  return (
    <div key={n} className={cn(n > 0 && "motion-safe:animate-shake", className)}>
      {children}
    </div>
  );
}

/* ========================================================= ROLAGEM */

/** ScrollProgress — barra fina no topo mostrando quanto da página já foi lida. */
export function ScrollProgress({ className, tone = "bg-primary" }: { className?: string; tone?: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? window.scrollY / h : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-x-0 top-0 z-[60] h-1", className)}>
      <div className={cn("h-full origin-left", tone)} style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

/** Parallax — desloca o conteúdo mais devagar (ou mais rápido) que a rolagem. */
export function Parallax({ speed = 0.2, children, className }: { speed?: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [y, setY] = useState(0);
  useEffect(() => {
    if (reduce) return setY(0);
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        setY(-center * speed);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [speed, reduce]);
  // O invólucro externo não se move: medimos ele (medir o elemento já deslocado acumularia o efeito).
  return (
    <div ref={ref} className={className}>
      <div style={{ transform: `translate3d(0, ${y.toFixed(1)}px, 0)` }}>{children}</div>
    </div>
  );
}

/* ======================================================= CELEBRAÇÃO */

const CONFETTI_COLORS = ["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "var(--color-success)", "var(--color-info)"];

/**
 * confetti() — explosão de confete nas cores da marca a partir de um ponto
 * (ou do elemento clicado). Não roda com prefers-reduced-motion.
 */
export function confetti(origin?: { x: number; y: number } | HTMLElement, amount = 70) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  if (origin instanceof HTMLElement) {
    const r = origin.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  } else if (origin) ({ x, y } = origin);

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden";
  document.body.appendChild(layer);

  for (let i = 0; i < amount; i++) {
    const p = document.createElement("span");
    const size = 6 + Math.random() * 8;
    const shape = i % 3;
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${shape === 2 ? size * 0.45 : size}px;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};border-radius:${shape === 1 ? "50%" : "1px"};outline:1px solid rgb(0 0 0 / .15)`;
    layer.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const velocity = 140 + Math.random() * 260;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 180;
    const rot = (Math.random() - 0.5) * 900;
    p.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 520}px)) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 1300 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
    );
  }
  setTimeout(() => layer.remove(), 2300);
}

/** useCelebrate — devolve um handler de clique que solta confete no botão. */
export function useCelebrate(amount = 70) {
  return useCallback((e?: React.MouseEvent<HTMLElement>) => confetti(e?.currentTarget, amount), [amount]);
}
