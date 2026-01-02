"use client";

import React from "react";
import {
  Trash2,
  Clock,
  List,
  Fish,
  Brain,
  Workflow,
  Target,
  ChevronRight,
  Star,
} from "lucide-react";

export type DiagramType =
  | "5W2H"
  | "Ishikawa"
  | "Mapa Mental"
  | "Flowchart"
  | "SWOT";

export interface Document {
  id: string;
  title: string;
  diagram_type: DiagramType;
  created_at: string;
  updated_at?: string;
  description?: string;
  is_favorite?: boolean;
}

interface DiagramCardProps {
  doc: Document;
  viewMode: "grid" | "list";
  onDelete: () => void;
  onToggleFavorite: () => void;
  onOpen: () => void;
}

const typeConfig: Record<
  DiagramType,
  { icon: any; color: string; bg: string }
> = {
  "5W2H": { icon: List, color: "text-primary", bg: "bg-primary/10" },
  Ishikawa: { icon: Fish, color: "text-secondary", bg: "bg-secondary/10" },
  "Mapa Mental": { icon: Brain, color: "text-accent", bg: "bg-accent/10" },
  Flowchart: { icon: Workflow, color: "text-success", bg: "bg-success/10" },
  SWOT: { icon: Target, color: "text-warning", bg: "bg-warning/10" },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR");

export default function DiagramCard({
  doc,
  viewMode,
  onDelete,
  onToggleFavorite,
  onOpen,
}: DiagramCardProps) {
  const cfg = typeConfig[doc.diagram_type];
  const Icon = cfg.icon;

  /* ================= LIST MODE ================= */
  if (viewMode === "list") {
    return (
      <div
        onClick={onOpen}
        className="flex items-center justify-between gap-4 p-4 bg-base-100 border border-base-300 rounded-xl hover:shadow cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}
          >
            <Icon size={22} />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold truncate">{doc.title}</h3>
            <div className="flex gap-2 text-xs text-base-content/60 mt-1">
              <span className="badge badge-outline">
                {doc.diagram_type}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDate(doc.updated_at || doc.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`btn btn-ghost btn-sm ${
              doc.is_favorite ? "text-warning" : "text-base-content/40"
            }`}
          >
            <Star
              size={18}
              className={doc.is_favorite ? "fill-warning" : ""}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn btn-ghost btn-sm text-error"
          >
            <Trash2 size={18} />
          </button>

          <ChevronRight className="opacity-40" />
        </div>
      </div>
    );
  }

  /* ================= GRID MODE ================= */
  return (
    <div
      onClick={onOpen}
      className="bg-base-100 border border-base-300 rounded-2xl p-5 hover:shadow-lg transition cursor-pointer flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl ${cfg.bg} ${cfg.color}`}
        >
          <Icon size={22} />
        </div>

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`btn btn-ghost btn-sm ${
              doc.is_favorite ? "text-warning" : "text-base-content/40"
            }`}
          >
            <Star
              size={18}
              className={doc.is_favorite ? "fill-warning" : ""}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn btn-ghost btn-sm text-error"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg line-clamp-2 mb-2">
        {doc.title}
      </h3>

      <div className="mt-auto flex justify-between items-center text-xs">
        <span className="badge badge-outline">
          {doc.diagram_type}
        </span>
        <span className="flex items-center gap-1 text-base-content/50">
          <Clock size={12} />
          {formatDate(doc.updated_at || doc.created_at)}
        </span>
      </div>
    </div>
  );
}