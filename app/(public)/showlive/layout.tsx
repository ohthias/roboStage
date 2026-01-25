import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "RoboStage Showlive",
    description: "Transforme sua temporada em uma competição da FLL.",
    keywords: [
        "RoboStage",
        "Showlive",
        "FLL",
        "First Lego League",
        "Robótica Educacional",
        "Competição de Robótica",
    ],
    openGraph: {
        title: "RoboStage Showlive",
        description: "Transforme sua temporada em uma competição da FLL.",
    },
};

export default function ShowlivePageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}