import { NextResponse } from "next/server";
import { readRawDocs } from "@/utils/competitions/docs";

export async function GET() {
  try {
    return NextResponse.json(await readRawDocs("fll"));
  } catch (err) {
    console.error("Erro ao carregar documentação da FLL:", err);
    const message =
      err instanceof SyntaxError
        ? "O arquivo fllDocs.json contém JSON inválido."
        : "Não foi possível carregar a documentação da FLL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
