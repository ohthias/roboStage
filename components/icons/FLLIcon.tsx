import type { SVGProps } from "react";

type FLLIconProps = SVGProps<SVGSVGElement> & {
  /** Quando true, o emblema usa currentColor em vez de vermelho/azul */
  mono?: boolean;
};

export function FLLIcon({ mono = false, ...props }: FLLIconProps) {
  const red = mono ? "currentColor" : "#E31B23";
  const blue = mono ? "currentColor" : "#0039A6";

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
      {/* Emblema FIRST */}
      <path d="M11 8.5 5 10l3-7 6.5 4-1.8 1.1" stroke={red} />
      <path d="m12.2 5.3 3.3-2.6 3.5 3.6-4.2 3.9-5-3.5 1.5-1.1" stroke={blue} />

      {/* Peça de LEGO (3 pinos) */}
      <rect x="5.5" y="12.2" width="3" height="1.8" rx="0.5" />
      <rect x="10.5" y="12.2" width="3" height="1.8" rx="0.5" />
      <rect x="15.5" y="12.2" width="3" height="1.8" rx="0.5" />
      <rect x="4" y="14" width="16" height="6.5" rx="1" />
    </svg>
  );
}