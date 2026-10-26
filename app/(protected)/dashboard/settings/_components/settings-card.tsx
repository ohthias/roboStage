import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Cartão de seção das configurações — mesmo vocabulário visual das páginas de equipe (card/border/base-100). */
export function SettingsCard({
  icon: Icon,
  title,
  description,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <section className={`card border bg-base-100 ${danger ? "border-error/30" : "border-base-300"}`}>
      <div className={`flex items-center gap-3 border-b px-5 py-4 ${danger ? "border-error/20" : "border-base-300"}`}>
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
            danger ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={17} />
        </span>
        <div>
          <h2 className={`text-sm font-semibold ${danger ? "text-error" : ""}`}>{title}</h2>
          <p className="mt-0.5 text-xs text-base-content/55">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Linha "título + descrição à esquerda, controle à direita". */
export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 max-w-xl text-xs leading-5 text-base-content/55">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
