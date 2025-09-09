"use client";

interface CardTestProps {
  imageBackground: string;
  nameTest: string;
  selected?: boolean;
  onSelect?: () => void;
}

export default function CardTest({
  imageBackground,
  nameTest,
  selected = false,
  onSelect,
}: CardTestProps) {
  return (
    <div
      onClick={onSelect}
      style={{ backgroundImage: `url(${imageBackground})` }}
      className={`
        relative cursor-pointer rounded-2xl overflow-hidden 
        bg-cover bg-center shadow-md transition-all duration-300 rounded-box group
        h-40 w-32 sm:h-52 sm:w-40 md:h-64 md:w-48
        ${
          selected
            ? "ring-4 ring-primary scale-105"
            : "hover:scale-105 hover:shadow-xl active:scale-95"
        }
      `}
    >
      {/* Nome aparece no hover OU se estiver selecionado */}
      <div
        className={`
          absolute bottom-0 w-full h-14 flex justify-center items-center text-base sm:text-lg font-semibold text-white text-center px-2
          transition-all duration-500
          ${
            selected
              ? "opacity-100 bg-gradient-to-t from-primary/90 to-transparent translate-y-0"
              : "group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-gradient-to-t group-hover:from-primary/90 group-hover:to-transparent opacity-0 translate-y-8"
          }
        `}
      >
        {nameTest}
      </div>
    </div>
  );
}
