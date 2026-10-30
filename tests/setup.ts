import { vi } from "vitest";
import { requestContext } from "./helpers/context";

// Banco real (Postgres em memória via PGlite) com o schema do projeto. Cada
// arquivo de teste recebe uma instância nova; `tests/helpers/db.ts` aplica o schema.
vi.mock("@/db/client", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const schema = await import("@/db/schema");
  const client = new PGlite();
  return { db: drizzle(client, { schema }), pglite: client };
});

vi.mock("server-only", () => ({}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: requestContext.userId }),
  currentUser: async () =>
    requestContext.userId
      ? {
          id: requestContext.userId,
          emailAddresses: [{ emailAddress: `${requestContext.userId}@example.com` }],
          firstName: requestContext.userId,
          lastName: null,
          imageUrl: null,
        }
      : null,
  clerkClient: async () => {
    throw new Error("clerkClient não está disponível nos testes");
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = requestContext.cookies.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string) => requestContext.cookies.set(name, value),
    delete: (name: string) => requestContext.cookies.delete(name),
  }),
  headers: async () => new Headers(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => {
    requestContext.revalidated.push(path);
  },
  revalidateTag: () => {},
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT ${url}`), { digest: `NEXT_REDIRECT;${url}` });
  },
  unstable_rethrow: (error: unknown) => {
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_")) throw error;
  },
  notFound: () => {
    throw Object.assign(new Error("NEXT_NOT_FOUND"), { digest: "NEXT_NOT_FOUND" });
  },
}));
