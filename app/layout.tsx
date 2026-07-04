import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./context/ToastContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://robostage.com.br"),

  title: {
    default: "RoboStage",
    template: "%s | RoboStage",
  },

  description:
    "RoboStage é uma plataforma para gestão de competições de robótica, equipes, rankings, transmissões ao vivo e eventos educacionais.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://robostage.com.br",
    siteName: "RoboStage",
    title: "RoboStage | Plataforma para Competições de Robótica",
    description:
      "Gerencie torneios, equipes, rankings e transmissões ao vivo em um só lugar.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "RoboStage",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RoboStage",
    description:
      "Plataforma para gestão de competições e equipes de robótica.",
    images: ["/images/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} antialiased`}>
        <Analytics />
        <SpeedInsights />
          <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
