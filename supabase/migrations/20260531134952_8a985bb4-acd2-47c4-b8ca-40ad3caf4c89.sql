
-- =========================================================
-- PLAYERS (presença em tempo real)
-- =========================================================
CREATE TABLE public.players (
  id              TEXT NOT NULL PRIMARY KEY,
  name            TEXT NOT NULL,
  map             TEXT NOT NULL,
  x               INTEGER NOT NULL DEFAULT 0,
  y               INTEGER NOT NULL DEFAULT 0,
  dir             TEXT NOT NULL DEFAULT 'down',
  leader_species  TEXT,
  leader_rarity   TEXT,
  level           INTEGER NOT NULL DEFAULT 1,
  trainer_level   INTEGER NOT NULL DEFAULT 1,
  craft_points    INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX players_updated_at_idx ON public.players(updated_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_public_read"   ON public.players FOR SELECT USING (true);
CREATE POLICY "players_public_insert" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_public_update" ON public.players FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "players_public_delete" ON public.players FOR DELETE USING (true);

-- =========================================================
-- MARKET LISTINGS
-- =========================================================
CREATE TABLE public.market_listings (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id    TEXT NOT NULL,
  seller_name  TEXT NOT NULL,
  kind         TEXT NOT NULL,
  pet_data     JSONB,
  item_id      TEXT,
  qty          INTEGER,
  price        INTEGER NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'gold',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX market_listings_created_idx ON public.market_listings(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_listings TO anon, authenticated;
GRANT ALL ON public.market_listings TO service_role;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_public_read"   ON public.market_listings FOR SELECT USING (true);
CREATE POLICY "market_public_insert" ON public.market_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "market_public_update" ON public.market_listings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "market_public_delete" ON public.market_listings FOR DELETE USING (true);

-- =========================================================
-- CHALLENGES (PvP)
-- =========================================================
CREATE TABLE public.challenges (
  id               UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id    TEXT NOT NULL,
  challenger_name  TEXT NOT NULL,
  challenger_pet   JSONB NOT NULL,
  opponent_id      TEXT NOT NULL,
  opponent_name    TEXT NOT NULL,
  opponent_pet     JSONB,
  stake_pet        BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'pending',
  winner_id        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX challenges_participants_idx ON public.challenges(challenger_id, opponent_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO anon, authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges_public_read"   ON public.challenges FOR SELECT USING (true);
CREATE POLICY "challenges_public_insert" ON public.challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "challenges_public_update" ON public.challenges FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "challenges_public_delete" ON public.challenges FOR DELETE USING (true);

-- =========================================================
-- GAME SAVES (backup opcional na nuvem)
-- =========================================================
CREATE TABLE public.game_saves (
  user_id     TEXT NOT NULL PRIMARY KEY,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_saves TO anon, authenticated;
GRANT ALL ON public.game_saves TO service_role;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saves_public_read"   ON public.game_saves FOR SELECT USING (true);
CREATE POLICY "saves_public_insert" ON public.game_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "saves_public_update" ON public.game_saves FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "saves_public_delete" ON public.game_saves FOR DELETE USING (true);

-- =========================================================
-- REALTIME
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
