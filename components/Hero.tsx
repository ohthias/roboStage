import FundoPadrao from "@/public/images/fundoPadrao.gif";

export function Hero() {
  return (
    <div
      className="hero h-[calc(100vh-80px)] relative overflow-hidden"
      style={{ backgroundImage: `url(${FundoPadrao.src})` }}
    >
      <div className="hero-overlay bg-black/50"></div>

      <div className="hero-content text-neutral-content flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-6 lg:space-y-0">
        <div className="max-w-md text-center lg:text-left">
          <h1 className="mb-5 text-4xl lg:text-5xl font-bold text-white">
            Robo<strong className="text-primary">Stage</strong>
          </h1>
          <p className="mb-5 text-lg text-white">
            Facilitando sua jornada na robótica
          </p>
        </div>

        <div className="hidden lg:block w-px h-40 bg-white/50"></div>

        {/* Imagem */}
        <div className="max-w-50 lg:max-w-xs">
          <img
            src="https://www.cvrobotics.org/wp-content/uploads/2016/05/FIRSTLego_iconHorz_RGB_reverse.png"
            className="w-full h-auto"
            alt="FLL Logo"
          />
        </div>
      </div>
    </div>
  );
}
