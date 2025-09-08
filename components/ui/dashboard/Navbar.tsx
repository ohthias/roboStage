"use client";

import { ThemeController } from "@/components/ui/themeController";
import {
  HomeIcon,
  PresentationChartBarIcon,
  SignalIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import { HomeModernIcon } from "@heroicons/react/24/outline";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface NavbarProps {
  profile: any;
  session: any;
  handleLogout: () => void;
}

export default function Navbar({
  profile,
  session,
  handleLogout,
  children,
}: React.PropsWithChildren<NavbarProps>) {
  const [activeSection, setActiveSection] = useState<string>("hub");

  const linkClass = (section: string) =>
    `flex items-center gap-2 px-3 py-2 pl-4 rounded-full font-semibold w-full
     ${activeSection === section
      ? "bg-primary/25 text-primary"
      : "hover:bg-base-200"
    }`;

  return (
    <div className="drawer md:drawer-open h-screen">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Conteúdo principal */}
      <div className="drawer-content flex flex-col h-screen">
        {/* Navbar mobile */}
        <nav className="navbar bg-base-200 border-b border-base-300 px-4 md:hidden flex flex-row justify-between shadow-md">
          <div className="flex-1 flex items-center">
            <span className="text-lg font-bold">
              Olá,{" "}
              <span className="text-primary">
                {profile?.username || session?.user?.email || "visitante"}!
              </span>
            </span>
          </div>
          <div className="flex-none flex items-center gap-2">
            <a href="#config" onClick={() => setActiveSection("config")}>
              <img
                src="/images/icons/UserDefaultPhoto.jpg"
                alt="Logo"
                className="h-10 rounded-full"
              />
            </a>
            <label htmlFor="app-drawer" className="btn btn-square btn-ghost">
              <i className="fi fi-br-menu-burger text-xl"></i>
            </label>
          </div>
        </nav>

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto">
          <nav className="flex justify-between items-center gap-2 flex-row mb-4 hidden sm:flex sticky top-0 z-10 border-b border-base-300 bg-base-100 px-4 py-2 shadow-xs">
            <a
              href="#hub"
              onClick={() => setActiveSection("hub")}
              className="text-lg font-bold"
            >
              Olá,{" "}
              <span className="text-primary">
                {profile?.username || session?.user?.email || "visitante"}!
              </span>
            </a>
            <div className="flex items-center gap-4 justify-end">
              <ThemeController />
              <a
                href="#profile"
                onClick={() => setActiveSection("profile")}
                className="tooltip tooltip-bottom"
                data-tip="Perfil"
              >
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 hover:scale-105 hover:shadow-md transition-transform duration-200 ease-in-out">
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/055/591/320/non_2x/chatbot-avatar-sending-and-receiving-messages-using-artificial-intelligence-vector.jpg"
                      alt="Logo"
                    />
                  </div>
                </div>
              </a>
            </div>
          </nav>
          <div className="px-4 mt-4 md:mt-6 lg:mt-4">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="app-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <aside className="menu p-4 w-60 flex flex-col justify-between h-full md:sticky md:top-0 overflow-y-auto border-r border-base-300 bg-base-100">
          <div>
            <span className="text-lg font-bold block mb-4 pb-2">
              Robo
              <span className="text-primary">
                Stage
              </span>
            </span>

            <ul className="space-y-2">
              <li>
                <a
                  href="#hub"
                  onClick={() => setActiveSection("hub")}
                  className={linkClass("hub")}
                  aria-current={activeSection === "hub" ? "page" : undefined}
                >
                  <HomeIcon className="size-6" /> Hub
                </a>
              </li>
              <li>
                <a
                  href="#labTest"
                  onClick={() => setActiveSection("labTest")}
                  className={linkClass("labTest")}
                  aria-current={
                    activeSection === "labTest" ? "page" : undefined
                  }
                >
                  <PresentationChartBarIcon className="size-6" /> LabTest
                </a>
              </li>
              <li>
                <a
                  href="#showLive"
                  onClick={() => setActiveSection("showLive")}
                  className={linkClass("showLive")}
                  aria-current={
                    activeSection === "showLive" ? "page" : undefined
                  }
                >
                  <SignalIcon className="size-6" /> ShowLive
                </a>
              </li>
              <li>
                <a
                  href="#styleLab"
                  onClick={() => setActiveSection("styleLab")}
                  className={linkClass("styleLab")}
                  aria-current={
                    activeSection === "styleLab" ? "page" : undefined
                  }
                >
                  <SparklesIcon className="size-6" /> StyleLab
                </a>
              </li>
            </ul>
            <div className="divider text-base-content/75">Outras ferramentas</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="/quickbrick"
                  target="_blank"
                  className="group relative inline-block transition-colors duration-200 hover:text-primary bg-transparent"
                >
                  QuickBrick Studio
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a
                  href="/fll-score#unearthed"
                  target="_blank"
                  className="group relative inline-block transition-colors duration-200 hover:text-primary bg-transparent"
                >
                  Pontuador UNEARTHED
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  className="group relative inline-block transition-colors duration-200 hover:text-primary bg-transparent"
                >
                  Jogo rápido (BrainShot)
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  className="group relative inline-block transition-colors duration-200 hover:text-primary bg-transparent"
                >
                  Timer
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Footer da sidebar */}
          <div className="mt-6 space-y-2 border-t border-base-300 pt-4">
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg w-full hover:bg-error/75 bg-error/50 cursor-pointer font-semibold text-error-content transition-colors duration-200">
              <ArrowLeftStartOnRectangleIcon className="size-6" /> Sair
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}