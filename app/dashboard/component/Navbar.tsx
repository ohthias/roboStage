"use client";
import { ThemeController } from "@/components/ui/themeController";
import { useState, useEffect } from "react";

interface NavbarProps {
  profile: any;
  session: any;
  handleLogout: () => void;
  className?: string;
}

export default function Navbar({
  profile,
  session,
  handleLogout,
  className
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hub");

  // Atualiza a seção ativa conforme o hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveSection(hash);

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash) setActiveSection(newHash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Função que retorna a classe do botão conforme ativo
  const linkClass = (section: string) =>
    `btn btn-ghost w-full justify-start gap-2 ${activeSection === section ? "btn-outline text-primary" : ""}`;

  return (
    <div className="flex h-screen">
      {/* Sidebar desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-base-200 border-r border-base-300 p-4 md:h-[calc(100vh-2rem)] h-auto overflow-y-auto rounded-lg ${className}`}>
        <div className="flex-1 flex flex-col justify-between h-full">
          <div className="space-y-2">
            <span className="text-lg font-bold block mb-4">
              Olá, <span className="text-primary">{profile?.username || session?.user?.email || "visitante"}!</span>
            </span>
            <a href="#hub" className={linkClass("hub")}> <i className="fi fi-br-home"></i> Hub </a>
            <a href="#labTest" className={linkClass("labTest")}> <i className="fi fi-br-dashboard"></i> LabTest </a>
            <a href="#showLive" className={linkClass("showLive")}> <i className="fi fi-br-stage-theatre"></i> ShowLive </a>
            <a href="#styleLab" className={linkClass("styleLab")}> <i className="fi fi-br-palette"></i> Style Lab </a>
            <a href="#config" className={linkClass("config")}> <i className="fi fi-br-settings"></i> Configurações </a>
          </div>

          <div className="space-y-2">
            <ThemeController />
            <button onClick={handleLogout} className="btn btn-error w-full">
              <i className="fi fi-br-sign-out-alt"></i> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile navbar + drawer */}
      <div className="flex-1 flex flex-col">
        <nav className="navbar bg-base-200 border-b border-base-300 px-4 md:hidden rounded-lg">
          <div className="flex-1">
            <span className="text-lg font-bold">
              Olá, <span className="text-primary">{profile?.username || session?.user?.email || "visitante"}!</span>
            </span>
          </div>
          <div className="flex-none">
            <button className="btn btn-square btn-ghost" onClick={() => setIsOpen(!isOpen)}>
              <i className="fi fi-br-menu-burger text-xl"></i>
            </button>
          </div>
        </nav>

        {/* Drawer mobile */}
        <div className={`fixed inset-0 z-50 md:hidden transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
          <aside className="relative w-64 h-full bg-base-200 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-2">
              <a href="#hub" className={linkClass("hub")} onClick={() => setIsOpen(false)}> <i className="fi fi-br-home"></i> Hub </a>
              <a href="#labTest" className={linkClass("labTest")} onClick={() => setIsOpen(false)}> <i className="fi fi-br-dashboard"></i> LabTest </a>
              <a href="#showLive" className={linkClass("showLive")} onClick={() => setIsOpen(false)}> <i className="fi fi-br-stage-theatre"></i> ShowLive </a>
              <a href="#styleLab" className={linkClass("styleLab")} onClick={() => setIsOpen(false)}> <i className="fi fi-br-palette"></i> Style Lab </a>
              <a href="#config" className={linkClass("config")} onClick={() => setIsOpen(false)}> <i className="fi fi-br-settings"></i> Configurações </a>
            </div>

            <div className="space-y-2">
              <ThemeController />
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn btn-error w-full">
                <i className="fi fi-br-sign-out-alt"></i> Sair
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}