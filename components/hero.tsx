"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/ui/navbar";

interface HeroProps {
  admin?: string;
}

export default function Hero({ admin }: HeroProps) {
  const pathname = usePathname();

  const pathParts = pathname.split("/").filter(Boolean);
  const id = pathParts[0] || undefined;
  const mode = pathParts[1] || "default";

  return (
    <header>
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <a className="block text-gray dark:text-teal-300" href="/">
          <span className="sr-only">Home</span>
          <Image
            className="h-8 w-auto"
            src="/icone.png"
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
                    className="text-foreground/75 transition hover:text-foreground"
                    href="/"
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
              <div className="sm:flex sm:gap-4">
                <a
                  className="block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-light transition hover:bg-primary-dark"
                  href="/enter"
                >
                  Entrar
                </a>

                <a
                  className="hidden rounded-md bg-transparent px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-light-smoke sm:block"
                  href="/create-room"
                >
                  Criar
                </a>
              </div>
            )}

            <button className="block rounded-sm bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden dark:bg-gray-800 dark:text-white dark:hover:text-white/75">
              <span className="sr-only">Toggle menu</span>
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
    </header>
  );
}
