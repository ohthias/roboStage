export function Hero() {
    return (
        <div
            className="hero min-h-[500px]"
            style={{
                backgroundImage:
                    "url(https://info.firstinspires.org/hubfs/2026%20Season/Season%20Assets/FIRST-AGE-IG-blankpost.png)",
            }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content text-neutral-content space-x-4">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold text-base-content">Robo<strong className="text-primary">Stage</strong></h1>
                    <p className="mb-5 text-lg text-base-content">
                        Facilitando sua jornada na robótica
                    </p>
                    <button className="btn btn-secondary">Conheça agora!</button>
                </div>
                <div className="w-1 h-50 bg-neutral/50"></div>
                <div className="max-w-md">
                    <img src="/images/FLL_logo.png" className="w-42" />
                </div>

            </div>
        </div>
    )
}