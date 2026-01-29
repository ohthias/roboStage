import { NavItem } from "@/types/navigation";
import { LayoutDashboard, User, Users, Radio, Palette, ChartPie, Book, Folder, NotebookTabs, Bot} from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "folders",
    label: "Pastas",
    icon: Folder,
    href: "/dashboard/folders",
  },
  {
    id: "teams",
    label: "Equipes",
    icon: Users,
    href: "/dashboard/teams",
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
    id: "calibrabot",
    label: "CalibraBot",
    icon: Bot,
    href: "/dashboard/calibrabot",
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
  {
    id: "profile",
    label: "Perfil",
    icon: User,
    href: "/dashboard/profile",
  },
];
