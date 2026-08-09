import { relations } from "drizzle-orm";
import { users } from "./users";
import { leagues, userLeagueInterests } from "./leagues";
import { teams, teamMembers } from "./teams";
import { folders, documents } from "./notebook";
import {
  labTests,
  labTestTagAssignments,
  labTestExecutions,
  labTestParameters,
  labTestParameterValues,
  labTestMetrics,
  labTestResults,
  labTestAttachments,
} from "./lab-test-core";
import {
  fllMissions,
  strategies,
  strategyVersions,
  labTestRunDetails,
  labTestMissionResults,
  labTestFailures,
} from "./lab-test-runs";
import {
  labTestCalibrationDetails,
  labTestReadings,
} from "./lab-test-calibration";

export const usersRelations = relations(users, ({ many }) => ({
  leagueInterests: many(userLeagueInterests),
  teamMemberships: many(teamMembers),
  folders: many(folders),
  documents: many(documents),
  labTests: many(labTests),
}));

export const leaguesRelations = relations(leagues, ({ many }) => ({
  userInterests: many(userLeagueInterests),
  teams: many(teams),
}));

export const userLeagueInterestsRelations = relations(
  userLeagueInterests,
  ({ one }) => ({
    user: one(users, {
      fields: [userLeagueInterests.userId],
      references: [users.id],
    }),
    league: one(leagues, {
      fields: [userLeagueInterests.leagueId],
      references: [leagues.id],
    }),
  })
);

export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  league: one(leagues, {
    fields: [teams.leagueId],
    references: [leagues.id],
  }),
  labTests: many(labTests),
  folders: many(folders),
  documents: many(documents),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

export const labTestsRelations = relations(labTests, ({ one, many }) => ({
  owner: one(users, { fields: [labTests.userId], references: [users.id] }),
  team: one(teams, { fields: [labTests.teamId], references: [teams.id] }),
  executions: many(labTestExecutions),
  parameters: many(labTestParameters),
  metrics: many(labTestMetrics),
  attachments: many(labTestAttachments),
  tagAssignments: many(labTestTagAssignments),
  strategies: many(strategies),
}));

export const labTestExecutionsRelations = relations(
  labTestExecutions,
  ({ one, many }) => ({
    test: one(labTests, {
      fields: [labTestExecutions.testId],
      references: [labTests.id],
    }),
    operator: one(users, {
      fields: [labTestExecutions.operatorId],
      references: [users.id],
    }),
    parameterValues: many(labTestParameterValues),
    results: many(labTestResults),
    attachments: many(labTestAttachments),
    runDetails: one(labTestRunDetails, {
      fields: [labTestExecutions.id],
      references: [labTestRunDetails.executionId],
    }),
    calibrationDetails: one(labTestCalibrationDetails, {
      fields: [labTestExecutions.id],
      references: [labTestCalibrationDetails.executionId],
    }),
    missionResults: many(labTestMissionResults),
    failures: many(labTestFailures),
    readings: many(labTestReadings),
  })
);

export const labTestParametersRelations = relations(
  labTestParameters,
  ({ one, many }) => ({
    test: one(labTests, {
      fields: [labTestParameters.testId],
      references: [labTests.id],
    }),
    values: many(labTestParameterValues),
  })
);

export const labTestMetricsRelations = relations(
  labTestMetrics,
  ({ one, many }) => ({
    test: one(labTests, {
      fields: [labTestMetrics.testId],
      references: [labTests.id],
    }),
    results: many(labTestResults),
  })
);

export const strategiesRelations = relations(
  strategies,
  ({ one, many }) => ({
    test: one(labTests, {
      fields: [strategies.testId],
      references: [labTests.id],
    }),
    versions: many(strategyVersions),
  })
);

export const strategyVersionsRelations = relations(
  strategyVersions,
  ({ one, many }) => ({
    strategy: one(strategies, {
      fields: [strategyVersions.strategyId],
      references: [strategies.id],
    }),
    runDetails: many(labTestRunDetails),
  })
);

export const labTestRunDetailsRelations = relations(
  labTestRunDetails,
  ({ one }) => ({
    execution: one(labTestExecutions, {
      fields: [labTestRunDetails.executionId],
      references: [labTestExecutions.id],
    }),
    strategyVersion: one(strategyVersions, {
      fields: [labTestRunDetails.strategyVersionId],
      references: [strategyVersions.id],
    }),
  })
);

export const labTestMissionResultsRelations = relations(
  labTestMissionResults,
  ({ one }) => ({
    execution: one(labTestExecutions, {
      fields: [labTestMissionResults.executionId],
      references: [labTestExecutions.id],
    }),
    mission: one(fllMissions, {
      fields: [labTestMissionResults.missionId],
      references: [fllMissions.id],
    }),
  })
);

export const labTestFailuresRelations = relations(
  labTestFailures,
  ({ one }) => ({
    execution: one(labTestExecutions, {
      fields: [labTestFailures.executionId],
      references: [labTestExecutions.id],
    }),
    mission: one(fllMissions, {
      fields: [labTestFailures.missionId],
      references: [fllMissions.id],
    }),
  })
);

export const foldersRelations = relations(folders, ({ one, many }) => ({
  owner: one(users, { fields: [folders.userId], references: [users.id] }),
  team: one(teams, { fields: [folders.teamId], references: [teams.id] }),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  owner: one(users, { fields: [documents.userId], references: [users.id] }),
  team: one(teams, { fields: [documents.teamId], references: [teams.id] }),
  folder: one(folders, {
    fields: [documents.folderId],
    references: [folders.id],
  }),
}));
