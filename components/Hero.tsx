export function Hero() {
    return (
        <div
            className="hero min-h-[500px]"
            style={{
                backgroundImage:
                    "url(https://info.firstinspires.org/hubfs/2026%20Season/Season%20Assets/FIRST-AGE-IG-blankpost.png)",
            }}
        >
            <div className="hero-content text-neutral-content text-center">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold text-neutral">Robo<strong className="text-primary">Stage</strong></h1>
                    <p className="mb-5 text-lg text-neutral">
                        Facilitando sua jornada na robótica
                    </p>
                    <button className="btn btn-secondary">Conheça agora!</button>
                </div>
            </div>
        </div>
    )
}