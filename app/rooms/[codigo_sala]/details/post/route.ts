import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;
  const body = await request.json();
  // 1. Buscar a sala pelo código
  const { data: sala, error: errorSala } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', codigo_sala)
    .single();

  if (errorSala || !sala) {
    return Response.json({ error: 'Sala não encontrada' }, { status: 404 });
  }

  // 2. Extrair e preparar os dados
  const {
    quantidade_arenas = 1,
    check_dividir_arenas = false,
    check_salas_avaliacao = false,
    check_intervalos = false,
    arenas_treino = 0,
    arenas_oficiais = 0,
    tempo_intervalo = 0,
    quantidade_intervalos = 0,
    inicio = new Date().toISOString(),
    fim = new Date().toISOString(),
    dados_extras
  } = body;

  // 3. Inserir em 'operacao'
  const { data: operacao, error: errorOperacao } = await supabase
    .from('operacao')
    .insert([
      {
        id_room: sala.id,
        quantidade_arenas,
        check_dividir_arenas,
        check_salas_avaliacao,
        check_intervalos,
        inicio,
        fim,
        dados_extras
      }
    ])
    .select()
    .single();

  if (errorOperacao || !operacao) {
    return Response.json({ error: 'Erro ao criar operação' }, { status: 500 });
  }

  // 4. Inserir em 'arenas'
  const { data: arenas, error: errorArenas } = await supabase
    .from('arenas')
    .insert([
      {
        id_operacao: operacao.id,
        arenas_treino,
        arenas_oficiais
      }
    ])
    .select()
    .single();

  if (errorArenas) {
    return Response.json({ error: 'Erro ao criar arenas' }, { status: 500 });
  }

  // 5. Inserir em 'intervalos'
  const { data: intervalos, error: errorIntervalos } = await supabase
    .from('intervalos')
    .insert([
      {
        id_operacao: operacao.id,
        tempo_intervalo,
        quantidade_intervalos
      }
    ])
    .select()
    .single();

  if (errorIntervalos) {
    return Response.json({ error: 'Erro ao criar intervalos' }, { status: 500 });
  }

  // 6. Resposta final
  return Response.json({
    message: 'Operação, arenas e intervalos criados com sucesso!',
    operacao,
    arenas,
    intervalos
  }, { status: 201 });
}