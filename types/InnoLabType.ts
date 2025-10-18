
export type DiagramType = 'Mapa Mental' | 'Ishikawa' | '5W2H';

export interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fillColor?: string;
  textColor?: string;
  // Diagram-specific properties
  shape?: 'rectangle' | 'ellipse' | 'diamond';
  isHeader?: boolean; // For 5W2H
  level?: number; // For MindMap
}

export interface Connection {
  from: string;
  to: string;
}

export interface Point {
  x: number;
  y: number;
}
