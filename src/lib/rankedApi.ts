import { supabase } from "@/integrations/supabase/client";

export type RankedRow = {
  user_id: string;
  username: string;
  trainer_level: number;
  craft_points: number;
  guild_name: string | null;
  score: number;
  updated_at: string;
};

export type RankedSeason = {
  id: string;
  started_at: string;
  ends_at: string;
  is_current: boolean;
};

/** Envia/atualiza score do jogador na temporada corrente. */
export async function recordRankedScore(level: number, craftPoints: number, guildName?: string | null) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("record_ranked_score", {
      _level: Math.max(1, Math.floor(level || 1)),
      _craft_points: Math.max(0, Math.floor(craftPoints || 0)),
      _guild_name: guildName ?? null,
    });
    if (error) console.warn("[ranked] record:", error.message);
  } catch (e) {
    console.warn("[ranked] record exc:", e);
  }
}

/** Busca a temporada corrente (com ends_at para countdown). */
export async function fetchCurrentSeason(): Promise<RankedSeason | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("ranked_seasons")
    .select("id, started_at, ends_at, is_current")
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();
  if (error) { console.warn("[ranked] season:", error.message); return null; }
  return data as RankedSeason | null;
}

/** Top N da temporada corrente, ordenado por score desc. */
export async function fetchTopRanked(limit = 50): Promise<RankedRow[]> {
  const season = await fetchCurrentSeason();
  if (!season) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("ranked_leaderboard")
    .select("user_id, username, trainer_level, craft_points, guild_name, score, updated_at")
    .eq("season_id", season.id)
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(limit);
  if (error) { console.warn("[ranked] top:", error.message); return []; }
  return (data ?? []) as RankedRow[];
}
