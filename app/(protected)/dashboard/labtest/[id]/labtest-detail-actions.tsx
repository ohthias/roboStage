"use client";

import { EditTestInfoModal } from "../edit-test-info-modal";

interface LabTestDetailActionsProps {
  testId: string;
  testName: string;
  testDescription?: string;
  teamId?: string;
  teams: { id: string; name: string }[];
}

export function LabTestDetailActions({
  testId,
  testName,
  testDescription,
  teamId,
  teams,
}: LabTestDetailActionsProps) {
  return (
    <div className="flex gap-2">
      <EditTestInfoModal
        testId={testId}
        initialName={testName}
        initialDescription={testDescription}
        initialTeamId={teamId}
        teams={teams}
      />
    </div>
  );
}
