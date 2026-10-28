import { CharCount, FieldLabel } from "./FormBits";

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
    <div className="flex flex-col gap-5">
      <div>
        <FieldLabel
          htmlFor="test-name"
          aside={<CharCount value={testName} max={100} />}
        >
          Nome
        </FieldLabel>
        <input
          id="test-name"
          type="text"
          className="input w-full"
          placeholder="ex: Run completa — qualificatória"
          value={testName}
          maxLength={100}
          required
          autoComplete="off"
          onChange={(e) => setTestName(e.target.value)}
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="test-description"
          aside={<CharCount value={testDescription} max={200} />}
        >
          Descrição{" "}
          <span className="font-normal text-base-content/45">(opcional)</span>
        </FieldLabel>
        <textarea
          id="test-description"
          rows={2}
          className="textarea w-full resize-none"
          placeholder="ex: Testes antes da regional"
          value={testDescription}
          maxLength={200}
          onChange={(e) => setTestDescription(e.target.value)}
        />
      </div>
    </div>
  );
}
