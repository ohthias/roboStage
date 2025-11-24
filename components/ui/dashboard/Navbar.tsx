"use client";

import { ChartPie, Palette, RadioIcon, House, Book, LogOut } from "lucide-react";
import { JSX } from "react";

interface SidebarProps {
  active: string;
  setActive: (value: string) => void;
  onLogout: () => void;
  profile: any;
  session: any;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function Sidebar({
  active,
  setActive,
  onLogout,
  profile,
  session,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const menuItem = (
    icon: JSX.Element,
    label: string,
    section: string,
    isExternal = false,
    href?: string
  ) => {
    const isActive = active === section;

    return (
      <li>
        <a
          href={isExternal ? href : `#`}
          title={label}
          onClick={(e) => {
            if (!isExternal) {
              e.preventDefault();
              setActive(section);
            }
          }}
          target={isExternal ? "_blank" : "_self"}
          className={`flex items-center gap-3 rounded-full px-3 py-2 transition-all duration-300 w-full 
            ${
              isActive
                ? "bg-primary/80 text-primary-content shadow-sm"
                : "hover:bg-base-300"
            }
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <span>{icon}</span>
          {!collapsed && (
            <span
              className={`${
                isExternal ? "font-normal text-xs" : "font-semibold"
              }`}
            >
              {label}
            </span>
          )}
        </a>
      </li>
    );
  };

  return (
    <aside
      className={`
    h-screen border-r border-base-300 bg-base-100 flex flex-col
    transition-all duration-300 ease-in-out fixed z-99
    ${collapsed ? "w-[80px] items-center" : "w-[256px]"}
  `}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <span className="text-xl font-bold">
            Robo<span className="text-primary">Stage</span>
          </span>
        )}

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <i
              className="fi fi-br-angle-small-right text-xl"
              style={{ lineHeight: 0 }}
            />
          ) : (
            <i
              className="fi fi-br-angle-small-left text-xl"
              style={{ lineHeight: 0 }}
            />
          )}
        </button>
      </div>

      {/* Navigation */}
      <ul className="px-3 flex flex-col flex-1 overflow-y-auto space-y-1 w-full">
        {menuItem(<House className="size-6" />, "Hub", "hub")}
        {menuItem(<RadioIcon className="size-6" />, "ShowLive", "showLive")}
        {menuItem(<ChartPie className="size-6" />, "LabTest", "labTest")}
        {menuItem(<Book className="size-6" />, "InnoLab", "innoLab")}
        {/*{menuItem(<ClipboardDocumentCheckIcon className="size-5"/>, "RoboFlow", "roboFlow")}
        {menuItem(<CommandLineIcon className="size-5"/>, "CalibraBot", "calibraBot")}
        {menuItem(<ListBulletIcon className="size-5"/>, "TrainLab", "trainLab")}*/}
        {menuItem(<Palette className="size-6" />, "StyleLab", "styleLab")}
      </ul>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-base-300">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-base-300 p-2 rounded-md"
          onClick={() => setActive("profile")}
        >
          <div className="avatar">
            <div className="w-10 rounded-md">
              <img
                src={
                  profile?.avatar_url ||
                  "https://static.vecteezy.com/system/resources/previews/055/591/320/non_2x/chatbot-avatar-sending-and-receiving-messages-using-artificial-intelligence-vector.jpg"
                }
                width={40}
                height={40}
                alt="Avatar"
              />
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1">
              <p className="font-semibold">
                {profile?.username ||
                  session?.user?.email?.split("@")[0] ||
                  "Usuário"}
              </p>
              <p className="text-xs opacity-70">Ver perfil</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3 space-y-1">
            <button
              className="btn btn-ghost w-full justify-start gap-2"
              onClick={onLogout}
            >
              <LogOut className="size-5" />
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
