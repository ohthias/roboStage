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
    <section className="card">
      <div className="card-body gap-4">
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
              maxLength={100}
              aria-describedby="test-name-limit"
              onChange={(e) => setTestName(e.target.value)}
            />
            <span
              id="test-name-limit"
              className={`label-text-alt mt-2 ml-auto block w-full text-right relative text-xs font-semibold uppercase tracking-wide ${testName.length >= 100 ? "text-error" : testName.length >= 75 ? "text-warning" : "text-base-content/60"}`}
            >
              {testName.length >= 100
                ? "Você atingiu o limite máximo de 100 caracteres."
                : `${testName.length}/100 caracteres`}
            </span>
          </label>

          <label className="form-control w-full relative">
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
              maxLength={200}
              aria-describedby="test-description-limit"
              onChange={(e) => setTestDescription(e.target.value)}
            />
            <span
              id="test-description-limit"
              className={`label-text-alt mt-2 ml-auto block w-full text-right relative text-xs font-semibold uppercase tracking-wide ${testDescription.length >= 200 ? "text-error" : testDescription.length >= 150 ? "text-warning" : "text-base-content/60"}`}
            >
              {testDescription.length >= 200
                ? "Você atingiu o limite máximo de 200 caracteres."
                : `${testDescription.length}/200 caracteres`}
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
