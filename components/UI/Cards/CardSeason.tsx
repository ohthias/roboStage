"use client";

interface CardSeasonProps {
  image: string;       // Logo da temporada
  name: string;        // Nome da temporada
  selected?: boolean;  // Temporada selecionada
  onSelect?: () => void;
}

export default function CardSeason({
  image,
  name,
  selected = false,
  onSelect,
}: CardSeasonProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative h-32 w-32 cursor-pointer rounded-2xl overflow-hidden
        flex flex-col items-center justify-center bg-white shadow-md transition-all duration-300
        ${selected 
          ? "ring-4 ring-primary scale-105 shadow-xl" 
          : "hover:scale-105 hover:shadow-lg active:scale-95"}
      `}
    >
      {/* Logo da temporada */}
      <img
        src={image}
        alt={name}
        className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
      />

      {/* Overlay com o nome */}
      <div
        className={`
          absolute bottom-0 left-0 w-full py-2 text-center text-sm font-semibold text-white
          bg-gradient-to-t from-black/70 to-transparent
          transition-opacity duration-300
          ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      >
        {name}
      </div>

      {/* Destaque animado no contorno */}
      {selected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
}