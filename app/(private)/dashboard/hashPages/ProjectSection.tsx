"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  FileText,
  FlaskConical,
  Palette,
  Calendar,
  MoreVertical,
} from "lucide-react";

/* ---------- Tipagens ---------- */

interface BaseItem {
  created_at: string;
  updated_at?: string;
}

interface Document extends BaseItem {
  id: string;
  title: string;
  diagram_type: string;
}

interface Test extends BaseItem {
  id: string;
  name_test: string;
}

interface Theme extends BaseItem {
  id_theme: string;
  name: string;
}

interface Event extends BaseItem {
  id_evento: string;
  name_event: string;
  code_event: string;
}

interface Data {
  documents: Document[];
  themes: Theme[];
  events: Event[];
}

/* ---------- Utils ---------- */

const diagramBadgeMap: Record<string, string> = {
  Flowchart: "badge-primary",
  SWOT: "badge-secondary",
  "Mapa Mental": "badge-accent",
  Ishikawa: "badge-info",
  "5W2H": "badge-warning",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

/* ---------- Página ---------- */

export default function ProjectSection() {
  const router = useRouter();
  const [data, setData] = useState<Data>({
    documents: [],
    themes: [],
    events: [],
  });
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [documents, themes, events, testsResponse] = await Promise.all([
        supabase
          .from("documents")
          .select("id, title, diagram_type, created_at, updated_at")
          .eq("user_id", user.id),

        supabase
          .from("styleLab")
          .select("id_theme, name, created_at")
          .eq("id_user", user.id),

        supabase
          .from("events")
          .select("id_evento, name_event, created_at, code_event")
          .eq("id_responsavel", user.id),

        supabase
          .from("tests")
          .select("id, name_test, created_at, updated_at")
          .eq("user_id", user.id),
      ]);

      setData({
        documents: documents.data || [],
        themes: themes.data || [],
        events: events.data || [],
      });

      setTests(testsResponse.data || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando seus projetos…</div>;
  }

  return (
    <section className="p-6 space-y-12">
      <header>
        <h1 className="text-3xl font-bold">Meus Projetos</h1>
        <p className="text-base-content/70 max-w-xl">
          Tudo o que você já criou — organizado por tipo e pronto para evoluir.
        </p>
      </header>

      {/* DOCUMENTOS */}
      <Category
        icon={<FileText />}
        title="Documentos"
        description="Diagramas, mapas e estruturas de planejamento."
        items={data.documents}
        render={(doc: Document) => (
          <ToolItemCard
            title={doc.title}
            badge={doc.diagram_type}
            badgeStyle={diagramBadgeMap[doc.diagram_type]}
            icon={<FileText size={16} />}
            createdAt={doc.created_at}
            updatedAt={doc.updated_at}
            onOpen={() =>
              router.push(`/dashboard/innolab/${doc.id}/${doc.diagram_type}`)
            }
          />
        )}
      />

      {/* TESTES */}
      <Category
        icon={<FlaskConical />}
        title="Testes"
        description="Ensaios e validações técnicas."
        items={tests}
        render={(test: Test) => (
          <ToolItemCard
            title={test.name_test}
            badge="Teste"
            badgeStyle="badge-neutral"
            icon={<FlaskConical size={16} />}
            createdAt={test.created_at}
            updatedAt={test.updated_at}
            onOpen={() => router.push(`/dashboard/labtest/${test.id}`)}
          />
        )}
      />

      {/* TEMAS */}
      <Category
        icon={<Palette />}
        title="Temas Visuais"
        description="Estilos criados no StyleLab."
        items={data.themes}
        render={(theme: Theme) => (
          <ToolItemCard
            title={theme.name}
            badge="Tema"
            badgeStyle="badge-accent"
            icon={<Palette size={16} />}
            createdAt={theme.created_at}
            onOpen={() => router.push(`/dashboard#stylelab`)}
          />
        )}
      />

      {/* EVENTOS */}
      <Category
        icon={<Calendar />}
        title="Eventos"
        description="Eventos e competições organizadas."
        items={data.events}
        render={(event: Event) => (
          <ToolItemCard
            title={event.name_event}
            badge="Evento"
            badgeStyle="badge-info"
            icon={<Calendar size={16} />}
            createdAt={event.created_at}
            onOpen={() =>
              router.push(`/dashboard/showlive/${event.code_event}`)
            }
          />
        )}
      />
    </section>
  );
}

/* ---------- Componentes ---------- */

function Category({ icon, title, description, items, render }: any) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-start">
        <div className="p-3 rounded-xl bg-base-200">{icon}</div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-base-content/70">{description}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-base-content/50 pl-16">
          Nenhum item criado ainda.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-16">
          {items.map(render)}
        </div>
      )}
    </div>
  );
}

function ToolItemCard({
  title,
  badge,
  badgeStyle,
  icon,
  createdAt,
  updatedAt,
  onOpen,
}: {
  title: string;
  badge: string;
  badgeStyle?: string;
  icon: React.ReactNode;
  createdAt: string;
  updatedAt?: string;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="card bg-base-200 hover:bg-base-300 transition shadow-sm cursor-pointer"
    >
      <div className="card-body p-4 gap-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-base-100 w-8 h-8 flex items-center justify-center">{icon}</div>
            <div>
              <p className="font-semibold leading-tight">{title}</p>
              <div
                className={`badge badge-sm mt-1 ${badgeStyle || "badge-outline"}`}
              >
                {badge}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div
            className="dropdown dropdown-end"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="btn btn-ghost btn-xs">
              <MoreVertical size={16} />
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
              <li>
                <button onClick={onOpen}>Abrir</button>
              </li>
              <li>
                <button>Renomear</button>
              </li>
              <li>
                <button>Duplicar</button>
              </li>
              <li className="text-error">
                <button>Excluir</button>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-base-content/50">
          {updatedAt
            ? `Atualizado em ${formatDate(updatedAt)}`
            : `Criado em ${formatDate(createdAt)}`}
        </p>
      </div>
    </div>
  );
}