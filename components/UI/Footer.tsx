import Link from "next/link";
import pkg from "@/package.json";
import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
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
                  Eventos ao vivo
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h3 className="footer-title">Atualizações</h3>
              <p className="text-sm text-base-content/70">
                Fique por dentro das novidades da plataforma
              </p>
              <Link href="/news" className="link link-hover text-sm mt-2 block">
                Ver notícias
              </Link>
              <Link href="/changelog" className="link link-hover text-sm mt-2 block">
                Ver notas de versão
              </Link>
            </div>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="footer-title">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="link link-hover">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/help" className="link link-hover">
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

          {/* Competições */}
          <div>
            <h3 className="footer-title">Competições</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/fll" className="link link-hover">
                  FIRST® LEGO® League
                </Link>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="footer-title">Temporadas FIRST®</h3>
              <ul className="space-y-2 text-sm">
                <li className="opacity-70">
                  FIRST® AGE™
                </li>
                <li>
                  <Link href="/robostage-canopy" className="link link-hover text-sm">
                    FIRST® CANOPY™
                  </Link>
                </li>
              </ul>
            </div>
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
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/legal/terms" className="link link-hover">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="link link-hover">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
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
