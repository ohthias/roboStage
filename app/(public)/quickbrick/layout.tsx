import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoboStage | QuickBrick Studio",
};

export default function QuickBrickLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <body>{children}</body>;
}
