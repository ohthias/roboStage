interface CardButton {
  label: string;
  onClick: () => void;
}

type CardSize = 'sm' | 'md' | 'lg';

interface PropCardOverlay {
  bgUrl?: string;
  title: string;
  description: string;
  buttons?: CardButton[];
  badge?: string; 
  size?: CardSize;
}

const sizeClasses: Record<CardSize, string> = {
    sm: 'card-sm',
    md: 'card-md',
    lg: 'card-lg',
};

export default function CardOverlay({
  bgUrl,
  title,
  description,
  buttons = [],
  badge,
  size = 'md'
}: PropCardOverlay) {
  return (
    <div className={`card bg-base-100 image-full w-96 shadow-lg flex flex-col justify-between ${sizeClasses[size]} min-w-50`}>
      {bgUrl && (
        <figure>
          <img
            src={bgUrl}
            alt={title}
            className="object-cover blur-sm"
          />
        </figure>
      )}

      <div className="card-body">
        <h2 className="card-title flex items-center justify-between">
          <span>{title}</span>
          {badge && <div className="badge badge-secondary">{badge}</div>}
        </h2>
        <p>{description}</p>

        {buttons.length > 0 && (
          <div className="card-actions justify-end mt-2 flex flex-wrap gap-2">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.onClick}
                className="btn btn-primary btn-sm"
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
