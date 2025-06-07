// app/api/theme/[id_room]/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { codigo_sala: string } }) {
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('codigo_sala', params.codigo_sala)
    .single();

  if (!room) {
    console.error('Erro ao buscar sala:', roomError);
    return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 });
  }

  const roomId = room.id;
  const { primary_color, secondary_color, wallpaper_url } = await req.json();

  const { data: existing, error: fetchError } = await supabase
    .from('theme')
    .select('id')
    .eq('id_room', roomId)
    .maybeSingle();
  
  console.log('Verificando tema existente para a sala:', roomId, 'Resultado:', existing, 'Erro:', fetchError);
  if (fetchError) {
    return NextResponse.json({ error: 'Erro ao verificar tema existente: ' + fetchError.message }, { status: 500 });
  }

  const updated_at = new Date().toISOString();

  if (existing) {
    // Atualiza o tema existente
    const { error: updateError } = await supabase
      .from('theme')
      .update({ primary_color, secondary_color, wallpaper_url, updated_at })
      .eq('id_room', roomId);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar tema: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tema atualizado com sucesso' });
  } else {
    // Cria novo tema para a sala
    const { error: insertError } = await supabase
      .from('theme')
      .insert([{ id_room: roomId, primary_color, secondary_color, wallpaper_url, updated_at }]);

    if (insertError) {
      return NextResponse.json({ error: 'Erro ao criar tema: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tema criado com sucesso' });
  }
}
