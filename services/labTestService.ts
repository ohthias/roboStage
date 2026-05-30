import { labTestRepository } from "@/repositories/labTestRepository";
import { CreateLabTestDTO } from "@/types/labTest.types";

export const labTestService = {
  async create(userId: string, payload: CreateLabTestDTO) {
    const test = await labTestRepository.create(userId, payload);

    await labTestRepository.insertMissions(test.id, payload.missions);

    await labTestRepository.insertVariables(test.id, payload.variables);

    return test;
  },

  async getByUser(userId: string) {
    return labTestRepository.getByUser(userId);
  },

  async getById(id: string) {
    return labTestRepository.getById(id);
  },

  async delete(id: string) {
    return labTestRepository.remove(id);
  },

  async createExecution(
    testId: string,
    payload: {
      returnedToBase: boolean;
      notes: string;
      score: number;
      missionScores: Record<string, number>;
      variables: Record<string, string>;
    },
  ) {
    return labTestRepository.createExecution(testId, payload);
  },
};
