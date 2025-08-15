import { ThemeController } from "./ui/themeController";

export function Navbar() {
    return (
        <div className="navbar bg-base-100 shadow-sm px-2">
            {/* Lado esquerdo - Logo */}
            <div className="flex-1">
                <a className="font-bold text-lg cursor-pointer" href="/">
                    robo<span className="text-primary">Stage</span>
                </a>
            </div>

            {/* Lado direito - Menu grande (desktop) */}
            <div className="hidden lg:flex flex-none">
                <ul className="menu menu-horizontal px-1 gap-5">
                    <li>
                        <a
                            href="https://www.portaldaindustria.com.br/sesi/canais/torneio-de-robotica/first-lego-league-brasil/"
                            target="_blank"
                        >
                            Docs UNEARTHED
                        </a>
                    </li>
                    <li>
                        <details>
                            <summary>FLL Score</summary>
                            <ul className="bg-base-200 rounded-t-none p-2 z-20">
                                <li><a href="/tools/score#unearthed">UNEARTHED</a></li>
                                <li><a href="/tools/score#submerged">SUBMERGED</a></li>
                            </ul>
                        </details>
                    </li>
                    <li><a href="/tools/quickbrick">QuickBrick Studio</a></li>
                    <li><a href="/universe" className="btn btn-accent btn-outline">Embarcar em evento</a></li>
                    <li><a href="/join" className="btn btn-primary">Entrar</a></li>
                    <ThemeController />
                </ul>
            </div>

            {/* Menu mobile (hamburguer) */}
            <div className="lg:hidden flex-none dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </label>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                >
                    <li>
                        <a
                            href="https://www.portaldaindustria.com.br/sesi/canais/torneio-de-robotica/first-lego-league-brasil/"
                            target="_blank"
                        >
                            Docs UNEARTHED
                        </a>
                    </li>
                    <li>
                        <details>
                            <summary>FLL Score</summary>
                            <ul className="p-2 bg-base-200 rounded-t-none">
                                <li><a href="/tools/score#unearthed">UNEARTHED</a></li>
                                <li><a href="/tools/score#submerged">SUBMERGED</a></li>
                            </ul>
                        </details>
                    </li>
                    <li><a href="/tools/quickbrick">QuickBrick Studio</a></li>
                    <li><ThemeController /></li>
                </ul>
            </div>
        </div>
    );
}