import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request, { params }) {
  const { codigoSala } = params;

  try {
    const sala = await prisma.sala.findUnique({
      where: { codigoSala: codigoSala },
      include: { equipes: true },
    });

    if (!sala) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
    }

    return NextResponse.json(sala);
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
