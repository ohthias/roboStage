"use client";
import { useState } from "react";

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
        relative h-64 w-48 cursor-pointer rounded-2xl overflow-hidden 
        bg-cover bg-center shadow-md transition-all duration-300 rounded-box group
        ${
          selected
            ? "ring-4 ring-primary scale-105"
            : "hover:scale-105 hover:shadow-xl active:scale-95"
        }
      `}
    >
      {/* Nome embaixo aparece no hover OU se estiver selecionado */}
      <div
        className={`
          absolute bottom-0 w-full h-16 flex justify-center items-center text-lg font-semibold text-white
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