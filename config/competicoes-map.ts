import FLLHome  from "@/components/competicoes/FLLHome";
import { OBRHome } from "@/components/competicoes/OBRHome";

export const COMPETICOES_COMPONENTES = {
  fll: {
    Home: FLLHome,
  },
  obr: {
    Home: OBRHome,
  },
  wro: {
    Home: () => "Em breve...",
  },
  tbr: {
    Home: () => "Em breve...",
  },
  showlive: {
    Home: () => "Em breve...",
  }
};