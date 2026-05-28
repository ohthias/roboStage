import type { FolderIconName } from "./folder-icons";

export type FolderTemplate = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: FolderIconName;
  tags: string[];
};

export const FOLDER_TEMPLATES: FolderTemplate[] = [
  {
    id: "fll",
    name: "Projeto FLL",
    description: "Estratégias, missões e testes",
    color: "#3b82f6",
    icon: "trophy",
    tags: ["fll", "robotica"],
  },

  {
    id: "study",
    name: "Área de Estudos",
    description: "Materiais e anotações",
    color: "#8b5cf6",
    icon: "study",
    tags: ["estudos"],
  },

  {
    id: "engineering",
    name: "Engenharia",
    description: "Projetos técnicos",
    color: "#f97316",
    icon: "engineering",
    tags: ["hardware", "projetos"],
  },

  {
    id: "tests",
    name: "Laboratório",
    description: "Área de testes",
    color: "#10b981",
    icon: "tests",
    tags: ["qa", "benchmark"],
  },

  {
    id: "docs",
    name: "Documentação",
    description: "Documentos e especificações",
    color: "#6366f1",
    icon: "docs",
    tags: ["docs"],
  },
];
