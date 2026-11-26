import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Vocabulário visual das configurações.
 *
 * - `SettingsGroup`: título + descrição da seção e, abaixo, linhas separadas por traço.
 * - `FieldRow`: rótulo e explicação à esquerda, controles à direita (empilha no celular).
 * - `SettingsCard` / `SettingRow`: caixa com borda, para listas e painéis (Uso, Dados).
 */

export function SettingsGroup({
  title,
  description,
  action,
  tone = "default",
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <section className="scroll-mt-24">
      <header
        className={`flex flex-wrap items-end justify-between gap-3 border-b pb-4 ${
          danger ? "border-error/30" : "border-base-300"
        }`}
      >
        <div className="min-w-0">
          <h2 className={`text-base font-semibold tracking-tight ${danger ? "text-error" : ""}`}>{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-base-content/60">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="divide-y divide-base-300">{children}</div>
    </section>
  );
}

export function FieldRow({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-x-10 gap-y-3 py-5 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {title}
          {badge}
        </p>
        {description && <div className="mt-1 text-sm leading-6 text-base-content/55">{description}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Interruptor com rótulo curto ao lado (como “Push / E-mail” no modelo). */
export function ToggleField({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-sm mt-0.5"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-5 text-base-content/50">{hint}</span>}
      </span>
    </label>
  );
}

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
    <section className={`overflow-hidden rounded-box border bg-base-100 ${danger ? "border-error/30" : "border-base-300"}`}>
      <div className={`flex items-center gap-3 border-b px-5 py-4 ${danger ? "border-error/20 bg-error/5" : "border-base-300"}`}>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
            danger ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={16} />
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

/** Linha "título + descrição à esquerda, controle à direita" dentro de um `SettingsCard`. */
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
