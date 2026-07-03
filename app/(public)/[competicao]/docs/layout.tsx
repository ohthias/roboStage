import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentações | RoboStage",
  description: "Central de documentações das competições RoboStage.",
};

export default function LayoutDocs({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
