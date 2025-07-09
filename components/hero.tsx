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
              <ul className="flex items-center gap-6 text-sm">
                <li className="relative group">
                  <button
                    className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-light-smoke transition"
                    type="button"
                  >
                    <img
                      src="https://flagcdn.com/w20/br.png"
                      alt="Português"
                      width={20}
                      height={14}
                      className="inline-block mr-1"
                    />
                    <span>PT-BR</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-auto transition z-10">
                    <li>
                      <button className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-light-smoke transition cursor-pointer">
                        <img
                          src="https://flagcdn.com/w20/br.png"
                          alt="Português"
                          width={20}
                          height={14}
                          className="inline-block"
                        />
                        PT-BR
                      </button>
                    </li>
                    <li>
                      <button className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-light-smoke transition cursor-pointer">
                        <img
                          src="https://flagcdn.com/w20/us.png"
                          alt="Inglês"
                          width={20}
                          height={14}
                          className="inline-block"
                        />
                        Inglês
                      </button>
                    </li>
                  </ul>
                </li>
                {/* Dropdown de ferramentas */}
                <li className="relative group">
                  <button
                    className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-light-smoke transition"
                    type="button"
                  >
                    <span>Ferramentas</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <ul className="absolute left-0 mt-2 min-w-100 max-w-screen bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-auto transition z-10 flex flex-row px-4">
                    <li className="flex-1 px-2 py-4">                      
                      <div className="font-semibold mb-2 text-primary">Pontuadores FLL</div>
                      <hr className="mb-2 text-gray-200" />
                      <a
                        href="/tools/score#uneartherd"
                        rel="noopener noreferrer"
                        className="block px-2 py-1 hover:bg-light-smoke transition rounded text-foreground font-semibold"
                      >                        
                        UNEARTHED <span className="text-xs text-gray-500 font-normal">(2025-2026)</span>
                      </a>
                      <a
                        href="/tools/score#submerged"
                        rel="noopener noreferrer"
                        className="block px-2 py-1 hover:bg-light-smoke transition rounded text-foreground font-semibold"
                      >                        
                        Submerged <span className="text-xs text-gray-500 font-normal">(2024-2025)</span>
                      </a>
                    </li>
                    <li className="flex-1 px-2 py-4">                      
                      <div className="font-semibold mb-2 text-primary">
                        Estratégia de mesa
                      </div>
                      <hr className="mb-2 text-gray-200" />
                      <a
                        href="/tools/arena#uneartherd"
                        rel="noopener noreferrer"
                        className="block px-2 py-1 hover:bg-light-smoke transition rounded text-foreground font-semibold"
                      >                        
                        UNEARTHED <span className="text-xs text-gray-500 font-normal">(2025-2026)</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
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
