import {
  Gauge,
  Info,
  Plus,
  Settings2,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";

import {
  CALIBRA_OPTIONS,
  GIRO_ANALYSIS_OPTIONS,
  PID_PARAM_OPTIONS,
} from "../Usecreatetest";
import { useToast } from "@/app/context/ToastContext";

export function CalibrabotSection({
  calibraMode,
  setCalibraMode,
  motorInput,
  setMotorInput,
  addMotor,
  removeMotor,
  motors,
  motorTestType,
  setMotorTestType,
  motorPairs,
  giroAngle,
  setGiroAngle,
  giroAnalysis,
  toggleGiroAnalysis,
  pidDistance,
  setPidDistance,
  pidParams,
  togglePidParam,
}: {
  calibraMode: "motores" | "giroscópio" | "pid";
  setCalibraMode: (value: "motores" | "giroscópio" | "pid") => void;
  motorInput: string;
  setMotorInput: (value: string) => void;
  addMotor: () => void;
  removeMotor: (name: string) => void;
  motors: string[];
  motorTestType: "individual" | "duplas";
  setMotorTestType: (value: "individual" | "duplas") => void;
  motorPairs: () => [string, string][];
  giroAngle: number;
  setGiroAngle: (value: number) => void;
  giroAnalysis: string[];
  toggleGiroAnalysis: (value: string) => void;
  pidDistance: number;
  setPidDistance: (value: number) => void;
  pidParams: string[];
  togglePidParam: (value: string) => void;
}) {
  const { addToast } = useToast();

  const handleAddMotor = () => {
    const name = motorInput.trim();

    if (motors.includes(name)) {
      addToast(
        "Não é possível usar o mesmo nome em motores diferentes.",
        "warning",
      );
      return;
    }

    addMotor();
  };

  const handleChangeMode = (mode: typeof calibraMode) => {
    setMotorInput("");
    motors.forEach(removeMotor);
    setMotorTestType("individual");
    setGiroAngle(0);
    giroAnalysis.forEach(toggleGiroAnalysis);
    setPidDistance(0);
    pidParams.forEach(togglePidParam);
    setCalibraMode(mode);
  };

  return (
    <div className="grid lg:grid-cols-[18rem_1fr]">
      <section className="h-full border-b border-base-300 bg-base-100 shadow-sm lg:sticky lg:top-20 lg:border">
        <div className="p-2 lg:p-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-4" />
            </div>

            <div>
              <h2 className="uppercase tracking-wide text-base-content/50 text-sm font-medium">
                Modo
              </h2>
              <p className="text-xs text-base-content/50">
                Estilo de teste que será utilizado
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {CALIBRA_OPTIONS.map((o) => {
              const active = calibraMode === o.value;

              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleChangeMode(o.value as typeof calibraMode)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition cursor-pointer ${
                    active
                      ? "bg-primary text-primary-content shadow-sm"
                      : "hover:bg-base-200"
                  }`}
                >
                  <Gauge className="size-4" />
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex-1 py-4 w-full px-2 sm:px-4 lg:px-6">
        <div className="">
          {calibraMode === "motores" && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Settings2 className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Teste de motores</h2>
                    <p className="text-sm text-base-content/60">
                      Configure os motores que serão avaliados.
                    </p>
                  </div>
                </div>

                <div className="alert mt-4 border border-info/20 bg-info/10 text-info">
                  <Info className="size-5 shrink-0" />
                  <p className="text-sm">
                    No modo <strong>individual</strong>, cada motor é testado
                    separadamente. Em <strong>duplas</strong>, todas as
                    combinações possíveis serão geradas.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: motor_esquerdo"
                  className="input input-bordered input-sm flex-1 w-full"
                  value={motorInput}
                  onChange={(e) => setMotorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMotor();
                    }
                  }}
                />

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddMotor}
                  disabled={motors.length >= 1 || !motorInput.trim()}
                >
                  <Plus className="size-4" />
                  Adicionar
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Motores adicionados
                </p>

                <div className="flex min-h-16 flex-wrap gap-3 rounded-xl border border-dashed border-base-300 bg-base-200/30 p-3">
                  {motors.map((m, index) => (
                    <div
                      key={m}
                      className="flex min-w-44 items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                          Motor {index + 1}
                        </p>
                        <p className="truncate text-sm font-medium text-base-content">
                          {m}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-xs shrink-0 text-base-content/50 hover:bg-error/10 hover:text-error"
                        onClick={() => removeMotor(m)}
                        title={`Remover ${m}`}
                        aria-label={`Remover ${m}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}

                  {motors.length === 0 && (
                    <span className="self-center text-xs text-base-content/40">
                      Nenhum motor adicionado.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Estratégia de teste
                </p>

                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="motorTestType"
                    aria-label="Individual"
                    className="btn btn-sm"
                    checked={motorTestType === "individual"}
                    onChange={() => setMotorTestType("individual")}
                  />

                  <input
                    type="radio"
                    name="motorTestType"
                    aria-label="Duplas"
                    className="btn btn-sm"
                    checked={motorTestType === "duplas"}
                    onChange={() => setMotorTestType("duplas")}
                  />
                </div>
              </div>

              {motorTestType === "duplas" && motors.length >= 2 && (
                              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-base-100 to-base-200/40 p-4 shadow-sm sm:p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Plus className="size-4" />
                                      </div>
                                      <p className="text-sm font-semibold">Combinações geradas</p>
                                    </div>
                                    <p className="mt-1 text-xs text-base-content/60">
                                      Cada dupla será executada como um teste independente.
                                    </p>
                                  </div>

                                  <div className="badge badge-primary gap-1.5 px-3 py-3 font-semibold">
                                    <span>{motorPairs().length}</span>
                                    <span className="font-normal opacity-80">
                                      {motorPairs().length === 1 ? "dupla" : "duplas"}
                                    </span>
                                  </div>
                  </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {motorPairs().map(([a, b]) => (
                      <span
                        key={`${a}-${b}`}
                                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-base-300/80 bg-base-100 px-3 py-2.5 text-center text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        {a}
                                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Plus className="size-3" />
                                      </span>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {calibraMode === "giroscópio" && (
            <div className="flex max-w-2xl flex-col gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Gauge className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Teste de giroscópio</h2>
                    <p className="text-sm text-base-content/60">
                      Configure o ângulo alvo e os indicadores que serão
                      avaliados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control">
                  <div className="label py-1.5">
                    <span className="label-text text-xs font-semibold uppercase tracking-wide">
                      Ângulo alvo
                    </span>
                  </div>

                  <label className="input input-bordered flex w-full items-center gap-2">
                    <input
                      type="number"
                      className="min-w-0 grow"
                      value={giroAngle}
                      onChange={(e) => setGiroAngle(Number(e.target.value))}
                    />

                    <span className="label text-base-content/60">°</span>
                  </label>
                </label>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Indicadores
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {GIRO_ANALYSIS_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3 hover:bg-base-200"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={giroAnalysis.includes(o.value)}
                        onChange={() => toggleGiroAnalysis(o.value)}
                      />

                      <span className="text-sm">{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {calibraMode === "pid" && (
            <div className="flex max-w-3xl flex-col gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <SlidersHorizontal className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Teste PID</h2>
                    <p className="text-sm text-base-content/60">
                      Configure a distância e os parâmetros utilizados pelo
                      controlador.
                    </p>
                  </div>
                </div>
              </div>

              <div className="alert alert-info alert-soft flex items-start gap-3">
                <Info className="size-5 inline-block" />
                <p>
                  O teste PID avalia a resposta do robô a um conjunto de
                  parâmetros, permitindo identificar o melhor ajuste para o
                  controlador.
                </p>
              </div>

              <label className="form-control max-w-xs">
                <div className="label py-1.5">
                  <span className="label-text text-xs font-semibold uppercase tracking-wide">
                    Distância alvo
                  </span>
                </div>

                <label className="input input-bordered">
                  <input
                    type="number"
                    className="w-full"
                    value={pidDistance}
                    onChange={(e) => setPidDistance(Number(e.target.value))}
                  />

                  <span className="label">cm</span>
                </label>
              </label>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Parâmetros
                </p>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PID_PARAM_OPTIONS.map((p) => (
                    <label
                      key={p}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3 hover:bg-base-200"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={pidParams.includes(p)}
                        onChange={() => togglePidParam(p)}
                      />

                      <span className="font-mono text-xs">{p.toUpperCase().replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
