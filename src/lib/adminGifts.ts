// Admin → Player gift system.
// Admin insere uma linha em `admin_gifts`. Quando o destinatário entra no jogo,
// reclama os presentes pendentes, aplica no save local e marca como claimed.
//
// Requer tabela Supabase `admin_gifts` (SQL em SUPABASE_SETUP.md).
import { supabase } from "@/integrations/supabase/client";
import { patchSave, addBound, pushLog, SAVE_KEY } from "@/components/admin/adminStore";

export type GiftKind = "gold" | "crystal" | "ruby" | "item" | "ball";

export type GiftRow = {
  id: string;
  recipient_username: string;
  recipient_user_id: string | null;
  kind: GiftKind;
  item_id: string | null;
  qty: number;
  note: string | null;
  sender: string;
  created_at: string;
  claimed_at: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

/** Resolve username → user_id via profiles. Retorna null se não encontrado. */
export async function resolveUserIdByUsername(username: string): Promise<string | null> {
  const u = username.trim();
  if (!u) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id, username")
    .ilike("username", u)
    .maybeSingle();
  if (error || !data) return null;
  return (data.id as string) ?? null;
}

export async function sendGift(input: {
  username: string;
  kind: GiftKind;
  itemId?: string;
  qty: number;
  note?: string;
  sender?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const username = input.username.trim();
  if (!username) return { ok: false, error: "Informe um username." };
  if (!Number.isFinite(input.qty) || input.qty <= 0) return { ok: false, error: "Quantidade inválida." };
  if ((input.kind === "item" || input.kind === "ball") && !input.itemId?.trim()) {
    return { ok: false, error: "Informe o ID do item." };
  }
  const userId = await resolveUserIdByUsername(username);
  // userId pode ser null — o destinatário ainda assim reclama por username.
  const payload = {
    recipient_username: username,
    recipient_user_id: userId,
    kind: input.kind,
    item_id: input.kind === "item" || input.kind === "ball" ? input.itemId!.trim() : null,
    qty: Math.floor(input.qty),
    note: input.note?.trim() || null,
    sender: input.sender ?? "admin",
  };
  const { error } = await sb.from("admin_gifts").insert(payload);
  if (error) return { ok: false, error: error.message };
  pushLog({ actor: "admin", action: "send_gift", target: username, detail: `${input.kind} ×${input.qty}${input.itemId ? ` (${input.itemId})` : ""}` });
  return { ok: true };
}

function applyGiftToSave(g: GiftRow) {
  patchSave((s) => {
    s.balls = s.balls ?? {};
    s.inventory = s.inventory ?? {};
    if (g.kind === "gold") s.gold = (s.gold ?? 0) + g.qty;
    else if (g.kind === "crystal") s.crystal = (s.crystal ?? 0) + g.qty;
    else if (g.kind === "ruby") s.ruby = (s.ruby ?? 0) + g.qty;
    else if (g.kind === "ball" && g.item_id) {
      s.balls[g.item_id] = (s.balls[g.item_id] ?? 0) + g.qty;
      addBound(g.item_id, g.qty);
    } else if (g.kind === "item" && g.item_id) {
      s.inventory[g.item_id] = (s.inventory[g.item_id] ?? 0) + g.qty;
      addBound(g.item_id, g.qty);
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new StorageEvent("storage", { key: SAVE_KEY }));
  }
}

/** Procura gifts pendentes para o usuário atual (por user_id OU username) e aplica. */
export async function claimMyGifts(opts: { userId?: string | null; username?: string | null }): Promise<GiftRow[]> {
  const ors: string[] = [];
  if (opts.userId) ors.push(`recipient_user_id.eq.${opts.userId}`);
  if (opts.username) ors.push(`recipient_username.ilike.${opts.username}`);
  if (ors.length === 0) return [];
  try {
    const { data, error } = await sb
      .from("admin_gifts")
      .select("*")
      .is("claimed_at", null)
      .or(ors.join(","));
    if (error || !data?.length) return [];
    const rows = data as GiftRow[];
    for (const g of rows) applyGiftToSave(g);
    const ids = rows.map((r) => r.id);
    await sb.from("admin_gifts").update({ claimed_at: new Date().toISOString() }).in("id", ids);
    return rows;
  } catch {
    return [];
  }
}
