// services/folders.service.ts

import {
  foldersRepository,
  type CreateSubfolderPayload,
  type UpdateFolderPayload,
} from "@/server/repositories/folders.repository";

export const foldersService = {
  async getFolderPageData(folderId: number) {
    const [folderRes, childrenRes, documentsRes, testsRes] = await Promise.all([
      foldersRepository.getFolderById(folderId),
      foldersRepository.getFolderChildren(folderId),
      foldersRepository.getFolderDocuments(folderId),
      foldersRepository.getFolderTests(folderId),
    ]);

    if (folderRes.error) throw folderRes.error;
    if (childrenRes.error) throw childrenRes.error;
    if (documentsRes.error) throw documentsRes.error;
    if (testsRes.error) throw testsRes.error;

    // fire-and-forget — don't block page load
    foldersRepository.updateLastAccess(folderId).catch(() => null);

    return {
      folder: folderRes.data,
      children: childrenRes.data ?? [],
      documents: documentsRes.data ?? [],
      tests: testsRes.data ?? [],
    };
  },

  async updateFolder(id: number, data: UpdateFolderPayload) {
    if (data.name !== undefined && data.name.trim().length < 2) {
      throw new Error("Nome da pasta muito curto");
    }

    const { data: folder, error } = await foldersRepository.updateFolder(
      id,
      data,
    );
    if (error) throw error;
    return folder;
  },

  async createSubfolder(
    data: CreateSubfolderPayload & {
      color?: string | null;
      icon?: string | null;
      tags?: string[];
    },
  ) {
    if (data.name.trim().length < 2) {
      throw new Error("Nome da pasta muito curto");
    }

    const { data: folder, error } =
      await foldersRepository.createSubfolder(data);
    if (error) throw error;
    return folder;
  },

  async deleteFolder(id: number) {
    const { error } = await foldersRepository.markFolderAsDeleted(id);
    if (error) throw error;
  },

  async getBreadcrumbs(folderId: number) {
    const breadcrumbs = [];
    let currentId: number | null = folderId;

    while (currentId) {
      const { data, error } =
        await foldersRepository.getFolderBreadcrumb(currentId);
      if (error || !data) break;
      breadcrumbs.unshift(data);
      currentId = data.parent_id;
    }

    return breadcrumbs;
  },
};
