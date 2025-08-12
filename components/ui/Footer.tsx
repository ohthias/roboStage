export function Footer() {
    return (
        <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
            <aside className="grid-flow-col items-center">
                <img src="/Icone.png" alt="logo" className="w-12 h-12"/>
                <p>Copyright © {new Date().getFullYear()} - Todos os direitos Reservados</p>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <a href="https://github.com/ohthias/roboStage" style={{ lineHeight: 0 }} target="_blank" rel="noopener noreferrer" className="text-lg">
                    <i className="fi fi-brands-github"></i>
                </a>
            </nav>
        </footer>
    )
}