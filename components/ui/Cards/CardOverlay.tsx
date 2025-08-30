interface CardButton {
  label: string;
  onClick: () => void;
}

type CardSize = "sm" | "md" | "lg";

interface PropCardOverlay {
  bgUrl?: string;
  title: string;
  description: string;
  buttons?: CardButton[];
  badge?: string;
  size?: CardSize;
}

const sizeClasses: Record<CardSize, string> = {
  sm: "sm:w-64 sm:h-48",
  md: "sm:w-80 sm:h-56",
  lg: "sm:w-96 sm:h-64",
};

export default function CardOverlay({
  bgUrl,
  title,
  description,
  buttons = [],
  badge,
  size = "md",
}: PropCardOverlay) {
  return (
    <div
      className={`relative card shadow-lg flex flex-col justify-between overflow-hidden 
        w-full h-auto max-w-full mx-auto transition-all duration-300
        ${sizeClasses[size]}`}
    >
      {/* Background com overlay */}
      {bgUrl && (
        <div className="absolute inset-0">
          <img
            src={bgUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="card-body relative flex flex-col justify-between h-full p-3 sm:p-4">
        <h2 className="card-title flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-white text-base sm:text-lg">{title}</span>
          {badge && <div className="badge badge-secondary">{badge}</div>}
        </h2>

        <p className="text-sm sm:text-base mt-2">{description}</p>

        {buttons.length > 0 && (
          <div className="card-actions justify-end mt-4 flex flex-col sm:flex-row gap-2">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.onClick}
                className="btn btn-primary btn-sm w-full sm:w-auto"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}