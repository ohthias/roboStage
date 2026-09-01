type License = {
  name: string;
  license: string;
  author: string;
  description: string;
  repository?: string;
  official?: string;
};

export const licenses: Record<string, License[]> = {
  "MIT License": [
    {
      name: "@heroicons/react",
      license: "MIT",
      author: "Tailwind Labs",
      description: "Ícones SVG desenvolvidos pela equipe Tailwind Labs.",
      repository: "https://github.com/tailwindlabs/heroicons",
    },
    {
      name: "@tailwindcss/typography",
      license: "MIT",
      author: "Tailwind Labs",
      description:
        "Plugin de tipografia para Tailwind CSS utilizado na renderização de conteúdo.",
      repository:
        "https://github.com/tailwindlabs/tailwindcss-typography",
    },
    {
      name: "@vercel/analytics",
      license: "MIT",
      author: "Vercel",
      description:
        "Integração de métricas e análises de utilização da aplicação.",
      repository: "https://github.com/vercel/analytics",
    },
    {
      name: "file-saver",
      license: "MIT",
      author: "Eli Grey",
      description:
        "Biblioteca utilizada para salvar arquivos no navegador.",
      repository: "https://github.com/eligrey/FileSaver.js",
    },
    {
      name: "framer-motion",
      license: "MIT",
      author: "Motion",
      description:
        "Biblioteca de animações e interações para interfaces React.",
      repository: "https://github.com/motiondivision/motion",
    },
    {
      name: "gray-matter",
      license: "MIT",
      author: "Jon Schlinkert and contributors",
      description:
        "Parser utilizado para trabalhar com front matter em arquivos de conteúdo.",
      repository: "https://github.com/jonschlinkert/gray-matter",
    },
    {
      name: "html2canvas-pro",
      license: "MIT",
      author: "Yorick Shan",
      description:
        "Biblioteca utilizada para renderização de elementos HTML em canvas.",
      repository: "https://github.com/yorickshan/html2canvas-pro",
    },
    {
      name: "jspdf",
      license: "MIT",
      author: "James Hall / yWorks GmbH",
      description:
        "Biblioteca utilizada para geração de documentos PDF no navegador.",
      repository: "https://github.com/parallax/jsPDF",
    },
    {
      name: "jspdf-autotable",
      license: "MIT",
      author: "Simon Bengtsson and contributors",
      description:
        "Plugin para criação de tabelas em documentos PDF gerados pelo jsPDF.",
      repository: "https://github.com/simonbengtsson/jsPDF-AutoTable",
    },
    {
      name: "nanoid",
      license: "MIT",
      author: "Andrey Sitnik and contributors",
      description:
        "Gerador de identificadores únicos compactos.",
      repository: "https://github.com/ai/nanoid",
    },
    {
      name: "next",
      license: "MIT",
      author: "Vercel",
      description:
        "Framework React utilizado como base para a aplicação RoboStage.",
      repository: "https://github.com/vercel/next.js",
    },
    {
      name: "postcss",
      license: "MIT",
      author: "PostCSS contributors",
      description:
        "Ferramenta utilizada no processamento e transformação de CSS.",
      repository: "https://github.com/postcss/postcss",
    },
    {
      name: "react",
      license: "MIT",
      author: "Meta Platforms, Inc. and contributors",
      description:
        "Biblioteca principal utilizada para construção da interface do RoboStage.",
      repository: "https://github.com/facebook/react",
    },
    {
      name: "react-dom",
      license: "MIT",
      author: "Meta Platforms, Inc. and contributors",
      description:
        "Integração do React com o DOM do navegador.",
      repository: "https://github.com/facebook/react",
    },
    {
      name: "react-markdown",
      license: "MIT",
      author: "Titus Wormer and contributors",
      description:
        "Renderização de conteúdo Markdown como componentes React.",
      repository: "https://github.com/remarkjs/react-markdown",
    },
    {
      name: "recharts",
      license: "MIT",
      author: "Recharts contributors",
      description:
        "Biblioteca de visualização de dados e gráficos para React.",
      repository: "https://github.com/recharts/recharts",
    },
    {
      name: "remark-gfm",
      license: "MIT",
      author: "Titus Wormer and contributors",
      description:
        "Suporte à sintaxe GitHub Flavored Markdown.",
      repository: "https://github.com/recharts/recharts",
    },
    {
      name: "uuid",
      license: "MIT",
      author: "Robert Kieffer and contributors",
      description:
        "Geração de identificadores UUID.",
      repository: "https://github.com/uuidjs/uuid",
    },
  ],

  "ISC License": [
    {
      name: "@lucide/lab",
      license: "ISC",
      author: "Lucide",
      description:
        "Coleção experimental de ícones utilizada na interface.",
      repository: "https://github.com/lucide-icons/lucide",
    },
    {
      name: "lucide-react",
      license: "ISC",
      author: "Lucide",
      description:
        "Biblioteca de ícones utilizada em componentes da interface.",
      repository: "https://github.com/lucide-icons/lucide",
    },
  ],

  "Apache License 2.0": [
    {
      name: "@vercel/speed-insights",
      license: "Apache-2.0",
      author: "Vercel",
      description:
        "Ferramenta de monitoramento de performance da aplicação.",
      repository: "https://github.com/vercel/speed-insights",
    },
    {
      name: "jszip",
      license: "Apache-2.0",
      author: "JSZip",
      description:
        "Biblioteca utilizada para criação e manipulação de arquivos ZIP.",
      repository: "https://github.com/Stuk/jszip",
    },
  ],

  "Mozilla Public License 2.0": [
    {
      name: "next-mdx-remote",
      license: "MPL-2.0",
      author: "HashiCorp and contributors",
      description:
        "Biblioteca utilizada para renderização de conteúdo MDX no Next.js.",
      repository: "https://github.com/hashicorp/next-mdx-remote",
      official: "https://www.mozilla.org/en-US/MPL/2.0/",
    },
  ],
};

