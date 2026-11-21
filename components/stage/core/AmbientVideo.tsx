"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./Motion";

/**
 * AmbientVideo — vídeo de fundo leve: mudo, em loop, sem controles.
 * Só começa a baixar perto da tela, pausa quando sai e, com
 * "reduzir movimento", fica parado no poster.
 */
export function AmbientVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [near, setNear] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          if (!reduce) v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(v);
    if (reduce) v.pause();
    return () => io.disconnect();
  }, [reduce]);
  return (
    <video
      ref={ref}
      className={className}
      src={near ? src : undefined}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      aria-hidden
    />
  );
}
