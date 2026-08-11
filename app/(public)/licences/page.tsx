import type { Metadata } from "next";
import {
  ExternalLink,
  FileText,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import Header from "@/components/UI/Header";

export const metadata: Metadata = {
  title: "Licenças",
  description:
    "Licenças e atribuições das bibliotecas e projetos de código aberto utilizados pelo RoboStage.",
};

function LicenseIcon({ license }: { license: string }) {
  if (license.includes("MIT")) return <Scale size={20} />
  if (license.includes("ISC")) return <FileText size={20} />
  if (license.includes("Apache")) return <ShieldCheck size={20} />
  return <Sparkles size={20} />;
}

export default function LicensesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-100">
        <Header
          type="Licenças"
          name="Licenças &"
          description="créditos"
          highlight="O RoboStage utiliza diversos projetos de código aberto e ferramentas de terceiros.Esta página apresenta as bibliotecas utilizadas e suas respectivas licenças."
        />

        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="space-y-12">
            {Object.entries(licenses).map(([licenseName, dependencies]) => (
              <section key={licenseName}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content">
                    <LicenseIcon license={licenseName} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{licenseName}</h2>
                    <p className="text-sm text-base-content/60">
                      {dependencies.length}{" "}
                      {dependencies.length === 1
                        ? "dependência"
                        : "dependências"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {dependencies.map((dependency) => (
                    <article
                      key={dependency.name}
                      className="card border border-base-300 bg-base-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="card-body">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-mono text-base font-bold">
                              {dependency.name}
                            </h3>

                            <p className="mt-1 text-sm text-base-content/60">
                              {dependency.author}
                            </p>
                          </div>

                          <span className="badge badge-outline shrink-0">
                            {dependency.license}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-base-content/70">
                          {dependency.description}
                        </p>

                        {dependency.repository && (
                          <div className="card-actions mt-4">
                            <a
                              href={dependency.repository}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-ghost"
                            >
                              Repositório
                              <ExternalLink className="size-4" />
                            </a>

                            {dependency.official && (
                              <a
                                href={dependency.official}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-ghost"
                              >
                                Licença
                                <ExternalLink className="size-4" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {/* Flaticon */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content">
                  <Sparkles className="size-5" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">Flaticon License</h2>
                  <p className="text-sm text-base-content/60">
                    Atribuição específica
                  </p>
                </div>
              </div>

              <article className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-mono text-base font-bold">
                        {flaticon.name}
                      </h3>
                      <p className="mt-1 text-sm text-base-content/60">
                        {flaticon.author}
                      </p>
                    </div>

                    <span className="badge badge-warning">
                      {flaticon.license}
                    </span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-base-content/70">
                    {flaticon.description}
                  </p>

                  <div className="alert mt-5 border border-base-300 bg-base-200">
                    <Sparkles className="size-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Uicons by Flaticon</p>
                      <p className="text-sm text-base-content/70">
                        A atribuição deve ser mantida de acordo com os termos de
                        utilização da Flaticon.
                      </p>
                    </div>
                  </div>

                  <div className="card-actions mt-4">
                    <a
                      href={flaticon.official}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      Flaticon UIcons
                      <ExternalLink className="size-4" />
                    </a>

                    <a
                      href={flaticon.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                    >
                      Repositório
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </div>
              </article>
            </section>

            {/* Notice */}
            <section className="alert border border-base-300 bg-base-200">
              <ShieldCheck className="size-6 shrink-0" />

              <div>
                <h2 className="font-bold">Sobre estas licenças</h2>

                <p className="mt-1 text-sm leading-6 text-base-content/70">
                  As licenças apresentadas nesta página pertencem aos
                  respectivos autores e organizações. Elas não transferem
                  propriedade sobre o código, marcas, logotipos ou outros
                  direitos de propriedade intelectual de terceiros para o
                  RoboStage.
                </p>
              </div>
            </section>

            {/* Footer information */}
            <footer className="border-t border-base-300 pt-8">
              <div className="flex flex-col gap-3 text-sm text-base-content/60 sm:flex-row sm:items-center sm:justify-between">
                <p>Última revisão: agosto de 2026.</p>

                <p>RoboStage © {new Date().getFullYear()}</p>
              </div>
            </footer>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
