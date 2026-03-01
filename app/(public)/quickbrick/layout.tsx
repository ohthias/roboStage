import { Metadata } from "next";

export const metadata: Metadata = {
  title: " QuickBrick Studio",
  description: "QuickBrick Studio é um conjunto de ferramentas para documentação e análise do robô e missões da FLL.",
  keywords: [
    "QuickBrick Studio",
    "Robótica Educacional",
    "FLL",
    "Documentação de Robôs",
    "Análise de Missões"
  ],
};

export default function QuickBrickLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <body>{children}</body>;
}
