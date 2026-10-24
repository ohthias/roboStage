import { Bot, Cpu, Info, Joystick, Palette, Settings2, Workflow } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { KIT_PRESETS, getKitPreset } from "@/utils/labtest/kit-ia";

const PRESET_ICONS: Record<string, ComponentType<LucideProps>> = {
  "sensor-cor": Palette,
  "motor-duplo": Cpu,
  "motor-simples": Settings2,
  controle: Joystick,
  ia: Bot,
  rotina: Workflow,
};

export function KitIaSection({
  kitPreset,
  selectKitPreset,
  kitParams,
  toggleKitParam,
}: {
  kitPreset: string;
  selectKitPreset: (id: string) => void;
  kitParams: string[];
  toggleKitParam: (name: string) => void;
}) {
  const preset = getKitPreset(kitPreset);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Kit LEGO Education Ciência e IA</h2>
            <p className="text-sm text-base-content/60">
              Testes prontos para os componentes do kit usado na FLL Future Edition.
            </p>
          </div>
        </div>

        <div className="alert alert-info alert-soft mt-4 items-start">
          <Info className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm">
            Disponível porque a liga <strong>FLL Future Edition</strong> está ativa na sua conta. Os
            campos são medições que a equipe anota a cada execução — o kit não envia esses números
            sozinho. Remova o que não for usar e compare a evolução nos gráficos.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
          Escolha o teste
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Teste do kit">
          {KIT_PRESETS.map((item) => {
            const Icon = PRESET_ICONS[item.id] ?? Cpu;
            const active = item.id === kitPreset;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectKitPreset(item.id)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-base-300 bg-base-100 hover:border-primary/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60"}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-bold">{item.label}</span>
                </span>
                <span className="text-xs leading-relaxed text-base-content/60">{item.resumo}</span>
                <span className="badge badge-ghost badge-sm">{item.relevantePara}</span>
              </button>
            );
          })}
        </div>
      </div>

      {preset && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Parâmetros medidos ({kitParams.length}/{preset.params.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {preset.params.map((param) => (
              <label
                key={param.nome}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-base-300 p-3 hover:bg-base-200/60"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm mt-0.5"
                  checked={kitParams.includes(param.nome)}
                  onChange={() => toggleKitParam(param.nome)}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {param.rotulo}
                    {param.unidade && <span className="badge badge-ghost badge-xs">{param.unidade}</span>}
                  </span>
                  <span className="block text-xs text-base-content/50">{param.descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
