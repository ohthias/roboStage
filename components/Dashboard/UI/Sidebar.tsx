"use client";

import { useRouter, usePathname } from "next/navigation";
import { NavItem } from "@/types/navigation";
import Logo from "@/components/UI/Logo";

interface SidebarProps {
  profile: {
    username: string | null;
    avatar_url?: string | null;
  };
  collapsed: boolean;
  items: NavItem[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({
  profile,
  collapsed,
  items,
  isMobileOpen,
  onCloseMobile,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (item: NavItem) => {
    if (item.page && onNavigate) onNavigate(item.page);
    if (item.href) router.push(item.href);
    onCloseMobile();
  };

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`
    fixed lg:static z-50
    inset-y-0 lg:inset-y-auto
    left-0
    bg-base-100 border-r border-base-300
    flex flex-col justify-between
    transition-transform duration-300

    w-64
    ${collapsed ? "lg:w-20" : "lg:w-64"}

    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}

    lg:h-[calc(100vh-4rem)]
  `}
      >
        <nav className="flex-1 p-2 space-y-1">
          {isMobileOpen && (
            <div className="px-2 py-4">
              <Logo logoSize="md" />
            </div>
          )}
          {items.map(({ id, label, icon: Icon, href, page }) => {
            const isActive =
              (href && pathname === href) ||
              (page && pathname === "/dashboard");

            return (
              <div key={id} className="relative group">
                <button
                  onClick={() =>
                    handleNavigate({ id, label, icon: Icon, href, page })
                  }
                  className={`
                    relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all text-left
                    ${
                      isActive
                        ? "bg-base-200 font-medium"
                        : "hover:bg-base-200/70"
                    }
                    ${collapsed ? "lg:justify-center" : "justify-start"}
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary" />
                  )}

                  <Icon
                    size={20}
                    className={`transition-colors ${
                      isActive ? "text-primary" : "opacity-70"
                    }`}
                  />

                  {/* Texto */}
                  <span
                    className={`truncate text-sm ${
                      collapsed ? "lg:hidden" : "block"
                    }`}
                  >
                    {label}
                  </span>
                </button>

                {collapsed && (
                  <div className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <div className="px-3 py-1.5 text-xs rounded-md bg-base-300 shadow-lg whitespace-nowrap">
                      {label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 p-4 border-t border-base-300">
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

          <div
            className={`flex flex-col min-w-0 ${
              collapsed ? "lg:hidden" : "block"
            }`}
          >
            <span className="font-semibold truncate">
              {profile.username ?? "Usuário"}
            </span>
            <span className="text-xs opacity-60">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
