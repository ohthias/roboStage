import { Info } from "lucide-react";

export function TestDetailsSection({
  testName,
  testDescription,
  setTestName,
  setTestDescription,
}: {
  testName: string;
  testDescription: string;
  setTestName: (value: string) => void;
  setTestDescription: (value: string) => void;
}) {
  return (
    <section className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold">Detalhes do teste</h2>
            <p className="text-sm text-base-content/60">
              Nome e descrição que identificam este teste.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control w-full">
            <div className="label py-1.5">
              <span className="label-text text-xs font-semibold uppercase tracking-wide">
                Nome do teste *
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="ex: Run completa - qualificatória"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <div className="label py-1.5">
              <span className="label-text text-xs font-semibold uppercase tracking-wide">
                Descrição (opcional)
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="ex: Testes antes da competição regional"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
