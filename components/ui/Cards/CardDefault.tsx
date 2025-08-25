interface CardButton {
    label: string;
    onClick: () => void;
}

type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
    bgUrl?: string;
    title: string;
    badge?: string;
    description: string;
    buttons: CardButton[];
    size?: CardSize;
}

const sizeClasses: Record<CardSize, string> = {
    sm: 'card-sm',
    md: 'card-md',
    lg: 'card-lg',
};

export default function CardDefault({
    bgUrl,
    title,
    badge,
    description,
    buttons,
    size = 'md',
}: CardProps) {
    return (
        <div className={`card bg-base-100 shadow-sm flex flex-col justify-between border border-base-200 ${sizeClasses[size]} min-w-50`}>
            {bgUrl && (
                <figure>
                    <img src={bgUrl} alt={title} />
                </figure>
            )}

            <div className="card-body">
                <div>
                    <h2 className="card-title">
                        {title}
                        {badge && <div className="badge badge-secondary">{badge}</div>}
                    </h2>
                    <p>{description}</p>
                </div>

                <div className="card-actions justify-end">
                    {buttons.map((btn, index) => (
                        <button
                            key={index}
                            onClick={btn.onClick}
                            className="btn btn-secondary btn-soft btn-sm"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
