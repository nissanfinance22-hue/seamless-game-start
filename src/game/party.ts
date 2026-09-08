// Party system — up to 5 players. Backed by Supabase (parties/party_members/
// party_invites) for cross-client sync, but the local game save is never
// blocked by it: if Supabase is down, party features simply go offline.

import { supabase } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export const PARTY_MAX = 5;

export type PartyRow = {
  id: string;
  name: string;
  leader_id: string;
  leader_name: string;
  created_at: string;
  updated_at: string;
};

export type PartyMemberRow = {
  party_id: string;
  player_id: string;
  player_name: string;
  level: number;
  map_id: string | null;
  joined_at: string;
  last_seen: string;
};

export type PartyInviteRow = {
  id: string;
  party_id: string;
  party_name: string;
  from_id: string;
  from_name: string;
  target_id: string;
  target_name: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

export async function createParty(opts: { name: string; leaderId: string; leaderName: string; level: number; mapId: string }) {
  const partyName = (opts.name || `Grupo de ${opts.leaderName}`).slice(0, 32);
  // Remove any prior membership for this player (one party at a time).
  await sb.from("party_members").delete().eq("player_id", opts.leaderId);
  const { data, error } = await sb
    .from("parties")
    .insert({ name: partyName, leader_id: opts.leaderId, leader_name: opts.leaderName })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Falha ao criar party");
  await sb.from("party_members").insert({
    party_id: data.id,
    player_id: opts.leaderId,
    player_name: opts.leaderName,
    level: opts.level,
    map_id: opts.mapId,
  });
  return data as PartyRow;
}

export async function getMyParty(playerId: string): Promise<{ party: PartyRow; members: PartyMemberRow[] } | null> {
  const { data: m } = await sb.from("party_members").select("party_id").eq("player_id", playerId).maybeSingle();
  if (!m) return null;
  const partyId = (m as { party_id: string }).party_id;
  const [pRes, mRes] = await Promise.all([
    sb.from("parties").select("*").eq("id", partyId).maybeSingle(),
    sb.from("party_members").select("*").eq("party_id", partyId),
  ]);
  if (!pRes.data) return null;
  return { party: pRes.data as PartyRow, members: (mRes.data ?? []) as PartyMemberRow[] };
}

export async function leaveParty(playerId: string, partyId: string, isLeader: boolean) {
  await sb.from("party_members").delete().eq("player_id", playerId).eq("party_id", partyId);
  if (isLeader) {
    // Delete the whole party (cascades to members & invites).
    await sb.from("parties").delete().eq("id", partyId);
  }
}

export async function kickMember(partyId: string, leaderId: string, targetId: string) {
  if (targetId === leaderId) return;
  await sb.from("party_members").delete().eq("party_id", partyId).eq("player_id", targetId);
}

export async function transferLeadership(partyId: string, newLeaderId: string, newLeaderName: string) {
  await sb.from("parties").update({ leader_id: newLeaderId, leader_name: newLeaderName, updated_at: new Date().toISOString() }).eq("id", partyId);
}

export async function invitePlayer(opts: { partyId: string; partyName: string; fromId: string; fromName: string; targetId: string; targetName: string }) {
  // Cancel any prior pending invite to the same target for this party.
  await sb.from("party_invites").delete()
    .eq("party_id", opts.partyId).eq("target_id", opts.targetId).eq("status", "pending");
  const { error } = await sb.from("party_invites").insert({
    party_id: opts.partyId, party_name: opts.partyName,
    from_id: opts.fromId, from_name: opts.fromName,
    target_id: opts.targetId, target_name: opts.targetName,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function listInvitesFor(targetId: string): Promise<PartyInviteRow[]> {
  const { data } = await sb.from("party_invites").select("*").eq("target_id", targetId).eq("status", "pending").order("created_at", { ascending: false });
  return (data ?? []) as PartyInviteRow[];
}

export async function acceptInvite(invite: PartyInviteRow, me: { id: string; name: string; level: number; mapId: string }) {
  // Check capacity.
  const { data: members } = await sb.from("party_members").select("player_id").eq("party_id", invite.party_id);
  if ((members?.length ?? 0) >= PARTY_MAX) {
    await sb.from("party_invites").update({ status: "declined" }).eq("id", invite.id);
    throw new Error("Party já está cheia.");
  }
  await sb.from("party_members").delete().eq("player_id", me.id);
  await sb.from("party_members").insert({
    party_id: invite.party_id, player_id: me.id, player_name: me.name,
    level: me.level, map_id: me.mapId,
  });
  await sb.from("party_invites").update({ status: "accepted" }).eq("id", invite.id);
}

export async function declineInvite(inviteId: string) {
  await sb.from("party_invites").update({ status: "declined" }).eq("id", inviteId);
}

export async function pingPresence(playerId: string, mapId: string, level: number) {
  await sb.from("party_members").update({
    last_seen: new Date().toISOString(),
    map_id: mapId,
    level,
  }).eq("player_id", playerId);
}
// ===== Realtime broadcast (XP share, PvP pings) =====
import type { RealtimeChannel } from "@supabase/supabase-js";

export type PartyBroadcastEvent =
  | { type: "xp_share"; fromId: string; fromName: string; mapId: string; xpEach: number }
  | { type: "kill_ping"; fromId: string; fromName: string; mapId: string; speciesId: string };

export function subscribePartyChannel(partyId: string, onEvent: (e: PartyBroadcastEvent) => void): RealtimeChannel {
  const ch = supabase.channel(`party-bus-${partyId}`, { config: { broadcast: { self: false } } });
  ch.on("broadcast", { event: "msg" }, (payload) => {
    const data = payload.payload as PartyBroadcastEvent;
    if (data) onEvent(data);
  });
  ch.subscribe();
  return ch;
}

export async function broadcastToParty(channel: RealtimeChannel, event: PartyBroadcastEvent) {
  await channel.send({ type: "broadcast", event: "msg", payload: event });
}
