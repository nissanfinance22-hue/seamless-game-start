// Guild system — frontend-only persistence (localStorage), independent of save file.
export const GUILD_KEY = "rubym.guild.v1";
export const GUILD_OPEN_COST = 5000;

import waterIcon from "@/assets/guild/water.png";
import fireIcon from "@/assets/guild/fire.png";
import grassIcon from "@/assets/guild/grass.png";
import psychicIcon from "@/assets/guild/psychic.png";
import poisonIcon from "@/assets/guild/poison.png";
import fairyIcon from "@/assets/guild/fairy.png";
import flyingIcon from "@/assets/guild/flying.png";

export type GuildElement = "fire" | "water" | "grass" | "psychic" | "poison" | "fairy" | "flying";

export const GUILD_ELEMENTS: { id: GuildElement; label: string; image: string; color: string }[] = [
  { id: "fire",    label: "Chamas",  image: fireIcon,    color: "#b1241f" },
  { id: "water",   label: "Marés",   image: waterIcon,   color: "#2754df" },
  { id: "grass",   label: "Folhas",  image: grassIcon,   color: "#157a3a" },
  { id: "psychic", label: "Mente",   image: psychicIcon, color: "#a23166" },
  { id: "poison",  label: "Veneno",  image: poisonIcon,  color: "#6b4396" },
  { id: "fairy",   label: "Fada",    image: fairyIcon,   color: "#9b1f55" },
  { id: "flying",  label: "Voador",  image: flyingIcon,  color: "#5a7c97" },
];

export function guildImageFor(el: GuildElement | undefined | null): string | null {
  if (!el) return null;
  return GUILD_ELEMENTS.find((e) => e.id === el)?.image ?? null;
}

export type GuildRole = "leader" | "vice" | "member";

export type GuildMember = {
  id: string;
  name: string;
  level: number;
  leaderSpecies?: string | null;
  joinedAt: number;
  role?: GuildRole;
};

export type GuildTreasury = { gold: number; crystal: number; ruby: number };

export type Guild = {
  id: string;
  name: string;
  element: GuildElement;
  level: number;
  xp: number;
  members: GuildMember[];
  founderId: string;
  foundedAt: number;
  totalDonated: number;
  viceLeaderId?: string | null;
  treasury?: GuildTreasury;
};

/** Custo para evoluir do nível atual para o próximo. */
export type LevelCost = { gold?: number; crystal?: number; ruby?: number };
export function nextLevelCost(level: number): LevelCost | null {
  // Nv 1→2 ... 9→10. Acima de 10 = MAX.
  const table: Record<number, LevelCost> = {
    1: { gold: 10000 },
    2: { gold: 25000 },
    3: { crystal: 100 },
    4: { crystal: 250 },
    5: { crystal: 500 },
    6: { ruby: 50 },
    7: { ruby: 120 },
    8: { ruby: 250 },
    9: { ruby: 500 },
  };
  return table[level] ?? null;
}
export const GUILD_MAX_LEVEL = 10;


// XP needed for next level (cumulative thresholds simple)
export function xpForLevel(lvl: number): number {
  // xp needed FROM lvl to lvl+1
  return Math.round(50 * Math.pow(1.55, lvl - 1));
}

export type GuildBonus = {
  gold: number;       // multiplier bonus, 0.05 = +5%
  xp: number;
  capture: number;    // additive to capture chance
  shiny: number;      // additive to shiny chance
  slots: number;      // max members
};

export function bonusesFor(level: number): GuildBonus {
  return {
    gold:    Math.min(0.5, level * 0.03),
    xp:      Math.min(0.6, level * 0.04),
    capture: Math.min(0.2, level * 0.01),
    shiny:   Math.min(0.02, level * 0.001),
    slots:   5 + level * 2,
  };
}

export function loadGuild(): Guild | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUILD_KEY);
    return raw ? (JSON.parse(raw) as Guild) : null;
  } catch { return null; }
}

export function saveGuild(g: Guild | null) {
  if (typeof window === "undefined") return;
  try {
    if (!g) localStorage.removeItem(GUILD_KEY);
    else localStorage.setItem(GUILD_KEY, JSON.stringify(g));
  } catch { /* ignore */ }
}

export function createGuild(opts: { name: string; element: GuildElement; founderId: string; founderName: string; founderLevel: number; leaderSpecies?: string | null; }): Guild {
  const g: Guild = {
    id: `g_${Date.now().toString(36)}`,
    name: opts.name.trim().slice(0, 18) || "Sem Nome",
    element: opts.element,
    level: 1,
    xp: 0,
    members: [{ id: opts.founderId, name: opts.founderName, level: opts.founderLevel, leaderSpecies: opts.leaderSpecies ?? null, joinedAt: Date.now() }],
    founderId: opts.founderId,
    foundedAt: Date.now(),
    totalDonated: 0,
  };
  saveGuild(g);
  return g;
}

/** Returns updated guild and how many levels were gained. */
export function donateToGuild(g: Guild, points: number): { guild: Guild; levelsGained: number } {
  if (points <= 0) return { guild: g, levelsGained: 0 };
  const ng: Guild = { ...g, xp: g.xp + points, totalDonated: g.totalDonated + points };
  let levelsGained = 0;
  while (ng.xp >= xpForLevel(ng.level)) {
    ng.xp -= xpForLevel(ng.level);
    ng.level += 1;
    levelsGained += 1;
    if (ng.level >= 50) { ng.xp = 0; break; }
  }
  saveGuild(ng);
  return { guild: ng, levelsGained };
}

export function inviteMember(g: Guild, m: Omit<GuildMember, "joinedAt">): { guild: Guild; ok: boolean; reason?: string } {
  if (g.members.some((x) => x.id === m.id)) return { guild: g, ok: false, reason: "Já é membro." };
  const cap = bonusesFor(g.level).slots;
  if (g.members.length >= cap) return { guild: g, ok: false, reason: `Sem vagas (max ${cap}). Suba o nível!` };
  const ng: Guild = { ...g, members: [...g.members, { ...m, joinedAt: Date.now() }] };
  saveGuild(ng);
  return { guild: ng, ok: true };
}

export function kickMember(g: Guild, memberId: string): Guild {
  if (memberId === g.founderId) return g;
  const ng = { ...g, members: g.members.filter((m) => m.id !== memberId) };
  saveGuild(ng);
  return ng;
}
