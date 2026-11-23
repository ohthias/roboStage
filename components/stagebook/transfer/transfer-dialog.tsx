"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  Book,
  Check,
  CheckCircle2,
  Cuboid,
  FlaskConical,
  Folder,
  Lightbulb,
  Loader2,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  InlineAlert,
  ListItem,
  Segmented,
  ToolBadge,
  ToolButton,
  ToolDialog,
  ToolEmpty,
  ToolInput,
  ToolSelect,
  cn,
} from "@/components/stage";
import { useToast } from "@/app/context/ToastContext";
import { searchTransferCandidates, transferItemsToTeam } from "@/utils/stagebook/actions/transfer";
import { teamToolHref } from "@/app/(protected)/dashboard/team/_components/team-links";
import {
  LEGACY_LIMITS,
  TRANSFER_KINDS,
  TRANSFER_KIND_LABEL,
  type TransferCandidateDTO,
  type TransferKind,
  type TransferResultDTO,
} from "@/types/legacy";

export const TRANSFER_ICONS: Record<TransferKind, LucideIcon> = {
  folder: Folder,
  stagebook: Book,
  labtest: FlaskConical,
  quickbrick: Cuboid,
  thinklab: Lightbulb,
};

export type TransferTarget = { id: string; name: string };

type Step = "pick" | "review" | "done";
type KindFilter = "all" | TransferKind;
const key = (c: { kind: TransferKind; id: string }) => `${c.kind}:${c.id}`;

function safeTeamToolHref(teamId: string, href: string) {
  const teamSegment = encodeURIComponent(teamId);
  const fallback = `/dashboard/team/${teamSegment}?tab=legado`;

  // Only internal paths are allowed. This blocks javascript:, protocol-relative,
  // backslash, and other control-character URL variants from result data.
  if (typeof href !== "string" || !/^\/(?!\/)[^\u0000-\u001F\u007F\\]*$/.test(href)) {
    return fallback;
  }

  const routed = teamToolHref(teamSegment, href);
  if (typeof routed !== "string" || !/^\/[^/\\]|^\/\/(?!\/)/.test(routed)) {
    return fallback;
  }

  return routed;
}

/**
 * Diálogo "Transferir para a equipe": escolhe itens do espaço PESSOAL (pastas,
 * páginas, testes, cadernos, quadros), revisa o que acontece e transfere.
 *
 * Usado na aba Legado da equipe (`fixedTeamId`) e nas ferramentas quando o
 * espaço ativo é o pessoal (aí a pessoa escolhe a equipe).
 */
type TransferDialogProps = {
  open: boolean;
  onClose: () => void;
  teams: TransferTarget[];
  fixedTeamId?: string;
  initialKind?: TransferKind;
  onDone?: (result: TransferResultDTO, teamId: string) => void;
};

export function TransferDialog(props: TransferDialogProps) {
  // Montado só aberto: cada abertura começa do zero.
  return props.open ? <TransferDialogBody {...props} /> : null;
}

