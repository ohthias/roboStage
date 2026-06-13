type ModuleCardProps = {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  featured?: boolean;
};

export function ModuleCard({
  title,
  description,
  color,
  icon,
  featured = false,
}: ModuleCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-3xl
        ${color}
        text-white
        min-h-[320px]
        p-8 cursor-default
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl
        ${featured ? "lg:scale-105" : ""}
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -bottom-8 opacity-10 scale-[2.5]">
        {icon}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="transition-all duration-300 group-hover:scale-75 group-hover:-translate-y-4 origin-top-left">
          {icon}
        </div>

        <h3 className="mt-6 text-3xl font-black">{title}</h3>

        <div className="mt-auto">
          <div className="translate-y-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-sm leading-relaxed text-white/90">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}