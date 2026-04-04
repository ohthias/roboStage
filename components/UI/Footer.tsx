import pkg from "@/package.json";
import Logo from "./Logo";

export function Footer() {
  return (
    <>
      <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
        <aside>
          <img src="/images/logos/Icone.png" alt="logo" className="w-12 h-12" />
          <Logo logoSize="sm" />
          <p className="border-b border-base-200 pb-2">
            Planeje. Teste. Organize. Evolua.
          </p>
          <a
            href="https://github.com/ohthias/roboStage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-primary transition-colors"
            title="Repositório no GitHub"
          >
            <i className="fi fi-brands-github"></i>
          </a>
        </aside>
        <nav>
          <p className="font-bold">Geral</p>
          <a href="/fll" className="hover:text-primary transition-colors">
            FLL
          </a>
          <a href="/fll/about" className="hover:text-primary transition-colors">
            Sobre
          </a>
          <a href="/fll/help" className="hover:text-primary transition-colors">
            Ajuda
          </a>
        </nav>
        <nav></nav>
        <nav></nav>
      </footer>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>
            Copyright © {new Date().getFullYear()} - Todos os direitos
            reservados
            <br className="sm:hidden" />
            <span className="text-xs opacity-75 ml-1">
              roboStage v{pkg.version}
            </span>
          </p>
        </aside>
      </footer>
    </>
  );
}
