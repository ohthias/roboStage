// /api/sala/[id].js
import { NextResponse } from 'next/server'
import { lerSalas } from '@/app/lib/salasDB'

export async function GET(request, { params }) {
  const { id } = params;
  const salas = await lerSalas();

  const sala = salas[id];

  if (!sala) {
    return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ...sala, idSala: id });
}
