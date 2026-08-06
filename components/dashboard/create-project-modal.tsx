"use client";

import { useRef, useState } from "react";
import { useOrganizationList } from "@clerk/nextjs";
import { Plus, FolderKanban } from "lucide-react";

export default function CreateProjectModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true, pageSize: 20 },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
    setName("");
    setDescription("");
    setOrganizationId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: integrar com a API de criação de projetos.
      // await fetch("/api/projects", { method: "POST", body: JSON.stringify({ name, description, organizationId }) });
      await new Promise((resolve) => setTimeout(resolve, 600));
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={openModal}>
        <Plus size={16} />
        Novo projeto
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <div className="mb-1 flex items-center gap-2">
            <FolderKanban className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Novo projeto</h3>
          </div>
          <p className="mb-5 text-sm text-base-content/60">
            Defina as informações básicas. Você poderá ajustar os detalhes depois.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Nome do projeto</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ex.: Plataforma de testes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Descrição</span>
                <span className="label-text-alt text-base-content/40">Opcional</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Do que se trata esse projeto?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Organização</span>
              </div>
              <select
                className="select select-bordered w-full"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                disabled={!isLoaded}
              >
                <option value="" disabled>
                  {isLoaded ? "Selecione uma organização" : "Carregando..."}
                </option>
                {userMemberships?.data?.map((membership) => (
                  <option key={membership.id} value={membership.organization.id}>
                    {membership.organization.name}
                  </option>
                )) ?? null}
              </select>
            </label>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={closeModal}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Criar projeto"
                )}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>fechar</button>
        </form>
      </dialog>
    </>
  );
}
