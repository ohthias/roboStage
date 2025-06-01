import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: any) {
  const codigo_sala = context.params.codigo_sala;
  const { teams } = await req.json();

  try {
    const { data: sala, error: erroSala } = await supabase
      .from("rooms")
      .select("id")
      .eq("codigo_sala", codigo_sala)
      .single();

    if (erroSala || !sala) {
      return NextResponse.json(
        { error: "Sala não encontrada" },
        { status: 404 }
      );
    }

    const { data: equipesExistentes, error: erroBuscaEquipes } = await supabase
      .from("teams")
      .select("*")
      .eq("sala_id", sala.id);

    if (erroBuscaEquipes) {
      return NextResponse.json(
        { error: "Erro ao buscar equipes existentes" },
        { status: 500 }
      );
    }

    const mapaEquipesExistentes = new Map(
      equipesExistentes.map((e) => [e.nome_equipe, e])
    );

    for (const equipe of teams) {
      const equipeAtual = mapaEquipesExistentes.get(equipe.nome_equipe);

      if (!equipeAtual) {
        const { data: novaEquipe, error: erroInsercao } = await supabase
          .from("teams")
          .insert([
            {
              nome_equipe: equipe.nome_equipe,
              round1: equipe.round1 ?? null,
              round2: equipe.round2 ?? null,
              round3: equipe.round3 ?? null,
              sala_id: sala.id,
            },
          ])
          .select()
          .single();

        if (erroInsercao) {
          console.error("Erro ao inserir nova equipe:", erroInsercao);
          continue;
        }

        await supabase.from("audit_logs").insert([
          {
            sala_id: sala.id,
            acao: "INSERT",
            tabela_afetada: "teams",
            id_registro: novaEquipe.id,
            descricao: `Equipe "${equipe.nome_equipe}" adicionada.`,
          },
        ]);
      } else {
        const camposAlterados: string[] = [];
        const updates: any = {};

        ["round1", "round2", "round3"].forEach((campo) => {
          const novoValor = equipe[campo] ?? null;
          const valorAtual = equipeAtual[campo] ?? null;
          if (novoValor !== valorAtual) {
            updates[campo] = novoValor;
            camposAlterados.push(`${campo}: ${valorAtual} → ${novoValor}`);
          }
        });

        if (camposAlterados.length > 0) {
          const { error: erroUpdate } = await supabase
            .from("teams")
            .update(updates)
            .eq("id", equipeAtual.id);

          if (erroUpdate) {
            console.error("Erro ao atualizar equipe:", erroUpdate);
            continue;
          }

          await supabase.from("audit_logs").insert([
            {
              sala_id: sala.id,
              acao: "UPDATE",
              tabela_afetada: "teams",
              id_registro: equipeAtual.id,
              descricao: `Equipe "${equipe.nome_equipe}" atualizada. Mudanças: ${camposAlterados.join(
                "; "
              )}`,
            },
          ]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro interno ao processar equipes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
