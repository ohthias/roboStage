-- Preferência "ShowLive ativado" (mostra o ShowLive no menu do painel).
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "showlive_enabled" boolean DEFAULT false NOT NULL;
