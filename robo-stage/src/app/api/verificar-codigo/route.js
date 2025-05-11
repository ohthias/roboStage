import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request) {
  try {
    const { codigo } = await request.json();
    console.log("Código recebido:", codigo);

    const salas = await prisma.sala.findMany();
    console.log("Salas no banco:", salas);

    let salaEncontrada = null;
    let role = null;
    let codigoSala = null;

    const roles = ["codigoVisitante", "codigoVoluntario", "codigoAdmin"];

    for (const sala of salas) {
      for (let r of roles) {
        console.log(`Verificando código ${codigo} contra o campo ${r}:`, sala[r]);
        if (codigo === sala[r]) {
          salaEncontrada = sala;
          role = r.replace("codigo", "").toLowerCase();
          codigoSala = sala.codigoSala;
          break;
        }
      }
      if (salaEncontrada) break;
    }

    if (!salaEncontrada) {
      console.log("Código não encontrado");
      return NextResponse.json({ error: "Código inválido" }, { status: 404 });
    }

    console.log("Sala encontrada:", salaEncontrada);

    return NextResponse.json({ success: true, role, codigoSala });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
