import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoboStage | FLL Score",
  description: "Pontuador da FIRST LEGO League Challenge",
};

export default function FllScoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="min-h-screen bg-base-100">{children}</section>;
}
