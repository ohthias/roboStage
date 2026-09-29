"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-200 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
      >
        {" "}
        <div className="absolute left-[10%] top-[15%] h-40 w-40 rounded-full border-2 border-current" />{" "}
        <div className="absolute bottom-[10%] right-[12%] h-64 w-64 rounded-full border-2 border-current" />{" "}
        <div className="absolute left-1/2 top-0 h-full w-px bg-current" />{" "}
        <div className="absolute left-0 top-1/2 h-px w-full bg-current" />{" "}
      </div>
      <div className="relative w-full max-w-lg">
        <div className="mb-3 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/40">
          <span>ROBOSTAGE / SYSTEM</span>
          <span>ERR_500</span>
        </div>

        <div className="overflow-hidden rounded-tl-[28px] rounded-br-[28px] border border-base-content/10 bg-base-100 shadow-2xl">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-base-content/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
              <span className="font-mono text-xs uppercase tracking-wider text-base-content/60">
                Diagnóstico do sistema
              </span>
            </div>

            <span className="font-mono text-xs text-error">OFFLINE</span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Ícone / diagnóstico */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-error/10 text-error">
                <div className="absolute inset-2 rounded-xl border border-error/20" />

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <rect x="5" y="7" width="14" height="12" rx="3" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                  <path d="M9 13h.01M15 13h.01" />
                  <path d="M9 16h6" />
                  <path d="M3 12h2M19 12h2" />
                </svg>
              </div>

              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-error">
                  Falha detectada
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Robô desconfigurado!
                </h1>
              </div>
            </div>

            <p className="max-w-md leading-relaxed text-base-content/65">
              Parece que alguma engrenagem saiu do lugar. O RoboStage encontrou
              um erro inesperado ao processar esta página.
            </p>

            {/* Status */}
            <div className="my-6 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-base-content/10 bg-base-200/60 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/40">
                  Sistema
                </p>
                <p className="mt-1 text-sm font-medium">RoboStage</p>
              </div>

              <div className="rounded-xl border border-error/15 bg-error/5 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/40">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-error">
                  Requer atenção
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="btn btn-primary flex-1" onClick={reset}>
                Tentar novamente
              </button>

              <button
                className="btn btn-ghost flex-1"
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </button>
            </div>
          </div>

          {/* Rodapé técnico */}
          <div className="border-t border-base-content/10 bg-base-200/40 px-5 py-3">
            <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-wider text-base-content/35">
              <span>Robot diagnostic protocol</span>
              {error.digest && <span>REF: {error.digest}</span>}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-base-content/30">
          Até robôs precisam de manutenção às vezes.
        </p>
      </div>
    </main>
  );
}
