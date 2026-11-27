import type { ReactNode } from "react";
import {
  ChevronRightSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Info,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Quote,
} from "lucide-react";
import type { BlockType } from "./block-utils";

/** Ícone de cada tipo de bloco (menus "Transformar em"). */
export function blockTypeIcon(type: BlockType, size = 15): ReactNode {
  switch (type) {
    case "paragraph":
      return <Pilcrow size={size} />;
    case "h1":
      return <Heading1 size={size} />;
    case "h2":
      return <Heading2 size={size} />;
    case "h3":
      return <Heading3 size={size} />;
    case "h4":
      return <Heading4 size={size} />;
    case "h5":
      return <Heading5 size={size} />;
    case "h6":
      return <Heading6 size={size} />;
    case "bullet":
      return <List size={size} />;
    case "number":
      return <ListOrdered size={size} />;
    case "check":
      return <ListChecks size={size} />;
    case "quote":
      return <Quote size={size} />;
    case "code":
      return <Code2 size={size} />;
    case "toggle":
      return <ChevronRightSquare size={size} />;
    case "callout":
      return <Info size={size} />;
  }
}

/** Ordem dos tipos no menu "Transformar em". */
export const TURN_INTO_TYPES: BlockType[] = [
  "paragraph",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "bullet",
  "number",
  "check",
  "toggle",
  "callout",
  "quote",
  "code",
];
