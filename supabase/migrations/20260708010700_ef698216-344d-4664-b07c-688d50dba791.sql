-- =========================================================
-- CORE PROFILE / SAVE TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  username text,
  level integer NOT NULL DEFAULT 1,
  gold integer NOT NULL DEFAULT 0,
  ruby integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_public_game_access ON public.profiles;
CREATE POLICY profiles_public_game_access ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.game_saves (
  user_id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_saves TO anon, authenticated;
GRANT ALL ON public.game_saves TO service_role;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS game_saves_public_game_access ON public.game_saves;
CREATE POLICY game_saves_public_game_access ON public.game_saves FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- PLAYERS (online presence / multiplayer)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.players (
  id text PRIMARY KEY,
  name text NOT NULL,
  map text NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  dir text NOT NULL DEFAULT 'down',
  leader_species text,
  leader_rarity text,
  level integer NOT NULL DEFAULT 1,
  trainer_level integer NOT NULL DEFAULT 1,
  craft_points integer NOT NULL DEFAULT 0,
  guild_name text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS players_updated_at_idx ON public.players(updated_at);
CREATE INDEX IF NOT EXISTS players_map_updated_idx ON public.players(map, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS players_public_game_access ON public.players;
CREATE POLICY players_public_game_access ON public.players FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- PARTIES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  leader_id text NOT NULL,
  leader_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parties TO anon, authenticated;
GRANT ALL ON public.parties TO service_role;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS parties_public_game_access ON public.parties;
CREATE POLICY parties_public_game_access ON public.parties FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.party_members (
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  map_id text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (party_id, player_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS party_members_player_unique ON public.party_members(player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.party_members TO anon, authenticated;
GRANT ALL ON public.party_members TO service_role;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS party_members_public_game_access ON public.party_members;
CREATE POLICY party_members_public_game_access ON public.party_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.party_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  party_name text NOT NULL,
  from_id text NOT NULL,
  from_name text NOT NULL,
  target_id text NOT NULL,
  target_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS party_invites_target_idx ON public.party_invites(target_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.party_invites TO anon, authenticated;
GRANT ALL ON public.party_invites TO service_role;
ALTER TABLE public.party_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS party_invites_public_game_access ON public.party_invites;
CREATE POLICY party_invites_public_game_access ON public.party_invites FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- GROUP LEGENDARY STATE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.group_legendary_state (
  spawn_id text PRIMARY KEY,
  map_id text NOT NULL,
  species text NOT NULL,
  party_id uuid,
  captured_by text,
  captured_name text,
  captured_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_legendary_state TO anon, authenticated;
GRANT ALL ON public.group_legendary_state TO service_role;
ALTER TABLE public.group_legendary_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gls_public_game_access ON public.group_legendary_state;
CREATE POLICY gls_public_game_access ON public.group_legendary_state FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- MARKET / CHALLENGES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  seller_name text NOT NULL,
  kind text NOT NULL,
  pet_data jsonb,
  item_id text,
  qty integer,
  price integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'gold',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS market_listings_created_idx ON public.market_listings(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_listings TO anon, authenticated;
GRANT ALL ON public.market_listings TO service_role;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS market_public_game_access ON public.market_listings;
CREATE POLICY market_public_game_access ON public.market_listings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id text NOT NULL,
  challenger_name text NOT NULL,
  challenger_pet jsonb NOT NULL,
  opponent_id text NOT NULL,
  opponent_name text NOT NULL,
  opponent_pet jsonb,
  stake_pet boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  winner_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS challenges_participants_idx ON public.challenges(challenger_id, opponent_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO anon, authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS challenges_public_game_access ON public.challenges;
CREATE POLICY challenges_public_game_access ON public.challenges FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- ADMIN GIFTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_username text NOT NULL,
  recipient_user_id text,
  kind text NOT NULL,
  item_id text,
  qty integer NOT NULL CHECK (qty > 0),
  note text,
  sender text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);
CREATE INDEX IF NOT EXISTS admin_gifts_recipient_user_idx ON public.admin_gifts(recipient_user_id) WHERE claimed_at IS NULL;
CREATE INDEX IF NOT EXISTS admin_gifts_recipient_name_idx ON public.admin_gifts(lower(recipient_username)) WHERE claimed_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_gifts TO anon, authenticated;
GRANT ALL ON public.admin_gifts TO service_role;
ALTER TABLE public.admin_gifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_gifts_public_game_access ON public.admin_gifts;
CREATE POLICY admin_gifts_public_game_access ON public.admin_gifts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- GUILDS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  element text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  total_donated integer NOT NULL DEFAULT 0,
  treasury_gold integer NOT NULL DEFAULT 0,
  treasury_crystal integer NOT NULL DEFAULT 0,
  treasury_ruby integer NOT NULL DEFAULT 0,
  founder_id text NOT NULL,
  vice_leader_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guilds TO anon, authenticated;
GRANT ALL ON public.guilds TO service_role;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS guilds_public_game_access ON public.guilds;
CREATE POLICY guilds_public_game_access ON public.guilds FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.guild_members (
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  leader_species text,
  level integer NOT NULL DEFAULT 1,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_id, user_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS guild_members_user_unique ON public.guild_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guild_members TO anon, authenticated;
GRANT ALL ON public.guild_members TO service_role;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS guild_members_public_game_access ON public.guild_members;
CREATE POLICY guild_members_public_game_access ON public.guild_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.guild_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  guild_name text NOT NULL,
  from_user_id text NOT NULL,
  from_username text NOT NULL,
  to_user_id text,
  to_username text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guild_invites_to_user_idx ON public.guild_invites(to_user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS guild_invites_to_name_idx ON public.guild_invites(lower(to_username)) WHERE status = 'pending';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guild_invites TO anon, authenticated;
GRANT ALL ON public.guild_invites TO service_role;
ALTER TABLE public.guild_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS guild_invites_public_game_access ON public.guild_invites;
CREATE POLICY guild_invites_public_game_access ON public.guild_invites FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- RANKED
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ranked_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ranked_seasons_one_current ON public.ranked_seasons(is_current) WHERE is_current = true;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ranked_seasons TO anon, authenticated;
GRANT ALL ON public.ranked_seasons TO service_role;
ALTER TABLE public.ranked_seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ranked_seasons_public_game_access ON public.ranked_seasons;
CREATE POLICY ranked_seasons_public_game_access ON public.ranked_seasons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ranked_leaderboard (
  season_id uuid NOT NULL REFERENCES public.ranked_seasons(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  trainer_level integer NOT NULL DEFAULT 1,
  craft_points integer NOT NULL DEFAULT 0,
  guild_name text,
  score integer GENERATED ALWAYS AS (trainer_level * 100 + craft_points) STORED,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, user_id)
);
CREATE INDEX IF NOT EXISTS ranked_leaderboard_score_idx ON public.ranked_leaderboard(season_id, score DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ranked_leaderboard TO anon, authenticated;
GRANT ALL ON public.ranked_leaderboard TO service_role;
ALTER TABLE public.ranked_leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ranked_leaderboard_public_game_access ON public.ranked_leaderboard;
CREATE POLICY ranked_leaderboard_public_game_access ON public.ranked_leaderboard FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ranked_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL,
  ended_at timestamptz NOT NULL,
  rank integer NOT NULL,
  user_id text NOT NULL,
  username text NOT NULL,
  trainer_level integer NOT NULL,
  craft_points integer NOT NULL,
  score integer NOT NULL,
  guild_name text
);
CREATE INDEX IF NOT EXISTS ranked_history_season_idx ON public.ranked_history(season_id, rank);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ranked_history TO anon, authenticated;
GRANT ALL ON public.ranked_history TO service_role;
ALTER TABLE public.ranked_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ranked_history_public_game_access ON public.ranked_history;
CREATE POLICY ranked_history_public_game_access ON public.ranked_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.ranked_seasons (started_at, ends_at, is_current)
SELECT now(), now() + interval '20 hours', true
WHERE NOT EXISTS (SELECT 1 FROM public.ranked_seasons WHERE is_current = true);

CREATE OR REPLACE FUNCTION public.record_ranked_score(_level int, _craft_points int, _guild_name text DEFAULT null)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sid uuid;
  _uid text;
  _uname text;
BEGIN
  _uid := coalesce(auth.uid()::text, 'anon-' || md5(coalesce(current_setting('request.headers', true), random()::text)));
  SELECT id INTO _sid FROM public.ranked_seasons WHERE is_current = true LIMIT 1;
  IF _sid IS NULL THEN
    INSERT INTO public.ranked_seasons (started_at, ends_at, is_current)
    VALUES (now(), now() + interval '20 hours', true)
    RETURNING id INTO _sid;
  END IF;
  SELECT coalesce(username, 'Treinador') INTO _uname FROM public.profiles WHERE id::text = _uid;
  INSERT INTO public.ranked_leaderboard (season_id, user_id, username, trainer_level, craft_points, guild_name, updated_at)
  VALUES (_sid, _uid, coalesce(_uname, 'Treinador'), greatest(_level, 1), greatest(_craft_points, 0), _guild_name, now())
  ON CONFLICT (season_id, user_id) DO UPDATE
    SET trainer_level = greatest(excluded.trainer_level, ranked_leaderboard.trainer_level),
        craft_points = greatest(excluded.craft_points, ranked_leaderboard.craft_points),
        guild_name = excluded.guild_name,
        username = excluded.username,
        updated_at = now();
END;
$$;
GRANT EXECUTE ON FUNCTION public.record_ranked_score(int, int, text) TO anon, authenticated;

-- =========================================================
-- REALTIME PUBLICATION
-- =========================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.parties;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.party_members;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.party_invites;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.market_listings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_invites;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.group_legendary_state;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;