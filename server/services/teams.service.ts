import { teamsRepository } from "@/server/repositories/teams.repository";

export const teamsService = {
  async getUserTeams(userId: string) {
    const { data, error } =
      await teamsRepository.getTeams(userId);

    if (error) throw error;

    return data;
  },

  async createTeam(data: {
    owner_id: string;
    name: string;
    description?: string;
  }) {
    if (data.name.length < 3) {
      throw new Error("Nome do time muito curto");
    }

    const { data: team, error } =
      await teamsRepository.createTeam(data);

    if (error) throw error;

    await teamsRepository.addMember({
      team_id: team.id,
      user_id: data.owner_id,
      role: "owner",
    });

    return team;
  },

  async joinByCode(code: string, userId: string) {
    const { data: team, error } =
      await teamsRepository.getTeamByCode(code);

    if (error || !team) {
      throw new Error("Time não encontrado");
    }

    await teamsRepository.addMember({
      team_id: team.id,
      user_id: userId,
    });

    return team;
  },

  async removeMember(teamId: number, userId: string) {
    const { error } =
      await teamsRepository.removeMember(
        teamId,
        userId,
      );

    if (error) throw error;
  },
};