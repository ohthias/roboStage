"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Users, X, Copy, Check } from "lucide-react";

interface CreateTeamSpaceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateTeamSpaceModal({
  open,
  onClose,
  onCreated,
}: CreateTeamSpaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError("O nome do espaço é obrigatório.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1️⃣ Criar espaço
    const { data: teamSpace, error: teamError } = await supabase
      .from("team_spaces")
      .insert({
        name,
        description,
      })
      .select("id, join_code")
      .single();

    if (teamError || !teamSpace) {
      setLoading(false);
      setError("Erro ao criar o espaço de equipe.");
      return;
    }

    // 2️⃣ Criar owner automaticamente
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: teamSpace.id,
      role: "owner",
    });

    if (memberError) {
      setLoading(false);
      setError("Espaço criado, mas erro ao definir proprietário.");
      return;
    }

    setJoinCode(teamSpace.join_code);
    setLoading(false);
    onCreated?.();
  }

  function handleCopy() {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setName("");
    setDescription("");
    setJoinCode(null);
    setError(null);
    onClose();
  }

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {joinCode ? "Equipe criada!" : "Criar Espaço de Equipe"}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {!joinCode ? (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome do espaço</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Descrição</span>
              </label>
              <textarea
                className="textarea textarea-bordered resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm">{error}</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="alert alert-success">
              Compartilhe este código para que outros entrem na equipe.
            </div>

            <div className="flex items-center justify-between bg-base-200 rounded-lg px-4 py-3">
              <span className="font-mono text-lg tracking-widest">
                {joinCode}
              </span>

              <button onClick={handleCopy} className="btn btn-sm btn-outline">
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modal-action">
          {!joinCode ? (
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Espaço"}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleClose}>
              Concluir
            </button>
          )}
        </div>
      </div>

      <div className="modal-backdrop" onClick={handleClose} />
    </dialog>
  );
}
