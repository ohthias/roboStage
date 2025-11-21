"use client";

import {
  HomeIcon,
  PresentationChartBarIcon,
  SignalIcon,
  SparklesIcon,
  ArrowLeftStartOnRectangleIcon,
  LightBulbIcon,
  ClipboardIcon,
  BellAlertIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { JSX, useState } from "react";
import { ThemeController } from "../themeController";

interface SidebarProps {
  active: string;
  setActive: (value: string) => void;
  onLogout: () => void;
  profile: any;
  session: any;
}

export default function Sidebar({
  active,
  setActive,
  onLogout,
  profile,
  session,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
          className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-300 w-full 
            ${
              isActive
                ? "bg-primary/75 text-primary-content shadow-sm"
                : "hover:bg-base-300"
            }
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <span className="size-6">{icon}</span>
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
    transition-all duration-300 ease-in-out
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
      <ul className="menu px-3 flex-1 overflow-y-auto space-y-1 w-full">
        {menuItem(<HomeIcon />, "Hub", "hub")}
        {menuItem(<PresentationChartBarIcon />, "LabTest", "labTest")}
        {menuItem(<SignalIcon />, "ShowLive", "showLive")}
        {menuItem(<SparklesIcon />, "StyleLab", "styleLab")}
      </ul>

      {/* Divider */}
      <div className="px-3">
        <div className="divider my-2 text-xs hidden md:block">
          {" "}
          {!collapsed && "Ferramentas"}{" "}
        </div>
      </div>

      {/* External Tools */}
      <ul className="menu px-3 space-y-1 w-full hidden md:block">
        {menuItem(
          <LightBulbIcon className="size-5" />,
          "QuickBrick Studio",
          "quickbrick",
          true,
          "/quickbrick"
        )}
        {menuItem(
          <NumberedListIcon className="size-5" />,
          "Pontuador UNEARTHED",
          "unearthed",
          true,
          "/fll-score#unearthed"
        )}
        {menuItem(
          <ClipboardIcon className="size-5" />,
          "Flash Q&A",
          "flashqa",
          true,
          "/flash-qa"
        )}
        {menuItem(
          <BellAlertIcon className="size-5" />,
          "Timers Avaliação",
          "timers",
          true,
          "/timers"
        )}
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
              <ArrowLeftStartOnRectangleIcon className="size-5" />
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
