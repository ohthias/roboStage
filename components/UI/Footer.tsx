import pkg from "@/package.json";
import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="bg-base-200 text-base-content">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4 items-start">
        
        {/* BRAND */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/images/logos/Icone.png" alt="logo" className="w-10 h-10" />
            <Logo logoSize="sm" />
          </div>

          <p className="text-sm opacity-70 leading-relaxed max-w-xs">
            Planeje, teste e evolua suas estratégias na FLL com uma plataforma pensada para equipes competitivas.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <a
              href="https://github.com/ohthias/roboStage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl opacity-70 hover:opacity-100 hover:text-primary transition"
            >
              <i className="fi fi-brands-github"></i>
            </a>

            <a
              href="https://www.instagram.com/robo.stage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl opacity-70 hover:opacity-100 hover:text-primary transition"
            >
              <i className="fi fi-brands-instagram"></i>
            </a>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <div>
          <p className="font-semibold mb-4 text-sm uppercase tracking-wide opacity-60">
            Navegação
          </p>

          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-primary transition">Início</a></li>
            <li><a href="/fll/about" className="hover:text-primary transition">Sobre</a></li>
            <li><a href="/fll/help" className="hover:text-primary transition">Ajuda</a></li>
          </ul>
        </div>

        {/* COMPETIÇÕES */}
        <div>
          <p className="font-semibold mb-4 text-sm uppercase tracking-wide opacity-60">
            Competições
          </p>

          <ul className="space-y-2 text-sm">
            <li><a href="/fll" className="hover:text-primary transition">FIRST LEGO League</a></li>
          </ul>

          <p className="font-semibold mt-6 mb-3 text-sm uppercase tracking-wide opacity-60">
            Legal
          </p>

          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/ohthias/roboStage/wiki/Pol%C3%ADtica-de-Privacidade"
                className="hover:text-primary transition"
                target="_blank"
              >
                Política de Privacidade
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mt-6 mb-3 text-sm uppercase tracking-wide opacity-60">
            Equipes
          </p>

          <ul className="space-y-2 text-sm">
            <li><span className="opacity-70">VMRT</span></li>
            <li><span className="opacity-70">Sharks FLL</span></li>
          </ul>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-base-300" />

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <p className="opacity-70 text-center md:text-left">
          © {new Date().getFullYear()} RoboStage. Todos os direitos reservados.
        </p>

        <div className="flex items-center gap-4 opacity-60 text-xs">
          <span>v{pkg.version}</span>
          <span className="hidden md:inline">•</span>
          <span>Feito para Robótica</span>
        </div>
      </div>
    </footer>
  );
}