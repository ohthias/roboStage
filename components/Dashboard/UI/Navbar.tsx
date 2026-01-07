"use client";

import {
  House,
  ChartPie,
  Book,
  Palette,
  RadioIcon,
  Bot,
  Users,
  Notebook,
} from "lucide-react";
import { JSX } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  profile: {
    avatar_url?: string;
    username?: string;
  };
  session: any;
  collapsed: boolean;
  onClose?: () => void;
}

interface NavItemProps {
  icon: JSX.Element;
  label: string;
  path: string;
  pathname: string;
  collapsed: boolean;
  onClick: () => void;
}

const NavItem = ({
  icon,
  label,
  path,
  pathname,
  collapsed,
  onClick,
}: NavItemProps) => {
  const isActive =
    path === "/dashboard/labtest"
      ? pathname === path || pathname.startsWith(path + "/")
      : pathname === path;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl w-full transition-all cursor-pointer
        ${
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "hover:bg-base-200 opacity-70 hover:opacity-100"
        }
        ${collapsed ? "justify-center" : ""}
      `}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

export default function Sidebar({
  profile,
  session,
  collapsed,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);

    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <aside
      className={`flex flex-col h-full bg-base-100 border-r border-base-300
        transition-all duration-300
        ${collapsed ? "w-20 px-3" : "w-64 px-6"}
      `}
    >
      <nav className="mt-4 space-y-2 flex-1">
        <NavItem
          icon={<House className="w-5 h-5" />}
          label="Hub"
          path="/dashboard"
          pathname={pathname}
          collapsed={collapsed}
          onClick={() => handleNavigate("/dashboard")}
        />

        <NavItem
          icon={<Users className="w-5 h-5" />}
          label="Equipes"
          path="/dashboard/teamspace"
          pathname={pathname}
          collapsed={collapsed}
          onClick={() => handleNavigate("/dashboard/teams")}
        />

        <NavItem
          icon={<Notebook className="w-5 h-5" />}
          label="Workspace"
          path="/dashboard/workspace"
          pathname={pathname}
          collapsed={collapsed}
          onClick={() => handleNavigate("/dashboard/workspace")}
        />

        <NavItem
          icon={<ChartPie className="w-5 h-5" />}
          label="LabTest"
          path="/dashboard/labtest"
          pathname={pathname}
          collapsed={collapsed}
          onClick={() => handleNavigate("/dashboard/labtest")}
        />

        <NavItem
          icon={<Book className="w-5 h-5" />}
          label="InnoLab"
          path="/dashboard/innolab"
          pathname={pathname}
          collapsed={collapsed}
          onClick={() => handleNavigate("/dashboard/innolab")}
        />

        <NavItem
          icon={<Bot className="w-5 h-5" />}
          label="CalibraBot"
          path="/dashboard/calibrabot"
          pathname={pathname}
          collapsed={collapsed}
          onClick={() => handleNavigate("/dashboard/calibrabot")}
        />

        <div className="pt-4 border-t border-base-300 space-y-2">
          <NavItem
            icon={<RadioIcon className="w-5 h-5" />}
            label="ShowLive"
            path="/dashboard/showlive"
            pathname={pathname}
            collapsed={collapsed}
            onClick={() => handleNavigate("/dashboard/showlive")}
          />

          <NavItem
            icon={<Palette className="w-5 h-5" />}
            label="StyleLab"
            path="/dashboard/stylelab"
            pathname={pathname}
            collapsed={collapsed}
            onClick={() => handleNavigate("/dashboard/stylelab")}
          />
        </div>
      </nav>

      {/* Perfil */}
      <div className="pt-4 border-t border-base-300">
        <button
          onClick={() => handleNavigate("/dashboard/profile")}
          className={`flex items-center gap-3 p-3 rounded-xl w-full hover:bg-base-200 mb-4 transition-all cursor-pointer
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <img
            src={
              profile?.avatar_url ||
              "https://static.vecteezy.com/system/resources/previews/055/591/320/non_2x/chatbot-avatar-sending-and-receiving-messages-using-artificial-intelligence-vector.jpg"
            }
            className="w-8 h-8 rounded-md"
            alt="Avatar"
          />

          {!collapsed && (
            <div className="text-left">
              <div className="font-semibold text-sm">
                {profile?.username ||
                  session?.user?.email?.split("@")[0] ||
                  "Usuário"}
              </div>
              <div className="text-xs opacity-60">Meu perfil</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}