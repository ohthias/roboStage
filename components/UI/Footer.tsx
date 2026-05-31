import Link from "next/link";
import pkg from "@/package.json";
import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/images/logos/Icone.png"
                alt="RoboStage"
                className="h-10 w-10"
              />
              <Logo logoSize="sm" />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-base-content/70">
              Plataforma para equipes de robótica planejarem missões,
              organizarem estratégias e acompanharem sua evolução durante a
              temporada.
            </p>
            <div className="flex gap-2">
              <a
                href="https://github.com/ohthias/roboStage"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <i className="fi fi-brands-github text-lg" />
              </a>
              <a
                href="https://www.instagram.com/robo.stage"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <i className="fi fi-brands-instagram text-lg" />
              </a>
            </div>
            <div className="pt-2">
              <Link href="/auth/signup" className="btn btn-primary btn-sm">
                Criar conta gratuita
              </Link>
            </div>
          </div>
          {/* Produto */}
          <div>
            <h3 className="footer-title">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="link link-hover">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/fll/quickbrick" className="link link-hover">
                  QuickBrick Studio
                </Link>
              </li>
              <li>
                <Link href="/showlive" className="link link-hover">
                  ShowLive
                </Link>
              </li>
              <li>
                <Link href="/universe" className="link link-hover">
                  Universo
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="footer-title">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/fll/about" className="link link-hover">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/fll/help" className="link link-hover">
                  Ajuda
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="link link-hover">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h3 className="footer-title">Comunidade</h3>
            <ul className="space-y-2 text-sm">
              <li className="opacity-70">VMRT</li>
              <li className="opacity-70">Sharks FLL</li>
            </ul>
            <div className="mt-6">
              <h3 className="footer-title">Legal</h3>
              <a
                href="https://github.com/ohthias/roboStage/wiki/Pol%C3%ADtica-de-Privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover text-sm"
              >
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-base-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-base-content/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} RoboStage. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-3">
            <span>v{pkg.version}</span>
            <span>•</span>
            <span>Feito para a comunidade de robótica</span>
          </div>
        </div>
      </div>
    </footer>
  );
}