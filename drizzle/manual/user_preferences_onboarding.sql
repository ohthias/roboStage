-- Colunas de user_preferences usadas pelo onboarding.
-- Já existem no banco de produção; este arquivo só garante bancos locais em dia.
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "showlive_enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "email_product_updates" boolean DEFAULT false NOT NULL;
