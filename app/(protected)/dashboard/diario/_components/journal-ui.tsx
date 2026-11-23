import {
  Code2,
  Dumbbell,
  FileText,
  Lightbulb,
  MessagesSquare,
  NotebookPen,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { TeamAvatar, cn, type Tone } from "@/components/stage";
import type { JournalAuthor, JournalTemplateIcon } from "@/types/journal";

export const TEMPLATE_ICONS: Record<JournalTemplateIcon, LucideIcon> = {
  NotebookPen,
  Dumbbell,
  Code2,
  Lightbulb,
  MessagesSquare,
  Wrench,
  Trophy,
  FileText,
};

export function TemplateIcon({ icon, className }: { icon: string | null | undefined; className?: string }) {
  const Icon = TEMPLATE_ICONS[(icon ?? "NotebookPen") as JournalTemplateIcon] ?? NotebookPen;
  return <Icon className={className} aria-hidden />;
}

/** Tom estável por categoria (mesma categoria = mesma cor em toda a tela). */
const CATEGORY_TONES: Tone[] = ["primary", "info", "success", "secondary", "warning", "accent", "ink"];
export function categoryTone(category: string): Tone {
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) >>> 0;
  return CATEGORY_TONES[h % CATEGORY_TONES.length];
}

/** Cor do ponto/barra da categoria (variável do tema). */
export function categoryColor(category: string): string {
  const tone = categoryTone(category);
  return tone === "ink" ? "var(--color-base-content)" : `var(--color-${tone})`;
}

export function AuthorChip({ author, size = 20, className }: { author: JournalAuthor; size?: number; className?: string }) {
  const name = author.name ?? "Membro";
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <TeamAvatar name={name} src={author.avatarUrl ?? undefined} size={size} className="ring-1" />
      <span className="truncate">{name}</span>
    </span>
  );
}

/** Rótulo relativo do dia ("Hoje", "Ontem") ou null. */
export function relativeDay(date: string, today: string, yesterday: string): string | null {
  if (date === today) return "Hoje";
  if (date === yesterday) return "Ontem";
  return null;
}
