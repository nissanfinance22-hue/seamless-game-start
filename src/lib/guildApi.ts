// Supabase-backed guild API.
// Tabelas: guilds, guild_members, guild_invites (criadas via SQL no SUPABASE_SETUP.md).
//
// Converte rows do DB para a shape `Guild` esperada pelo overlay
// (mantém compat com src/game/guild.ts).
import { supabase } from "@/integrations/supabase/client";
import type { Guild, GuildElement, GuildMember } from "@/game/guild";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type GuildInvite = {
  id: string;
  guild_id: string;
  guild_name: string;
  from_user_id: string;
  from_username: string;
  to_user_id: string | null;
  to_username: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

type DbGuild = {
  id: string;
  name: string;
  element: GuildElement;
  level: number;
  xp: number;
  total_donated: number;
  treasury_gold: number;
  treasury_crystal: number;
  treasury_ruby: number;
  founder_id: string;
  vice_leader_id: string | null;
  created_at: string;
};

type DbMember = {
  guild_id: string;
  user_id: string;
  username: string;
  role: "leader" | "vice" | "member";
  leader_species: string | null;
  level: number;
  joined_at: string;
};

function toGuild(g: DbGuild, members: DbMember[]): Guild {
  return {
    id: g.id,
    name: g.name,
    element: g.element,
    level: g.level,
    xp: g.xp,
    founderId: g.founder_id,
    foundedAt: new Date(g.created_at).getTime(),
    totalDonated: g.total_donated,
    viceLeaderId: g.vice_leader_id,
    treasury: {
      gold: g.treasury_gold ?? 0,
      crystal: g.treasury_crystal ?? 0,
      ruby: g.treasury_ruby ?? 0,
    },
    members: members.map<GuildMember>((m) => ({
      id: m.user_id,
      name: m.username,
      level: m.level,
      leaderSpecies: m.leader_species,
      joinedAt: new Date(m.joined_at).getTime(),
      role: m.role,
    })),
  };
}


/** Carrega a guilda atual do usuário (ou null). */
export async function fetchMyGuild(userId: string): Promise<Guild | null> {
  try {
    const { data: mine } = await sb
      .from("guild_members")
      .select("guild_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!mine?.guild_id) return null;
    const [{ data: g }, { data: ms }] = await Promise.all([
      sb.from("guilds").select("*").eq("id", mine.guild_id).maybeSingle(),
      sb.from("guild_members").select("*").eq("guild_id", mine.guild_id),
    ]);
    if (!g) return null;
    return toGuild(g as DbGuild, (ms as DbMember[]) ?? []);
  } catch {
    return null;
  }
}

/** Verifica se um usuário já tem guilda. */
export async function userHasGuild(userId: string): Promise<boolean> {
  const { data } = await sb.from("guild_members").select("guild_id").eq("user_id", userId).maybeSingle();
  return !!data?.guild_id;
}

export async function createGuildRemote(args: {
  name: string;
  element: GuildElement;
  founderId: string;
  founderName: string;
  founderLevel: number;
  leaderSpecies?: string | null;
}): Promise<{ ok: boolean; guild?: Guild; error?: string }> {
  try {
    if (await userHasGuild(args.founderId)) {
      return { ok: false, error: "Você já está em uma guilda." };
    }
    const { data: ginsert, error: gerr } = await sb
      .from("guilds")
      .insert({ name: args.name.trim().slice(0, 18), element: args.element, founder_id: args.founderId })
      .select("*")
      .single();
    if (gerr || !ginsert) return { ok: false, error: gerr?.message ?? "Erro ao criar." };
    const g = ginsert as DbGuild;
    const { error: merr } = await sb.from("guild_members").insert({
      guild_id: g.id,
      user_id: args.founderId,
      username: args.founderName,
      role: "leader",
      leader_species: args.leaderSpecies ?? null,
      level: args.founderLevel,
    });
    if (merr) {
      await sb.from("guilds").delete().eq("id", g.id);
      return { ok: false, error: merr.message };
    }
    const guild = await fetchMyGuild(args.founderId);
    return guild ? { ok: true, guild } : { ok: false, error: "Falha ao carregar." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro" };
  }
}

/** Resolve username → user_id (via tabela `players` por último visto). */
async function resolveUserId(username: string): Promise<string | null> {
  const u = username.trim();
  if (!u) return null;
  const { data } = await sb.from("players").select("id, name").ilike("name", u).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function sendInviteByUsername(args: {
  guild: Guild;
  fromUserId: string;
  fromUsername: string;
  toUsername: string;
}): Promise<{ ok: boolean; error?: string }> {
  const username = args.toUsername.trim();
  if (!username) return { ok: false, error: "Informe o username." };
  if (username.toLowerCase() === args.fromUsername.toLowerCase()) return { ok: false, error: "Você mesmo? 😅" };
  const targetId = await resolveUserId(username);
  if (targetId && await userHasGuild(targetId)) {
    return { ok: false, error: `${username} já está em uma guilda.` };
  }
  // Checa convite pendente duplicado
  const { data: existing } = await sb
    .from("guild_invites")
    .select("id")
    .eq("guild_id", args.guild.id)
    .eq("status", "pending")
    .ilike("to_username", username)
    .maybeSingle();
  if (existing) return { ok: false, error: "Convite já pendente pra esse jogador." };
  const { error } = await sb.from("guild_invites").insert({
    guild_id: args.guild.id,
    guild_name: args.guild.name,
    from_user_id: args.fromUserId,
    from_username: args.fromUsername,
    to_user_id: targetId,
    to_username: username,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendInviteToPlayer(args: {
  guild: Guild;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (await userHasGuild(args.toUserId)) {
    return { ok: false, error: `${args.toUsername} já está em uma guilda.` };
  }
  const { data: existing } = await sb
    .from("guild_invites")
    .select("id")
    .eq("guild_id", args.guild.id)
    .eq("status", "pending")
    .eq("to_user_id", args.toUserId)
    .maybeSingle();
  if (existing) return { ok: false, error: "Convite já pendente." };
  const { error } = await sb.from("guild_invites").insert({
    guild_id: args.guild.id,
    guild_name: args.guild.name,
    from_user_id: args.fromUserId,
    from_username: args.fromUsername,
    to_user_id: args.toUserId,
    to_username: args.toUsername,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchPendingInvites(userId: string, username: string): Promise<GuildInvite[]> {
  const ors = [`to_user_id.eq.${userId}`, `to_username.ilike.${username}`];
  const { data } = await sb
    .from("guild_invites")
    .select("*")
    .eq("status", "pending")
    .or(ors.join(","));
  return (data as GuildInvite[]) ?? [];
}

export async function acceptInvite(args: {
  invite: GuildInvite;
  userId: string;
  username: string;
  level: number;
  leaderSpecies?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (await userHasGuild(args.userId)) {
    await sb.from("guild_invites").update({ status: "declined" }).eq("id", args.invite.id);
    return { ok: false, error: "Você já está em uma guilda." };
  }
  const { error: merr } = await sb.from("guild_members").insert({
    guild_id: args.invite.guild_id,
    user_id: args.userId,
    username: args.username,
    role: "member",
    leader_species: args.leaderSpecies ?? null,
    level: args.level,
  });
  if (merr) return { ok: false, error: merr.message };
  await sb.from("guild_invites").update({ status: "accepted" }).eq("id", args.invite.id);
  return { ok: true };
}

export async function declineInvite(inviteId: string): Promise<void> {
  await sb.from("guild_invites").update({ status: "declined" }).eq("id", inviteId);
}

export async function kickMemberRemote(guildId: string, userId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from("guild_members").delete().eq("guild_id", guildId).eq("user_id", userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function leaveGuildRemote(userId: string): Promise<void> {
  await sb.from("guild_members").delete().eq("user_id", userId);
}

export async function dissolveGuildRemote(guildId: string): Promise<void> {
  await sb.from("guilds").delete().eq("id", guildId);
}

export async function donateToGuildRemote(guildId: string, xp: number): Promise<{ ok: boolean; error?: string }> {
  if (xp <= 0) return { ok: false, error: "Inválido" };
  const { data: g } = await sb.from("guilds").select("xp, total_donated, level").eq("id", guildId).maybeSingle();
  if (!g) return { ok: false, error: "Guilda não encontrada." };
  const newXp = (g.xp ?? 0) + xp;
  const newTotal = (g.total_donated ?? 0) + xp;
  const { error } = await sb.from("guilds").update({ xp: newXp, total_donated: newTotal }).eq("id", guildId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Doa recurso (gold/crystal/ruby) para o tesouro da guilda. */
export async function donateResourceRemote(
  guildId: string,
  kind: "gold" | "crystal" | "ruby",
  qty: number,
): Promise<{ ok: boolean; error?: string }> {
  if (qty <= 0) return { ok: false, error: "Inválido" };
  const col = `treasury_${kind}`;
  const { data: g } = await sb.from("guilds").select(`${col}, total_donated`).eq("id", guildId).maybeSingle();
  if (!g) return { ok: false, error: "Guilda não encontrada." };
  const cur = (g as Record<string, number>)[col] ?? 0;
  const { error } = await sb
    .from("guilds")
    .update({ [col]: cur + qty, total_donated: (g.total_donated ?? 0) + qty })
    .eq("id", guildId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Consome o tesouro e sobe 1 nível da guilda (líder ou vice). */
export async function evolveGuildRemote(guildId: string): Promise<{ ok: boolean; error?: string; newLevel?: number }> {
  const { nextLevelCost, GUILD_MAX_LEVEL } = await import("@/game/guild");
  const { data: g } = await sb
    .from("guilds")
    .select("level, treasury_gold, treasury_crystal, treasury_ruby")
    .eq("id", guildId)
    .maybeSingle();
  if (!g) return { ok: false, error: "Guilda não encontrada." };
  if (g.level >= GUILD_MAX_LEVEL) return { ok: false, error: "Nível máximo atingido." };
  const cost = nextLevelCost(g.level);
  if (!cost) return { ok: false, error: "Sem custo definido." };
  if ((cost.gold ?? 0) > (g.treasury_gold ?? 0)) return { ok: false, error: `Faltam ${(cost.gold ?? 0) - (g.treasury_gold ?? 0)} ouro no tesouro.` };
  if ((cost.crystal ?? 0) > (g.treasury_crystal ?? 0)) return { ok: false, error: `Faltam ${(cost.crystal ?? 0) - (g.treasury_crystal ?? 0)} cristal no tesouro.` };
  if ((cost.ruby ?? 0) > (g.treasury_ruby ?? 0)) return { ok: false, error: `Faltam ${(cost.ruby ?? 0) - (g.treasury_ruby ?? 0)} ruby no tesouro.` };
  const { error } = await sb
    .from("guilds")
    .update({
      level: g.level + 1,
      treasury_gold: (g.treasury_gold ?? 0) - (cost.gold ?? 0),
      treasury_crystal: (g.treasury_crystal ?? 0) - (cost.crystal ?? 0),
      treasury_ruby: (g.treasury_ruby ?? 0) - (cost.ruby ?? 0),
    })
    .eq("id", guildId);
  return error ? { ok: false, error: error.message } : { ok: true, newLevel: g.level + 1 };
}

/** Promove um membro a vice-líder (apenas o fundador). */
export async function setViceLeaderRemote(guildId: string, userId: string | null): Promise<{ ok: boolean; error?: string }> {
  // 1) atualiza coluna na guilds
  const { error: e1 } = await sb.from("guilds").update({ vice_leader_id: userId }).eq("id", guildId);
  if (e1) return { ok: false, error: e1.message };
  // 2) rebaixa vices antigos
  await sb.from("guild_members").update({ role: "member" }).eq("guild_id", guildId).eq("role", "vice");
  // 3) promove o novo
  if (userId) {
    const { error: e2 } = await sb.from("guild_members").update({ role: "vice" }).eq("guild_id", guildId).eq("user_id", userId);
    if (e2) return { ok: false, error: e2.message };
  }
  return { ok: true };
}

/** Realtime subscription para convites do usuário (callback chamado a cada change). */
export function subscribeMyInvites(userId: string, cb: () => void): () => void {
  const ch = sb
    .channel(`rt-invites-${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "guild_invites", filter: `to_user_id=eq.${userId}` }, cb)
    .subscribe();
  return () => { sb.removeChannel(ch); };
}

