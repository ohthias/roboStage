import { NextResponse } from "next/server";
import { readRawDocs } from "@/utils/competitions/docs";

export async function GET() {
  try {
    return NextResponse.json(await readRawDocs("obr"));
  } catch (err) {
    console.error("Erro ao carregar documentação da OBR:", err);
    const message =
      err instanceof SyntaxError
        ? "O arquivo obrDocs.json contém JSON inválido."
        : "Não foi possível carregar a documentação da OBR.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
