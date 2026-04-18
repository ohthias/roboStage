"use client";

import { useParams } from "next/navigation";
import { Menu, Trophy } from "lucide-react";
import Logo from "./Logo";
import { ThemeController } from "./themeController";
import { NAVIGATION } from "@/config/navigation";
import Link from "next/link";

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
  const params = useParams();
  const competicao = (params?.competicao as string) || "fll";
  const competitionOptions = Object.keys(NAVIGATION) as Array<
    keyof typeof NAVIGATION
  >;

  const nav =
    NAVIGATION[competicao as keyof typeof NAVIGATION] || NAVIGATION.fll;

  return (
    <div className="drawer drawer-start z-50">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Conteúdo principal */}
      <div
        className={`drawer-content flex flex-col ${isIndexPage ? "fixed top-0 left-0 right-0 z-20" : ""}`}
      >
        <div
          className={`navbar flex justify-between px-4 sm:px-8 lg:px-10 shadow-sm h-16 ${isIndexPage ? "bg-base-200/70 backdrop-blur-md" : "bg-base-200"}`}
        >
          {/* Logo + competição */}
          <div className="flex items-center space-x-2">
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider divider-horizontal" />
            <details className="dropdown">
              <summary className="list-none cursor-pointer font-bold italic text-base-content/50 hover:text-primary">
                {nav.label}
              </summary>
              
            </details>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex flex-none flex-1 justify-center">
            <ul className="menu menu-horizontal gap-2 items-center">
              {/* Pontuador */}
              <li>
                <details>
                  <summary className="cursor-pointer text-base-content/70 hover:text-primary hover:bg-primary/10">
                    <Trophy size={16} />
                    Pontuador
                  </summary>

                  <ul className="menu dropdown-content bg-base-200 rounded-box shadow-lg py-3 px-2 mt-6 w-48 space-y-2">
                    <li className="font-semibold text-xs uppercase text-center">
                      Temporadas
                    </li>

                    {seasons.map((season) => (
                      <li key={season.key}>
                        <Link
                          href={`/${competicao}/${nav.scorePath}/${season.key}`}
                          className="flex flex-col text-primary font-semibold hover:bg-primary/10"
                        >
                          {season.name}
                          <span className="text-xs opacity-70">
                            {season.period}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>

              {/* Menu dinâmico */}
              {nav.menu.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={`/${competicao}/${item.path}`}
                      className="text-base-content/70 hover:text-primary hover:bg-primary/10 flex items-center gap-2"
                    >
                      <Icon size={16} />
                      {item.nome}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Ações Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <ThemeController />
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center space-x-2">
            <ThemeController />

            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost btn-sm"
            >
              <Menu size={20} />
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <div className="drawer-side z-50">
        <label htmlFor="navbar-drawer" className="drawer-overlay"></label>

        <div className="menu flex flex-col justify-between h-full p-4 w-64 bg-base-200">
          <div>
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider" />

            <ul className="space-y-2">
              {/* Pontuador */}
              <li>
                <details>
                  <summary className="btn btn-ghost w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Trophy size={16} />
                      Pontuador
                    </span>
                  </summary>

                  <ul className="mt-2">
                    {seasons.map((season) => (
                      <li key={season.key}>
                        <Link
                          href={`/${competicao}/${nav.scorePath}/${season.key}`}
                          className="flex flex-col font-semibold"
                        >
                          {season.name}
                          <span className="text-xs opacity-70">
                            {season.period}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>

              {/* Menu dinâmico */}
              {nav.menu.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={`/${competicao}/${item.path}`}
                      className="btn btn-ghost w-full justify-start gap-2"
                    >
                      <Icon size={16} />
                      {item.nome}
                    </Link>
                  </li>
                );
              })}

              <li>
                <Link href="/fll/help" className="btn btn-ghost w-full">
                  Ajuda & Dúvidas
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
