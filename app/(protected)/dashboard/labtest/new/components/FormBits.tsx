import type { ReactNode } from "react";

/** Um passo numerado do formulário. */
export function Step({
  n,
  title,
  hint,
  done,
  last,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  done?: boolean;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <li className="relative grid grid-cols-[2rem_1fr] gap-x-4 pb-10 last:pb-0">
      {/* linha que liga os passos */}
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-1 left-4 top-9 w-px bg-base-300"
        />
      )}
      <span
        className={`relative z-10 flex size-8 items-center justify-center rounded-tl-lg rounded-br-lg font-mono text-xs font-bold transition-colors ${
          done
            ? "bg-primary text-primary-content"
            : "border border-base-300 bg-base-100 text-base-content/60"
        }`}
      >
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h2 className="pt-1 text-base font-semibold leading-6">{title}</h2>
        {hint && (
          <p className="mt-0.5 text-sm text-base-content/55">{hint}</p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </li>
  );
}

/** Rótulo pequeno de campo. */
export function FieldLabel({
  children,
  htmlFor,
  aside,
}: {
  children: ReactNode;
  htmlFor?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-base-content/80"
      >
        {children}
      </label>
      {aside}
    </div>
  );
}

/** Contador que só aparece perto do limite. */
export function CharCount({ value, max }: { value: string; max: number }) {
  if (value.length < max * 0.8) return null;
  return (
    <span
      className={`font-mono text-xs ${
        value.length >= max ? "text-error" : "text-warning"
      }`}
    >
      {value.length}/{max}
    </span>
  );
}

/** Controle segmentado simples (abas pequenas). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-fit max-w-full flex-wrap gap-1 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/50 p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`cursor-pointer rounded-tl-lg rounded-br-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active
                ? "bg-base-100 text-base-content shadow-sm"
                : "text-base-content/55 hover:text-base-content"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Caixa de opção marcável (checkbox em forma de pílula). */
export function CheckChip({
  checked,
  onChange,
  children,
  mono,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-tl-lg rounded-br-lg border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
        checked
          ? "border-primary/50 bg-primary/5"
          : "border-base-300 hover:border-base-content/25"
      }`}
    >
      <input
        type="checkbox"
        className="checkbox checkbox-primary checkbox-xs"
        checked={checked}
        onChange={onChange}
      />
      <span className={mono ? "font-mono text-xs uppercase" : ""}>
        {children}
      </span>
    </label>
  );
}

/** Nota discreta (substitui os alertas grandes). */
export function Note({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "info" | "warning" | "error";
  children: ReactNode;
}) {
  const tones = {
    neutral: "border-base-300 text-base-content/60",
    info: "border-info/60 text-base-content/70",
    warning: "border-warning text-base-content/75",
    error: "border-error text-error",
  };
  return (
    <div className={`border-l-2 py-1 pl-3 text-sm leading-6 ${tones[tone]}`}>
      {children}
    </div>
  );
}
