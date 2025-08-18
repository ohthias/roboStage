import pkg from "@/package.json";

export function Footer() {
  return (
    <footer className="footer flex flex-col sm:flex-row justify-between bg-neutral text-neutral-content items-center p-6 gap-4 text-center sm:text-left">
      {/* Logo e Copyright */}
      <aside className="flex flex-col sm:flex-row items-center gap-3">
        <img src="/images/logos/Icone.png" alt="logo" className="w-12 h-12" />
        <p className="text-sm">
          <span className="block sm:inline">
            Copyright © {new Date().getFullYear()} - Todos os direitos
            reservados
          </span>
          <br className="sm:hidden" />
          <span className="text-xs opacity-75">roboStage v{pkg.version}</span>
        </p>
      </aside>

      {/* Links */}
      <nav className="flex gap-6 items-center">
        {/* Repo principal */}
        <a
          href="https://github.com/ohthias/roboStage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:text-primary transition-colors"
          title="Repositório no GitHub"
        >
          <i className="fi fi-brands-github"></i>
        </a>

        {/* Wiki */}
        <a
          href="https://github.com/ohthias/roboStage/wiki"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:text-primary transition-colors"
          title="Documentação na Wiki"
        >
          <i className="fi fi-br-book-alt"></i>
        </a>

        <a
          href="https://patreon.com/roboStage"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-warning btn-outline gap-2"
          title="Apoie no Patreon"
          style={{ lineHeight: 0 }}
        >
          <i className="fi fi-brands-patreon"></i>
          Apoiar
        </a>
      </nav>
    </footer>
  );
}
