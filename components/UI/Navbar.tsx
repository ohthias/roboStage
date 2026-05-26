"use client";
import { useParams } from "next/navigation";
import {
  ChevronDown,
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
      <div
        className={`drawer-content flex flex-col ${isIndexPage ? "fixed top-0 left-0 right-0 z-20" : ""}`}
      >
        <div
          className={`navbar flex justify-between px-4 sm:px-8 lg:px-10 shadow-sm h-16 ${isIndexPage ? "bg-base-200/70 backdrop-blur-md" : "bg-base-200"}`}
        >
          <div className="flex items-center space-x-2">
            <Logo logoSize="lg" redirectIndex={true} />
            <div className="divider divider-horizontal" />

            <Link
              href={`/${competicao}`}
              className="font-bold italic text-base-content/50 hover:text-primary"
            >
              {nav.label}
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex flex-none flex-1 justify-center">
            <ul className="menu menu-horizontal gap-2 items-center">
              <li>
                <div className="dropdown hover:bg-base-300 rounded-lg px-3 py-2">
                  <div
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer text-base-content/70 rounded-lg flex items-center gap-2"
                  >
                    <Trophy size={16} />
                    Pontuador
                    <ChevronDown size={12} className="text-base-content/50" />
                  </div>

                  <ul
                    tabIndex={-1}
                    className="menu dropdown-content bg-base-200 rounded-box shadow-lg p-2 mt-4 w-48 z-[1]"
                  >
                    <li className="menu-title">
                      <span>Temporadas</span>
                    </li>

                    {seasons.map((season) => {
                      const Icon = season.icon;

                      return (
                        <li key={season.key}>
                          <Link
                            href={`/${competicao}/${nav.scorePath}/${season.key}`}
                            className="flex flex-row items-start gap-2 px-3 py-2 rounded font-medium"
                          >
                            <Icon size={20} className="text-base-content/35" />
                            <div className="flex flex-col items-start gap-1">
                              {season.name}
                              <span className="text-xs opacity-70 font-normal">
                                {season.period}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>

              <li>
                <Link
                  href="/fll/quickbrick"
                  className="text-base-content/70 hover:bg-base-300 px-3 py-2 rounded-lg "
                >
                  <Table2 size={16} className="inline mr-1" />
                  QuickBrick Studio
                </Link>
              </li>

              <li>
                <div className="dropdown hover:bg-base-300 rounded-lg px-3 py-2">
                  <div
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer text-base-content/70 flex items-center gap-2"
                  >
                    <ToolCase size={16} />
                    Ferramentas
                    <ChevronDown size={12} className="text-base-content/50" />
                  </div>

                  <ul
                    tabIndex={-1}
                    className="menu dropdown-content bg-base-200 rounded-box shadow-lg p-2 mt-4 w-56 z-[1]"
                  >
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
                </div>
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

        <aside className="menu flex flex-col justify-start h-full p-0 w-72 bg-base-200 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <Logo logoSize="md" redirectIndex={true} />
            <label
              htmlFor="navbar-drawer"
              className="btn btn-ghost btn-square"
              aria-label="Fechar menu"
            >
              ✕
            </label>
          </div>

          <div className="p-4">
            <div className="text-sm font-semibold mb-2">Ferramentas</div>
            <ul className="menu gap-2 w-full">
              <li>
                <div className="dropdown">
                  <div
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer font-medium flex items-center gap-2 px-3 py-2 rounded-lg"
                  >
                    <Trophy size={16} />
                    Pontuador
                    <ChevronDown size={12} className="text-base-content/50" />
                  </div>

                  <ul
                    tabIndex={-1}
                    className="menu dropdown-content bg-base-200 rounded-box p-2 mt-2 w-full z-50 absolute"
                  >
                    {seasons.map((season) => {
                      const Icon = season.icon;

                      return (
                        <li key={season.key}>
                          <Link
                            href={`/${competicao}/${nav.scorePath}/${season.key}`}
                            className="flex flex-row items-start gap-2 px-3 py-2 rounded hover:bg-base-300 font-medium"
                          >
                            <Icon size={20} className="text-base-content/35" />
                            <div className="flex flex-col items-start gap-1">
                              {season.name}
                              <span className="text-xs opacity-70 font-normal">
                                {season.period}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>

              <li>
                <Link href="/fll/quickbrick" className="font-medium">
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

            <div className="divider my-4">Acessos</div>
            <div className="flex flex-col gap-3">
              <Link
                href="/universe"
                className="btn btn-soft flex items-center gap-2 justify-center"
              >
                <Earth size={16} />
                Competições
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-ghost w-full"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-primary w-full"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}