import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getGithubReleases } from "@/utils/institutional/github";
import Header from "@/components/UI/Header";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Histórico de versões do RoboStage.",
};

export default async function ChangelogPage() {
  const releases = await getGithubReleases();

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <Header
          name="Changelog"
          description="Histórico de versões do RoboStage."
          type="Versão"
          highlight=""
        />

        <div className="space-y-16 max-w-5xl mx-auto mt-10">
          {releases.map((release) => (
            <article
              key={release.id}
              className="border-b border-base-300 pb-12 last:border-none"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {release.name || release.tag_name}
                  </h2>

                  <p className="text-sm text-base-content/60">
                    {new Date(release.published_at).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>

                <Link
                  href={release.html_url}
                  target="_blank"
                  className="btn btn-outline btn-sm"
                >
                  Ver no GitHub
                </Link>
              </div>

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {release.body}
                </ReactMarkdown>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
