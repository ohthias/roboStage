import type { SVGProps } from "react";

type OBRIconProps = SVGProps<SVGSVGElement> & {
  /** Sem efeito (o ícone já é monocromático); existe para manter a API igual à dos outros ícones */
  mono?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OBRIcon({ mono, ...props }: OBRIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Linha a ser seguida (entra por baixo e faz curva à frente) */}
      <path d="M12 19v3.5" />
      <path d="M12 5c0-1.6 2.5-2.2 2.5-3.5" />

      {/* Chassi (vista de cima) */}
      <rect x="7" y="5" width="10" height="14" rx="2" />

      {/* 4 rodas */}
      <rect x="4.5" y="6" width="2.5" height="4" rx="1" />
      <rect x="4.5" y="14" width="2.5" height="4" rx="1" />
      <rect x="17" y="6" width="2.5" height="4" rx="1" />
      <rect x="17" y="14" width="2.5" height="4" rx="1" />

      {/* Sensores de linha na frente */}
      <path d="M9.5 7.8h.01M12 7.8h.01M14.5 7.8h.01" strokeWidth="2" />
    </svg>
  );
}