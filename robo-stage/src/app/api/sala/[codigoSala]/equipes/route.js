import prisma from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
  const { codigoSala } = params
  const { equipes } = await req.json()

  try {
    const salaExistente = await prisma.sala.findUnique({ where: { codigoSala } })
    if (!salaExistente) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    // Usando o ID da sala existente
    await prisma.equipe.createMany({
      data: equipes.map((e) => ({
        nomeEquipe: e.nomeEquipe,
        round1: e.round1 ?? null,
        round2: e.round2 ?? null,
        round3: e.round3 ?? null,
        salaId: salaExistente.id, // Usando o id da sala encontrada
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar equipes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}