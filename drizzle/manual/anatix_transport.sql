-- ---------------------------------------------------------------------------
-- Anatix na FLL (Pybricks) — inserção manual (equivale a
-- drizzle/0006_anatix_transport.sql). Pode rodar mais de uma vez.
-- Rodar no SQL Editor do Neon (ou psql), num banco que já tem as tabelas do
-- Anatix (drizzle/manual/anatix_labs.sql).
--
-- O que muda:
--  1. anatix_sessions.transport: como cada sessão foi conectada
--     ("serial", "pybricks-ble" ou "pybricks-usb"); nulo em sessões antigas
--     sem baud rate.
--  2. CHECK para aceitar só esses valores.
--  3. Laboratórios antigos recebem config.transport = "serial" (o código já
--     tratava a ausência do campo como "serial"; isto só deixa o dado explícito).
--
-- Seguro para produção: não apaga nada e não reescreve frames.
-- Rode ANTES (ou junto) do deploy da integração com a FLL: a versão nova do app
-- grava a coluna `transport` ao iniciar cada sessão e falharia sem ela.
-- ---------------------------------------------------------------------------

BEGIN;

-- 1. Coluna nova.
ALTER TABLE "anatix_sessions" ADD COLUMN IF NOT EXISTS "transport" text;

-- Sessões antigas com baud rate vieram da Web Serial (Arduino pelo cabo).
UPDATE "anatix_sessions"
SET "transport" = 'serial'
WHERE "transport" IS NULL
  AND "baud_rate" IS NOT NULL;

-- 2. Valores aceitos (só cria se ainda não existir).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anatix_sessions_transport_check') THEN
    ALTER TABLE "anatix_sessions" ADD CONSTRAINT "anatix_sessions_transport_check"
      CHECK ("transport" IS NULL OR "transport" IN ('serial', 'pybricks-ble', 'pybricks-usb'));
  END IF;
END $$;

-- 3. Laboratórios sem o campo de conexão no config passam a ser "serial".
UPDATE "anatix_labs"
SET "config" = jsonb_set(COALESCE("config", '{}'::jsonb), '{transport}', '"serial"'::jsonb, true)
WHERE NOT (COALESCE("config", '{}'::jsonb) ? 'transport');

COMMIT;

-- ---------------------------------------------------------------------------
-- Conferência (opcional): quantos laboratórios e sessões por tipo de conexão.
-- ---------------------------------------------------------------------------
-- SELECT "config"->>'transport' AS conexao, count(*) FROM "anatix_labs" GROUP BY 1;
-- SELECT coalesce("transport", '(antiga)') AS conexao, count(*) FROM "anatix_sessions" GROUP BY 1;

-- ---------------------------------------------------------------------------
-- Desfazer (só se precisar voltar para a versão anterior do app):
-- ---------------------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE "anatix_sessions" DROP CONSTRAINT IF EXISTS "anatix_sessions_transport_check";
-- ALTER TABLE "anatix_sessions" DROP COLUMN IF EXISTS "transport";
-- UPDATE "anatix_labs" SET "config" = "config" - 'transport' WHERE "config"->>'transport' = 'serial';
-- COMMIT;
-- (Laboratórios "pybricks" ficam com o campo: a versão anterior simplesmente o ignora.)
