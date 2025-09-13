import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "toolsAbout.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(jsonData);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao ler JSON:", err);
    return NextResponse.json(
      { error: "Não foi possível carregar o JSON" },
      { status: 500 }
    );
  }
}
