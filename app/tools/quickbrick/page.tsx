import { Navbar } from "@/components/Navbar";
import QuickBrickCanvas from "@/components/QuickBrickCanva";

export default function QuickBrickPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Navbar />
      <div className="text-center my-4 w-5xl">
        <h1 className="text-2xl font-bold my-4 text-primary">
          QuickBrick Studio
        </h1>
        <p className="text-sm mb-2 text-base-content">
          O QuickBrick Studio é uma ferramenta que ajuda sua equipe a criar
          estratégias eficientes para o robô durante sua jornada no FIRST LEGO
          League Challenge. Basta selecionar uma das ferramentas disponíveis e
          desenhar diretamente sobre a imagem do tapete, planejando cada
          movimento com precisão e facilidade.
        </p>
      </div>
      <QuickBrickCanvas />
    </div>
  );
}
