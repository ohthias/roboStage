import { createClient } from "@/utils/supabase/client";
import { CreateLabTestDTO } from "@/types/labTest.types";

const supabase = createClient();

export const labTestRepository = {
  async create(userId: string, data: CreateLabTestDTO) {
    const { data: test, error } = await supabase
      .from("tests")
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        mode: data.mode,
        season: data.season,
        config: data.config ?? {},
        team_id: data.team_id,
        folder_id: data.folder_id,
      })
      .select()
      .single();

    if (error) throw error;

    return test;
  },

  async insertMissions(testId: string, missions: CreateLabTestDTO["missions"]) {
    if (!missions?.length) return;

    const { error } = await supabase
      .from("test_missions")
      .insert(
        missions.map((mission) => ({
          test_id: testId,
          ...mission,
        }))
      );

    if (error) throw error;
  },

  async insertVariables(
    testId: string,
    variables: CreateLabTestDTO["variables"]
  ) {
    if (!variables?.length) return;

    const { error } = await supabase
      .from("test_variables")
      .insert(
        variables.map((variable, index) => ({
          test_id: testId,
          variable_order: index + 1,
          ...variable,
        }))
      );

    if (error) throw error;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("tests")
      .select(`
        *,
        test_missions(*),
        test_variables(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("tests")
      .select(`
        *,
        test_missions(*),
        test_variables(*),
        test_executions(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from("tests")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};