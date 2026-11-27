/**
 * Domínio canônico do site. É o mesmo usado em `metadataBase` (app/layout.tsx),
 * no sitemap e no robots — manter os três iguais evita que o Google trate
 * `www.` e o domínio raiz como sites diferentes.
 */
export const SITE_URL = "https://robostage.com.br";

/** Só a produção deve ser indexada; previews da Vercel ficam fora do Google. */
export const IS_PRODUCTION_DEPLOY =
  process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
