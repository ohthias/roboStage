"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  Earth,
  Fish,
  Menu,
  Palette,
  Pickaxe,
  Table2,
  ToolCase,
  Trophy,
  X,
} from "lucide-react";

import Logo from "./Logo";
import { ThemeController } from "./themeController";
import { NAVIGATION } from "@/config/navigation";

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

const renderSeasonLink = (season: Season, competicao: string, nav: any, isActive: (href: string) => boolean, className: string) => {
  const Icon = season.icon;
  const href = `/${competicao}/${nav.scorePath}/${season.key}`;
  const active = isActive(href);

  return (
    <li key={season.key}>
      <Link href={href} className={className}>
        <Icon
          size={18}
          className={`mt-0.5 transition-opacity duration-200 ${
            active ? "opacity-100" : "opacity-60"
          }`}
        />
        <span className="flex flex-col">
          <span className={`font-medium ${active ? "text-primary" : ""}`}>
            {season.name}
          </span>
          <span className="text-xs opacity-60">{season.period}</span>
        </span>
      </Link>
    </li>
  );
};

const renderToolLink = (item: any, competicao: string, isActive: (href: string) => boolean, className: string) => {
  const Icon = item.icon;
  const href = `/${competicao}/${item.path}`;
  const active = isActive(href);

  return (
    <li key={item.path}>
      <Link href={href} className={className}>
        <Icon
          size={18}
          className={`mt-0.5 transition-opacity duration-200 ${
            active ? "opacity-100" : "opacity-60"
          }`}
        />
        <span className="flex flex-col">
          <span className={`font-medium ${active ? "text-primary" : ""}`}>
            {item.nome}
          </span>
          <span className="text-xs opacity-60">
            {item.description || "Ferramenta"}
          </span>
        </span>
      </Link>
    </li>
  );
};

