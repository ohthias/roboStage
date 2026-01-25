import { Plus, FileText, Calendar, Palette } from "lucide-react";

type QuickActionType = "test" | "document" | "event" | "style";

const actions = [
  { label: "Novo Teste", icon: Plus, type: "test" },
  { label: "Novo Documento", icon: FileText, type: "document" },
  { label: "Criar Evento", icon: Calendar, type: "event" },
  { label: "Novo Estilo", icon: Palette, type: "style" },
] as const;

interface QuickActionsProps {
  onAction: (type: QuickActionType) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map(({ label, icon: Icon, type }) => (
        <button
          key={label}
          onClick={() => onAction(type)}
          className="flex items-center gap-3 p-4 rounded-2xl bg-base-100 border border-base-300 hover:bg-base-200 transition"
        >
          <Icon size={20} />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}