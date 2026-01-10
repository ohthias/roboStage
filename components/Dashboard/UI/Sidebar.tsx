"use client";

import { useRouter, usePathname } from "next/navigation";
import { NavItem } from "@/types/navigation";

interface SidebarProps {
  profile: {
    username: string | null;
    avatar_url?: string | null;
  };
  collapsed: boolean;
  items: NavItem[];
  onNavigate?: (page: string) => void;
}

export default function Sidebar({
  profile,
  collapsed,
  items,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (item: NavItem) => {
    if (item.page && onNavigate) onNavigate(item.page);
    if (item.href) router.push(item.href);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between h-[calc(100vh-4rem)] bg-base-100 border-r border-base-300 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ id, label, icon: Icon, href, page }) => {
          const isActive =
            (href && pathname === href) || (page && pathname === "/dashboard");

          return (
            <div key={id} className="relative group">
              <button
                onClick={() =>
                  handleNavigate({ id, label, icon: Icon, href, page })
                }
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive ? "bg-base-200 font-medium" : "hover:bg-base-200/70"} ${collapsed ? "justify-center" : "justify-start"}
                }`}
              >
                {/* Indicador ativo */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary" />
                )}

                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? "text-primary" : "opacity-70"
                  }`}
                />

                {!collapsed && (
                  <span className="truncate text-sm">{label}</span>
                )}
              </button>

              {/* Tooltip (somente colapsada) */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="px-3 py-1.5 text-xs rounded-md bg-base-300 text-base-content shadow-lg whitespace-nowrap">
                    {label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* Perfil */}
      <div className="relative flex items-center gap-3 p-4 border-b border-base-300">
        <div className="avatar">
          <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <span className="text-sm font-semibold opacity-60">
                {profile.username?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold truncate">
              {profile.username ?? "Usuário"}
            </span>
            <span className="text-xs opacity-60">Online</span>
          </div>
        )}
      </div>
    </aside>
  );
}
