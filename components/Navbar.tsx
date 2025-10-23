"use client";
import { ThemeController } from "./ui/themeController";

interface Season {
  key: string;
  name: string;
  period: string;
}

const seasons: Season[] = [
  { key: "unearthed", name: "UNEARTHED", period: "2025/2026" },
  { key: "submerged", name: "SUBMERGED", period: "2024/2025" },
  { key: "masterpiece", name: "MASTERPIECE", period: "2023/2024" },
];

export function Navbar() {
  return (
    <div className="drawer drawer-start z-50">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Conteúdo principal */}
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-200 shadow-sm px-4">
          <div className="flex-1">
            <a
              href="/"
              className="text-xl font-bold tracking-tight hover:text-primary transition-colors"
            >
              Robo<span className="text-primary">Stage</span>
            </a>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex flex-none">
            <ul className="menu menu-horizontal gap-4 items-center">
              {/* Dropdown Temporadas */}
              <li>
                <details className="dropdown">
                  <summary className="cursor-pointer hover:text-primary">
                    FLL Score
                  </summary>
                  <ul className="menu dropdown-content bg-base-200 rounded-b-box rounded-t-none shadow-md p-4 mt-2 z-50">
                    <li className="font-semibold text-primary text-sm mb-2">
                      Temporadas
                    </li>
                    {seasons.map((season) => (
                      <li
                        key={season.key}
                        >
                        <a
                          href={`/fll-score#${season.key}`}
                          className="flex justify-between"
                        >
                          {season.name}
                          <span className="text-xs opacity-70">
                            {season.period}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>

              <li>
                <a href="/quickbrick" className="hover:text-primary">
                  QuickBrick Studio
                </a>
              </li>

              <li>
                <a href="/universe" className="btn btn-accent btn-outline">
                  Embarcar em evento
                </a>
              </li>

              <li>
                <a href="/auth/login" className="btn btn-primary">
                  Entrar
                </a>
              </li>

              <ThemeController />
            </ul>
          </div>

          {/* Menu Mobile */}
          <div className="flex-none lg:hidden flex items-center space-x-2">
            <a href="/auth/login" className="btn btn-primary btn-sm">
              Entrar
            </a>
            <ThemeController />
            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost"
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

      {/* Sidebar Drawer Mobile */}
      <div className="drawer-side">
        <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
        <div className="menu flex flex-col justify-between h-full p-4 w-64 bg-base-200">
          <div className="space-y-2">
            <a
              href="/"
              className="text-xl font-bold tracking-tight hover:text-primary transition-colors"
            >
              Robo<span className="text-primary">Stage</span>
            </a>
            <ul className="menu menu-vertical gap-2 mt-4 w-full">
              <li>
                <a href="/about" className="btn btn-ghost w-full justify-start">
                  Sobre
                </a>
              </li>
              <li>
                <details>
                  <summary className="btn btn-ghost w-full justify-between">
                    FLL Score
                  </summary>
                  <ul className="menu w-full">
                    {seasons.map((season) => (
                      <li key={season.key} className="mb-2">
                        <a
                          href={`/fll-score#${season.key}`}
                          className="flex justify-between"
                        >
                          {season.name}
                          <span className="text-xs opacity-70">
                            {season.period}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              <li>
                <a
                  href="/quickbrick"
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
                  Documentações UNEARTHED
                </a>
              </li>
            </ul>
            <hr />
            <a href="/universe" className="btn btn-accent btn-outline w-full">
              Embarcar em evento
            </a>
            <a href="/auth/login" className="btn btn-primary w-full">
              Entrar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}