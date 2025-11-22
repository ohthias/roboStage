
export type DiagramType = "Mapa Mental" | "Ishikawa" | "5W2H" | "Flowchart" | "SWOT" | "Business Model Canvas";

export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  // Border Options
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  type?: "root" | "branch" | "leaf" | "process" | "decision" | "start-end" | "label" | "text" | "sticker" | "zone";
  shape?: "rect" | "circle" | "diamond" | "pill" | "triangle" | "hexagon" | "parallelogram" | "cylinder" | "cloud" | "star" | "document";
  groupId?: string; 
  locked?: boolean; // If true, node cannot be dragged
  hidden?: boolean; // If true, node is not rendered
  isTemplate?: boolean; // If true, belongs to the diagram background structure
  width?: number;
  height?: number;
  backgroundImage?: string; // URL or Base64 data for image stickers
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  color?: string;
  thickness?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  shape?: 'straight' | 'curved' | 'step';
  animated?: boolean;
  startMarker?: 'none' | 'arrow' | 'circle';
  endMarker?: 'none' | 'arrow' | 'circle';
}

export interface PathLayer {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  thickness: number;
  opacity: number;
}

export interface DiagramContent {
  nodes: Node[];
  connections: Connection[];
  paths: PathLayer[];
  zoom: number;
  font: string;
  fontSize: number;
  fontColor: string;
}

export interface AIPromptRequest {
  topic: string;
  type: DiagramType;
}

export interface AIResponse {
  nodes: Node[];
  connections: Connection[];
}