// Conteúdo da página /roboticar.
// Todos os números vêm das fontes listadas em `sources`. Ao atualizar um dado,
// atualize também a fonte e a data de consulta.

export type Source = {
  id: string;
  label: string;
  publisher: string;
  url: string;
  date: string; // data da publicação ou da consulta
};

export const sources: Source[] = [
  {
    id: "obr-invista",
    label: "OBR: números por edição (2007–2023)",
    publisher: "Olimpíada Brasileira de Robótica",
    url: "https://obr.robocup.org.br/invista/",
    date: "consultado em out. 2026",
  },
  {
    id: "robocup-eventos",
    label: "Eventos nacionais: OBR, MNR, CBR e evento Robótica",
    publisher: "RoboCup Brasil",
    url: "https://www.robocup.org.br/wp/eventos/",
    date: "consultado em out. 2026",
  },
  {
    id: "agencia-brasil-2026",
    label: "Festival SESI de Educação leva campeonato de robótica para São Paulo",
    publisher: "Agência Brasil",
    url: "https://agenciabrasil.ebc.com.br/educacao/noticia/2026-03/festival-sesi-de-educacao-leva-campeonato-de-robotica-para-sao-paulo",
    date: "6 mar. 2026",
  },
  {
    id: "sesi-festival-2026",
    label: "Festival SESI de Educação 2026",
    publisher: "SESI",
    url: "https://www.sesi.portaldaindustria.com.br/para-voce/robotica/festival-sesi-de-educacao-2026",
    date: "consultado em out. 2026",
  },
  {
    id: "robocup-2025",
    label: "RoboCup 2025 começa em Salvador",
    publisher: "Olhar Digital",
    url: "https://olhardigital.com.br/2025/07/15/pro/robocup-2025-comeca-em-salvador-nesta-terca-feira-15/",
    date: "15 jul. 2025",
  },
  {
    id: "ifr-2026",
    label: "World Robotics 2026: Five million robots now operate in factories",
    publisher: "International Federation of Robotics (IFR)",
    url: "https://ifr.org/ifr-press-releases/news/five-million-robots-now-operate-in-factories-globally",
    date: "24 set. 2026",
  },
  {
    id: "first-2025",
    label: "FIRST Annual Report 2025 (temporada 2024–2025)",
    publisher: "FIRST",
    url: "https://www.firstinspires.org/hubfs/web/about/report/annual_report_2025.pdf",
    date: "2025",
  },
];

export type Stat = {
  value: string;
  unit?: string;
  label: string;
  detail: string;
  source: string; // id em `sources`
  tone: "primary" | "secondary" | "accent";
};

export const brazilStats: Stat[] = [
  {
    value: "+1",
    unit: "milhão",
    label: "de estudantes na OBR",
    detail: "Desde a primeira edição, em 2007, com mais de 3 mil escolas e 3 mil professores.",
    source: "obr-invista",
    tone: "primary",
  },
  {
    value: "198.297",
    label: "inscrições na OBR 2023",
    detail: "Cerca de 30 vezes as 6.500 inscrições da primeira edição.",
    source: "obr-invista",
    tone: "secondary",
  },
  {
    value: "+45",
    unit: "mil",
    label: "estudantes em torneios FIRST",
    detail: "Participaram de torneios FIRST no Brasil desde 2012, quando o SESI passou a organizá-los.",
    source: "agencia-brasil-2026",
    tone: "accent",
  },
  {
    value: "244",
    label: "vagas na etapa nacional SESI 2026",
    detail: "100 na FLL, 48 na FTC, 48 na FRC e 48 no STEM Racing, com cerca de 2,3 mil estudantes.",
    source: "sesi-festival-2026",
    tone: "primary",
  },
  {
    value: "+400",
    label: "trabalhos na MNR 2023",
    detail: "Na Mostra Nacional de Robótica, do fundamental à universidade. Os melhores concorrem a bolsas do CNPq.",
    source: "robocup-eventos",
    tone: "secondary",
  },
  {
    value: "+200",
    label: "equipes na CBR 2023",
    detail: "A Competição Brasileira de Robótica reúne universitários e pesquisadores em 16 categorias.",
    source: "robocup-eventos",
    tone: "accent",
  },
  {
    value: "45",
    label: "equipes brasileiras na RoboCup 2025",
    detail: "Maior delegação do mundial em Salvador, que reuniu 40 delegações e mais de 2 mil competidores.",
    source: "robocup-2025",
    tone: "primary",
  },
  {
    value: "≈4.300",
    label: "robôs industriais instalados em 2025",
    detail: "Alta de 38% no Brasil. Só o setor automotivo instalou cerca de 2.100 (+212%).",
    source: "ifr-2026",
    tone: "secondary",
  },
];

export const worldStats: Stat[] = [
  {
    value: "+853",
    unit: "mil",
    label: "estudantes em programas FIRST",
    detail: "Na temporada 2024–2025, em 114 países.",
    source: "first-2025",
    tone: "primary",
  },
  {
    value: "+650",
    unit: "mil",
    label: "na FIRST LEGO League",
    detail: "Somando Discover, Explore e Challenge, em 77 países.",
    source: "first-2025",
    tone: "accent",
  },
  {
    value: "5",
    unit: "milhões",
    label: "de robôs nas fábricas do mundo",
    detail: "Recorde em 2025, com mais de 600 mil novas instalações no ano.",
    source: "ifr-2026",
    tone: "secondary",
  },
];

// Inscrições totais na OBR por ano e cidade da etapa nacional.
// 2007 e 2008 são valores aproximados informados pela organização.
export const obrSeries: { year: number; total: number; host: string; approx?: boolean; virtual?: boolean }[] = [
  { year: 2007, total: 6500, host: "Florianópolis/SC", approx: true },
  { year: 2008, total: 12000, host: "Salvador/BA", approx: true },
  { year: 2009, total: 20544, host: "Brasília/DF" },
  { year: 2010, total: 30622, host: "São Bernardo do Campo/SP" },
  { year: 2011, total: 23704, host: "São João del Rei/MG" },
  { year: 2012, total: 29086, host: "Fortaleza/CE" },
  { year: 2013, total: 50900, host: "Fortaleza/CE" },
  { year: 2014, total: 68310, host: "São Carlos/SP" },
  { year: 2015, total: 91574, host: "Uberlândia/MG" },
  { year: 2016, total: 111287, host: "Recife/PE" },
  { year: 2017, total: 142287, host: "Curitiba/PR" },
  { year: 2018, total: 156813, host: "João Pessoa/PB" },
  { year: 2019, total: 204952, host: "Rio Grande/RS" },
  { year: 2020, total: 125527, host: "Virtual", virtual: true },
  { year: 2021, total: 163632, host: "Virtual", virtual: true },
  { year: 2022, total: 178426, host: "São Bernardo do Campo/SP" },
  { year: 2023, total: 198297, host: "Salvador/BA" },
];

export type Initiative = {
  name: string;
  region: "brasil" | "mundo";
  category: "Aprender" | "Dados" | "Ferramenta" | "Comunidade" | "Competição";
  competitions: string[];
  description: string;
  url: string;
  by: string;
};

export const initiatives: Initiative[] = [];

export const SUGGEST_URL =
  "https://github.com/ohthias/roboStage/issues/new?title=Roboticar%3A%20sugest%C3%A3o%20de%20iniciativa";
