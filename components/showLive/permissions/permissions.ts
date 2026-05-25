export type AccessRole =
  | "public"
  | "visitor"
  | "volunteer";

export const permissions = {
  public: {
    canEdit: false,
    canAccessAdmin: false,
    canControlTimer: false,
    canManageScores: false,
  },

  visitor: {
    canEdit: false,
    canAccessAdmin: false,
    canControlTimer: false,
    canManageScores: false,
  },

  volunteer: {
    canEdit: true,
    canAccessAdmin: true,
    canControlTimer: true,
    canManageScores: true,
  },
};