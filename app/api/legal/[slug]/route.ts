import { NextResponse } from "next/server";
import { getLegalDocument } from "@/utils/institutional/legal";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json(
      { error: "Identificador de documento inválido." },
      { status: 400 },
    );
  }

  const doc = await getLegalDocument(slug);

  if (!doc) {
    return NextResponse.json(
      { error: "Documento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json(doc);
}