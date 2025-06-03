import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(_: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params;

  // 1. Buscar sala
  const { data: sala, error: errorSala } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', codigo_sala)
    .single();

  if (errorSala || !sala) {
    return Response.json({ error: 'Sala não encontrada' }, { status: 404 });
  }

  // 2. Buscar operação
  const { data: operacao, error: errorOperacao } = await supabase
    .from('operacao')
    .select('*')
    .eq('id_room', sala.id)
    .single();

  if (errorOperacao || !operacao) {
    return Response.json({ error: 'Operação não encontrada' }, { status: 404 });
  }

  // 3. Buscar arenas
  const { data: arenas, error: errorArenas } = await supabase
    .from('arenas')
    .select('*')
    .eq('id_operacao', operacao.id)
    .single();

  if (errorArenas) {
    return Response.json({ error: 'Erro ao buscar arenas' }, { status: 500 });
  }

  // 4. Buscar intervalos
  const { data: intervalos, error: errorIntervalos } = await supabase
    .from('intervalos')
    .select('*')
    .eq('id_operacao', operacao.id)
    .single();

  if (errorIntervalos) {
    return Response.json({ error: 'Erro ao buscar intervalos' }, { status: 500 });
  }

  const salasAvaliacao = operacao.dados_extras?.salas_avaliacao ?? 0;

  // 5. Retornar tudo agrupado
  return Response.json({
    operacao,
    arenas,
    intervalos,
    salasAvaliacao,
  });
}