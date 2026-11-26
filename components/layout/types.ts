import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  page?: string;   // SPA interna
  href?: string;   // rota real
}
