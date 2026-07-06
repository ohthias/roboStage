import { NextResponse } from "next/server";
import { getLegalDocument } from "@/utils/institutional/legal";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const doc = await getLegalDocument(slug);

  if (!doc) {
    return NextResponse.json(
      { error: "Documento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json(doc);
}