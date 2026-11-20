"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "../lib";
import { TeamAvatar } from "../core/Data";
import { Logo } from "./Brand";

/* ------------------------------------------------------------------ */
/*  Sidebar do dashboard — item ativo vira cápsula com sombra dura.    */
/*  Recebe o usuário por props (no app real, venha do useUser da Clerk)*/
/* ------------------------------------------------------------------ */

export type SidebarItem = {
  title: string;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: string | number;
};

export function Sidebar({
  items,
  activeHref,
  user,
  className,
}: {
  items: SidebarItem[];
  activeHref: string;
  user: { name: string; email?: string; avatarUrl?: string };
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={cn(
        "stage-paper stage-ink flex h-full flex-col overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-base-100 shadow-sm transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
        className,
      )}
    >
      <div className={cn("flex items-center border-b border-base-300 bg-gradient-to-r from-base-100/50 to-base-200/30 py-4", collapsed ? "justify-center" : "justify-between px-5")}>
        {!collapsed && <Logo logoSize="lg" />}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="btn btn-circle btn-ghost btn-sm rounded-full!"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft size={16} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              data-tip={collapsed ? item.title : undefined}
              className={cn(
                "group relative flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-all duration-200",
                collapsed && "tooltip tooltip-right justify-center px-0",
                active
                  ? "bg-primary/10 font-semibold text-base-content"
                  : "font-medium text-base-content/70 hover:translate-x-0.5 hover:bg-base-200/50 hover:text-base-content",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-7 w-1 -translate-x-3 -translate-y-1/2 rounded-r-full transition-all duration-200",
                  active ? "bg-primary" : "bg-base-content opacity-0 group-hover:opacity-30",
                )}
              />
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-tl-lg rounded-br-lg transition-colors",
                  active ? "bg-primary text-primary-content" : "text-base-content/60 group-hover:text-base-content",
                )}
              >
                <Icon size={18} />
              </span>
              {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
              {!collapsed && item.badge != null && (
                <span className="stage-corner-sm bg-accent px-1.5 font-mono text-[10px] font-bold text-accent-content">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-base-300 p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <TeamAvatar name={user.name} src={user.avatarUrl} size={38} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              {user.email && <p className="truncate text-xs text-base-content/60">{user.email}</p>}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
