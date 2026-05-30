"use client";

import { Folder } from "lucide-react";
import { FOLDER_ICONS, type FolderIconName } from "@/config/folder-icons";

type Props = {
  icon?: string | null;
  size?: number;
  className?: string;
};

export default function FolderIcon({
  icon,
  size = 24,
  className,
}: Props) {
  const Icon =
    FOLDER_ICONS[icon as FolderIconName] || Folder;

  return <Icon size={size} className={className} />;
}