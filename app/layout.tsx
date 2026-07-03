import type { Metadata } from "next";
import { Roboto } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://robostage.com.br"),
  alternates: {
    canonical: "/",
  },
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
        <UserProvider>
          <ToastProvider>{children}</ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
