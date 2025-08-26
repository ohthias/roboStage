"use client";
import { ThemeController } from "@/components/ui/themeController";
import {
  Cog6ToothIcon,
  HomeIcon,
  PresentationChartBarIcon,
  SignalIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
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
    `btn btn-ghost justify-start gap-2 w-full transition-colors duration-200
     ${
       activeSection === section
         ? "bg-base-300 text-primary font-semibold"
         : "hover:bg-base-200"
     }`;

  return (
    <div className="drawer md:drawer-open max-h-screen overflow-y-hidden p-4">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Conteúdo principal */}
      <div className="drawer-content flex flex-col gap-4">
        {/* Navbar mobile */}
        <nav className="navbar bg-base-200 border-b border-base-300 px-4 md:hidden flex flex-row justify-between rounded-box shadow-md">
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
                className="h-10 rounded-full "
              />
            </a>
            <label htmlFor="app-drawer" className="btn btn-square btn-ghost">
              <i className="fi fi-br-menu-burger text-xl"></i>
            </label>
          </div>
        </nav>

        <main className="flex-1 md:ml-4 max-h-screen overflow-y-auto">
          <nav className="flex justify-between items-center gap-2 flex-row mb-4 hidden sm:flex sticky top-0 z-10 backdrop-blur-md bg-base-300/30 p-2 rounded-box shadow-md">
            <a
              href="#hub"
              onClick={() => setActiveSection("hub")}
              className="text-lg font-bold"
            >
              Robo<strong className="text-primary">Stage</strong>
            </a>
            <a
              href="#config"
              onClick={() => setActiveSection("config")}
              className="tooltip tooltip-bottom"
              data-tip="Perfil"
            >
              <img
                src="/images/icons/UserDefaultPhoto.jpg"
                alt="Logo"
                className="h-10 rounded-full hover:scale-105 hover:shadow-md transition-transform duration-200 ease-in-out"
              />
            </a>
          </nav>
          {children}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="app-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <aside className="menu p-4 w-60 bg-base-200 text-base-content flex flex-col justify-between h-screen md:h-[calc(100vh-2rem)] md:rounded-box shadow-lg md:sticky md:top-0 overflow-y-auto">
          <div>
            <span className="text-lg font-bold block mb-4 border-b border-base-300 pb-2">
              Olá,{" "}
              <span className="text-primary">
                {profile?.username || session?.user?.email || "visitante"}!
              </span>
            </span>

            <ul className="space-y-1">
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
              <li></li>
            </ul>
          </div>

          {/* Footer da sidebar */}
          <div className="mt-6 space-y-2">
            <ThemeController />
            <button onClick={handleLogout} className="btn btn-error w-full">
              <i className="fi fi-br-sign-out-alt"></i> Sair
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
