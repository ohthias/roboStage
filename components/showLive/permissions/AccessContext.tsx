"use client";

import {
  createContext,
  useContext,
} from "react";

import {
  permissions,
  AccessRole,
} from "./permissions";

interface AccessContextType {
  role: AccessRole;

  permissions: {
    canEdit: boolean;
    canAccessAdmin: boolean;
    canControlTimer: boolean;
    canManageScores: boolean;
  };
}

const AccessContext =
  createContext<AccessContextType>({
    role: "public",

    permissions: permissions.public,
  });

export const useAccess = () =>
  useContext(AccessContext);

export default AccessContext;