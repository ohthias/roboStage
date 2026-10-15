import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "missions.json",
);

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao carregar missions.json:", err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "ENOENT"
    ) {
      return NextResponse.json(
        { error: "Arquivo missions.json não encontrado." },
        { status: 500 },
      );
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "O arquivo missions.json contém JSON inválido." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível carregar as missões." },
      { status: 500 },
    );
  }
}
