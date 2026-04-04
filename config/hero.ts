// /config/hero.ts

export const HERO_CONFIG = {
  fll: {
    badge: "Onde o LEGO ganham vida",
    titulo: "",
    descricao:
      "Planeje missões, analise pontuações e evolua sua estratégia na mesa.",
    imagem:
      "https://www.first-lego-league.org/assets/images/f/FLL_C_Robi_Detail_Girl_BG-ddda704b.jpg",
    ctaPrimario: {
      label: "Saiba Mais",
      href: "/fll/about",
    },
    ctaSecundario: {
      label: "Pontuar",
      href: "/fll/score/unearthed",
    },
  },

  obr: {
    badge: "Precisão em cada sensor",
    descricao:
      "Desenvolva lógica de resgate, navegação e sensores com eficiência.",
    imagem:
      "https://obr.robocup.org.br/wp-content/uploads/2026/03/Resgate-OBR-1-1024x683.jpg",
    ctaPrimario: {
      label: "LabTest",
      href: "/obr/dashboard",
    },
    ctaSecundario: {
      label: "Saiba Mais",
      href: "/obr/resgate",
    },
  },
};