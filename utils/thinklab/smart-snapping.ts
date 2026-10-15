import { CanvasElement, Point } from '@/types/thinklab.types';

export interface SnapGuide {
  type: 'x' | 'y'; // 'x' means vertical line at coordinate X, 'y' means horizontal line at coordinate Y
  coordinate: number;
  start: number;
  end: number;
  label?: string;
}

export interface SnapResult {
  dx: number;
  dy: number;
  guides: SnapGuide[];
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// Compute bounding box of a collection of elements
export function getElementsBounds(elements: CanvasElement[]): BoundingBox | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const elMinX = Math.min(el.x, el.x + el.width);
    const elMaxX = Math.max(el.x, el.x + el.width);
    const elMinY = Math.min(el.y, el.y + el.height);
    const elMaxY = Math.max(el.y, el.y + el.height);

    if (el.points && el.points.length > 0) {
      el.points.forEach((p) => {
        minX = Math.min(minX, el.x + p.x);
        maxX = Math.max(maxX, el.x + p.x);
        minY = Math.min(minY, el.y + p.y);
        maxY = Math.max(maxY, el.y + p.y);
      });
    } else {
      minX = Math.min(minX, elMinX);
      maxX = Math.max(maxX, elMaxX);
      minY = Math.min(minY, elMinY);
      maxY = Math.max(maxY, elMaxY);
    }
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Calculate smart snap positions against target elements
export function computeSmartSnapping(
  draggedElements: CanvasElement[],
  initialPositions: Record<string, Point>,
  rawDx: number,
  rawDy: number,
  candidateElements: CanvasElement[],
  threshold = 8
): SnapResult {
  if (draggedElements.length === 0 || candidateElements.length === 0) {
    return { dx: rawDx, dy: rawDy, guides: [] };
  }

  // Calculate current candidate positions of dragged group with raw delta
  const currentDragged: CanvasElement[] = draggedElements.map((el) => {
    const init = initialPositions[el.id] || { x: el.x, y: el.y };
    return {
      ...el,
      x: init.x + rawDx,
      y: init.y + rawDy,
    };
  });

  const draggedBounds = getElementsBounds(currentDragged);
  if (!draggedBounds) {
    return { dx: rawDx, dy: rawDy, guides: [] };
  }

  const guides: SnapGuide[] = [];

  // Targets are non-dragged elements
  const targetBoundsList: BoundingBox[] = [];
  candidateElements.forEach((el) => {
    const b = getElementsBounds([el]);
    if (b) targetBoundsList.push(b);
  });

  let bestDiffX: number | null = null;
  let bestGuideX: SnapGuide | null = null;

  let bestDiffY: number | null = null;
  let bestGuideY: SnapGuide | null = null;

  // Dragged key X positions
  const draggedXs = [
    { pos: draggedBounds.minX, type: 'left', label: 'Borda Esquerda' },
    { pos: draggedBounds.centerX, type: 'center', label: 'Centro' },
    { pos: draggedBounds.maxX, type: 'right', label: 'Borda Direita' },
  ];

  // Dragged key Y positions
  const draggedYs = [
    { pos: draggedBounds.minY, type: 'top', label: 'Borda Superior' },
    { pos: draggedBounds.centerY, type: 'center', label: 'Centro' },
    { pos: draggedBounds.maxY, type: 'bottom', label: 'Borda Inferior' },
  ];

  // Test vertical alignments (X coordinates)
  targetBoundsList.forEach((target) => {
    const targetXs = [
      { pos: target.minX, label: 'Esquerda' },
      { pos: target.centerX, label: 'Centro' },
      { pos: target.maxX, label: 'Direita' },
    ];

    draggedXs.forEach((d) => {
      targetXs.forEach((t) => {
        const diff = t.pos - d.pos;
        if (Math.abs(diff) <= threshold) {
          if (bestDiffX === null || Math.abs(diff) < Math.abs(bestDiffX)) {
            bestDiffX = diff;
            const startY = Math.min(draggedBounds.minY, target.minY) - 30;
            const endY = Math.max(draggedBounds.maxY, target.maxY) + 30;
            bestGuideX = {
              type: 'x',
              coordinate: t.pos,
              start: startY,
              end: endY,
              label: `${d.label} alinhada com ${t.label}`,
            };
          }
        }
      });
    });
  });

  // Test horizontal alignments (Y coordinates)
  targetBoundsList.forEach((target) => {
    const targetYs = [
      { pos: target.minY, label: 'Superior' },
      { pos: target.centerY, label: 'Centro' },
      { pos: target.maxY, label: 'Inferior' },
    ];

    draggedYs.forEach((d) => {
      targetYs.forEach((t) => {
        const diff = t.pos - d.pos;
        if (Math.abs(diff) <= threshold) {
          if (bestDiffY === null || Math.abs(diff) < Math.abs(bestDiffY)) {
            bestDiffY = diff;
            const startX = Math.min(draggedBounds.minX, target.minX) - 30;
            const endX = Math.max(draggedBounds.maxX, target.maxX) + 30;
            bestGuideY = {
              type: 'y',
              coordinate: t.pos,
              start: startX,
              end: endX,
              label: `${d.label} alinhada com ${t.label}`,
            };
          }
        }
      });
    });
  });

  const snappedDx = bestDiffX !== null ? rawDx + bestDiffX : rawDx;
  const snappedDy = bestDiffY !== null ? rawDy + bestDiffY : rawDy;

  if (bestGuideX) guides.push(bestGuideX);
  if (bestGuideY) guides.push(bestGuideY);

  return {
    dx: snappedDx,
    dy: snappedDy,
    guides,
  };
}
