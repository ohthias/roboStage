import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(_: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { codigo_sala } = params

  const { data: sala, error: errorSala } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', codigo_sala)
    .single()

  if (errorSala || !sala) {
    return Response.json({ error: 'Sala não encontrada' }, { status: 404 })
  }

  const { data: detalhes, error: errorDetalhes } = await supabase
    .from('room_details')
    .select('*')
    .eq('id_room', sala.id)

  if (errorDetalhes) {
    return Response.json({ error: errorDetalhes.message }, { status: 500 })
  }

  return Response.json(detalhes)
}