import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params
  const body = await request.json()

  // 1. Busca o ID da sala pelo código
  const { data: sala, error: errorSala } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', codigo_sala)
    .single()

  if (errorSala || !sala) {
    return Response.json({ error: 'Sala não encontrada' }, { status: 404 })
  }

  const {
    quantidade_arenas = 2,
    salas_avaliacao = 1,
    inicio = new Date().toISOString(),
    fim = new Date().toISOString()
  } = body

  const { data, error } = await supabase
    .from('room_details')
    .insert([
      {
        id_room: sala.id,
        quantidade_arenas,
        salas_avaliacao,
        inicio,
        fim
      }
    ])

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: 'Detalhes inseridos com sucesso', data }, { status: 201 })
}