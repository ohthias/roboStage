"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { ChevronLeft, Home, Building2, LayoutGrid, Users } from "lucide-react";
import Logo from "../UI/Logo";

const items = [
  {
    title: "Início",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Equipes",
    href: "/dashboard/organizations",
    icon: Users,
  },
  {
    title: "Projetos",
    href: "/dashboard/projects",
    icon: LayoutGrid,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-base-100 border-base-300 shadow-sm transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div
        className={`flex items-center border-b border-base-300 py-4 bg-gradient-to-r from-base-100/50 to-base-200/30 ${
          collapsed ? "justify-center px-2" : "justify-between px-6"
        }`}
      >
        {!collapsed && <Logo logoSize="sm" />}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              data-tip={collapsed ? item.title : undefined}
              className={`tooltip tooltip-right relative flex items-center rounded-xl px-3 py-2 transition-all duration-200 hover:bg-base-200/50 hover:translate-x-0.5 group ${collapsed ? "justify-center" : "gap-1"}`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full transition-all duration-200 ${active ? "bg-primary opacity-100" : "opacity-0 group-hover:opacity-30 bg-base-content"}`}
              />

              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 ${active ? "text-primary" : "text-base-content/60 group-hover:text-base-content"}`}
              >
                <Icon size={18} />
              </span>

              {!collapsed && (
                <span
                  className={`text-sm transition-colors duration-200 ${active ? "font-semibold text-base-content" : "font-medium text-base-content/70 group-hover:text-base-content"}`}
                >
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-base-300 bg-base-100 px-3 py-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-12 h-12",
              },
            }}
          />

          {!collapsed && (
            <div className="min-w-0">
              <h2 className="truncate font-semibold">
                {user?.fullName ?? user?.username}
              </h2>

              <p className="truncate text-sm opacity-70">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