/**
 * Recursos visuais de terceiros
 */

export const flaticon: License = {
  name: "@flaticon/flaticon-uicons",
  license: "Flaticon License",
  author: "Flaticon / Freepik Company",
  description:
    "Biblioteca de UIcons utilizada em partes da interface do RoboStage. A utilização está sujeita aos termos e condições da Flaticon e aos requisitos de atribuição aplicáveis.",
  repository:
    "https://github.com/freepik-company/flaticon-uicons",
  official: "https://www.flaticon.com/uicons",
};

export const storyset: License = {
  name: "Storyset",
  license: "Storyset / Freepik License",
  author: "Storyset / Freepik Company",
  description:
    "Ilustrações utilizadas em partes da interface e dos materiais visuais do RoboStage. O uso das ilustrações está sujeito à licença, aos termos de uso e aos requisitos de atribuição aplicáveis da Storyset / Freepik.",
  official: "https://storyset.com/",
};

export const magnific: License = {
  name: "Magnific",
  license: "Third-Party Creative Tool",
  author: "Magnific",
  description:
    "Ferramenta de terceiros utilizada no processo de geração, aprimoramento, transformação e processamento de determinadas ilustrações e recursos visuais do RoboStage. O uso do Magnific não implica, por si só, transferência de propriedade ou concessão de licença sobre todos os resultados produzidos. Os direitos aplicáveis a cada recurso podem depender dos termos do Magnific, dos materiais de origem ou referência utilizados e dos direitos de terceiros eventualmente envolvidos.",
  official: "https://magnific.ai/",
};

/**
 * Recursos visuais utilizados pelo RoboStage.
 *
 * Estes recursos não fazem parte das licenças de software open-source
 * acima e estão sujeitos aos seus próprios termos, licenças e direitos.
 */
export const visualAssets: License[] = [
  flaticon,
  storyset,
  magnific,
];