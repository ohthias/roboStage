import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', params.codigo_sala)
    .single();

  if (!room) {
    return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 });
  }

  const { data: theme, error: themeError } = await supabase
    .from('theme')
    .select('*')
    .eq('id_room', room.id)
    .single();

  if (themeError) {
    return NextResponse.json({ error: 'Erro ao buscar tema.' }, { status: 500 });
  }

  return NextResponse.json(theme);
}
