export function Hero() {
    return (
        <div
            className="hero min-h-[500px] relative overflow-hidden"
            style={{
            background: "linear-gradient(120deg, #FFD600, #FF69B4)",
            }}
        >
            <div
            className="absolute inset-0 z-0 animate-gradient"
            style={{
                background: "linear-gradient(120deg, #FFD600, #FF69B4, #FFD600 80%)",
                backgroundSize: "200% 200%",
                animation: "gradientMove 6s ease-in-out infinite",
                opacity: 0.7,
            }}
            ></div>
            <div className="hero-overlay"></div>
            <div className="hero-content text-neutral-content flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-6 lg:space-y-0">
                {/* Texto */}
                <div className="max-w-md text-center lg:text-left">
                    <h1 className="mb-5 text-4xl lg:text-5xl font-bold text-base-content">
                        Robo<strong className="text-primary">Stage</strong>
                    </h1>
                    <p className="mb-5 text-lg text-base-content">
                        Facilitando sua jornada na robótica
                    </p>
                </div>

                {/* Divisor (mostra só no desktop) */}
                <div className="hidden lg:block w-px h-40 bg-neutral/50"></div>

                {/* Imagem */}
                <div className="max-w-50 lg:max-w-xs">
                    <img
                        src="/images/FLL_logo.png"
                        className="w-full h-auto"
                        alt="FLL Logo"
                    />
                </div>
            </div>
        </div>
    );
}