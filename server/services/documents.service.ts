import { documentsRepository } from "@/server/repositories/documents.repository";

export const documentsService = {
  async getDocuments(userId: string) {
    const { data, error } = await documentsRepository.getDocuments(userId);

    if (error) throw error;

    return data;
  },

  async getDocument(id: string) {
    const { data, error } = await documentsRepository.getDocument(id);

    if (error) throw error;

    return data;
  },

  async createDocument(data: any) {
    if (!data.title) {
      throw new Error("Documento sem título");
    }

    const { data: document, error } =
      await documentsRepository.createDocument(data);

    if (error) throw error;

    return document;
  },

  async updateDocument(id: string, data: any) {
    const { data: document, error } = await documentsRepository.updateDocument(
      id,
      data,
    );

    if (error) throw error;

    return document;
  },

  async deleteDocument(id: string) {
    const { error } = await documentsRepository.deleteDocument(id);

    if (error) throw error;
  },
};
