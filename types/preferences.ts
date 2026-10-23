/** Preferências do usuário (ver db/schema/user-preferences.ts). Sem dependências de servidor. */
export type UserPreferences = {
  layoutLocked: boolean;
  sidebarExpanded: boolean;
  allowTeamInvites: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  layoutLocked: false,
  sidebarExpanded: false,
  allowTeamInvites: true,
};

export const PREFERENCE_KEYS = Object.keys(DEFAULT_PREFERENCES) as (keyof UserPreferences)[];
