import type { SVGProps } from "react";

type FTCIconProps = SVGProps<SVGSVGElement> & {
  /** Quando true, o emblema usa currentColor em vez de vermelho/azul */
  mono?: boolean;
};

export function FTCIcon({ mono = false, ...props }: FTCIconProps) {
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

      {/* Corpo do robô */}
      <path d="M6.5 11.5h11l1.5 3-1.5 3h-11L5 14.5Z" />
      <path d="M10 14.5h4" />

      {/* Rodas + eixo */}
      <rect x="3" y="16" width="2.2" height="4.5" rx="1.1" />
      <rect x="18.8" y="16" width="2.2" height="4.5" rx="1.1" />
      <path d="M7.5 20h9" />
    </svg>
  );
}