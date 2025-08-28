"use client"
import { useEffect, useState } from "react";
import { ThemeController } from "./ui/themeController";

interface SeasonsData {
  [key: string]: any[];
}

export function Navbar() {
  const [seasons, setSeasons] = useState<SeasonsData>({});

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setSeasons(data))
      .catch((err) => console.error("Erro ao carregar as temporadas:", err));
  }, []);

  return (
    <div className="drawer drawer-start">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Conteúdo principal */}
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-200 shadow-sm px-2">
          <div className="flex-1">
            <a className="font-bold text-lg cursor-pointer" href="/">
              Robo<span className="text-primary">Stage</span>
            </a>
          </div>

          {/* Menu desktop */}
          <div className="hidden lg:flex flex-none">
            <ul className="menu menu-horizontal px-1 gap-5">
              <li>
                <details>
                  <summary>FLL Score</summary>
                  <ul className="bg-base-200 rounded-t-none p-2 z-50">
                    {Object.keys(seasons).sort().map((seasonKey) => (
                      <li key={seasonKey}>
                        <a href={`/tools/score#${seasonKey.toLowerCase()}`}>
                          {seasonKey.toUpperCase()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              <li><a href="/tools/quickbrick">QuickBrick Studio</a></li>
              <li><a href="/universe" className="btn btn-accent btn-outline">Embarcar em evento</a></li>
              <li><a href="/join" className="btn btn-primary">Entrar</a></li>
              <ThemeController />
            </ul>
          </div>

          {/* Botão mobile */}
          <div className="flex-none lg:hidden space-x-2">
            <ThemeController />
            <label htmlFor="navbar-drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div className="drawer-side">
        <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
        <div className="menu flex flex-col justify-between h-full p-4 w-64 bg-base-200">
          <div className="space-y-2">
            <a className="font-bold text-lg cursor-pointer" href="/">
              Robo<span className="text-primary">Stage</span>
            </a>
            <ul className="menu menu-vertical px-1 gap-5 w-full">
              <li><a href="/about" className="btn btn-ghost w-full justify-start">Sobre</a></li>
              <li>
                <details className="w-full">
                  <summary className="btn btn-ghost w-full justify-between">FLL Score</summary>
                  <ul className="menu p-2 rounded-box mt-2 space-y-1 w-full">
                    {Object.keys(seasons).sort().map((seasonKey) => (
                      <li key={seasonKey}>
                        <a href={`/tools/score#${seasonKey.toLowerCase()}`}>
                          {seasonKey.toUpperCase()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              <li><a href="/tools/quickbrick" className="btn btn-ghost w-full justify-start">QuickBrick Studio</a></li>
              <li><a href="/fll-docs" className="btn btn-ghost w-full justify-start">Docs</a></li>
            </ul>
            <hr />
            <a href="/universe" className="btn btn-accent btn-outline w-full">Embarcar em evento</a>
            <a href="/join" className="btn btn-primary w-full">Entrar</a>
          </div>
        </div>
      </div>
    </div>
  );
}
