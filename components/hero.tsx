"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import Icone from "@/public/Icone.png";

interface HeroProps {
  admin?: string;
}

export default function Hero({ admin }: HeroProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const id = pathParts[0] || undefined;
  const mode = pathParts[1] || "default";

  return (
    <header>
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-2 lg:px-6">
        <a className="block text-gray dark:text-teal-300" href="/">
          <span className="sr-only">Home</span>
          <Image
            className="h-8 w-auto"
            src={Icone}
            alt="Logo"
            width={32}
            height={32}
          />
        </a>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Global" className="hidden md:block">
            {mode === "default" && (
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <a
                    className="text-foreground/75 transition hover:text-foreground cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("pontuador");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Pontuador
                  </a>
                </li>
              </ul>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {mode === "admin" || mode === "voluntario" ? (
              <Navbar id={id} mode={mode} admin={admin} />
            ) : (
              <div className="hidden sm:flex sm:gap-4">
                <a
                  className="block rounded-md bg-primary px-5 py-2.5 text-sm text-center font-medium text-light transition hover:bg-primary-dark"
                  href="/enter"
                >
                  Entrar
                </a>

                <a
                  className="rounded-md bg-transparent px-5 py-2.5 text-sm text-center font-medium text-primary transition hover:bg-light-smoke"
                  href="/create-room"
                >
                  Criar
                </a>
              </div>
            )}

            {/* Toggle menu button */}
            <button
              className="block rounded-sm bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden dark:bg-gray-800 dark:text-white dark:hover:text-white/75"
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && mode === "default" && (
        <div className="md:hidden px-4 py-4 bg-white border-t border-gray-200 transtion">
          <ul className="space-y-2 text-sm">
            <li>
              <a
                className="block rounded-md bg-primary px-4 py-2 text-sm font-medium text-center text-light transition hover:bg-primary-dark"
                href="/enter"
              >
                Entrar
              </a>
            </li>
            <li>
              <a
                className="block rounded-md border border-primary text-primary px-4 py-2 text-sm font-medium text-center transition hover:bg-light-smoke"
                href="/create-room"
              >
                Criar
              </a>
            </li>
            <li>
              <a
                className="block text-foreground/75 transition hover:text-foreground cursor-pointer text-center"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("pontuador");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    setIsMobileMenuOpen(false); // fecha o menu
                  }
                }}
              >
                Pontuador
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
