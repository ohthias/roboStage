import type { Node, Connection, DiagramType } from "@/types/InnoLabType";

export function generateInitialNodes(type: DiagramType): {
  nodes: Node[];
  connections: Connection[];
} {
  switch (type) {
    case "Mapa Mental":
      return generateMindMapModel();
    case "Ishikawa":
      return generateIshikawaModel();
    case "5W2H":
      return generate5W2HModel();
    default:
      return { nodes: [], connections: [] };
  }
}

const generateMindMapModel = (): {
  nodes: Node[];
  connections: Connection[];
} => {
  const central: Node = {
    id: "1",
    x: 400,
    y: 300,
    text: "Ideia Central",
    width: 160,
    height: 70,
    shape: "ellipse",
    level: 0,
  };
  const branches: Node[] = [
    {
      id: "2",
      x: 650,
      y: 200,
      text: "Tópico 1",
      width: 140,
      height: 60,
      shape: "ellipse",
      level: 1,
    },
    {
      id: "3",
      x: 650,
      y: 400,
      text: "Tópico 2",
      width: 140,
      height: 60,
      shape: "ellipse",
      level: 1,
    },
    {
      id: "4",
      x: 150,
      y: 200,
      text: "Tópico 3",
      width: 140,
      height: 60,
      shape: "ellipse",
      level: 1,
    },
    {
      id: "5",
      x: 150,
      y: 400,
      text: "Tópico 4",
      width: 140,
      height: 60,
      shape: "ellipse",
      level: 1,
    },
  ];
  const connections = branches.map((b) => ({ from: central.id, to: b.id }));
  return { nodes: [central, ...branches], connections };
};

const generateIshikawaModel = (): {
  nodes: Node[];
  connections: Connection[];
} => {
  const main: Node = {
    id: "1",
    x: 900,
    y: 300,
    text: "Efeito (Problema)",
    width: 180,
    height: 60,
    shape: "rectangle",
  };

  const categories: Node[] = [
    {
      id: "c1",
      x: 650,
      y: 150,
      text: "Método",
      width: 150,
      height: 50,
      shape: "rectangle",
    },
    {
      id: "c2",
      x: 400,
      y: 450,
      text: "Máquina",
      width: 150,
      height: 50,
      shape: "rectangle",
    },
    {
      id: "c3",
      x: 150,
      y: 150,
      text: "Pessoal",
      width: 150,
      height: 50,
      shape: "rectangle",
    },
    {
      id: "c4",
      x: 150,
      y: 450,
      text: "Material",
      width: 150,
      height: 50,
      shape: "rectangle",
    },
    {
      id: "c5",
      x: 400,
      y: 150,
      text: "Medição",
      width: 150,
      height: 50,
      shape: "rectangle",
    },
    {
      id: "c6",
      x: 650,
      y: 450,
      text: "Ambiente",
      width: 150,
      height: 50,
      shape: "rectangle",
    },
  ];

  const subCauses: Node[] = [
    {
      id: "s1",
      text: "Sub-causa A",
      x: 50,
      y: 100,
      width: 120,
      height: 40,
      shape: "rectangle",
    },
    {
      id: "s2",
      text: "Sub-causa B",
      x: 50,
      y: 500,
      width: 120,
      height: 40,
      shape: "rectangle",
    },
  ];

  const nodes = [main, ...categories, ...subCauses];
  const connections = [
    ...categories.map((c) => ({ from: c.id, to: main.id })),
    { from: "s1", to: "c3" }, // Attached to Pessoal
    { from: "s2", to: "c4" }, // Attached to Material
  ];

  return { nodes, connections };
};

const generate5W2HModel = (): { nodes: Node[]; connections: Connection[] } => {
  const headers = [
    "O que",
    "Por que",
    "Onde",
    "Quando",
    "Quem",
    "Como",
    "Quanto",
  ];
  const startX = 50,
    startY = 100,
    colWidth = 140,
    rowHeight = 60,
    colGap = 5;
  const tableNodes: Node[] = [];

  headers.forEach((h, i) => {
    tableNodes.push({
      id: `h${i}`,
      x: startX + i * (colWidth + colGap),
      y: startY,
      width: colWidth,
      height: rowHeight,
      text: h,
      isHeader: true,
      shape: "rectangle",
    });
    tableNodes.push({
      id: `a${i}`,
      x: startX + i * (colWidth + colGap),
      y: startY + rowHeight,
      width: colWidth,
      height: rowHeight * 2,
      text: "Clique duas vezes para editar...",
      isHeader: false,
      shape: "rectangle",
    });
  });

  return { nodes: tableNodes, connections: [] };
};
