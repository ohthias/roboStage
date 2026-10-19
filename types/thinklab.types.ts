export type ToolType = 
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'diamond'
  | 'ellipse'
  | 'cylinder'
  | 'parallelogram'
  | 'capsule'
  | 'document'
  | 'cloud'
  | 'arrow'
  | 'line'
  | 'bezier'
  | 'path'
  | 'freedraw'
  | 'text'
  | 'eraser';

export type FillStyle = 'none' | 'solid' | 'hachure' | 'cross-hatch' | 'dots' | 'zigzag';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type FontFamily = 'Patrick Hand' | 'Plus Jakarta Sans' | 'Fira Code';
export type FontSize = number;
export type TextAlign = 'left' | 'center' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  // Specific to freedraw, path, & custom shapes
  points?: Point[];
  // Specific to Bézier curves
  controlPoint1?: Point;
  controlPoint2?: Point;
  hasArrowhead?: boolean;
  isClosed?: boolean;
  // Styling
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number; // 0 (crisp) to 3 (very sketchy)
  opacity: number; // 0.1 to 1.0
  roundness?: boolean;
  // Text content
  text?: string;
  fontSize?: FontSize;
  fontFamily?: FontFamily;
  textAlign?: TextAlign;
  // Flowchart connectivity
  startBindingId?: string;
  endBindingId?: string;
  startPort?: 'top' | 'bottom' | 'left' | 'right';
  endPort?: 'top' | 'bottom' | 'left' | 'right';
  groupId?: string;
  zIndex: number;
}

export interface ViewportState {
  panX: number;
  panY: number;
  zoom: number;
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface GraphicAsset {
  id: string;
  name: string;
  category:
    | 'UI & Wireframe'
    | 'Tecnologia & Cloud'
    | 'Negócios & Métricas'
    | 'Gestão & Kanban'
    | 'Pessoas & Personas'
    | 'Selos & Destaques';
  description: string;
  iconName: string;
  tags?: string[];
  elements: Omit<CanvasElement, 'id' | 'zIndex'>[];
}

export interface PredefinedComponent {
  id: string;
  name: string;
  category: 'Fluxograma' | 'Arquitetura' | 'Anotações' | 'Formas';
  description: string;
  iconName: string;
  tags?: string[];
  template: Omit<CanvasElement, 'id' | 'zIndex' | 'x' | 'y'> & {
    width: number;
    height: number;
  };
}

