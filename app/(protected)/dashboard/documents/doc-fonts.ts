import { Caveat, Inter, JetBrains_Mono, Merriweather } from "next/font/google";

// Fontes do seletor do editor. `preload: false`: os arquivos só são baixados
// quando algum texto da página usa a fonte — não pesam no carregamento.
const sans = Inter({ subsets: ["latin"], variable: "--font-doc-sans", display: "swap", preload: false });
const serif = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-doc-serif",
  display: "swap",
  preload: false,
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-doc-mono", display: "swap", preload: false });
const hand = Caveat({ subsets: ["latin"], variable: "--font-doc-hand", display: "swap", preload: false });

/** Classes que definem as variáveis --font-doc-* usadas em utils/stagebook/doc-fonts.ts. */
export const docFontVariables = [sans.variable, serif.variable, mono.variable, hand.variable].join(" ");
