import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rubrica FLL | RoboStage",
  description:
    "Ferramenta de avaliação interativa para competições de robótica, permitindo que juízes registrem pontuações, comentários e feedback de forma eficiente.",
};

export default function RubricLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
