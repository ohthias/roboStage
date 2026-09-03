import Image from "next/image";

interface SeasonBannerProps {
  logo: string;
  logoAlt: string;
  title: string;
  description: string;
  edition?: string;
  organization?: string;
  className?: string;
}

export function SeasonBanner({
  logo,
  logoAlt,
  title,
  description,
  edition = "FUTURE EDITION",
  organization = "FIRST LEGO League",
  className = "",
}: SeasonBannerProps) {
  return (
    <section
      className={`mt-8 overflow-hidden border border-base-content/10 bg-base-100 ${className} rounded-2xl shadow-sm`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-6 sm:p-8 lg:p-10">
        {/* Logo */}
        <div className="shrink-0 flex items-center justify-center">
          <Image
            src={logo}
            alt={logoAlt}
            width={256}
            height={256}
            className="w-32 sm:w-38 lg:w-48 h-auto object-contain"
          />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-base-content">
            {title}
            <span className="text-primary">™</span>
          </h1>

          <p className="mt-3 max-w-2xl text-base sm:text-md lg:text-lg leading-relaxed text-base-content/60">
            {description}
          </p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-base-content/10 px-6 sm:px-8 py-3 text-xs font-mono uppercase tracking-wider text-base-content/40">
        <span>{organization} - {edition}</span>
        <span className="text-primary">{title}™</span>
      </div>
    </section>
  );
}