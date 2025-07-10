"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  admin?: string;
}

export default function Hero({ admin }: HeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <span className="text-xl flex items-center space-x-2">
              <Image
                src="/Icone.png"
                alt="RoboStage Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
            </span>
          </Link>

          <div
            className="hidden md:block relative ml-4"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
              <span>Ferramentas</span>
              <i className="fi fi-rr-angle-small-down"></i>
            </button>

            {dropdownOpen && (
              <div className="absolute mt-0 w-max bg-white border border-gray-200 rounded shadow-lg z-10 flex flex-row gap-4 p-4">
                <div className="w-42">
                  <span className="block py-2 font-semibold text-red-600 text-left">
                    FLL Score
                  </span>
                  <hr className="border-gray-200" />
                  <Link href="/tools/score#uneartherd">
                    <span className="block py-2 hover:font-bold cursor-pointer capitalize transition text-sm">
                      uneartherd <i className="text-gray-500">(2025-2026)</i>
                    </span>
                  </Link>
                  <Link href="/tools/score#submerged">
                    <span className="block py-2 hover:font-bold cursor-pointer capitalize transition text-sm">
                      submerged <i className="text-gray-500">(2024-2025)</i>
                    </span>
                  </Link>
                </div>
                <div className="border-l border-gray-200 pl-2 min-w-42">
                  <span className="block py-2 font-semibold text-red-600 text-left">
                    QuickBrick Studio
                  </span>
                  <hr className="border-gray-200" />
                  <Link href="/tool/quickbrick#uneartherd">
                    <span className="block py-2 hover:font-bold cursor-pointer capitalize transition text-sm">
                      uneartherd <i className="text-gray-500">(2025-2026)</i>
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

          <div className="flex items-center space-x-4">
            <Link href="/enter">
              <button className="flex items-center px-4 py-2 text-sm bg-white text-gray-700 border border-gray-700 rounded hover:bg-red-700 hover:text-white hover:border-red-700 transition cursor-pointer">
                Entrar
              </button>
            </Link>
            <Link href="/create-room">
              <button className="flex items-center px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-600 cursor-pointer transition">
                Criar Evento
              </button>
            </Link>
          </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <i
              className={`fi ${
                menuOpen ? "fi-rr-cross" : "fi-rr-menu-burger"
              } text-xl text-gray-700`}
            ></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 space-y-1">
          <Link href="/opcao1">
            <span className="block px-4 py-2 hover:bg-gray-100">Opção 1</span>
          </Link>
          <Link href="/opcao2">
            <span className="block px-4 py-2 hover:bg-gray-100">Opção 2</span>
          </Link>
          <Link href="/login">
            <span className="block px-4 py-2 hover:bg-gray-100">Login</span>
          </Link>
          <Link href="/cadastro">
            <span className="block px-4 py-2 hover:bg-gray-100">Cadastro</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
