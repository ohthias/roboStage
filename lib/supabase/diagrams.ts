import { supabase } from "@/utils/supabase/client";
import { DiagramType } from "@/types/InnoLabType";

export async function getDiagramById(id: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateDiagram(id: string, updates: {
  title?: string;
  content?: object;
  diagram_type?: DiagramType;
}) {
  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createDiagram(data: {
  title: string;
  content: object;
  diagram_type: DiagramType;
  user_id?: string;
  group_id?: number;
}) {
  const { data: inserted, error } = await supabase
    .from("documents")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return inserted;
}
