"use client";

interface CardSeasonProps {
  image: string; // logo da temporada
  name: string;  // nome da temporada
  selected?: boolean;
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
        relative h-28 w-28 cursor-pointer rounded-xl overflow-hidden
        flex items-center justify-center bg-white shadow-md transition-all duration-300 group
        ${selected ? "ring-4 ring-base-300 scale-105" : "hover:scale-105 hover:shadow-xl active:scale-95"}
      `}
    >
      {/* Imagem da temporada */}
      <img
        src={image}
        alt={name}
        className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
      />

      {/* Nome aparece só quando selecionado ou hover */}
      <div
        className={`
          absolute bottom-0 w-full py-1 text-center text-sm font-semibold text-base-content
          transition-all duration-500
          ${selected
            ? "opacity-100 bg-gradient-to-t from-base-300/90 to-transparent"
            : "opacity-0 group-hover:opacity-100 group-hover:bg-gradient-to-t group-hover:from-base-300/90 group-hover:to-transparent"}
        `}
      >
        {name}
      </div>
    </div>
  );
}
