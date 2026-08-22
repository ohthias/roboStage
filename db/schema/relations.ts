import { relations } from "drizzle-orm";
import { users } from "./users";
import { leagues, userLeagueInterests } from "./leagues";
import { teams, teamMembers } from "./teams";
import { folders, documents } from "./notebook";
import { tests, testExecutions } from "./labtest";

export const usersRelations = relations(users, ({ many }) => ({
  leagueInterests: many(userLeagueInterests),
  teamMemberships: many(teamMembers),
  folders: many(folders),
  documents: many(documents),
  tests: many(tests),
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
  folders: many(folders),
  documents: many(documents),
  tests: many(tests),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  owner: one(users, { fields: [folders.userId], references: [users.id] }),
  team: one(teams, { fields: [folders.teamId], references: [teams.id] }),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  documents: many(documents),
  tests: many(tests),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  owner: one(users, { fields: [documents.userId], references: [users.id] }),
  team: one(teams, { fields: [documents.teamId], references: [teams.id] }),
  folder: one(folders, {
    fields: [documents.folderId],
    references: [folders.id],
  }),
}));

// ---------------------------------------------------------------------------
// LabTest
// ---------------------------------------------------------------------------

export const testsRelations = relations(tests, ({ one, many }) => ({
  owner: one(users, { fields: [tests.userId], references: [users.id] }),
  team: one(teams, { fields: [tests.teamId], references: [teams.id] }),
  folder: one(folders, { fields: [tests.folderId], references: [folders.id] }),
  executions: many(testExecutions),
}));


export const testExecutionsRelations = relations(
  testExecutions,
  ({ one, many }) => ({
    test: one(tests, {
      fields: [testExecutions.testId],
      references: [tests.id],
    }),
  }),
);
