import { Brush, Flame, Grid2X2, LayoutGrid, ShieldAlert, Table, type LucideProps } from "lucide-react";
import type { DiagramKind } from "@/utils/quickbrick/notebook";

const ICONS = {
  estrategia: Brush,
  "matriz-risco": ShieldAlert,
  swot: Grid2X2,
  "swot-missoes": LayoutGrid,
  "tabela-missoes": Table,
  heatmap: Flame,
} satisfies Record<DiagramKind, React.ComponentType<LucideProps>>;

export function DiagramIcon({ kind, ...props }: { kind: DiagramKind } & LucideProps) {
  const Icon = ICONS[kind];
  return <Icon {...props} />;
}
