// Helpers to sync the localStorage game save with Supabase (game_saves table).
import { supabase } from "@/integrations/supabase/client";

export const SAVE_KEY = "rubym.save.v2";

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pendingData: unknown = null;

export function scheduleCloudSync(data: unknown) {
  pendingData = data;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    syncTimer = null;
    const snapshot = pendingData;
    pendingData = null;
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid || !snapshot) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("game_saves")
        .upsert({ user_id: uid, data: snapshot, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn("[cloudSave] sync failed", e);
    }
  }, 1500);
}

export async function fetchCloudSave(userId: string): Promise<unknown | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("game_saves")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[cloudSave] fetch failed", error);
    return null;
  }
  return data?.data ?? null;
}

export async function deleteCloudSave(userId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("game_saves").delete().eq("user_id", userId);
}
