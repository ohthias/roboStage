import { Navbar } from "@/components/UI/Navbar";
import { COMPETICOES } from "@/utils/competitions/competicoes";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;

  if (!COMPETICOES[competicao as keyof typeof COMPETICOES]) {
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