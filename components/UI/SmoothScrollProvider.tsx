"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !containerRef.current) return;

    let scroll: any;
    let cancelled = false;

    (async () => {
      try {
        const { default: LocomotiveScroll } = await import(
          "locomotive-scroll"
        );

        if (cancelled || !containerRef.current) return;

        scroll = new LocomotiveScroll({
          el: containerRef.current,
          smooth: true,
          lerp: 0.1,
          multiplier: 1,
          class: "is-inview",
          tablet: { smooth: true, breakpoint: 1024 },
          smartphone: { smooth: false },
        } as any);

        const handleResize = () => scroll?.update();
        window.addEventListener("resize", handleResize);
        (containerRef.current as any).__locoResizeCleanup = () =>
          window.removeEventListener("resize", handleResize);
      } catch (err) {
        // If the library fails to load for any reason, fail silently into
        // plain native scrolling rather than leaving the page stuck.
        console.error("Locomotive Scroll failed to initialize:", err);
      }
    })();

    return () => {
      cancelled = true;
      (containerRef.current as any)?.__locoResizeCleanup?.();
      scroll?.destroy();
    };
  }, []);

  return (
    <div data-scroll-container ref={containerRef}>
      {children}
    </div>
  );
}
