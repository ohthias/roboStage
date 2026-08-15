import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { labTestRunPlan, fllMissions, labTestCalibrationPlan, labTestParameters } from "@/db/schema";
import { getLabTestForExecute } from "../../actions";
import { RunExecuteForm } from "./RunExecuteForm";
import { CalibraBotExecuteForm } from "./CalibraBotExecuteForm";
import { PersonalizadoExecuteForm } from "./PersonalizadoExecuteForm";

export default async function ExecuteTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getLabTestForExecute(id).catch((err) => {
    if (err instanceof Error && err.message.includes("Configure o teste")) {
      redirect(`/dashboard/labtest/${id}/setup`);
    }
    return null;
  });
  if (!test) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/labtest/${test.id}`}
          className="text-xs text-base-content/50 hover:underline"
        >
          ← {test.name}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Nova execução</h1>
      </div>

      {test.type === "run" && <RunExecuteContainer testId={test.id} />}
      {test.type === "calibrabot" && <CalibraBotExecuteContainer testId={test.id} />}
      {test.type === "personalizado" && <PersonalizadoExecuteContainer testId={test.id} />}
    </div>
  );
}

async function RunExecuteContainer({ testId }: { testId: string }) {
  const plan = await db
    .select({
      missionId: fllMissions.id,
      orderIndex: labTestRunPlan.orderIndex,
      fullAttempt: labTestRunPlan.fullAttempt,
      missionCode: fllMissions.code,
      missionName: fllMissions.name,
      maxScore: fllMissions.maxScore,
      season: fllMissions.season,
    })
    .from(labTestRunPlan)
    .innerJoin(fllMissions, eq(fllMissions.id, labTestRunPlan.missionId))
    .where(eq(labTestRunPlan.testId, testId))
    .orderBy(asc(labTestRunPlan.orderIndex));

  if (plan.length === 0) {
    return (
      <div className="alert alert-warning text-sm">
        Este teste não tem missões configuradas. Volte ao setup antes de registrar uma execução.
        <a href={`/dashboard/labtest/${testId}/setup`} className="ml-1 font-semibold underline">
          Configurar teste
        </a>
      </div>
    );
  }

  return <RunExecuteForm testId={testId} missions={plan} season={plan[0].season} />;
}

async function CalibraBotExecuteContainer({ testId }: { testId: string }) {
  const plan = await db
    .select()
    .from(labTestCalibrationPlan)
    .where(eq(labTestCalibrationPlan.testId, testId))
    .limit(1)
    .then((r) => r[0]);

  if (!plan) {
    return (
      <div className="alert alert-warning text-sm">
        Este teste não tem uma configuração de calibração salva. Volte ao setup antes de registrar
        uma execução.
        <a href={`/dashboard/labtest/${testId}/setup`} className="ml-1 font-semibold underline">
          Configurar teste
        </a>
      </div>
    );
  }

  return <CalibraBotExecuteForm testId={testId} calibrationType={plan.calibrationType} config={plan.config} />;
}

async function PersonalizadoExecuteContainer({ testId }: { testId: string }) {
  const parameters = await db
    .select()
    .from(labTestParameters)
    .where(eq(labTestParameters.testId, testId));

  if (parameters.length === 0) {
    return (
      <div className="alert alert-warning text-sm">
        Este teste não tem parâmetros configurados. Volte ao setup antes de registrar uma execução.
        <a href={`/dashboard/labtest/${testId}/setup`} className="ml-1 font-semibold underline">
          Configurar teste
        </a>
      </div>
    );
  }

  return <PersonalizadoExecuteForm testId={testId} parameters={parameters} />;
}