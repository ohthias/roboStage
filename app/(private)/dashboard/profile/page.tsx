"use client";

import { Mail, User } from "lucide-react";
import { useUser } from "@/app/context/UserContext";

export default function ProfilePage() {
  const { session, profile } = useUser();

  if (!session || !profile) return null;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="avatar">
          <div className="w-24 rounded-full bg-base-300">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User size={36} className="opacity-50" />
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {profile.username ?? "Usuário"}
          </h1>
          <p className="text-sm opacity-70 flex items-center gap-2">
            <Mail size={14} />
            {session.user.email}
          </p>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">
          Informações da Conta
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs opacity-60">Nome</span>
            <p className="font-medium">
              {profile.username ?? "Não definido"}
            </p>
          </div>

          <div>
            <span className="text-xs opacity-60">Email</span>
            <p className="font-medium">
              {session.user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Editar informações */}
      <button className="btn btn-primary">
        Editar Informações
      </button>
    </div>
  );
}