"use client";

import { RunSetup } from "./RunSetup";
import { CalibraBotSetup } from "./CalibraBotSetup";
import { PersonalizadoSetup } from "./PersonalizadoSetup";

export function TestSetupWizard({
  testId,
  type,
}: {
  testId: string;
  type: "run" | "calibrabot" | "personalizado";
}) {
  switch (type) {
    case "run":
      return <RunSetup testId={testId} />;
    case "calibrabot":
      return <CalibraBotSetup testId={testId} />;
    case "personalizado":
      return <PersonalizadoSetup testId={testId} />;
  }
}