"use client"

import { useState } from "react";
import { ThemeController } from "./ui/themeController";

export function Navbar() {
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

      {/* Conteúdo da página com navbar */}
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 shadow-sm px-2">
          {/* Lado esquerdo - Logo */}
          <div className="flex-1">
            <a className="font-bold text-lg cursor-pointer" href="/">
              robo<span className="text-primary">Stage</span>
            </a>
          </div>

          {/* Menu desktop */}
          <div className="hidden lg:flex flex-none">
            <ul className="menu menu-horizontal px-1 gap-5">
              <li>
                <a
                  href="/about"
                >Sobre</a>
              </li>
              <li>
                <details>
                  <summary>FLL Score</summary>
                  <ul className="bg-base-200 rounded-t-none p-2 z-20">
                    <li>
                      <a href="/tools/score#unearthed">UNEARTHED</a>
                    </li>
                    <li>
                      <a href="/tools/score#submerged">SUBMERGED</a>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <a href="/tools/quickbrick">QuickBrick Studio</a>
              </li>
              <li>
                <a
                  href="/fll-docs"
                >
                  Docs
                </a>
              </li>
              <li>
                <a href="/universe" className="btn btn-accent btn-outline">
                  Embarcar em evento
                </a>
              </li>
              <li>
                <a href="/join" className="btn btn-primary">
                  Entrar
                </a>
              </li>
              <ThemeController />
            </ul>
          </div>

          {/* Botão mobile */}
          <div className="flex-none lg:hidden space-x-2">
            <ThemeController />
            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div className="drawer-side">
        <label
          htmlFor="navbar-drawer"
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
        ></label>
        <div className="menu flex flex-col justify-between h-full p-4 w-64 bg-base-200">
          {/* Parte superior */}
          <div className="space-y-2">
            <a className="font-bold text-lg cursor-pointer" href="/">
              robo<span className="text-primary">Stage</span>
            </a>
            <ul className="menu menu-vertical px-1 gap-5 w-full">
              <li>
                <a
                  href="/about"
                  className="btn btn-ghost w-full justify-start"
                >Sobre</a>
              </li>
              <li>
                <details className="w-full">
                  <summary className="btn btn-ghost w-full justify-between">
                    FLL Score
                  </summary>
                  <ul className="menu p-2 rounded-box mt-2 space-y-1 w-full">
                    <li>
                      <a href="/tools/score#unearthed">UNEARTHED</a>
                    </li>
                    <li>
                      <a href="/tools/score#submerged">SUBMERGED</a>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <a
                  href="/tools/quickbrick"
                  className="btn btn-ghost w-full justify-start"
                >
                  QuickBrick Studio
                </a>
              </li>
              <li>
                <a
                  href="/fll-docs"
                  className="btn btn-ghost w-full justify-start"
                >
                  Docs
                </a>
              </li>
            </ul>

            <hr />
            <a href="/universe" className="btn btn-accent btn-outline w-full">
              Embarcar em evento
            </a>
            <a href="/join" className="btn btn-primary w-full">
              Entrar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
