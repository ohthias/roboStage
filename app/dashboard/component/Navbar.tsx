"use client"
import { ThemeController } from "@/components/ui/themeController";
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
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="drawer drawer-start">
      <input
        id="navbar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        readOnly
      />

      <div className="drawer-content flex flex-col">
        <nav className="navbar bg-base-200 border-b border-base-300 rounded-lg px-4">
          <div className="flex-1">
            <span className="text-xl font-bold text-base-content">
              Olá, {profile?.username || session?.user?.email || "visitante"}!
            </span>
          </div>

          {/* Botões desktop */}
          <div className="flex-none space-x-2 hidden md:flex">
            <a href="#hub"
              className="btn btn-ghost leading-none place-content-center"
            >
              <i className="fi fi-br-home"></i> Hub
            </a>
            <a href="#labTest"
              className="btn btn-ghost leading-none place-content-center"
            >
              <i className="fi fi-br-dashboard"></i> LabTest
            </a>
            <a href="#showLive"
              className="btn btn-ghost leading-none place-content-center"
            >
              <i className="fi fi-br-stage-theatre"></i> ShowLive
            </a>
            <a href="#styleLab"
              className="btn btn-ghost leading-none place-content-center"
            >
              <i className="fi fi-br-palette"></i> Style Lab
            </a>
            <a href="#config"
              className="btn btn-ghost leading-none place-content-center"
            >
              <i className="fi fi-br-settings"></i> Configurações
            </a>
            <button
              onClick={handleLogout}
              className="btn btn-error leading-none"
            >
              <i className="fi fi-br-sign-out-alt"></i> Sair
            </button>
            <ThemeController />
          </div>

          {/* Botão mobile */}
          <div className="flex-none md:hidden">
            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost"
              onClick={() => setIsOpen(!isOpen)}
            >
              <i className="fi fi-br-menu-burger text-xl"></i>
            </label>
          </div>
        </nav>
      </div>

      {/* Sidebar drawer ocupando toda a altura */}
      <div className="drawer-side">
        <label
          htmlFor="navbar-drawer"
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
        ></label>
        <div className="menu flex flex-col justify-between h-full p-4 w-64 bg-base-200">
          {/* Parte superior */}
          <div className="space-y-2 flex flex-col">
            <a
              href="#hub"
              onClick={() => {
                setIsOpen(false);
              }}
              className="btn btn-ghost flex place-content-center justify-start gap-2"
            >
              <i className="fi fi-br-home"></i> Hub
            </a>
            <a
              href="#styleLab"
              onClick={() => {
                setIsOpen(false);
              }}
              className="btn btn-ghost flex place-content-center justify-start gap-2"
            >
              <i className="fi fi-br-home"></i> Style Lab
            </a>
            <a
              href="#config"
              onClick={() => {
                setIsOpen(false);
              }}
              className="btn btn-ghost flex place-content-center justify-start gap-2"
            >
              <i className="fi fi-br-settings"></i> Configurações
            </a>
          </div>

          {/* Parte inferior */}
          <div className="space-y-2">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="btn btn-error w-full"
            >
              <i className="fi fi-br-sign-out-alt"></i> Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
