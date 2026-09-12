import { relations } from "drizzle-orm";
import { users } from "./users";
import { leagues, userLeagueInterests } from "./leagues";
import { teams, teamMembers } from "./teams";
import { folders, documents } from "./notebook";
import { tests, testExecutions } from "./labtest";
import { calendarEvents, calendarEventDocuments } from "./calendar";
import {
  boards,
  boardColumns,
  boardCards,
  boardCardAssignees,
  boardCardDocuments,
  boardCardEvents,
} from "./boards";
import { tags, documentTags, boardCardTags } from "./tags";
import { notifications } from "./notifications";

export const usersRelations = relations(users, ({ many }) => ({
  leagueInterests: many(userLeagueInterests),
  teamMemberships: many(teamMembers),
  folders: many(folders),
  documents: many(documents),
  tests: many(tests),
  calendarEvents: many(calendarEvents),
  boards: many(boards),
  cardAssignments: many(boardCardAssignees),
  notifications: many(notifications),
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
  calendarEvents: many(calendarEvents),
  boards: many(boards),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

// ---------------------------------------------------------------------------
// Pages / Folders
// ---------------------------------------------------------------------------

export const foldersRelations = relations(folders, ({ one, many }) => ({
  owner: one(users, { fields: [folders.userId], references: [users.id] }),
  team: one(teams, { fields: [folders.teamId], references: [teams.id] }),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: "folder_children",
  }),
  children: many(folders, { relationName: "folder_children" }),
  documents: many(documents),
  tests: many(tests),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, { fields: [documents.userId], references: [users.id] }),
  team: one(teams, { fields: [documents.teamId], references: [teams.id] }),
  folder: one(folders, {
    fields: [documents.folderId],
    references: [folders.id],
  }),
  parent: one(documents, {
    fields: [documents.parentId],
    references: [documents.id],
    relationName: "document_children",
  }),
  children: many(documents, { relationName: "document_children" }),
  calendarEvents: many(calendarEventDocuments),
  boardCards: many(boardCardDocuments),
  tags: many(documentTags),
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
  ({ one }) => ({
    test: one(tests, {
      fields: [testExecutions.testId],
      references: [tests.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export const calendarEventsRelations = relations(
  calendarEvents,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [calendarEvents.userId],
      references: [users.id],
    }),
    team: one(teams, {
      fields: [calendarEvents.teamId],
      references: [teams.id],
    }),
    documents: many(calendarEventDocuments),
    cards: many(boardCardEvents),
  })
);

export const calendarEventDocumentsRelations = relations(
  calendarEventDocuments,
  ({ one }) => ({
    event: one(calendarEvents, {
      fields: [calendarEventDocuments.eventId],
      references: [calendarEvents.id],
    }),
    document: one(documents, {
      fields: [calendarEventDocuments.documentId],
      references: [documents.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// Kanban
// ---------------------------------------------------------------------------

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, { fields: [boards.userId], references: [users.id] }),
  team: one(teams, { fields: [boards.teamId], references: [teams.id] }),
  columns: many(boardColumns),
  cards: many(boardCards),
}));

export const boardColumnsRelations = relations(
  boardColumns,
  ({ one, many }) => ({
    board: one(boards, {
      fields: [boardColumns.boardId],
      references: [boards.id],
    }),
    cards: many(boardCards),
  })
);

export const boardCardsRelations = relations(boardCards, ({ one, many }) => ({
  board: one(boards, {
    fields: [boardCards.boardId],
    references: [boards.id],
  }),
  column: one(boardColumns, {
    fields: [boardCards.columnId],
    references: [boardColumns.id],
  }),
  assignees: many(boardCardAssignees),
  documents: many(boardCardDocuments),
  events: many(boardCardEvents),
  tags: many(boardCardTags),
}));

export const boardCardAssigneesRelations = relations(
  boardCardAssignees,
  ({ one }) => ({
    card: one(boardCards, {
      fields: [boardCardAssignees.cardId],
      references: [boardCards.id],
    }),
    user: one(users, {
      fields: [boardCardAssignees.userId],
      references: [users.id],
    }),
  })
);

export const boardCardDocumentsRelations = relations(
  boardCardDocuments,
  ({ one }) => ({
    card: one(boardCards, {
      fields: [boardCardDocuments.cardId],
      references: [boardCards.id],
    }),
    document: one(documents, {
      fields: [boardCardDocuments.documentId],
      references: [documents.id],
    }),
  })
);

export const boardCardEventsRelations = relations(
  boardCardEvents,
  ({ one }) => ({
    card: one(boardCards, {
      fields: [boardCardEvents.cardId],
      references: [boardCards.id],
    }),
    event: one(calendarEvents, {
      fields: [boardCardEvents.eventId],
      references: [calendarEvents.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const tagsRelations = relations(tags, ({ many }) => ({
  documents: many(documentTags),
  cards: many(boardCardTags),
}));

export const documentTagsRelations = relations(documentTags, ({ one }) => ({
  document: one(documents, {
    fields: [documentTags.documentId],
    references: [documents.id],
  }),
  tag: one(tags, { fields: [documentTags.tagId], references: [tags.id] }),
}));

export const boardCardTagsRelations = relations(boardCardTags, ({ one }) => ({
  card: one(boardCards, {
    fields: [boardCardTags.cardId],
    references: [boardCards.id],
  }),
  tag: one(tags, { fields: [boardCardTags.tagId], references: [tags.id] }),
}));

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
