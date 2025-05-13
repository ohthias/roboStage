import { NextResponse } from "next/server";
import { gerarCodigoAleatorio } from "@/app/lib/utils";
import prisma from "@/app/lib/prisma";

export async function POST(req) {
  try {
    const { nome } = await req.json();

    if (!nome || nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome da sala é obrigatório" },
        { status: 400 }
      );
    }

    const codigoSala = gerarCodigoAleatorio();
    const codigoAdmin = codigoSala + gerarCodigoAleatorio();
    const codigoVisitante = codigoSala + gerarCodigoAleatorio();
    const codigoVoluntario = codigoSala + gerarCodigoAleatorio();

    const novaSala = await prisma.sala.create({
      data: {
        nome,
        codigoSala,
        codigoAdmin,
        codigoVisitante,
        codigoVoluntario,
      },
    });

    return NextResponse.json(novaSala);
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
