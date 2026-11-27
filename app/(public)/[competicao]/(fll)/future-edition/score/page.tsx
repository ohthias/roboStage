import type { MissionsData } from "@/features/scoring/future-edition/types";
import { FUTURE_EDITION_DATA } from "@/lib/data/static-data";
import FutureEditionScoreClient from "@/features/scoring/future-edition/components/FutureEditionScoreClient";

// Componente de servidor: o JSON da Future Edition sai do bundle JavaScript do
// cliente e vai uma vez nas props, já no HTML estático da página.
export default function FutureEditionScorePage() {
  return <FutureEditionScoreClient data={FUTURE_EDITION_DATA as unknown as MissionsData} />;
}
