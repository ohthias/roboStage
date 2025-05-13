import prisma  from '@/app/lib/prisma'

export async function PUT(request, { params }) {
  const { id } = params
  const dadosAtualizados = await request.json()

  try {
    const equipe = await prisma.equipe.findFirst({
      where: {
        salaId: id,
        nomeEquipe: dadosAtualizados.nomeEquipe,
      },
    })

    if (!equipe) {
      return new Response(JSON.stringify({ error: 'Equipe não encontrada' }), {
        status: 404,
      })
    }

    const updateData = {}
    for (const key in dadosAtualizados) {
      if (key.startsWith('round')) {
        updateData[key] = dadosAtualizados[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo de round informado' }), {
        status: 400,
      })
    }

    await prisma.equipe.update({
      where: { id: equipe.id },
      data: updateData,
    })

    return new Response(JSON.stringify({ sucesso: true }), { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar equipe:', error)
    return new Response(JSON.stringify({ error: 'Erro interno ao atualizar' }), {
      status: 500,
    })
  }
}
