import {
  Briefcase,
  CalendarDays,
  Flag,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  Rocket,
  Star,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Ícones aceitos por `renameBoard` (mesma lista de BOARD_ICON_NAMES). */
export const BOARD_ICON_PRESET: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "LayoutDashboard", label: "Dashboard", icon: LayoutDashboard },
  { name: "ListTodo", label: "Tarefas", icon: ListTodo },
  { name: "FolderKanban", label: "Projetos", icon: FolderKanban },
  { name: "Rocket", label: "Lançamento", icon: Rocket },
  { name: "Target", label: "Metas", icon: Target },
  { name: "CalendarDays", label: "Agenda", icon: CalendarDays },
  { name: "Lightbulb", label: "Ideias", icon: Lightbulb },
  { name: "Briefcase", label: "Trabalho", icon: Briefcase },
  { name: "GraduationCap", label: "Estudos", icon: GraduationCap },
  { name: "Users", label: "Equipe", icon: Users },
  { name: "Star", label: "Favoritos", icon: Star },
  { name: "Flag", label: "Prioridades", icon: Flag },
];

export const BOARD_ICON_MAP = new Map(BOARD_ICON_PRESET.map((item) => [item.name, item.icon]));
