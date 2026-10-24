"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronDown, Menu, Trophy, X, ChevronUp } from "lucide-react";

import Logo from "./Logo";
import { ThemeController } from "./themeController";
import {
  NAVIGATION,
  NAVIGATION_MAIN_LINKS,
  NAVIGATION_MAIN_MENUS,
  type NavLinkGroup,
} from "@/utils/competitions/navigation";
import { Show, UserAvatar } from "@clerk/nextjs";

export function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const [scoreOpen, setScoreOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = useCallback((key: string, open: boolean) => {
    setOpenMenus((prev) => ({ ...prev, [key]: open }));
  }, []);

  const competition =
    typeof params?.competicao === "string" ? params.competicao : undefined;

  const nav = competition
    ? (NAVIGATION[competition as keyof typeof NAVIGATION] ?? NAVIGATION.fll)
    : undefined;

  const isCompetitionRoute = Boolean(competition);
  const isNotCompetitionRoute = !isCompetitionRoute;
  const isHomePage = pathname === "/";
  const isIndexPage = isCompetitionRoute
    ? pathname === `/${competition}`
    : isHomePage;

  const competitionOptions = Object.entries(NAVIGATION).map(([key, value]) => ({
    key,
    label: value.label,
    href: `/${key}`,
    icon: value.icon,
  }));

  /*
    Grupos de menu normalizados com URLs absolutas.
    - Em competição: menus da competição (path → /{competicao}/{path})
    - Fora de competição: NAVIGATION_MAIN_MENUS
    Assim a mesma renderização (popover no desktop / acordeão no mobile)
    serve para os dois contextos.
  */
  const menuGroups: NavLinkGroup[] = useMemo(() => {
    if (competition && nav) {
      return (nav.menus ?? []).map((group) => ({
        ...group,
        items: group.items.map(({ path, ...item }) => ({
          ...item,
          href: `/${competition}/${path}`,
        })),
      }));
    }
    if (!competition) return NAVIGATION_MAIN_MENUS;
    return [];
  }, [competition, nav]);

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

  const isMenuGroupActive = useCallback(
    (group: NavLinkGroup) => group.items.some((item) => isActive(item.href)),
    [isActive],
  );

  const baseLink =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary relative";
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
    `flex w-full items-start gap-3 rounded-xl px-3 py-2 transition-all duration-200 relative w-full ${
      active
        ? "bg-primary/10 text-base-content shadow-[4px_4px_0_theme(colors.base-300)]"
        : "hover:bg-base-200/80 hover:shadow-[4px_4px_0_theme(colors.primary)]"
    }`;

  const homeHref = competition ? `/${competition}` : "/";
  const competitionLabel = nav?.label ?? "";

  const showCompetitionNav = Boolean(competition && nav);
  const showMainNav = !isCompetitionRoute;

  // IDs estáveis por contexto, exigidos pela Popover API do megamenu do daisyUI
  const megamenuId = `megamenu-${competition ?? "root"}`;
  const scorePopoverId = `${megamenuId}-pontuador`;

  const renderBadges = (
    item: { new?: boolean; update?: boolean },
    position: string,
  ) => (
    <>
      {item.new && (
        <span
          className={`badge badge-sm badge-primary absolute ${position} text-[0.55rem] font-bold`}
        >
          Novo
        </span>
      )}
      {item.update && (
        <span
          className={`badge badge-sm badge-secondary absolute ${position} text-[0.55rem] font-bold`}
        >
          Atualizado
        </span>
      )}
    </>
  );

  /* ---------- Grupo de menu: desktop (gatilho + popover do megamenu) ---------- */
  const renderDesktopGroup = (group: NavLinkGroup) => {
    const GroupIcon = group.icon;
    const groupPopoverId = `${megamenuId}-${group.key}`;

    return (
      <Fragment key={group.key}>
        <button
          type="button"
          popoverTarget={groupPopoverId}
          aria-label={`Abrir menu de ${group.label.toLowerCase()}`}
          className={navItemClass(isMenuGroupActive(group))}
        >
          <GroupIcon size={16} />
          <span>{group.label}</span>
          {renderBadges(group, "-right-2 -top-2")}
        </button>

        <div
          id={groupPopoverId}
          popover="auto"
          className="w-72 rounded-box border border-base-300/60 bg-base-100 p-2 shadow-xl"
        >
          <ul className="menu menu-sm space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                      active ? "bg-base-200" : "hover:bg-base-200/80"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      size={18}
                      className={`mt-0.5 flex-shrink-0 transition-opacity duration-200 ${
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
                    {renderBadges(item, "right-2 top-2")}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Fragment>
    );
  };

  /* ---------- Grupo de menu: mobile (acordeão no drawer) ---------- */
  const renderMobileGroup = (group: NavLinkGroup) => {
    const GroupIcon = group.icon;
    const isOpen = openMenus[group.key] ?? false;

    return (
      <details
        key={group.key}
        className="collapse rounded-2xl transition hover:bg-base-200/40 hover:shadow-[4px_4px_0_theme(colors.primary)]"
        open={isOpen}
        onToggle={(event) => toggleMenu(group.key, event.currentTarget.open)}
      >
        <summary className="collapse-title min-h-0 rounded-2xl px-4 py-3 text-base font-semibold">
          <span className="flex items-center gap-2">
            <GroupIcon size={16} className="shrink-0 text-base-content/70" />
            {group.label}
            {isOpen ? (
              <ChevronUp size={14} className="ml-auto opacity-60" />
            ) : (
              <ChevronDown size={14} className="ml-auto opacity-60" />
            )}
          </span>
        </summary>

        <div className="collapse-content px-2 pb-2">
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeDrawer}
                    className={mobileItemClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} className="mt-0.5 shrink-0 opacity-60" />
                    <span className="flex flex-col">
                      <span className={`font-medium ${active ? "text-primary" : ""}`}>
                        {item.nome}
                      </span>
                      <span className="text-xs opacity-60">
                        {item.description || "Ferramenta"}
                      </span>
                    </span>
                    {renderBadges(item, "-top-2 -right-2")}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    );
  };

  return (
    <div className="drawer drawer-start z-50">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <header className={navbarClasses}>
          <div className="flex flex-1 items-center gap-3 lg:flex-none">
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider divider-horizontal mx-1 hidden sm:flex" />
            {isNotCompetitionRoute && (
              <div className="dropdown dropdown-start">
                <button
                  type="button"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-label="Abrir seletor de competições"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-content/70 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary"
                >
                  <span className="font-medium">Competições</span>
                  <ChevronDown size={14} className="opacity-60" />
                </button>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] mt-4 w-64 rounded-box border border-base-300/60 bg-base-100 p-2 shadow-xl"
                >
                  <li className="menu-title px-3 pb-1 pt-2">
                    <span>Escolha uma competição</span>
                  </li>

                  {competitionOptions.map((competitionItem) => (
                    <li key={competitionItem.key}>
                      <Link
                        href={competitionItem.href}
                        className="rounded-lg px-3 py-2 transition-all duration-200 hover:bg-base-200/80"
                      >
                        <span>
                          <competitionItem.icon className="opacity-60" />
                        </span>
                        {competitionItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href={homeHref}
              className={`hidden sm:inline-flex text-sm font-bold italic uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
                isActive(homeHref)
                  ? "cursor-default text-base-content/55 hover:text-base-content"
                  : "text-primary"
              }`}
              aria-current={isActive(homeHref) ? "page" : undefined}
              title="Ir para a página inicial da competição"
            >
              {competitionLabel}
            </Link>
          </div>

          {/*
            Navegação desktop.
            Um único container `.megamenu` engloba tudo (recomendação do daisyUI),
            tanto em rotas de competição quanto fora delas. Os grupos de menu
            vêm de `menuGroups`, que já resolve o contexto.
          */}
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            <div id={megamenuId} className="megamenu megamenu-md contents">
              <span className="megamenu-active" />

              {showCompetitionNav && nav && (
                <>
                  {/* Pontuador */}
                  {nav.scorePath && "seasons" in nav && nav.seasons.length ? (
                    <>
                      <button
                        type="button"
                        popoverTarget={scorePopoverId}
                        aria-label="Abrir menu de pontuador"
                        className={navItemClass(
                          isActive(`/${competition}/${nav.scorePath}`),
                        )}
                      >
                        <Trophy size={16} />
                        <span>Pontuador</span>
                      </button>

                      <div
                        id={scorePopoverId}
                        popover="auto"
                        className="rounded-box border border-base-300/60 bg-base-100 p-2 shadow-xl"
                      >
                        <ul className="menu menu-sm w-60">
                          <li className="menu-title cursor-default select-none px-3 pb-1 pt-2">
                            Temporadas
                          </li>

                          {nav.seasons.map((season) => {
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
                                    <span className={`font-medium ${active ? "text-primary" : ""}`}>
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
                    </>
                  ) : nav.scorePath ? (
                    <Link
                      href={`/${competition}/${nav.scorePath}`}
                      className={navItemClass(
                        isActive(`/${competition}/${nav.scorePath}`),
                      )}
                      aria-current={
                        isActive(`/${competition}/${nav.scorePath}`)
                          ? "page"
                          : undefined
                      }
                    >
                      <Trophy size={16} />
                      <span>Pontuador</span>
                    </Link>
                  ) : null}

                  {/* Itens diretos da competição */}
                  {nav.options?.map((item) => {
                    const Icon = item.icon;
                    const href = `/${competition}/${item.path}`;
                    const active = isActive(href);

                    return (
                      <Link
                        key={item.path}
                        href={href}
                        className={navItemClass(active)}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span>{item.nome}</span>
                        {renderBadges(item, "-right-2 -top-2")}
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Links simples fora de competição */}
              {showMainNav &&
                NAVIGATION_MAIN_LINKS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={navItemClass(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.icon && <item.icon size={16} className="flex-shrink-0" />}
                      <span>{item.label}</span>
                      {renderBadges(item, "-top-2 -right-2")}
                    </Link>
                  );
                })}

              {/* Grupos de menu — funcionam em qualquer contexto */}
              {menuGroups.map(renderDesktopGroup)}
            </div>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeController />

            <div className="divider divider-horizontal mx-1" />

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-full border transition-shadow duration-200 hover:scale-110 hover:shadow-[0_0_0_2px_theme(colors.primary)]"
              >
                <UserAvatar component="button" />
              </Link>
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in" className="btn btn-ghost btn-sm">
                Entrar
              </Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm">
                Criar conta
              </Link>
            </Show>
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

      {/* Menu mobile: drawer + acordeões */}
      <div className="drawer-side z-50">
        <label
          htmlFor="navbar-drawer"
          className="drawer-overlay"
          aria-label="Fechar menu principal"
        />

        <aside className="flex min-h-full w-80 max-w-[85vw] flex-col border-r border-base-300/60 bg-base-100">
          <div className="flex items-center justify-between border-b border-base-300/60 px-4 py-4">
            <div className="flex items-center gap-1">
              <Logo logoSize="md" redirectIndex={true} />
              {competitionLabel && (
                <>
                  <div className="divider divider-horizontal divider-base-300/60" />
                  <span className="inline-flex text-sm font-bold italic uppercase tracking-wide text-base-content/70 md:hidden">
                    {competitionLabel}
                  </span>
                </>
              )}
            </div>
            <label
              htmlFor="navbar-drawer"
              className="btn btn-ghost btn-square btn-sm transition-transform duration-200 hover:scale-105"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </label>
          </div>

          <div className="overflow-y-auto p-4">
            <div className="mt-2 space-y-3">
              {showCompetitionNav && nav && (
                <>
                  {nav.scorePath && "seasons" in nav && nav.seasons.length ? (
                    <details
                      className="collapse rounded-2xl transition hover:bg-base-200/40 hover:shadow-[4px_4px_0_theme(colors.primary)]"
                      open={scoreOpen}
                      onToggle={(event) => setScoreOpen(event.currentTarget.open)}
                    >
                      <summary className="collapse-title min-h-0 rounded-2xl px-4 py-3 text-base font-semibold">
                        <span className="flex items-center gap-2">
                          <Trophy size={16} className="shrink-0 text-base-content/70" />
                          Pontuador
                          {scoreOpen ? (
                            <ChevronUp size={14} className="ml-auto opacity-60" />
                          ) : (
                            <ChevronDown size={14} className="ml-auto opacity-60" />
                          )}
                        </span>
                      </summary>

                      <div className="collapse-content px-2 pb-2">
                        <ul className="space-y-1">
                          {nav.seasons.map((season) => {
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
                                  <Icon size={18} className="mt-0.5 shrink-0 opacity-60" />
                                  <span className="flex flex-col">
                                    <span className={`font-medium ${active ? "text-primary" : ""}`}>
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
                  ) : nav.scorePath ? (
                    <Link
                      href={`/${competition}/${nav.scorePath}`}
                      onClick={closeDrawer}
                      className={mobileItemClass(
                        isActive(`/${competition}/${nav.scorePath}`),
                      )}
                      aria-current={
                        isActive(`/${competition}/${nav.scorePath}`)
                          ? "page"
                          : undefined
                      }
                    >
                      <Trophy size={18} className="shrink-0 opacity-60" />
                      <span
                        className={
                          isActive(`/${competition}/${nav.scorePath}`)
                            ? "text-primary"
                            : ""
                        }
                      >
                        Pontuador
                      </span>
                    </Link>
                  ) : null}

                  {nav.options?.map((item) => {
                    const Icon = item.icon;
                    const href = `/${competition}/${item.path}`;
                    const active = isActive(href);

                    return (
                      <Link
                        key={item.path}
                        href={href}
                        onClick={closeDrawer}
                        className={mobileItemClass(active)}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon size={18} className="mt-0.5 shrink-0 opacity-60" />
                        <span className={`font-medium ${active ? "text-primary" : ""}`}>
                          {item.nome}
                        </span>
                      </Link>
                    );
                  })}
                </>
              )}

              {showMainNav &&
                NAVIGATION_MAIN_LINKS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={mobileItemClass(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.icon && (
                        <item.icon size={18} className="mt-0.5 shrink-0 opacity-60" />
                      )}
                      <span className={`font-medium ${active ? "text-primary" : ""}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

              {/* Grupos de menu — funcionam em qualquer contexto */}
              {menuGroups.map(renderMobileGroup)}
            </div>

            <div className="mt-4 border-t border-base-300 p-4">
              <div className="flex flex-col items-center gap-2">
                <Show when="signed-in">
                  <Link href="/dashboard" className="btn btn-ghost btn-wide">
                    Acessar seu dashboard
                  </Link>
                </Show>
                <Show when="signed-out">
                  <Link href="/sign-in" className="btn btn-ghost btn-sm btn-wide">
                    Entrar
                  </Link>
                  <Link href="/sign-up" className="btn btn-primary btn-sm btn-wide">
                    Criar conta
                  </Link>
                </Show>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}