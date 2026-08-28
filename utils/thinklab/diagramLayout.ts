import { IshikawaCategory, IshikawaCause, IshikawaSubCause, DiagramSettings } from '../types';

/**
 * Splits text into multiple lines based on maximum character limit per line,
 * breaking at word boundaries.
 */
export function wrapText(text: string, maxCharsPerLine: number = 24): string[] {
  if (!text) return [''];
  const trimmed = text.trim();
  if (trimmed.length <= maxCharsPerLine) return [trimmed];

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      if (word.length > maxCharsPerLine) {
        // If single word is longer than maxCharsPerLine, break it with hyphen
        let remaining = word;
        while (remaining.length > maxCharsPerLine) {
          lines.push(remaining.slice(0, maxCharsPerLine - 1) + '-');
          remaining = remaining.slice(maxCharsPerLine - 1);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    } else {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        if (word.length > maxCharsPerLine) {
          let remaining = word;
          while (remaining.length > maxCharsPerLine) {
            lines.push(remaining.slice(0, maxCharsPerLine - 1) + '-');
            remaining = remaining.slice(maxCharsPerLine - 1);
          }
          currentLine = remaining;
        } else {
          currentLine = word;
        }
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [trimmed];
}

export interface ComputedSubCauseLayout {
  id: string;
  rawText: string;
  lines: string[];
  isRootCause?: boolean;
  boxWidth: number;
  boxHeight: number;
  relX: number;
  relY: number;
}

export interface ComputedCauseLayout {
  id: string;
  rawText: string;
  lines: string[];
  isRootCause?: boolean;
  severity?: 'low' | 'medium' | 'high';
  boxWidth: number;
  boxHeight: number;
  branchLen: number;
  attachX: number;
  attachY: number;
  branchEndX: number;
  branchEndY: number;
  cardX: number;
  cardY: number;
  subCauses: ComputedSubCauseLayout[];
  totalHeightContribution: number;
}

export interface ComputedCategoryLayout {
  id: string;
  name: string;
  nameLines: string[];
  placement: 'top' | 'bottom';
  causes: ComputedCauseLayout[];
  spineAttachX: number;
  spineAttachY: number;
  tipX: number;
  tipY: number;
  boneLength: number;
  headerBoxWidth: number;
  headerBoxHeight: number;
  colorIndex: number;
  maxBranchSpan: number;
}

export interface DiagramDimensions {
  svgWidth: number;
  svgHeight: number;
  spineStartX: number;
  spineEndX: number;
  spineY: number;
  headCenterX: number;
  headCenterY: number;
  headWidth: number;
  headHeight: number;
  headLines: string[];
  topCategories: ComputedCategoryLayout[];
  bottomCategories: ComputedCategoryLayout[];
}

/**
 * Calculates a fully dynamic, collision-free layout for the Ishikawa fishbone diagram.
 * The canvas auto-grows horizontally and vertically based on content volume.
 */
export function calculateDiagramLayout(
  title: string,
  categories: IshikawaCategory[],
  settings: DiagramSettings
): DiagramDimensions {
  const isRight = settings.fishDirection === 'right';
  const fontSizeScale = settings.fontSizeScale || 1.0;
  const boneAngleRad = ((settings.boneAngle || 55) * Math.PI) / 180;

  // Split categories into top and bottom branches
  const rawTop: IshikawaCategory[] = [];
  const rawBottom: IshikawaCategory[] = [];

  categories.forEach((cat, idx) => {
    if (cat.customPlacement === 'top') {
      rawTop.push(cat);
    } else if (cat.customPlacement === 'bottom') {
      rawBottom.push(cat);
    } else {
      if (idx % 2 === 0) rawTop.push(cat);
      else rawBottom.push(cat);
    }
  });

  // Calculate problem head text lines & dimensions
  const headLines = wrapText(title || 'Problema / Efeito', 20);
  const headWidth = Math.max(220, Math.min(340, Math.max(...headLines.map((l) => l.length)) * 12 + 60));
  const headHeight = Math.max(110, 56 + headLines.length * 20);

  // Measure content density per category
  const maxCols = Math.max(rawTop.length, rawBottom.length, 1);

  // Dynamic Horizontal column width: scales if causes have long text
  const catColWidth = Math.max(290, 320 * Math.min(1.4, fontSizeScale));

  // Determine required spine length so all categories have ample breathing room
  const tailMargin = 160;
  const headMargin = headWidth + 90;
  const availableSpineWidth = Math.max(700, maxCols * catColWidth);
  const totalSpineSpan = availableSpineWidth;

  // Compute cause layouts for a category to determine required bone length & vertical height
  const computeCausesForCategory = (
    causes: IshikawaCause[],
    placement: 'top' | 'bottom'
  ): {
    computedCauses: Omit<ComputedCauseLayout, 'attachX' | 'attachY' | 'branchEndX' | 'branchEndY' | 'cardX' | 'cardY' | 'subCauses'>[];
    subLayouts: ComputedSubCauseLayout[][];
    requiredBoneHeight: number;
    maxBranchWidth: number;
  } => {
    let currentYOffset = 0;
    const computedCauses: Omit<ComputedCauseLayout, 'attachX' | 'attachY' | 'branchEndX' | 'branchEndY' | 'cardX' | 'cardY' | 'subCauses'>[] = [];
    const subLayouts: ComputedSubCauseLayout[][] = [];
    let maxBranchWidth = 160;

    causes.forEach((cause) => {
      const causeLines = wrapText(cause.text, 22);
      const maxLineLen = Math.max(...causeLines.map((l) => l.length));
      const boxWidth = Math.max(140, maxLineLen * 7.6 * fontSizeScale + 32);
      const boxHeight = Math.max(28, causeLines.length * 15 * fontSizeScale + 12);
      const branchLen = Math.max(150, boxWidth + 10);
      if (branchLen > maxBranchWidth) maxBranchWidth = branchLen;

      // Sub-causes (5 whys)
      const computedSubs: ComputedSubCauseLayout[] = [];
      let subHeightTotal = 0;

      if (settings.showSubCauses && cause.subCauses) {
        cause.subCauses.forEach((sub, sIdx) => {
          const subLines = wrapText(sub.text, 18);
          const subMaxLen = Math.max(...subLines.map((l) => l.length));
          const sWidth = Math.max(110, subMaxLen * 6.8 * fontSizeScale + 24);
          const sHeight = Math.max(22, subLines.length * 13 * fontSizeScale + 8);
          const sRelX = 14 + sIdx * 20;
          const sRelY = (placement === 'top' ? -1 : 1) * (boxHeight / 2 + 16 + sIdx * (sHeight + 8));

          subHeightTotal += sHeight + 8;
          computedSubs.push({
            id: sub.id,
            rawText: sub.text,
            lines: subLines,
            isRootCause: sub.isRootCause,
            boxWidth: sWidth,
            boxHeight: sHeight,
            relX: sRelX,
            relY: sRelY,
          });
        });
      }

      const totalHeightContribution = Math.max(48, boxHeight + subHeightTotal + 16);
      currentYOffset += totalHeightContribution;

      computedCauses.push({
        id: cause.id,
        rawText: cause.text,
        lines: causeLines,
        isRootCause: cause.isRootCause,
        severity: cause.severity,
        boxWidth,
        boxHeight,
        branchLen,
        totalHeightContribution,
      });

      subLayouts.push(computedSubs);
    });

    const requiredBoneHeight = Math.max(260, currentYOffset + 70);
    return { computedCauses, subLayouts, requiredBoneHeight, maxBranchWidth };
  };

  // Find max required vertical height across top and bottom
  let maxTopBoneHeight = 280;
  let maxBottomBoneHeight = 280;

  const topCategoryPrep = rawTop.map((cat) => {
    const prep = computeCausesForCategory(cat.causes, 'top');
    if (prep.requiredBoneHeight > maxTopBoneHeight) maxTopBoneHeight = prep.requiredBoneHeight;
    return { cat, ...prep };
  });

  const bottomCategoryPrep = rawBottom.map((cat) => {
    const prep = computeCausesForCategory(cat.causes, 'bottom');
    if (prep.requiredBoneHeight > maxBottomBoneHeight) maxBottomBoneHeight = prep.requiredBoneHeight;
    return { cat, ...prep };
  });

  // Calculate SVG Dimensions based on calculated requirements
  const SVG_HEIGHT = Math.max(880, maxTopBoneHeight + maxBottomBoneHeight + 240);
  const SPINE_Y = maxTopBoneHeight + 120;
  const SVG_WIDTH = Math.max(1400, tailMargin + totalSpineSpan + headMargin + 100);

  const spineStartX = isRight ? tailMargin : SVG_WIDTH - tailMargin;
  const spineEndX = isRight ? spineStartX + totalSpineSpan : spineStartX - totalSpineSpan;
  const headCenterX = isRight ? spineEndX + headWidth / 2 + 30 : spineEndX - headWidth / 2 - 30;
  const headCenterY = SPINE_Y;

  // Build full Category and Cause layouts with exact coordinate geometry
  const buildCategories = (
    prepList: typeof topCategoryPrep,
    placement: 'top' | 'bottom',
    maxBoneHeight: number
  ): ComputedCategoryLayout[] => {
    const count = prepList.length;

    return prepList.map((item, catIdx) => {
      const t = count === 1 ? 0.5 : (catIdx + 0.6) / (count + 0.2);
      const spineAttachX = isRight
        ? spineStartX + totalSpineSpan * t
        : spineStartX - totalSpineSpan * t;
      const spineAttachY = SPINE_Y;

      // Dynamic Bone Length for this category
      const boneHeight = Math.max(item.requiredBoneHeight, maxBoneHeight);
      const boneDx = (boneHeight / Math.tan(boneAngleRad)) * (isRight ? 1 : -1);
      const boneDy = placement === 'top' ? -boneHeight : boneHeight;

      const tipX = spineAttachX - boneDx;
      const tipY = spineAttachY + boneDy;

      const nameLines = wrapText(item.cat.name, 18);
      const headerBoxWidth = Math.max(170, Math.max(...nameLines.map((l) => l.length)) * 8.5 * fontSizeScale + 48);
      const headerBoxHeight = Math.max(38, nameLines.length * 15 * fontSizeScale + 14);

      // Distribute causes along the rib with safe vertical spacing
      const totalContribution = item.computedCauses.reduce((acc, c) => acc + c.totalHeightContribution, 0);
      let accumulatedY = 0;

      const fullyComputedCauses: ComputedCauseLayout[] = item.computedCauses.map((c, cIdx) => {
        // Safe position along the rib
        const centerFrac = totalContribution > 0
          ? (accumulatedY + c.totalHeightContribution * 0.45) / totalContribution
          : (cIdx + 1) / (item.computedCauses.length + 1);

        accumulatedY += c.totalHeightContribution;

        // Linear interpolation from tip to spineAttach
        // Offset slightly away from tip and spine joint for aesthetic clarity
        const safeFrac = 0.12 + centerFrac * 0.76;
        const attachX = tipX + (spineAttachX - tipX) * safeFrac;
        const attachY = tipY + (spineAttachY - tipY) * safeFrac;

        const branchDir = isRight ? -1 : 1;
        const branchEndX = attachX + branchDir * c.branchLen;
        const branchEndY = attachY;

        const cardX = isRight ? branchEndX : attachX;
        const cardY = branchEndY - c.boxHeight / 2;

        const subs = item.subLayouts[cIdx].map((s) => {
          const subX = isRight ? branchEndX + s.relX : branchEndX - s.relX - s.boxWidth;
          const subY = branchEndY + s.relY;
          return {
            ...s,
            relX: subX,
            relY: subY,
          };
        });

        return {
          ...c,
          attachX,
          attachY,
          branchEndX,
          branchEndY,
          cardX,
          cardY,
          subCauses: subs,
        };
      });

      return {
        id: item.cat.id,
        name: item.cat.name,
        nameLines,
        placement,
        causes: fullyComputedCauses,
        spineAttachX,
        spineAttachY,
        tipX,
        tipY,
        boneLength: Math.sqrt(boneDx * boneDx + boneDy * boneDy),
        headerBoxWidth,
        headerBoxHeight,
        colorIndex: placement === 'top' ? catIdx : catIdx + rawTop.length,
        maxBranchSpan: item.maxBranchWidth,
      };
    });
  };

  const topCategories = buildCategories(topCategoryPrep, 'top', maxTopBoneHeight);
  const bottomCategories = buildCategories(bottomCategoryPrep, 'bottom', maxBottomBoneHeight);

  return {
    svgWidth: SVG_WIDTH,
    svgHeight: SVG_HEIGHT,
    spineStartX,
    spineEndX,
    spineY: SPINE_Y,
    headCenterX,
    headCenterY,
    headWidth,
    headHeight,
    headLines,
    topCategories,
    bottomCategories,
  };
}
