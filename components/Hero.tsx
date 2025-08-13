export function Hero() {
  return (
    <div
      className="hero min-h-[500px] relative overflow-hidden bg-[#f3f3f3]"
      style={{ backgroundImage: "url(/fundoPadrao.gif)" }}
    >
      <div className="hero-overlay"> </div>
      <div className="hero-content text-neutral-content flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-6 lg:space-y-0">
        <div className="max-w-md text-center lg:text-left">
          <h1 className="mb-5 text-4xl lg:text-5xl font-bold text-white">
            Robo<strong className="text-primary">Stage</strong>
          </h1>
          <p className="mb-5 text-lg text-white">
            Facilitando sua jornada na robótica
          </p>
        </div>

        <div className="hidden lg:block w-px h-40 bg-primary/50"></div>

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
