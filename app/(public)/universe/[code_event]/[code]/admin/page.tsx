"use client";

import { useAccess } from "@/components/showLive/permissions/AccessContext";

export default function AdminPage() {
  const { permissions } = useAccess();

  if (!permissions.canAccessAdmin) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          Você não possui acesso.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">
        Painel Administrativo
      </h1>
    </div>
  );
}