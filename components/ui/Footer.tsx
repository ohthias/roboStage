import pkg from "@/package.json";

export function Footer() {
  return (
    <>
      <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
        <aside>
          <img src="/images/logos/Icone.png" alt="logo" className="w-12 h-12" />
          <p className="border-b border-base-200 pb-2">
            RoboStage
            <br />
            Facilitando a jornada na robótica
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
          <h6 className="footer-title">Sobre</h6>
          <a className="link link-hover" href="/about">Sobre o projeto</a>
          <a
            href="https://github.com/ohthias/roboStage/wiki"
            className="link link-hover"
          >
            Wiki
          </a>
          <a className="link link-hover" href="/help">Dúvidas</a>
          <a className="link link-hover" href="/fll-docs">Documentações UNEARTHED</a>
          <nav className="mt-4 flex flex-col">
            <h6 className="footer-title">Comunidade</h6>
            <a className="link link-hover" href="https://www.instagram.com/robo.stage/">Instagram</a>
          </nav>
        </nav>
        <nav>
          <h6 className="footer-title">Tutoriais</h6>
          <a className="link link-hover" href="#">QuickBrick Studio Aplicado</a>
          <a className="link link-hover" href="#">LabTest na prática</a>
          <a className="link link-hover" href="#">InnoLab - Documentando seu projeto</a>
          <a className="link link-hover" href="#">ShowLive: Básico</a>
          <a className="link link-hover" href="#">ShowLive: Avançado</a>
        </nav>
        <nav>
          <h6 className="footer-title">Legal</h6>
          <a className="link link-hover" href="https://github.com/ohthias/roboStage/wiki/terms">Termos de Serviço</a>
          <a className="link link-hover" href="https://github.com/ohthias/roboStage/wiki/privacy">Política de Privacidade</a>
          <a className="link link-hover" href="https://github.com/ohthias/roboStage/wiki/cookies">Política de Cookies</a>
          <nav className="mt-4 flex flex-col">
            <h6 className="footer-title">Suporte</h6>
            <a className="link link-hover" href="https://github.com/ohthias/roboStage/issues">Reportar bugs</a>
          </nav>
        </nav>
        <nav>
          <h6 className="footer-title">Desenvolvedores</h6>
          <a className="link link-hover" href="https://github.com/ohthias">@ohthias</a>
          <nav className="mt-4 flex flex-col">
            <h6 className="footer-title">Parceiros</h6>
            <a className="link link-hover" href="https://github.com/">@VMRT</a>
            <a className="link link-hover" href="https://github.com/G-Tomboly/">@G-Tomboly</a>
          </nav>
        </nav>
      </footer>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>
            Copyright © {new Date().getFullYear()} - Todos os direitos
            reservados
            <br className="sm:hidden" />
            <span className="text-xs opacity-75 ml-1">roboStage v{pkg.version}</span>
          </p>
        </aside>
      </footer>
    </>
  );
}
