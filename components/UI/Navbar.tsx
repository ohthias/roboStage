"use client";

import { useCallback, useEffect } from "react";
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
  ToolCase,
  Trophy,
  X,
  Cuboid,
} from "lucide-react";

import Logo from "./Logo";
import { ThemeController } from "./themeController";
import { NAVIGATION } from "@/utils/competitions/navigation";

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

const mainLinks = [
  { href: "/about", label: "Sobre" },
  { href: "/showlive", label: "ShowLive" },
  { href: "/help", label: "Ajuda" },
];

const accessLinks = [
  {
    href: "/universe",
    label: "Competições",
    icon: Earth,
    variant: "outline" as const,
  },
  { href: "/auth/login", label: "Login", variant: "ghost" as const },
  { href: "/auth/signup", label: "Cadastrar", variant: "primary" as const },
];

export function Navbar() {
  const params = useParams();
  const pathname = usePathname();

  const competition =
    typeof params?.competicao === "string" ? params.competicao : undefined;

  const nav = competition
    ? (NAVIGATION[competition as keyof typeof NAVIGATION] ?? NAVIGATION.fll)
    : undefined;

  const isCompetitionRoute = Boolean(competition);
  const isHomePage = pathname === "/";
  const isIndexPage = isCompetitionRoute
    ? pathname === `/${competition}`
    : isHomePage;

  const closeDrawer = useCallback(() => {
    const drawer = document.getElementById(
      "navbar-drawer",
    ) as HTMLInputElement | null;
    if (drawer) drawer.checked = false;
  }, []);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  const baseLink =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary";
  const mutedLink =
    "text-base-content/70 hover:bg-primary/10 hover:text-primary";
  const activeLink = "bg-primary/10 text-primary shadow-sm";

  const navbarClasses = `navbar h-16 px-4 sm:px-6 lg:px-8 border-b border-base-300 ${
    isIndexPage
      ? "fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur"
      : "sticky top-0 z-40 bg-base-100/95 backdrop-blur"
  }`;

  const navItemClass = (active: boolean) =>
    `${baseLink} ${active ? activeLink : mutedLink}`;

  const mobileItemClass = (active: boolean) =>
    `flex w-full items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
      active
        ? "bg-base-200 text-base-content shadow-sm"
        : "hover:bg-base-200/80 hover:shadow-sm"
    }`;

  const homeHref = competition ? `/${competition}` : "/";
  const competitionLabel = nav?.label ?? "";

  const showCompetitionNav = Boolean(competition && nav);
  const showMainNav = !isCompetitionRoute;

  const activeCompetitionTools =
    nav?.menu?.some((item) => isActive(`/${competition}/${item.path}`)) ??
    false;

  return (
    <div className="drawer drawer-start z-50">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <header className={navbarClasses}>
          <div className="flex flex-1 items-center gap-3 lg:flex-none">
            <Logo logoSize="lg" redirectIndex={true} />

            <div className="divider divider-horizontal mx-1 hidden sm:flex" />

            <Link
              href={homeHref}
              className={`hidden sm:inline-flex text-sm font-bold italic uppercase tracking-wide transition-colors duration-200 ${
                isActive(homeHref)
                  ? "cursor-default text-base-content/55 hover:text-base-content"
                  : "text-primary"
              }`}
              aria-current={isActive(homeHref) ? "page" : undefined}
            >
              {competitionLabel}
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {showCompetitionNav && nav ? (
              <>
                <div className="dropdown dropdown-end">
                  <button
                    type="button"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-label="Abrir menu de pontuador"
                    className={navItemClass(
                      isActive(`/${competition}/${nav.scorePath}`),
                    )}
                  >
                    <Trophy size={16} />
                    <span>Pontuador</span>
                    <ChevronDown size={14} className="opacity-60" />
                  </button>

                  <ul
                    tabIndex={0}
                    className="menu dropdown-content z-[1] mt-4 w-60 rounded-box border border-base-300/60 bg-base-100 p-2 shadow-xl"
                  >
                    <li className="menu-title px-3 pb-1 pt-2">
                      <span>Temporadas</span>
                    </li>

                    {seasons.map((season) => {
                      const Icon = season.icon;
                      const href = `/${competition}/${nav.scorePath}/${season.key}`;
                      const active = isActive(href);

                      return (
                        <li key={season.key}>
                          <Link
                            href={href}
                            className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                              active ? "bg-base-200" : "hover:bg-base-200/80"
                            }`}
                            aria-current={active ? "page" : undefined}
                          >
                            <Icon
                              size={18}
                              className={`mt-0.5 transition-opacity duration-200 ${
                                active ? "opacity-100" : "opacity-60"
                              }`}
                            />
                            <span className="flex flex-col">
                              <span
                                className={`font-medium ${
                                  active ? "text-primary" : ""
                                }`}
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

                {competition === "fll" && (
                  <Link
                    href="/fll/quickbrick"
                    className={navItemClass(isActive("/fll/quickbrick"))}
                    aria-current={
                      isActive("/fll/quickbrick") ? "page" : undefined
                    }
                  >
                    <Cuboid size={16} />
                    <span>QuickBrick Studio</span>
                  </Link>
                )}

                <div className="dropdown dropdown-end">
                  <button
                    type="button"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-label="Abrir menu de ferramentas"
                    className={navItemClass(activeCompetitionTools)}
                  >
                    <ToolCase size={16} />
                    <span>Ferramentas</span>
                    <ChevronDown size={14} className="opacity-60" />
                  </button>

                  <ul
                    tabIndex={0}
                    className="menu dropdown-content z-[1] mt-4 w-72 rounded-box border border-base-300/60 bg-base-100 p-2 shadow-xl"
                  >
                    {nav.menu.map((item) => {
                      const Icon = item.icon;
                      const href = `/${competition}/${item.path}`;
                      const active = isActive(href);

                      return (
                        <li key={item.path}>
                          <Link
                            href={href}
                            className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                              active ? "bg-base-200" : "hover:bg-base-200/80"
                            }`}
                            aria-current={active ? "page" : undefined}
                          >
                            <Icon
                              size={18}
                              className={`mt-0.5 transition-opacity duration-200 ${
                                active ? "opacity-100" : "opacity-60"
                              }`}
                            />
                            <span className="flex flex-col">
                              <span
                                className={`font-medium ${
                                  active ? "text-primary" : ""
                                }`}
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
              </>
            ) : null}

            {showMainNav && (
              <>
                {mainLinks.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={navItemClass(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeController />

            <div className="divider divider-horizontal mx-1" />

            {accessLinks.map((item) => {
              const active = isActive(item.href);

              if (item.variant === "primary") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="btn btn-primary btn-sm rounded-lg shadow-sm transition-transform duration-200 hover:scale-[1.01]"
                  >
                    {item.label}
                  </Link>
                );
              }

              if (item.variant === "outline") {
                const Icon = item.icon ?? Earth;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navItemClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeController />

            <label
              htmlFor="navbar-drawer"
              className="btn btn-ghost btn-square btn-sm transition-transform duration-200 hover:scale-105"
              aria-label="Abrir menu principal"
            >
              <Menu size={20} />
            </label>
          </div>
        </header>
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="navbar-drawer"
          className="drawer-overlay"
          aria-label="Fechar menu principal"
        />

        <aside className="flex min-h-full w-80 max-w-[85vw] flex-col border-r border-base-300/60 bg-base-100">
          <div className="flex items-center justify-between border-b border-base-300/60 px-4 py-4">
            <Logo logoSize="md" redirectIndex={true} />
            <label
              htmlFor="navbar-drawer"
              className="btn btn-ghost btn-square btn-sm transition-transform duration-200 hover:scale-105"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </label>
          </div>

          <div className="overflow-y-auto p-4">
            {showCompetitionNav && nav ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-base-300/60 bg-base-200/60 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                    Competição atual
                  </p>
                  <p className="mt-1 text-lg font-bold italic uppercase">{competitionLabel}</p>
                  <p className="mt-1 text-sm opacity-70">
                    Navegue entre pontuador, ferramentas e atalhos.
                  </p>
                </div>

                <div>
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                    Navegação
                  </p>

                  <div className="mt-2 space-y-3">
                    {nav.scorePath && (
                      <details className="collapse collapse-arrow rounded-2xl border border-base-300/60 bg-base-100 shadow-sm">
                        <summary className="collapse-title min-h-0 rounded-2xl px-4 py-3 text-base font-semibold hover:bg-base-200/80">
                          <span className="flex items-center gap-2">
                            <Trophy size={16} />
                            Pontuador
                          </span>
                        </summary>

                        <div className="collapse-content px-2 pb-2">
                          <ul className="space-y-1">
                            {seasons.map((season) => {
                              const Icon = season.icon;
                              const href = `/${competition}/${nav.scorePath}/${season.key}`;
                              const active = isActive(href);

                              return (
                                <li key={season.key}>
                                  <Link
                                    href={href}
                                    onClick={closeDrawer}
                                    className={mobileItemClass(active)}
                                    aria-current={active ? "page" : undefined}
                                  >
                                    <Icon
                                      size={18}
                                      className="mt-0.5 shrink-0 opacity-60"
                                    />
                                    <span className="flex flex-col">
                                      <span
                                        className={`font-medium ${
                                          active ? "text-primary" : ""
                                        }`}
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
                      </details>
                    )}

                    {competition === "fll" && (
                      <Link
                        href="/fll/quickbrick"
                        onClick={closeDrawer}
                        className={mobileItemClass(isActive("/fll/quickbrick"))}
                        aria-current={
                          isActive("/fll/quickbrick") ? "page" : undefined
                        }
                      >
                        <Cuboid
                          size={18}
                          className="mt-0.5 shrink-0 opacity-60"
                        />
                        <span className="flex flex-col">
                          <span className="font-medium">QuickBrick Studio</span>
                          <span className="text-xs opacity-60">
                            Editor e atalho da FLL
                          </span>
                        </span>
                      </Link>
                    )}

                    {nav.menu.length > 0 && (
                      <details className="collapse collapse-arrow rounded-2xl border border-base-300/60 bg-base-100 shadow-sm">
                        <summary className="collapse-title min-h-0 rounded-2xl px-4 py-3 text-base font-semibold hover:bg-base-200/80">
                          <span className="flex items-center gap-2">
                            <ToolCase size={16} />
                            Ferramentas
                          </span>
                        </summary>

                        <div className="collapse-content px-2 pb-2">
                          <ul className="space-y-1">
                            {nav.menu.map((item) => {
                              const Icon = item.icon;
                              const href = `/${competition}/${item.path}`;
                              const active = isActive(href);

                              return (
                                <li key={item.path}>
                                  <Link
                                    href={href}
                                    onClick={closeDrawer}
                                    className={mobileItemClass(active)}
                                    aria-current={active ? "page" : undefined}
                                  >
                                    <Icon
                                      size={18}
                                      className="mt-0.5 shrink-0 opacity-60"
                                    />
                                    <span className="flex flex-col">
                                      <span
                                        className={`font-medium ${
                                          active ? "text-primary" : ""
                                        }`}
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
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-base-300/60 bg-base-200/60 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                    Navegação principal
                  </p>
                  <p className="mt-1 text-lg font-bold">Explorar RoboStage</p>
                  <p className="mt-1 text-sm opacity-70">
                    Acesse as páginas institucionais e os atalhos da plataforma.
                  </p>
                </div>

                <div>
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                    Navegação
                  </p>

                  <div className="mt-2 space-y-2">
                    {mainLinks.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeDrawer}
                          className={mobileItemClass(active)}
                          aria-current={active ? "page" : undefined}
                        >
                          <span className="flex flex-col">
                            <span
                              className={`font-medium ${active ? "text-primary" : ""}`}
                            >
                              {item.label}
                            </span>
                            <span className="text-xs opacity-60">
                              Página institucional
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-60">
                Acessos
              </p>

              <div className="mt-2 grid gap-2">
                {accessLinks.map((item) => {
                  const active = isActive(item.href);

                  if (item.variant === "outline") {
                    const Icon = item.icon ?? Earth;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeDrawer}
                        className={`btn btn-outline btn-sm justify-start rounded-xl transition-all duration-200 ${
                          active ? "btn-active" : ""
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon size={16} />
                        {item.label}
                      </Link>
                    );
                  }

                  if (item.variant === "primary") {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeDrawer}
                        className="btn btn-primary btn-sm justify-start rounded-xl shadow-sm"
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`btn btn-ghost btn-sm justify-start rounded-xl transition-all duration-200 ${
                        active ? "btn-active" : ""
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}