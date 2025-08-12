import { ThemeController } from "./ui/themeController";

export function Navbar() {
    return (
        <div className="navbar bg-base-100 shadow-sm px-2">
            <div className="flex-1">
                <a className="font-bold text-lg cursor-pointer" href="/">robo<span className="text-primary">Stage</span></a>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1 gap-5">
                    <li><a href="https://www.portaldaindustria.com.br/sesi/canais/torneio-de-robotica/first-lego-league-brasil/" target="_blank">Docs UNEARTHED</a></li>
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
                    <ThemeController />
                </ul>
            </div>
        </div>
    )
}