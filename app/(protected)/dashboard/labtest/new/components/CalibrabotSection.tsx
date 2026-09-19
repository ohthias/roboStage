import { Gauge, Info, Plus, Settings2, SlidersHorizontal, X, Zap } from "lucide-react";

import { CALIBRA_OPTIONS, GIRO_ANALYSIS_OPTIONS, PID_PARAM_OPTIONS } from "../Usecreatetest";

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
  return (
    <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
      <section className="card h-fit border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-4" />
            </div>

            <div>
              <h2 className="font-semibold">Calibrabot</h2>
              <p className="text-xs text-base-content/50">Tipo de calibração</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {CALIBRA_OPTIONS.map((o) => {
              const active = calibraMode === o.value;

              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setCalibraMode(o.value as typeof calibraMode)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active ? "bg-primary text-primary-content shadow-sm" : "hover:bg-base-200"
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

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body p-5 md:p-6">
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
                    No modo <strong>individual</strong>, cada motor é testado separadamente. Em <strong>duplas</strong>, todas as combinações possíveis serão geradas.
                  </p>
                </div>
              </div>

              <div className="flex max-w-xl gap-2">
                <input
                  type="text"
                  placeholder="ex: motor_esquerdo"
                  className="input input-bordered input-sm flex-1"
                  value={motorInput}
                  onChange={(e) => setMotorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMotor();
                    }
                  }}
                />

                <button type="button" className="btn btn-primary btn-sm" onClick={addMotor}>
                  <Plus className="size-4" />
                  Adicionar
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                  Motores adicionados
                </p>

                <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed border-base-300 p-3">
                  {motors.map((m) => (
                    <span key={m} className="badge badge-outline h-8 gap-2 px-3">
                      {m}

                      <button
                        type="button"
                        className="hover:text-error"
                        onClick={() => removeMotor(m)}
                        title={`Remover ${m}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
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

                <div className="join">
                  <input
                    type="radio"
                    name="motorTestType"
                    aria-label="Individual"
                    className="join-item btn btn-sm"
                    checked={motorTestType === "individual"}
                    onChange={() => setMotorTestType("individual")}
                  />

                  <input
                    type="radio"
                    name="motorTestType"
                    aria-label="Duplas"
                    className="join-item btn btn-sm"
                    checked={motorTestType === "duplas"}
                    onChange={() => setMotorTestType("duplas")}
                  />
                </div>
              </div>

              {motorTestType === "duplas" && motors.length >= 2 && (
                <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Combinações geradas</p>
                    <span className="badge badge-primary">{motorPairs().length}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {motorPairs().map(([a, b]) => (
                      <span key={`${a}-${b}`} className="badge badge-ghost gap-1.5 py-3">
                        {a}
                        <Plus className="size-3" />
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
                      Configure o ângulo e os indicadores que deseja analisar.
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

                  <div className="join">
                    <input
                      type="number"
                      className="input input-bordered join-item w-full"
                      value={giroAngle}
                      onChange={(e) => setGiroAngle(Number(e.target.value))}
                    />

                    <span className="btn btn-disabled join-item">°</span>
                  </div>
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
                      Configure a distância e os parâmetros utilizados pelo controlador.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-info/20 bg-info/10 p-4 text-sm text-info">
                O PID mantém o robô andando reto. Com base na distância alvo, o sistema gera testes usando os parâmetros selecionados.
              </div>

              <label className="form-control max-w-xs">
                <div className="label py-1.5">
                  <span className="label-text text-xs font-semibold uppercase tracking-wide">
                    Distância alvo
                  </span>
                </div>

                <div className="join">
                  <input
                    type="number"
                    className="input input-bordered join-item w-full"
                    value={pidDistance}
                    onChange={(e) => setPidDistance(Number(e.target.value))}
                  />

                  <span className="btn btn-disabled join-item">cm</span>
                </div>
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

                      <span className="font-mono text-xs">{p}</span>
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
