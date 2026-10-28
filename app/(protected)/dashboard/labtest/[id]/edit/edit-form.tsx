"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Folder,
  FolderOpen,
  Loader2,
  Search,
} from "lucide-react";

import { useToast } from "@/app/context/ToastContext";
import { DocIcon } from "@/components/editor/doc-icon";
import { folderColorStyles } from "@/utils/stagebook/folder-colors";
import { ResourceLabels } from "@/components/stagebook/labels/resource-labels";
import type { MilestoneDTO, TagDTO } from "@/types/labels";
import { updateTestDetails, type EditFolderOption } from "../../actions";
import {
  CharCount,
  FieldLabel,
  Note,
} from "../../new/components/FormBits";

type EditableTest = {
  id: string;
  name: string;
  description: string | null;
  folderId: string | null;
  season: string | null;
  createdAt: string;
  modeLabel: string;
  configSummary: string;
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function Section({
  kicker,
  title,
  hint,
  children,
}: {
  kicker: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5 sm:p-7">
      <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
        / {kicker}
      </p>
      <h2 className="mt-1 text-base font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-base-content/55">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Ícone da pasta igual ao da tela de Pastas: ícone escolhido ou a pasta na cor dela. */
function FolderGlyph({ icon, color }: { icon: string | null; color: string | null }) {
  const colored = folderColorStyles(color);
  if (icon) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={colored?.tile}
      >
        <DocIcon value={icon} size={17} />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      <Folder
        size={19}
        strokeWidth={1.8}
        className="text-primary"
        style={colored ? { color: color ?? undefined } : undefined}
      />
    </span>
  );
}

export function EditTestForm({
  test,
  folders,
  initialTags,
  initialMilestone,
}: {
  test: EditableTest;
  folders: EditFolderOption[];
  initialTags: TagDTO[];
  initialMilestone: MilestoneDTO | null;
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState(test.name);
  const [description, setDescription] = useState(test.description ?? "");
  const [folderId, setFolderId] = useState<string | null>(test.folderId);
  const [folderQuery, setFolderQuery] = useState("");
  const [tagCount, setTagCount] = useState(initialTags.length);

  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const dirty =
    name.trim() !== test.name ||
    description.trim() !== (test.description ?? "") ||
    folderId !== test.folderId;

  const nameError = !name.trim() ? "Informe um nome para o teste." : null;
  const currentFolder = folders.find((f) => f.id === folderId) ?? null;
  // Pasta apagada ou de outro espaço: mostra como "sem pasta".
  const folderMissing = Boolean(folderId) && !currentFolder;

  const filteredFolders = useMemo(() => {
    const q = folderQuery.trim().toLowerCase();
    return q ? folders.filter((f) => f.label.toLowerCase().includes(q)) : folders;
  }, [folders, folderQuery]);

  const backHref = `/dashboard/labtest/${test.id}`;

  const handleSave = () => {
    setError(null);
    if (nameError) {
      setError(nameError);
      document.getElementById("test-name")?.focus();
      return;
    }
    startSaving(async () => {
      try {
        await updateTestDetails(test.id, {
          name,
          description,
          folderId: folderMissing ? null : folderId,
        });
        addToast("Teste atualizado.", "success");
        router.push(backHref);
        router.refresh();
      } catch (err) {
        const raw = err instanceof Error ? err.message : "";
        setError(
          !raw || /failed to fetch|network/i.test(raw)
            ? "Sem conexão com o servidor. Tente de novo."
            : raw,
        );
      }
    });
  };

  const btnShape = "rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none";

  const saveButton = (className = "") => (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving || !dirty}
      className={`btn btn-primary ${btnShape} ${className}`}
    >
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      {saving ? "Salvando…" : "Salvar alterações"}
    </button>
  );

  const folderRow = (
    id: string | null,
    label: string,
    opts: { color?: string | null; icon?: string | null; depth?: number } = {},
  ) => {
    const active = folderId === id;
    return (
      <li key={id ?? "none"}>
        <button
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => setFolderId(id)}
          className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors focus-visible:bg-base-200 focus-visible:outline-none ${
            active ? "bg-primary/10 font-medium" : "hover:bg-base-200/60"
          }`}
        >
          {id === null ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <FolderOpen size={19} strokeWidth={1.8} className="text-base-content/40" />
            </span>
          ) : (
            <FolderGlyph icon={opts.icon ?? null} color={opts.color ?? null} />
          )}
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {active && <Check className="size-4 shrink-0 text-primary" />}
        </button>
      </li>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:px-8 lg:pb-12">
      <Link
        href={backHref}
        className="group inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-base-content"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        {test.name}
      </Link>

      <header className="mb-8 mt-4">
        <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
          / {test.modeLabel.toUpperCase()} · EDITAR
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Editar{" "}
          <span className="inline-block -rotate-1 bg-accent px-2 italic text-accent-content">
            teste
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-base-content/60">
          Mude o nome, a descrição, a pasta e as tags. A configuração do teste
          continua igual, para não afetar as execuções já registradas.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-6">
          {/* Identificação */}
          <Section kicker="01" title="Identificação">
            <div className="flex flex-col gap-5">
              <div>
                <FieldLabel htmlFor="test-name" aside={<CharCount value={name} max={100} />}>
                  Nome
                </FieldLabel>
                <input
                  id="test-name"
                  type="text"
                  className={`input w-full ${error && nameError ? "input-error" : ""}`}
                  value={name}
                  maxLength={100}
                  required
                  autoComplete="off"
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="test-description"
                  aside={<CharCount value={description} max={200} />}
                >
                  Descrição{" "}
                  <span className="font-normal text-base-content/45">(opcional)</span>
                </FieldLabel>
                <textarea
                  id="test-description"
                  rows={3}
                  className="textarea w-full resize-none"
                  placeholder="ex: Testes antes da regional"
                  value={description}
                  maxLength={200}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Pasta */}
          <Section
            kicker="02"
            title="Pasta"
            hint="Guarde o teste junto com as páginas e quadros do mesmo assunto."
          >
            {folderMissing && (
              <div className="mb-3">
                <Note tone="warning">
                  A pasta atual não existe mais neste espaço. Escolha outra ou
                  deixe sem pasta.
                </Note>
              </div>
            )}

            {folders.length > 6 && (
              <label className="input input-sm mb-2 w-full">
                <Search className="size-3.5 text-base-content/40" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Buscar pasta"
                  value={folderQuery}
                  onChange={(e) => setFolderQuery(e.target.value)}
                />
              </label>
            )}

            <ul
              role="radiogroup"
              aria-label="Pasta do teste"
              className="max-h-72 divide-y divide-base-300 overflow-y-auto rounded-tl-xl rounded-br-xl border border-base-300"
            >
              {!folderQuery && folderRow(null, "Sem pasta")}
              {filteredFolders.map((f) =>
                folderRow(f.id, f.label, { color: f.color, icon: f.icon }),
              )}
              {folders.length > 0 && filteredFolders.length === 0 && (
                <li className="px-3 py-5 text-center text-xs text-base-content/45">
                  Nenhuma pasta encontrada.
                </li>
              )}
            </ul>

            {folders.length === 0 && (
              <p className="mt-2 text-xs text-base-content/55">
                Você ainda não tem pastas.{" "}
                <Link href="/dashboard/folders" className="link link-primary">
                  Criar uma pasta
                </Link>
              </p>
            )}
          </Section>

          {/* Tags */}
          <Section
            kicker="03"
            title="Tags e marco"
            hint="As tags são as mesmas do Kanban, das páginas e do ThinkLab. Mudanças aqui salvam na hora."
          >
            <ResourceLabels
              kind="labtest"
              resourceId={test.id}
              initialTags={initialTags}
              initialMilestone={initialMilestone}
              onChange={({ tags }) => setTagCount(tags.length)}
            />
          </Section>
        </div>

        {/* Resumo */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
              / RESUMO
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-base-content/45">Nome</dt>
                <dd className={`mt-0.5 break-words ${name.trim() ? "font-medium" : "text-base-content/35"}`}>
                  {name.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-base-content/45">Pasta</dt>
                <dd className="mt-0.5 flex items-center gap-2 break-words font-medium">
                  {currentFolder && (
                    <FolderGlyph icon={currentFolder.icon} color={currentFolder.color} />
                  )}
                  <span className="min-w-0">{currentFolder?.label ?? "Sem pasta"}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-base-content/45">Tags</dt>
                <dd className="mt-0.5 font-medium">
                  {tagCount === 0 ? "Nenhuma" : `${tagCount} ${tagCount === 1 ? "tag" : "tags"}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-base-content/45">Configuração</dt>
                <dd className="mt-0.5 text-base-content/70">{test.configSummary}</dd>
              </div>
              <div>
                <dt className="text-xs text-base-content/45">Criado em</dt>
                <dd className="mt-0.5 text-base-content/70">
                  {dateFmt.format(new Date(test.createdAt))}
                  {test.season ? ` · ${test.season.toUpperCase()}` : ""}
                </dd>
              </div>
            </dl>

            <div className="my-5 h-px bg-base-300" />

            <p className="text-xs text-base-content/55" aria-live="polite">
              {dirty ? "Há alterações não salvas." : "Nada para salvar."}
            </p>
            {saveButton("mt-3 w-full")}
            <Link href={backHref} className="btn btn-ghost btn-sm mt-2 w-full text-base-content/55">
              {dirty ? "Descartar" : "Voltar"}
            </Link>
            {error && (
              <p className="mt-3 border-l-2 border-error pl-3 text-sm text-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Barra fixa (celular / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p
            className={`min-w-0 flex-1 truncate text-sm ${error ? "text-error" : "text-base-content/60"}`}
            aria-live="polite"
          >
            {error ?? (dirty ? "Alterações não salvas" : "Tudo salvo")}
          </p>
          {saveButton("shrink-0")}
        </div>
      </div>
    </div>
  );
}
