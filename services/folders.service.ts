import { foldersRepository } from "@/repositories/folders.repository";

export const foldersService = {
  async getFolders(userId: string) {
    const { data, error } = await foldersRepository.getFolders(userId);

    if (error) throw error;

    return data;
  },

  async createFolder(data: {
    owner_id: string;
    name: string;
    description?: string;
    parent_id?: number | null;
    team_id?: number | null;
  }) {
    if (data.name.length < 2) {
      throw new Error("Nome da pasta muito curto");
    }

    const { data: folder, error } = await foldersRepository.createFolder(data);

    if (error) throw error;

    return folder;
  },

  async updateFolder(
    id: number,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    const { data: folder, error } = await foldersRepository.updateFolder(
      id,
      data,
    );

    if (error) throw error;

    return folder;
  },

  async deleteFolder(id: number) {
    const { error } = await foldersRepository.deleteFolder(id);

    if (error) throw error;
  },
};
