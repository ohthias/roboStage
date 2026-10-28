import {
  Bot,
  Calculator,
  Cpu,
  Crosshair,
  GitFork,
  Joystick,
  Mountain,
  Palette,
  Settings2,
  Spline,
  Workflow,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { KIT_PRESETS, type KitPreset } from "@/utils/labtest/kit-ia";
import { Note } from "./FormBits";

const PRESET_ICONS: Record<string, ComponentType<LucideProps>> = {
  "sensor-cor": Palette,
  "motor-duplo": Cpu,
  "motor-simples": Settings2,
  controle: Joystick,
  ia: Bot,
  rotina: Workflow,
  "obr-cor": Palette,
  "obr-seguidor": Spline,
  "obr-verde": GitFork,
  "obr-rampa": Mountain,
  "obr-vitimas": Crosshair,
};

/**
 * Escolha de um teste pronto (preset) e das medições anotadas.
 * Usado pelo kit Ciência e IA (Future Edition) e pelos testes da OBR.
 */
export function KitIaSection({
  kitPreset,
  selectKitPreset,
  kitParams,
  toggleKitParam,
  presets = KIT_PRESETS,
  note,
}: {
  kitPreset: string;
  selectKitPreset: (id: string) => void;
  kitParams: string[];
  toggleKitParam: (name: string) => void;
  presets?: KitPreset[];
  note?: ReactNode;
}) {
  const preset = presets.find((p) => p.id === kitPreset);

  return (
    <div className="flex flex-col gap-6">
      <Note tone="info">
        {note ?? (
          <>
            Testes prontos do kit LEGO Education Ciência e IA, usado na{" "}
            <strong className="font-semibold">FLL Future Edition</strong> (liga
            ativa na sua conta). Os campos são medições que a equipe anota em cada
            execução; o kit não envia esses números sozinho.
          </>
        )}
      </Note>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-base-content/80">
          Escolha o teste
        </legend>
        <div
          className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
          role="radiogroup"
          aria-label="Teste do kit"
        >
          {presets.map((item) => {
            const Icon = PRESET_ICONS[item.id] ?? Cpu;
            const active = item.id === kitPreset;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectKitPreset(item.id)}
                className={`flex cursor-pointer flex-col items-start gap-1.5 rounded-tl-xl rounded-br-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-base-content/25"
                }`}
              >
                <Icon
                  className={`size-5 ${active ? "text-primary" : "text-base-content/45"}`}
                />
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="text-xs leading-5 text-base-content/55">
                  {item.resumo}
                </span>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-wide text-base-content/45">
                  {item.relevantePara}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {preset && (
        <fieldset>
          <legend className="mb-1.5 flex w-full items-baseline justify-between text-sm font-medium text-base-content/80">
            Medições anotadas
            <span className="font-mono text-xs font-normal text-base-content/45">
              {kitParams.length}/{preset.params.length}
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {preset.params.map((param) => {
              const checked = kitParams.includes(param.nome);
              return (
                <label
                  key={param.nome}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-tl-lg rounded-br-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                    checked
                      ? "border-primary/50 bg-primary/5"
                      : "border-base-300 hover:border-base-content/25"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-xs mt-0.5"
                    checked={checked}
                    onChange={() => toggleKitParam(param.nome)}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-1.5 text-sm font-medium">
                      {param.rotulo}
                      {param.calc && (
                        <span
                          className="inline-flex items-center gap-0.5 font-mono text-[10px] font-normal uppercase text-primary"
                          title="Calculado a partir das outras medições"
                        >
                          <Calculator className="size-3" />
                          auto
                        </span>
                      )}
                      {param.unidade && (
                        <span className="font-mono text-[11px] font-normal text-base-content/45">
                          {param.unidade}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-base-content/50">
                      {param.descricao}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
