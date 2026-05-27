import { NavItem } from "@/types/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Radio,
  Palette,
  ChartPie,
  Book,
  Folder,
  NotebookTabs,
  Bot,
  NotepadText,
} from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "workspaces",
    label: "Equipes",
    icon: Users,
    href: "/dashboard/workspace",
  },
  {
    id: "folders",
    label: "Minhas Pastas",
    icon: Folder,
    href: "/dashboard/folders",
  },
  {
    id: "innolab",
    label: "InnoLab",
    icon: Book,
    href: "/dashboard/innolab",
  },
  {
    id: "labtest",
    label: "LabTest",
    icon: ChartPie,
    href: "/dashboard/labtest",
  },
  {
    id: "showlive",
    label: "ShowLive",
    icon: Radio,
    href: "/dashboard/showlive",
  },
  {
    id: "stylelab",
    label: "StyleLab",
    icon: Palette,
    href: "/dashboard/stylelab",
  },
];
