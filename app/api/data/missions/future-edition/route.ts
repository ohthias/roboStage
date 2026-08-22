import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "fll", "future-edition.json");

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao ler future-edition.json:", err);
    return NextResponse.json(
      { error: "Não foi possível carregar as missões da Future Edition." },
      { status: 500 }
    );
  }
}