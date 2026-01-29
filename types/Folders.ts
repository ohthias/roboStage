export type Folder = {
  id: number;
  name: string;
  parent_id: number | null;
  team_id: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

type FolderItem = {
  id: string | number;
  folder_id: number;
  type: "folder" | "document" | "test";
  title: string;
  created_at: string;
  updated_at: string;
};
