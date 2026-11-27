import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * `<Link>` para rotas comuns; `<a>` simples para atalhos que passam por
 * `/dashboard/team/:id/abrir` (ver `team-links.ts`). Esses trocam o espaço
 * ativo, então não podem ser pré-carregados pelo `<Link>`.
 */
export function NavLink({ href, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  if (href.includes("/abrir?to=")) return <a href={href} {...props} />;
  return <Link href={href} {...props} />;
}
