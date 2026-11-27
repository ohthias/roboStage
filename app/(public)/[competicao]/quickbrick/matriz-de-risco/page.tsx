"use client";
import { useEffect, useState } from "react";
import { Grid2X2 } from "lucide-react";
import MatrizRiscoEditor from "@/features/quickbrick/matriz-risco/components/MatrizRiscoEditor";
import { Risco } from "@/features/quickbrick/matriz-risco/types";
import { INITIAL_RISCOS } from "@/features/quickbrick/matriz-risco/lib/constants";
import CardMobileNotUse from "@/components/stage/platform/MobileNotUse";
import HeaderTool from "@/features/quickbrick/shared/components/HeaderTool";

const STORAGE_KEY = "riscos";

function loadRiscos(): Risco[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Risco[]) : INITIAL_RISCOS;
  } catch {
    return INITIAL_RISCOS;
  }
}

export default function MatrizDeRiscoPage() {
  // Só monta o editor depois de ler o navegador (o editor guarda o estado inicial).
  const [initial, setInitial] = useState<Risco[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setInitial(loadRiscos());
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (isMobile) return <CardMobileNotUse />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
      <HeaderTool
        NameTool="Matriz de Risco"
        DescriptionTool="A Matriz de Risco ajuda identificar e avaliar os riscos potenciais para o sucesso do seu robô. Ao mapear os riscos em uma matriz de impacto versus probabilidade, pode priorizar quais riscos precisam ser gerenciados ativamente e quais podem ser monitorados passivamente."
        IconTool={Grid2X2}
      />
      {initial && (
        <MatrizRiscoEditor
          initialRiscos={initial}
          resetRiscos={INITIAL_RISCOS}
          onRiscosChange={(r) => {
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
            } catch {
              /* sem armazenamento: segue só em memória */
            }
          }}
        />
      )}
    </div>
  );
}
