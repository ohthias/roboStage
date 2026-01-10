import { Plus, FileText, Calendar, Palette } from "lucide-react";

const actions = [
  { label: "Novo Teste", icon: Plus },
  { label: "Novo Documento", icon: FileText },
  { label: "Criar Evento", icon: Calendar },
  { label: "Novo Estilo", icon: Palette },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map(({ label, icon: Icon }) => (
        <button
          key={label}
          className="flex items-center gap-3 p-4 rounded-2xl bg-base-100 border border-base-300 hover:bg-base-200 transition"
        >
          <Icon size={20} />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
