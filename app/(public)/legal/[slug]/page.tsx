import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getAllLegalDocuments, getLegalDocument } from "@/utils/legal";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const titles: Record<string, string> = {
  terms: "Termos de Uso",
  privacy: "Política de Privacidade",
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const title =
    titles[slug] ??
    slug
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title,
    description: `Leia o documento "${title}" da plataforma RoboStage.`,
  };
}

export async function generateStaticParams() {
  return await getAllLegalDocuments();
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;

  const doc = await getLegalDocument(slug);

  if (!doc) {
    notFound();
  }

  return (
    <main className="prose prose-invert mx-auto max-w-4xl px-6 py-16">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {doc.content}
      </ReactMarkdown>
    </main>
  );
}