import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida");
}

const sql = neon(process.env.DATABASE_URL);

// schema é passado para habilitar db.query.<tabela>.findMany({ with: {...} })
export const db = drizzle(sql, { schema });
