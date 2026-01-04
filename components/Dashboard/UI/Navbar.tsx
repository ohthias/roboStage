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
import { JSX, useMemo, useState } from "react";

interface SidebarProps {
  active: string;
  setActive: (value: string) => void;
  profile: {
    avatar_url?: string;
    username?: string;
  };
  session: any;
  collapsed: boolean;
}

const NavItem = ({
  icon,
  label,
  section,
  active,
  onClick,
  collapsed,
}: {
  icon: JSX.Element;
  label: string;
  section: string;
  active: string;
  onClick?: () => void;
  collapsed: boolean;
}) => {
  const isActive = active === section;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl w-full transition-all
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
  active,
  setActive,
  profile,
  session,
  collapsed,
}: SidebarProps) {
  return (
    <aside
      className={`
        flex flex-col h-full bg-base-100 border-r border-base-300
        transition-all duration-300
        ${collapsed ? "w-20 px-3" : "w-64 px-6"}
      `}
    >
      <nav className="mt-4 space-y-2 flex-1">
        <NavItem
          icon={<House className="w-5 h-5" />}
          label="Hub"
          section="hub"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("hub")}
        />

        <NavItem
          icon={<Notebook className="w-5 h-5" />}
          label="Workspace"
          section="workspace"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("workspace")}
        />

        <NavItem
          icon={<ChartPie className="w-5 h-5" />}
          label="LabTest"
          section="labTest"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("labTest")}
        />

        <NavItem
          icon={<Book className="w-5 h-5" />}
          label="InnoLab"
          section="innoLab"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("innoLab")}
        />

        <NavItem
          icon={<Bot className="w-5 h-5" />}
          label="CalibraBot"
          section="calibraBot"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("calibraBot")}
        />

        <NavItem
          icon={<Users className="w-5 h-5" />}
          label="Equipes"
          section="teamSpace"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("teamSpace")}
        />

        <div className="pt-4 border-t border-base-300">
          <NavItem
            icon={<RadioIcon className="w-5 h-5" />}
            label="ShowLive"
            section="showLive"
            active={active}
            collapsed={collapsed}
            onClick={() => setActive("showLive")}
          />

          <NavItem
            icon={<Palette className="w-5 h-5" />}
            label="StyleLab"
            section="styleLab"
            active={active}
            collapsed={collapsed}
            onClick={() => setActive("styleLab")}
          />
        </div>
      </nav>

      <div className="pt-4 border-t border-base-300">
        <button
          onClick={() => setActive("profile")}
          className={`flex items-center gap-3 p-3 rounded-xl w-full hover:bg-base-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <img
            src={
              profile?.avatar_url ||
              "https://api.dicebear.com/7.x/bottts/svg?seed=user"
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
