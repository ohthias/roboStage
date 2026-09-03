import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LabTest",
  description:
    "Teste, analise e evolua seu robô com dados. O laboratório de análise do RoboStage.",
};

export default function LabTestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
