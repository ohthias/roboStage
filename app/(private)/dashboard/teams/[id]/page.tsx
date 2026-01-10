"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTeam } from "@/hooks/useTeam";
import { Users, Shield, ArrowLeft } from "lucide-react";

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();

  const teamId = Number(params.id);

  const { team, loading, error } = useTeam(teamId);

  useEffect(() => {
    if (error) {
      router.replace("/dashboard/teams");
    }
  }, [error, router]);

  if (loading) {
    return <div className="p-6 opacity-70">Carregando equipe...</div>;
  }

  if (!team) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => router.push("/dashboard/teams")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="opacity-70">
            {team.description || "Sem descrição"}
          </p>
        </div>
      </header>

      {/* Info */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-info" />
            <h3 className="font-semibold">Seu papel</h3>
          </div>
          <p className="mt-2 capitalize">{team.role}</p>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-success" />
            <h3 className="font-semibold">Acesso</h3>
          </div>
          <p className="mt-2">
            {team.role === "member"
              ? "Acesso padrão"
              : "Acesso administrativo"}
          </p>
        </div>
      </section>
    </div>
  );
}
