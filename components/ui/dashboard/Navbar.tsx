"use client";

import {
  House,
  ChartPie,
  Book,
  Palette,
  RadioIcon,
  Bot,
  Users,
} from "lucide-react";
import { JSX, useMemo, useState } from "react";

/* =======================
   Types
======================= */

interface Team {
  id: string;
  name: string;
  role: "mentor" | "judge" | "team_member";
  joined_at: string;
  avatar_url?: string;
  members_count: number;
  activity: "online" | "idle" | "offline";
}

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

/* =======================
   Mock
======================= */

const MOCK_TEAMS: Team[] = [
  {
    id: "team-1",
    name: "Infinity Bots",
    role: "mentor",
    joined_at: new Date().toISOString(),
    avatar_url: "https://api.dicebear.com/7.x/shapes/svg?seed=Infinity",
    members_count: 8,
    activity: "online",
  },
  {
    id: "team-2",
    name: "RoboSpark",
    role: "team_member",
    joined_at: new Date().toISOString(),
    avatar_url: "https://api.dicebear.com/7.x/shapes/svg?seed=Spark",
    members_count: 5,
    activity: "idle",
  },
  {
    id: "team-3",
    name: "Judges Lab",
    role: "judge",
    joined_at: new Date().toISOString(),
    avatar_url: "https://api.dicebear.com/7.x/shapes/svg?seed=Judges",
    members_count: 3,
    activity: "offline",
  },
];

/* =======================
   Helpers
======================= */

const activityColor: Record<Team["activity"], string> = {
  online: "bg-success animate-pulse",
  idle: "bg-warning",
  offline: "bg-base-300",
};

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
      className={`flex items-center gap-3 p-3 rounded-xl w-full transition-all text-left
        ${
          isActive
            ? "bg-primary/10 text-primary font-semibold shadow-sm"
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

/* =======================
   Component
======================= */

export default function Sidebar({
  active,
  setActive,
  profile,
  session,
  collapsed,
}: SidebarProps) {
  const teams = MOCK_TEAMS;
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavoriteTeams((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const favoriteList = useMemo(
    () => teams.filter((team) => favoriteTeams.includes(team.id)),
    [teams, favoriteTeams]
  );

  const otherTeams = useMemo(
    () => teams.filter((team) => !favoriteTeams.includes(team.id)),
    [teams, favoriteTeams]
  );

  return (
    <aside
      className={`hidden lg:flex flex-col bg-base-100 border-r border-base-300
      transition-all duration-300 h-full
      ${collapsed ? "w-20 px-3" : "w-64 px-6"}
    `}
    >
      {/* ===== Scrollable Content ===== */}
      <div className="flex-1 overflow-y-visible">
        {/* Core */}
        <nav className="space-y-2 mt-4">
          <NavItem
            icon={<House className="w-5 h-5" />}
            label="Hub"
            section="hub"
            active={active}
            collapsed={collapsed}
            onClick={() => setActive("hub")}
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
        </nav>

        {/* Equipes */}
        <NavItem
          icon={<Users className="w-5 h-5" />}
          label="Equipes"
          section="teams"
          active={active}
          collapsed={collapsed}
          onClick={() => setActive("teams")}
        />

        {/* Favoritas */}
        {favoriteList.length > 0 && (
          <div className="mt-2">
            {!collapsed && (
              <span className="px-3 text-xs font-semibold text-base-content/60">
                Favoritas
              </span>
            )}
            <div className="mt-1 space-y-1">
              {favoriteList.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setActive(`team:${team.id}`)}
                  className={`flex items-center gap-3 w-full p-2 rounded-xl transition
                    ${
                      active === `team:${team.id}`
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200/70 opacity-80 hover:opacity-100"
                    }
                  `}
                >
                  <div className="relative">
                    <img
                      src={team.avatar_url}
                      alt={team.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-base-100 ${
                        activityColor[team.activity]
                      }`}
                    />
                  </div>
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{team.name}</span>
                      <span className="text-xs opacity-60">
                        {team.members_count} membros
                      </span>
                    </div>
                  )}
                  {!collapsed && (
                    <button
                      onClick={() => toggleFavorite(team.id)}
                      className="btn btn-ghost btn-xs text-warning"
                    >
                      ★
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Labs */}
        <div className="my-2 pt-4 border-t border-base-300">
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
      </div>

      {/* ===== Fixed Profile ===== */}
      <div className="pt-6 border-t border-base-300">
        <button
          onClick={() => setActive("profile")}
          className={`flex items-center gap-3 p-3 rounded-xl w-full hover:bg-base-200 transition
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
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm">
                {profile?.username ||
                  session?.user?.email?.split("@")[0] ||
                  "Usuário"}
              </span>
              <span className="text-xs opacity-60">Meu perfil</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
