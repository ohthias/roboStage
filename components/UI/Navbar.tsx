"use client";
import { BookOpen, Clock, Menu, MessageSquare, Table2, Trophy } from "lucide-react";
import Logo from "./Logo";
import { ThemeController } from "./themeController";

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

export function Navbar({ isIndexPage = false }: { isIndexPage?: boolean }) {
  return (
    <div className="drawer drawer-start z-50">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Conteúdo principal */}
      <div className={`drawer-content flex flex-col ${isIndexPage ? 'fixed top-0 left-0 right-0 z-20' : ''}`}>
        <div className={`navbar flex justify-between px-4 sm:px-8 lg:px-10 shadow-sm h-16 ${isIndexPage ? 'bg-base-200/70 backdrop-blur-md' : 'bg-base-200'}`}>
          <div className="flex items-center space-x-2">
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider divider-horizontal" />
            <p className="font-bold italic text-base-content/30 cursor-default">FLL</p>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex flex-none flex-1 justify-center">
            <ul className="menu menu-horizontal gap-2 items-center">
              <li>
                <details>
                  <summary className="cursor-pointer text-base-content/70 transition-colors hover:text-primary hover:bg-primary/10">
                    <Trophy size={16} />
                    Pontuador
                  </summary>
                  <ul className="menu dropdown-content bg-base-200 rounded-box shadow-lg py-3 px-2 mt-6 z-50 w-48 space-y-2 transition-all duration-300">
                    <li className="font-semibold text-base-content text-xs uppercase text-center">
                      Temporadas
                    </li>
                    {seasons.map((season) => (
                      <li
                        key={season.key}
                      >
                        <a
                          href={`/fll-score/${season.key}`}
                          className="flex flex-col text-primary justify-between items-start font-semibold hover:bg-primary/10 gap-0"
                        >
                          {season.name}
                          <span className="text-base-content/70 text-xs font-normal">
                            {season.period}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>

              <li>
                <a href="/quickbrick" className="cursor-pointer text-base-content/70 transition-colors hover:text-primary hover:bg-primary/10">
                  <Table2 size={16} />
                  QuickBrick Studio
                </a>
              </li>

              <li>
                <a href="/flash-qa" className="cursor-pointer text-base-content/70 transition-colors hover:text-primary hover:bg-primary/10">
                  <MessageSquare size={16} />
                  Flash Q&A
                </a>
              </li>

              <li>
                <a href="/fll-docs" className="cursor-pointer text-base-content/70 transition-colors hover:text-primary hover:bg-primary/10">
                  <BookOpen size={16} />
                  Guias FLL
                </a>
              </li>

              <li>
                <a href="/timers" className="cursor-pointer text-base-content/70 transition-colors hover:text-primary hover:bg-primary/10">
                  <Clock size={16} />
                  Timers
                </a>
              </li>
            </ul>
          </div>

          {/* Ações Desktop */}
          <div className="hidden lg:flex flex-none items-center space-x-2 justify-end">
            <div className="divider divider-horizontal h-6 my-auto" />
            <ul className="menu menu-horizontal gap-2 items-center">
              <li>
                <a role="button" href="/universe" className="btn btn-default btn-outline btn-sm">
                  Embarcar em evento
                </a>
              </li>
              <li>
                <a role="button" href="/auth/login" className="btn btn-primary btn-sm">
                  Entrar
                </a>
              </li>
              <ThemeController />
            </ul>
          </div>

          {/* Menu Mobile */}
          <div className="flex-none lg:hidden flex items-center space-x-2 justify-end">
            <ThemeController />
            <a href="/auth/login" className="btn btn-primary btn-sm btn-outline">
              Entrar
            </a>
            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost btn-sm"
            >
              <Menu size={20} />
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer Mobile */}
      <div className="drawer-side z-50">
        <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
        <div className="menu flex flex-col justify-between h-full p-4 w-64 bg-base-200">
          <div className="space-y-2">
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider" />
            <ul className="menu menu-vertical w-full space-y-2">
              <li>
                <details>
                  <summary className="btn btn-ghost w-full justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Trophy size={16} />
                      Pontuador
                    </span>
                  </summary>
                  <ul className="menu w-full">
                    {seasons.map((season) => (
                      <li key={season.key} className="mb-2">
                        <a
                          href={`/fll-score/${season.key}`}
                          className="flex flex-col justify-between items-start font-semibold hover:bg-base-300/80 gap-2"
                        >
                          {season.name}
                          <span className="text-base-content/70 text-xs font-normal">
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
                  className="btn btn-ghost w-full justify-start items-center"
                >
                  <span className="flex items-center gap-2">
                    <Table2 size={16} />
                    QuickBrick Studio
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/flash-qa"
                  className="btn btn-ghost w-full justify-start items-center"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    Flash Q&A
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/timers"
                  className="btn btn-ghost w-full justify-start items-center"
                >
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    Timers
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/fll-docs"
                  className="btn btn-ghost w-full justify-start items-center"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={16} />
                    Guias FLL
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className="btn btn-ghost w-full justify-start items-center"
                >
                  Ajuda & Dúvidas
                </a>
              </li>
            </ul>
            <div className="divider" />
            <a href="/universe" className="btn btn-default btn-outline w-full">
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