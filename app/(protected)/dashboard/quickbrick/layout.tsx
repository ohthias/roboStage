import type { ReactNode } from "react";
import { Caveat, Instrument_Serif } from "next/font/google";
import "./notebook.css";

export const metadata = { title: "QuickBrick Studio · RoboStage" };

// Tipografia do caderno: serifada para títulos, "à mão" para rótulos.
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-qb-serif",
  display: "swap",
});
const hand = Caveat({ subsets: ["latin"], variable: "--font-qb-hand", display: "swap" });

export default function QuickBrickStudioLayout({ children }: { children: ReactNode }) {
  return <div className={`${serif.variable} ${hand.variable} min-h-full`}>{children}</div>;
}
