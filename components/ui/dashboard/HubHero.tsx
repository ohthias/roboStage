"use client";

export default function HubHero() {
    return (
        <section className="flex flex-col gap-8">
            {/* Banner de Boas-vindas */}
            <div className="hero rounded-xl shadow-lg bg-[linear-gradient(135deg,_#e7000b,_#ff4d4f,_#ffb3b3,_#e7000b)] bg-[length:300%_300%] animate-gradient">
                <div className="hero-overlay rounded-xl"></div>
                <div className="hero-content w-full flex flex-col items-start justify-start gap-4 text-left p-6 md:p-12">
                    <h1 className="text-4xl font-bold text-primary-content">
                        Bem-vindo ao seu Dashboard!
                    </h1>
                    <p className="text-lg text-primary-content max-w-2xl">
                        Sua hub central para{" "}
                        <span className="font-semibold">gerenciar</span>,{" "}
                        <span className="font-semibold">testar</span> e{" "}
                        <span className="font-semibold">criar</span> seus robôs e eventos de forma
                        fácil e divertida. 🚀
                    </p>
                </div>
            </div>
            <style jsx global>{`
                @keyframes gradientBG {
                    0% {
                    background-position: 0% 0%;
                    }
                    50% {
                    background-position: 100% 100%;
                    }
                    100% {
                    background-position: 0% 0%;
                    }
                }
                .animate-gradient {
                    animation: gradientBG 10s ease-in-out infinite;
                }
            `}</style>

            {/* Novidades da versão */}
            <div className="collapse collapse-arrow bg-secondary/10 border border-secondary shadow-md">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold text-secondary flex items-center gap-2">
                    🚀 Nova versão disponível! <span className="badge badge-secondary">v3.0.0</span>
                </div>
                <div className="collapse-content">
                    <p className="text-base-content/70 mb-4">
                        Confira as melhorias e novas funcionalidades:
                    </p>
                    <div className="flex flex-row gap-4 flex-wrap">
                        <div className="collapse collapse-plus bg-base-100 shadow colapse-open">
                            <input type="checkbox" />
                            <div className="collapse-title font-medium">🧪 LabTest</div>
                            <div className="collapse-content text-sm">
                                <p>
                                    Crie e documente testes para seu robô na temporada{" "}
                                    <span className="font-semibold">UNEARTHED</span> da FIRST LEGO
                                    League Challenge.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow colapse-open">
                            <input type="checkbox" />
                            <div className="collapse-title font-medium">🎨 StyleLab</div>
                            <div className="collapse-content text-sm">
                                <p>
                                    Aprimore seus eventos com temas personalizados ou utilize os{" "}
                                    <span className="font-semibold">presets já criados</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}