function TransferDialogBody({ onClose, teams, fixedTeamId, initialKind, onDone }: TransferDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>("pick");
  const [teamId, setTeamId] = useState(fixedTeamId ?? teams[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<KindFilter>(initialKind ?? "all");
  const [found, setFound] = useState<{ key: string; items: TransferCandidateDTO[]; error: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Map<string, TransferCandidateDTO>>(new Map());
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<TransferResultDTO | null>(null);
  const [reload, setReload] = useState(0);

  const searchKey = `${q}|${kind}|${reload}`;
  const results = found?.key === searchKey ? found.items : null;
  const searchError = found?.key === searchKey ? found.error : null;

  useEffect(() => {
    if (step !== "pick") return;
    let alive = true;
    const t = setTimeout(async () => {
      const res = await searchTransferCandidates({ q, kind: kind === "all" ? null : kind });
      if (!alive) return;
      setFound(res.ok ? { key: searchKey, items: res.data, error: null } : { key: searchKey, items: [], error: res.error });
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, kind, step, searchKey]);

  const team = teams.find((t) => t.id === teamId) ?? null;
  const picked = useMemo(() => [...selected.values()], [selected]);
  const full = selected.size >= LEGACY_LIMITS.transferBatch;

  function toggle(c: TransferCandidateDTO) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(key(c))) next.delete(key(c));
      else if (next.size < LEGACY_LIMITS.transferBatch) next.set(key(c), c);
      return next;
    });
  }

  async function run() {
    if (!teamId || !picked.length) return;
    setPending(true);
    const res = await transferItemsToTeam(
      teamId,
      picked.map((c) => ({ kind: c.kind, id: c.id })),
    );
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      setStep("pick");
      setReload((n) => n + 1);
      return;
    }
    setResult(res.data);
    setStep("done");
    addToast(`${res.data.moved.length === 1 ? "1 item transferido" : `${res.data.moved.length} itens transferidos`} para ${team?.name ?? "a equipe"}.`, "success");
    onDone?.(res.data, teamId);
    router.refresh();
  }

  const title = step === "done" ? "Transferência concluída" : step === "review" ? "Confirmar transferência" : "Transferir para a equipe";
  const description =
    step === "pick"
      ? "Escolha o que sai do seu espaço pessoal e passa a ser da equipe."
      : step === "review"
        ? `Para ${team?.name ?? "a equipe"}. Depois disso, o item é da equipe.`
        : undefined;

  const footer =
    step === "pick" ? (
      <>
        <span className="mr-auto self-center text-[12px] text-base-content/55">
          {selected.size ? `${selected.size} selecionado${selected.size > 1 ? "s" : ""}` : "Nada selecionado"}
          {full && ` · máximo de ${LEGACY_LIMITS.transferBatch}`}
        </span>
        <ToolButton onClick={onClose}>Cancelar</ToolButton>
        <ToolButton variant="primary" disabled={!selected.size || !teamId} onClick={() => setStep("review")}>
          Continuar
        </ToolButton>
      </>
    ) : step === "review" ? (
      <>
        <ToolButton onClick={() => setStep("pick")} disabled={pending}>
          Voltar
        </ToolButton>
        <ToolButton variant="primary" icon={pending ? <Loader2 className="animate-spin" /> : <ArrowRightLeft />} disabled={pending} onClick={run}>
          Transferir {picked.length === 1 ? "1 item" : `${picked.length} itens`}
        </ToolButton>
      </>
    ) : (
      <>
        {!fixedTeamId && teamId && (
          <a href={`/dashboard/team/${encodeURIComponent(teamId)}?tab=legado`} className="mr-auto self-center text-[12px] font-semibold text-primary hover:underline">
            Ver o legado da equipe
          </a>
        )}
        <ToolButton
          onClick={() => {
            setStep("pick");
            setSelected(new Map());
            setResult(null);
            setReload((n) => n + 1);
          }}
        >
          Transferir mais
        </ToolButton>
        <ToolButton variant="primary" onClick={onClose}>
          Concluir
        </ToolButton>
      </>
    );

  return (
    <ToolDialog open onClose={onClose} size="md" title={title} description={description} footer={footer}>
      {step === "pick" && (
        <div className="space-y-3 pb-2">
          {!fixedTeamId && (
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Para a equipe</span>
              <ToolSelect value={teamId} onChange={(e) => setTeamId(e.target.value)} aria-label="Equipe de destino">
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </ToolSelect>
            </label>
          )}
          {(error ?? searchError) && <InlineAlert type="error">{error ?? searchError}</InlineAlert>}
          <ToolInput autoFocus icon={<Search />} placeholder="Buscar no seu espaço pessoal" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar itens pessoais" />
          <Segmented<KindFilter>
            label="Ferramenta"
            size="xs"
            value={kind}
            onChange={setKind}
            className="flex-wrap"
            options={[
              { value: "all", label: "Tudo" },
              ...TRANSFER_KINDS.map((k) => {
                const Icon = TRANSFER_ICONS[k];
                return { value: k, label: TRANSFER_KIND_LABEL[k].tool, icon: <Icon /> };
              }),
            ]}
          />
          {results === null ? (
            <p className="flex items-center gap-2 py-6 text-[13px] text-base-content/50">
              <Loader2 size={14} className="animate-spin" /> Buscando…
            </p>
          ) : results.length === 0 ? (
            <ToolEmpty
              icon={<Search />}
              title="Nada para transferir"
              description={q ? "Tente outro nome." : "Seu espaço pessoal não tem itens nessa ferramenta."}
            />
          ) : (
            <ul className="max-h-80 space-y-0.5 overflow-y-auto" aria-label="Itens do espaço pessoal">
              {results.map((c) => {
                const Icon = TRANSFER_ICONS[c.kind];
                const on = selected.has(key(c));
                return (
                  <li key={key(c)}>
                    <ListItem
                      selected={on}
                      onClick={!on && full ? undefined : () => toggle(c)}
                      leading={c.icon ? <span className="text-[14px]">{c.icon}</span> : <Icon />}
                      title={c.title}
                      description={[TRANSFER_KIND_LABEL[c.kind].tool, c.detail].filter(Boolean).join(" · ")}
                      trailing={
                        <span
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`Selecionar ${c.title}`}
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded border",
                            on ? "border-primary bg-primary text-primary-content" : "border-base-content/30 bg-base-100",
                          )}
                        >
                          {on && <Check size={11} strokeWidth={3} />}
                        </span>
                      }
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {step === "review" && (
        <div className="space-y-3 pb-2">
          <ul className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border border-base-300 p-1">
            {picked.map((c) => {
              const Icon = TRANSFER_ICONS[c.kind];
              return (
                <li key={key(c)}>
                  <ListItem leading={c.icon ? <span className="text-[14px]">{c.icon}</span> : <Icon />} title={c.title} description={[TRANSFER_KIND_LABEL[c.kind].tool, c.detail].filter(Boolean).join(" · ")} />
                </li>
              );
            })}
          </ul>
          <InlineAlert type="info" title="O que acontece">
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px]">
              <li>Todos os membros de {team?.name ?? "a equipe"} passam a ver e editar. O item some do seu espaço pessoal.</li>
              <li>Pastas levam subpastas, páginas, testes e quadros guardados nelas; páginas levam as subpáginas.</li>
              <li>Execuções, fotos, diagramas e histórico vão junto, sem cópia.</li>
              <li>Tags viram as tags da equipe com o mesmo nome. Metas pessoais são retiradas.</li>
              <li>Vínculos com o seu Diário, Kanban e agenda pessoais são desfeitos.</li>
            </ul>
          </InlineAlert>
        </div>
      )}

      {step === "done" && result && (
        <div className="space-y-3 pb-2">
          <InlineAlert type="success" title={`Agora ${result.moved.length === 1 ? "é" : "são"} da equipe ${team?.name ?? ""}`.trim()}>
            {result.pages > 0 && <span className="text-[12px]">{result.pages === 1 ? "1 página" : `${result.pages} páginas`} no total. </span>}
            <span className="text-[12px]">Guarde no legado da temporada para não se perder.</span>
          </InlineAlert>
          <ul className="space-y-0.5">
            {result.moved.map((m) => {
              const Icon = TRANSFER_ICONS[m.kind];
              return (
                <li key={`${m.kind}:${m.id}`}>
                  <a
                    href={safeTeamToolHref(teamId, m.href)}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] hover:bg-base-content/[0.05]"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-base-200 text-base-content/70">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{m.title}</span>
                    <ToolBadge>{TRANSFER_KIND_LABEL[m.kind].tool}</ToolBadge>
                    <CheckCircle2 size={14} className="text-success" />
                  </a>
                </li>
              );
            })}
          </ul>
          {result.renamed.length > 0 && (
            <InlineAlert type="warning" title="Nomes ajustados">
              <ul className="mt-1 space-y-0.5 text-[12px]">
                {result.renamed.map((r) => (
                  <li key={`${r.from}->${r.to}`}>
                    “{r.from}” virou “{r.to}” (a equipe já tinha um com esse nome).
                  </li>
                ))}
              </ul>
            </InlineAlert>
          )}
          {result.notes.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-[12px] text-base-content/60">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </ToolDialog>
  );
}

/** Botão + diálogo, para as ferramentas no espaço pessoal. */
export function TransferToTeamButton({
  teams,
  kind,
  label = "Transferir para equipe",
  size = "md",
  className,
}: {
  teams: TransferTarget[];
  kind?: TransferKind;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!teams.length) return null;
  return (
    <>
      <ToolButton size={size} icon={<ArrowRightLeft />} onClick={() => setOpen(true)} className={className}>
        {label}
      </ToolButton>
      <TransferDialog open={open} onClose={() => setOpen(false)} teams={teams} initialKind={kind} />
    </>
  );
}
