import { IS_PRODUCTION_DEPLOY, SITE_URL } from "@/utils/competitions/site";
import type { MetadataRoute } from "next";


export default function robots(): MetadataRoute.Robots {
  // Deploys de preview/desenvolvimento não devem aparecer nos buscadores.
  if (!IS_PRODUCTION_DEPLOY) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          // Dados públicos que as páginas buscam no cliente: o Googlebot
          // precisa deles para renderizar o conteúdo (missões, docs, etc.).
          "/api/data/",
        ],
        disallow: [
          // Área logada: só gera redirect para /sign-in e desperdiça crawl.
          "/dashboard",
          "/onboarding",
          "/sign-in",
          "/sign-up",
          // Endpoints de API (exceto /api/data, liberado acima).
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
