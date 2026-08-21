"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Plus, Users } from "lucide-react";

const roleLabels: Record<string, string> = {
  "org:admin": "Administrador",
  "org:member": "Membro",
};

export default function OrganizationsQuickAccess() {
  const router = useRouter();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true, pageSize: 4 },
  });

  async function handleAccess(organizationId: string) {
    if (!setActive) return;
    await setActive({ organization: organizationId });
    router.push("/dashboard/organizations");
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organizações</h2>
          <p className="text-sm text-base-content/60">
            Acesse rapidamente as organizações das quais você faz parte.
          </p>
        </div>
        <a href="/dashboard/organizations" className="btn btn-sm btn-outline">
          Ver todas
          <ArrowRight size={16} />
        </a>
      </div>

      {!isLoaded && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isLoaded && userMemberships.data.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
          <Building2 className="size-8 text-base-content/40" />
          <p className="text-sm text-base-content/60">
            Você ainda não faz parte de nenhuma organização.
          </p>
          <a href="/dashboard/organizations" className="btn btn-primary btn-sm">
            <Plus size={16} />
            Criar organização
          </a>
        </div>
      )}

      {isLoaded && userMemberships.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {userMemberships.data.map((membership) => {
            const org = membership.organization;
            return (
              <div
                key={membership.id}
                className="group flex flex-col justify-between rounded-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-xl bg-base-200">
                      {org.imageUrl ? (
                        <img src={org.imageUrl} alt={org.name} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{org.name}</p>
                    <p className="flex items-center gap-1 text-xs text-base-content/50">
                      <Users size={12} />
                      {roleLabels[membership.role] ?? membership.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAccess(org.id)}
                  className="btn btn-ghost btn-sm mt-4 justify-between px-2"
                >
                  Acessar
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
