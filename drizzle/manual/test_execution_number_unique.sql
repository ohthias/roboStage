-- ---------------------------------------------------------------------------
-- Números de execução únicos por teste — inserção manual (equivale a
-- drizzle/0005_test_execution_number_unique.sql). Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql).
-- ---------------------------------------------------------------------------

BEGIN;

-- Renumera duplicados para o fim da sequência do teste; o primeiro lançamento
-- de cada número mantém o seu.
WITH ranked AS (
  SELECT "id", "test_id", "created_at",
    row_number() OVER (PARTITION BY "test_id", "execution_number" ORDER BY "created_at", "id") AS rn
  FROM "test_executions"
), extra AS (
  SELECT "id", "test_id",
    row_number() OVER (PARTITION BY "test_id" ORDER BY "created_at", "id") AS k
  FROM ranked
  WHERE rn > 1
), maxes AS (
  SELECT "test_id", max("execution_number") AS m
  FROM "test_executions"
  GROUP BY "test_id"
)
UPDATE "test_executions" AS t
SET "execution_number" = maxes.m + extra.k
FROM extra
JOIN maxes ON maxes."test_id" = extra."test_id"
WHERE t."id" = extra."id";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'test_executions_test_number_unique'
  ) THEN
    ALTER TABLE "test_executions"
      ADD CONSTRAINT "test_executions_test_number_unique" UNIQUE ("test_id", "execution_number");
  END IF;
END $$;

COMMIT;
