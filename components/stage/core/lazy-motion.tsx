"use client";

/* framer-motion leve: `m` + LazyMotion. O núcleo é pequeno; os recursos de
   animação (motion-features) baixam em segundo plano depois da hidratação,
   em vez de entrar no JS inicial de toda página. */
import { AnimatePresence as FMAnimatePresence, LazyMotion, m } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

const loadFeatures = () => import("./motion-features").then((r) => r.default);

export function MotionLazy({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}

/** AnimatePresence já dentro do LazyMotion. */
export function AnimatePresence(props: ComponentProps<typeof FMAnimatePresence>) {
  return (
    <MotionLazy>
      <FMAnimatePresence {...props} />
    </MotionLazy>
  );
}

export { m as motion };
