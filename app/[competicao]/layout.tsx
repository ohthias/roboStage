import { Navbar } from "@/components/UI/Navbar";
import { COMPETICOES } from "@/config/competicoes";

type Competicao = keyof typeof COMPETICOES;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ competicao: Competicao }>;
}) {
  const { competicao } = await params;

  if (!COMPETICOES[competicao as Competicao]) {
    throw new Error("Competição não encontrada");
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