export function Navbar() {
  const params = useParams();
  const pathname = usePathname();

  const competicao = (params?.competicao as string) || "fll";
  const nav =
    NAVIGATION[competicao as keyof typeof NAVIGATION] || NAVIGATION.fll;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const isIndexPage = pathname === `/${competicao}`;

  const baseLink =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out";
  const mutedLink =
    "text-base-content/70 hover:bg-base-200 hover:text-base-content";
  const activeLink = "bg-base-200 text-base-content shadow-sm";
  const dropdownItemClass = "flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200";

  const navbarClasses = `navbar h-16 px-4 sm:px-6 lg:px-8 border-b border-base-300/60 ${
    isIndexPage
      ? "fixed top-0 left-0 right-0 z-50 bg-base-100/75 backdrop-blur-md"
      : "sticky top-0 z-40 bg-base-100"
  }`;

  const navItemClass = (active: boolean) =>
    `${baseLink} ${active ? activeLink : mutedLink}`;

  const mobileItemClass = (active: boolean) =>
    `rounded-lg px-3 py-2 transition-all duration-200 ${
      active ? "bg-base-200 text-base-content" : "hover:bg-base-200"
    }`;

  const getDropdownItemClass = (active: boolean) =>
    `${dropdownItemClass} ${active ? "bg-base-200" : "hover:bg-base-200/80"}`;

  return (
    <div className="drawer drawer-start z-50">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <header className={navbarClasses}>
          <div className="flex-1 gap-3 flex items-center">
            <Logo logoSize="lg" redirectIndex={true} />

            <div className="hidden sm:block h-6 w-px bg-base-300/80" />

            <Link
              href={`/${competicao}`}
              className={`hidden sm:inline-flex text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isActive(`/${competicao}`)
                  ? "text-primary"
                  : "text-base-content/55 hover:text-primary"
              }`}
            >
              {nav.label}
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-1">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className={navItemClass(
                  isActive(`/${competicao}/${nav.scorePath}`),
                )}
              >
                <Trophy size={16} />
                <span>Pontuador</span>
                <ChevronDown size={14} className="opacity-60" />
              </div>

              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] mt-3 w-60 rounded-box bg-base-100 p-2 shadow-xl border border-base-300/60"
              >
                <li className="menu-title px-3 pt-2 pb-1">
                  <span>Temporadas</span>
                </li>

                {seasons.map((season) => {
                  const Icon = season.icon;
                  const href = `/${competicao}/${nav.scorePath}/${season.key}`;
                  const active = isActive(href);

                  return (
                    <li key={season.key}>
                      <Link
                        href={href}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                          active ? "bg-base-200" : "hover:bg-base-200/80"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={`mt-0.5 transition-opacity duration-200 ${
                            active ? "opacity-100" : "opacity-60"
                          }`}
                        />
                        <span className="flex flex-col">
                          <span
                            className={`font-medium ${active ? "text-primary" : ""}`}
                          >
                            {season.name}
                          </span>
                          <span className="text-xs opacity-60">
                            {season.period}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link
              href="/fll/quickbrick"
              className={navItemClass(isActive("/fll/quickbrick"))}
            >
              <Table2 size={16} />
              <span>QuickBrick</span>
            </Link>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className={navItemClass(
                  nav.menu.some((item) =>
                    isActive(`/${competicao}/${item.path}`),
                  ),
                )}
              >
                <ToolCase size={16} />
                <span>Ferramentas</span>
                <ChevronDown size={14} className="opacity-60" />
              </div>

              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] mt-3 w-72 rounded-box bg-base-100 p-2 shadow-xl border border-base-300/60"
              >
                {nav.menu.map((item) => {
                  const Icon = item.icon;
                  const href = `/${competicao}/${item.path}`;
                  const active = isActive(href);

                  return (
                    <li key={item.path}>
                      <Link
                        href={href}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                          active ? "bg-base-200" : "hover:bg-base-200/80"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={`mt-0.5 transition-opacity duration-200 ${
                            active ? "opacity-100" : "opacity-60"
                          }`}
                        />
                        <span className="flex flex-col">
                          <span
                            className={`font-medium ${active ? "text-primary" : ""}`}
                          >
                            {item.nome}
                          </span>
                          <span className="text-xs opacity-60">
                            {item.description || "Ferramenta"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <ThemeController />

            <div className="divider divider-horizontal mx-1" />

            <Link
              href="/universe"
              className={navItemClass(isActive("/universe"))}
            >
              <Earth size={16} />
              <span>Competições</span>
            </Link>

            <Link
              href="/auth/login"
              className={navItemClass(isActive("/auth/login"))}
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="btn btn-primary btn-sm rounded-lg shadow-sm transition-transform duration-200 hover:scale-[1.01]"
            >
              Cadastrar
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <ThemeController />

            <label
              htmlFor="navbar-drawer"
              className="btn btn-ghost btn-square btn-sm transition-transform duration-200 hover:scale-105"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </label>
          </div>
        </header>
      </div>

      <div className="drawer-side z-50">
        <label htmlFor="navbar-drawer" className="drawer-overlay" />

        <aside className="flex min-h-full w-80 flex-col bg-base-100 border-r border-base-300/60">
          <div className="flex items-center justify-between px-4 py-4 border-b border-base-300/60">
            <Logo logoSize="md" redirectIndex={true} />
            <label
              htmlFor="navbar-drawer"
              className="btn btn-ghost btn-square btn-sm transition-transform duration-200 hover:scale-105"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </label>
          </div>

          <div className="p-4 space-y-5 overflow-y-auto">
            <div>
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                Navegação
              </p>

              <ul className="menu mt-2 gap-1 w-full">
                <li>
                  <details>
                    <summary className="rounded-lg transition-colors duration-200 hover:bg-base-200">
                      <Trophy size={16} />
                      Pontuador
                    </summary>

                    <ul className="mt-2">
                      {seasons.map((season) => {
                        const Icon = season.icon;
                        const href = `/${competicao}/${nav.scorePath}/${season.key}`;
                        const active = isActive(href);

                        return (
                          <li key={season.key}>
                            <Link
                              href={href}
                              className={mobileItemClass(active)}
                            >
                              <span className="flex items-start gap-3">
                                <Icon size={18} className="mt-0.5 opacity-60" />
                                <span className="flex flex-col">
                                  <span
                                    className={`font-medium ${active ? "text-primary" : ""}`}
                                  >
                                    {season.name}
                                  </span>
                                  <span className="text-xs opacity-60">
                                    {season.period}
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>

                <li>
                  <Link
                    href="/fll/quickbrick"
                    className={mobileItemClass(isActive("/fll/quickbrick"))}
                  >
                    <Table2 size={16} />
                    QuickBrick
                  </Link>
                </li>

                <li>
                  <details>
                    <summary className="rounded-lg transition-colors duration-200 hover:bg-base-200">
                      <ToolCase size={16} />
                      Ferramentas
                    </summary>

                    <ul className="mt-2">
                      {nav.menu.map((item) => {
                        const Icon = item.icon;
                        const href = `/${competicao}/${item.path}`;
                        const active = isActive(href);

                        return (
                          <li key={item.path}>
                            <Link
                              href={href}
                              className={mobileItemClass(active)}
                            >
                              <span className="flex items-start gap-3">
                                <Icon size={18} className="mt-0.5 opacity-60" />
                                <span className="flex flex-col">
                                  <span
                                    className={`font-medium ${active ? "text-primary" : ""}`}
                                  >
                                    {item.nome}
                                  </span>
                                  <span className="text-xs opacity-60">
                                    {item.description || "Ferramenta"}
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>
              </ul>
            </div>

            <div>
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                Acessos
              </p>

              <div className="mt-2 grid gap-2">
                <Link
                  href="/universe"
                  className={`btn btn-outline btn-sm justify-start transition-all duration-200 ${
                    isActive("/universe") ? "btn-active" : ""
                  }`}
                >
                  <Earth size={16} />
                  Competições
                </Link>

                <Link
                  href="/auth/login"
                  className={`btn btn-ghost btn-sm justify-start transition-all duration-200 ${
                    isActive("/auth/login") ? "btn-active" : ""
                  }`}
                >
                  Login
                </Link>

                <Link
                  href="/auth/signup"
                  className="btn btn-primary btn-sm justify-start shadow-sm"
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}