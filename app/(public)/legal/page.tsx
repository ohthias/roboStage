import Link from "next/link";
import { FileText } from "lucide-react";
import { getAllLegalDocuments } from "@/utils/institutional/legal";
import Header from "@/components/UI/Header";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

export const metadata = {
  title: "Documentos Legais",
  description:
    "Acesse os documentos legais da plataforma RoboStage, incluindo Termos de Uso e Política de Privacidade.",
};

const TITLES: Record<string, string> = {
  terms: "Termos de Uso",
  privacy: "Política de Privacidade",
};

const DESCRIPTIONS: Record<string, string> = {
  terms: "Conheça as regras de utilização da plataforma RoboStage.",
  privacy: "Entenda como coletamos, utilizamos e protegemos seus dados.",
};

function formatTitle(slug: string) {
  return (
    TITLES[slug] ??
    slug
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export default async function LegalPage() {
  const documents = await getAllLegalDocuments();

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <Header
          description=""
          name="Documentos Legais"
          type="Legal"
          highlight={""}
        />

        <div className="grid gap-6 md:grid-cols-2 mt-10">
          {documents.map(({ slug }) => (
            <Link
              key={slug}
              href={`/legal/${slug}`}
              className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition hover:border-primary hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <FileText size={24} />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {formatTitle(slug)}
                  </h2>

                  <p className="mt-2 text-sm text-base-content/70">
                    {DESCRIPTIONS[slug] ??
                      "Documento oficial da plataforma RoboStage."}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-base-300 bg-base-200 p-6">
          <h2 className="text-lg font-semibold">Última atualização</h2>

          <p className="mt-2 text-sm text-base-content/70">
            Os documentos desta página podem ser atualizados periodicamente para
            refletir melhorias na plataforma, mudanças legais ou novas
            funcionalidades. Sempre consulte a versão mais recente antes de
            utilizar os serviços do RoboStage.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
