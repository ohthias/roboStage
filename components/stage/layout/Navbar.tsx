"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "../lib";
import { ButtonLink } from "../core/Button";
import { Logo } from "./Brand";

/* ------------------------------------------------------------------ */
/*  Navbar — barra fixa do site: logo, links com hover vermelho        */
/*  suave, alternador de tema e CTA com sombra dura.                   */
/* ------------------------------------------------------------------ */

export type NavLink = { label: string; href: string; active?: boolean };

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "darkScheme");
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "darkScheme" : "lightScheme";
    try {
      localStorage.setItem("theme", next ? "darkScheme" : "lightScheme");
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      className={cn("btn btn-circle btn-ghost btn-sm rounded-full! text-base-content/70 hover:text-base-content", className)}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function Navbar({
  links,
  cta = { label: "Cadastre-se", href: "/sign-up" },
  extra,
  className,
}: {
  links: NavLink[];
  cta?: { label: string; href: string } | null;
  extra?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={cn(
        "stage-paper sticky top-0 z-40 border-b border-base-300/70 bg-base-100/80 backdrop-blur-md supports-[backdrop-filter]:bg-base-100/70",
        className,
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo logoSize="xl" redirectIndex />
        </div>

        <ul className="hidden flex-1 items-center justify-center gap-0.5 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={l.active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ease-out",
                  l.active ? "bg-primary/10 text-primary" : "text-base-content/70 hover:bg-primary/10 hover:text-primary",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {extra}
          <ThemeToggle />
          {cta && (
            <ButtonLink href={cta.href} size="sm" iconRight={<ArrowUpRight size={14} />} className="hidden sm:inline-flex">
              {cta.label}
            </ButtonLink>
          )}
        </div>
      </nav>

      {open && (
        <div className="border-t border-base-300 bg-base-100 px-5 py-4 xl:hidden animate-pop">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold transition hover:bg-base-200/60 hover:shadow-[4px_4px_0_var(--color-primary)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {cta && (
            <ButtonLink href={cta.href} className="mt-4 w-full">
              {cta.label}
            </ButtonLink>
          )}
        </div>
      )}
    </header>
  );
}
