"use client";

import AccessContext from "./AccessContext";

import {
  permissions,
  AccessRole,
} from "./permissions";

interface Props {
  children: React.ReactNode;
  role: AccessRole;
}

export default function AccessProvider({
  children,
  role,
}: Props) {
  return (
    <AccessContext.Provider
      value={{
        role,
        permissions: permissions[role],
      }}
    >
      {children}
    </AccessContext.Provider>
  );
}