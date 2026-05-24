"use client";

import { useParams } from "next/navigation";
import {
  Calendar,
  Earth,
  Fish,
  LucideIcon,
  Menu,
  Palette,
  Pickaxe,
  Table2,
  ToolCase,
  Trophy,
} from "lucide-react";
import Logo from "./Logo";
import { ThemeController } from "./themeController";
import { NAVIGATION } from "@/config/navigation";
import Link from "next/link";

interface Season {
  key: string;
  name: string;
  period: string;
  icon: LucideIcon;
}

const seasons: Season[] = [
  { key: "unearthed", name: "UNEARTHED", period: "2025/2026", icon: Pickaxe },
  { key: "submerged", name: "SUBMERGED", period: "2024/2025", icon: Fish },
  {
    key: "masterpiece",
    name: "MASTERPIECE",
    period: "2023/2024",
    icon: Palette,
  },
];

export function Navbar({ isIndexPage = false }: { isIndexPage?: boolean }) {
  const params = useParams();
  const competicao = (params?.competicao as string) || "fll";

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
                    <li className="font-semibold text-sm uppercase text-center">
                      Temporadas
                    </li>

                    {seasons.map((season) => (
                      <li key={season.key}>
                        <Link
                          href={`/${competicao}/${nav.scorePath}/${season.key}`}
                          className="flex flex-row items-start gap-2 px-3 py-2 rounded hover:bg-base-300 font-medium"
                        >
                          <season.icon
                            size={20}
                            className="text-base-content/35"
                          />
                          <div className="flex flex-col items-start gap-1">
                            {season.name}
                            <span className="text-xs opacity-70 font-normal">
                              {season.period}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>

              <li>
                <Link
                  href={`/fll/quickbrick`}
                  className="text-base-content/70 hover:text-primary hover:bg-primary/10"
                >
                  <Table2 size={16} className="inline mr-1" />
                  QuickBrick Studio
                </Link>
              </li>

              {/* Menu dinâmico */}
              <li>
                <details>
                  <summary className="cursor-pointer text-base-content/70 hover:text-primary hover:bg-primary/10">
                    <ToolCase size={16} />
                    Ferramentas
                  </summary>

                  <ul className="menu dropdown-content bg-base-200 rounded-box shadow-lg py-3 px-2 mt-6 w-56 space-y-2">
                    {nav.menu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.path}>
                          <Link
                            href={`/${competicao}/${item.path}`}
                            className="flex flex-row items-start gap-2 px-3 py-2 rounded hover:bg-base-300 font-medium"
                          >
                            <Icon
                              size={20}
                              className="text-base-content/35 flex-shrink-0"
                            />
                            <div className="flex flex-col items-start gap-1">
                              {item.nome}
                              <span className="text-xs opacity-70 font-normal">
                                {item.description || "Ferramenta"}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            </ul>
          </div>

          {/* Ações Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <ThemeController />
            <div className="divider divider-horizontal" />
            <Link
              href="/universe"
              className="btn btn-ghost btn-sm flex items-center gap-2 backdrop-blur-sm"
            >
              <Earth size={16} />
              Competições
            </Link>
            <div className="divider divider-horizontal" />
            <Link
              href="/auth/login"
              className="btn btn-ghost btn-sm flex items-center gap-2 backdrop-blur-sm"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              Cadastrar
            </Link>
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

        <div className="menu flex flex-col justify-start h-full p-4 w-64 bg-base-200 overflow-y-auto gap-2">
          <div>
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider">Ferramentas</div>
            <ul className="menu gap-2 w-full">
              <li>
                <details>
                  <summary className="cursor-pointer font-medium">
                    <Trophy size={16} className="inline mr-1" />
                    Pontuador
                  </summary>

                  <ul className="menu bg-base-200 rounded-box py-2 px-4 mt-2 w-full">
                    {seasons.map((season) => (
                      <li key={season.key}>
                        <Link
                          href={`/${competicao}/${nav.scorePath}/${season.key}`}
                          className="flex flex-row items-start gap-2 px-3 py-2 rounded hover:bg-base-300 font-medium"
                        >
                          <season.icon
                            size={20}
                            className="text-base-content/35"
                          />
                          <div className="flex flex-col items-start gap-1">
                            {season.name}
                            <span className="text-xs opacity-70 font-normal">
                              {season.period}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              <li>
                <Link href={`/fll/quickbrick`} className="font-medium">
                  <Table2 size={16} className="inline mr-1" />
                  QuickBrick Studio
                </Link>
              </li>

              {nav.menu.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={`/${competicao}/${item.path}`}
                      className="font-medium"
                    >
                      <Icon
                        size={16}
                        className="text-base-content/35 inline-flex-shrink-0 mr-1"
                      />
                      {item.nome}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="divider">Acessos</div>
            <div className="flex flex-col gap-4 mt-auto">
              <Link
                href="/universe"
                className="btn btn-soft flex items-center gap-2 justify-center"
              >
                <Earth size={16} />
                Competições
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-soft flex items-center gap-2 justify-center"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-primary flex items-center gap-2 justify-center"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
