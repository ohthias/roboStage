import { notFound } from "next/navigation";
import { getLabTestForSetup } from "../../actions";
import { TestSetupWizard } from "./TestSetupWizard";

export default async function TestSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getLabTestForSetup(id).catch(() => null) || notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-base-content/50">
          Configuração do teste
        </p>
        <h1 className="text-2xl font-bold">{test.name}</h1>
        {test.description && (
          <p className="mt-1 text-sm text-base-content/60">{test.description}</p>
        )}
      </div>

      <TestSetupWizard testId={test.id} type={test.type as "run" | "calibrabot" | "personalizado"} />
    </div>
  );
}