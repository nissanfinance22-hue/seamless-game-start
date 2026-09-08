// Sistemas adicionais do Ruby M: economia, captura por tipos de ball, status detalhado, loja e market.
import * as React from "react";
import { useMemo, useState } from "react";
import { getDex, TYPE_COLOR, TYPE_ICON, MOVE_UNLOCK_LEVEL, isMoveUnlocked } from "./movesets";
import iconPokeball from "@/assets/icon-pokeball.png";
import iconGreatball from "@/assets/icon-greatball.png";
import iconFastball from "@/assets/icon-fastball.png";
import iconUltraball from "@/assets/icon-ultraball.png";
import iconSafariball from "@/assets/icon-safariball.png";
import iconMasterball from "@/assets/ball-master.png";
import iconRevive from "@/assets/item-revive.png";
import iconIncense from "@/assets/item-incense.png";
import iconVip from "@/assets/item-vip.png";

const SHOP_BALL_ICONS: Record<string, string> = {
  pokeball: iconPokeball,
  greatball: iconGreatball,
  fastball: iconFastball,
  ultraball: iconUltraball,
  safariball: iconSafariball,
  masterball: iconMasterball,
};

// ===== Classic currency badges (no emojis) =====
export function GoldCoin({ size = 14 }: { size?: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, #fff2a8 0%, #f6c84a 45%, #a8761c 100%)",
      border: "1px solid #5a3a08",
      color: "#5a3a08", fontWeight: 700,
      fontSize: Math.floor(size * 0.7), lineHeight: 1,
      fontFamily: '"VT323", monospace',
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.25)",
    }}>G</span>
  );
}
export function CrystalGem({ size = 14 }: { size?: number }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      background: "linear-gradient(135deg, #cfeaff 0%, #5aa9e6 50%, #2a5bb0 100%)",
      border: "1px solid #1a2f60",
      transform: "rotate(45deg)",
      boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.55), inset -1px -1px 0 rgba(0,0,0,0.25)",
    }} />
  );
}
function ItemBox({ size = 24 }: { size?: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size,
      background: "linear-gradient(180deg, #d6a96b 0%, #8b5a2b 100%)",
      border: "1px solid #3a2410",
      color: "#fff8e2", fontWeight: 700,
      fontSize: Math.floor(size * 0.55), lineHeight: 1,
      fontFamily: '"VT323", monospace',
      borderRadius: 3,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.35)",
    }}>i</span>
  );
}

export function RareMushroom({ size = 18 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))"
    }}>
      {/* Mushroom Cap */}
      <div style={{
        position: "absolute",
        top: "10%",
        width: "100%",
        height: "60%",
        background: "linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%)",
        borderRadius: "50% 50% 20% 20% / 80% 80% 20% 20%",
        border: "1px solid #660000",
        overflow: "hidden"
      }}>
        {/* White dots */}
        <div style={{ position: "absolute", top: "15%", left: "20%", width: "20%", height: "20%", background: "white", borderRadius: "50%", opacity: 0.8 }} />
        <div style={{ position: "absolute", top: "35%", left: "55%", width: "25%", height: "25%", background: "white", borderRadius: "50%", opacity: 0.8 }} />
        <div style={{ position: "absolute", top: "10%", left: "65%", width: "15%", height: "15%", background: "white", borderRadius: "50%", opacity: 0.8 }} />
      </div>
      {/* Mushroom Stem */}
      <div style={{
        position: "absolute",
        bottom: "10%",
        width: "35%",
        height: "40%",
        background: "linear-gradient(180deg, #fefefe 0%, #e0e0e0 100%)",
        borderRadius: "4px",
        border: "1px solid #999",
        zIndex: -1
      }} />
    </div>
  );
}


export type Species =
  | "charmeleon" | "bulbasaur" | "vulpix" | "jigglypuff" | "caterpie"
  | "charmander" | "squirtle" | "charizard" | "ivysaur" | "venusaur"
  | "butterfree" | "bulbasaur_hat"
  | "pikachu" | "sandslash" | "mewtwo" | "onix" | "pinsir"
  | "magmar" | "hitmonchan" | "golem" | "aerodactyl"
  | "arbok" | "charizard_shiny" | "charizard_alt"
  | "moltres" | "zapdos" | "articuno"
  | "mew" | "dragonite" | "lucario"
  | "metapod" | "beedrill" | "pidgey" | "pidgeot" | "vileplume" | "tangela" | "kabutops"
  | "lapras" | "vaporeon" | "dragonair"
  | "gyarados" | "jolteon" | "jolteon_shiny" | "vaporeon_shiny"
  | "flareon" | "flareon_shiny" | "snorlax" | "dragonite_shiny" | "mew_alt" | "raichu"
  | "weedle" | "weedle_shiny" | "kakuna" | "kakuna_shiny" | "metapod_shiny" | "butterfree_shiny"
  | "rattata_f" | "raticate_f" | "sandshrew" | "sandshrew_shiny" | "sandslash_shiny"
  | "ekans" | "fearow" | "pidgeotto"
  | "wartortle" | "wartortle_shiny" | "blastoise" | "blastoise_shiny"
  // Pack POKÉDEX (Ruby M)
  | "abra" | "kadabra" | "arcanine" | "growlithe" | "bellsprout" | "gloom" | "oddish"
  | "clefable" | "clefairy" | "cubone" | "diglett" | "magnemite"
  | "machamp" | "machoke" | "machop" | "mankey" | "primeape"
  | "meowth" | "persian" | "nidoking" | "nidoran_f" | "nidorina" | "ninetales"
  | "paras" | "parasect" | "poliwag" | "poliwhirl" | "poliwrath" | "psyduck"
  | "venonat" | "venomoth" | "zubat"
  // Novo pack (evento maribondo)
  | "blaziken"
  // Legendários/míticos evento
  | "virizion" | "raikou" | "suicune" | "suicune_shiny" | "luxray_f";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "mythic_shiny";

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9bbc0f",
  uncommon: "#3aa655",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#ef4444",
  mythic: "#f59e0b",
  mythic_shiny: "linear-gradient(45deg, #f59e0b, #ef4444, #a855f7)",
};
export const RARITY_NAME: Record<Rarity, string> = {
  common: "COMUM",
  uncommon: "INCOMUM",
  rare: "RARO",
  epic: "EPICO",
  legendary: "LENDARIO",
  mythic: "MITICO",
  mythic_shiny: "MITICO BRILHANTE",
};

export interface PetInstance {
  uid: string;
  species: Species;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  fome: number;
  lealdade: number;
  rarity: Rarity;
  faintedAt?: number | null; // timestamp em ms quando desmaiou (revive após 3 min)
  statBoost?: number; // multiplicador extra de stats (ex: 1.05 = +5% a+)
  locked?: boolean; // pets de evento: não podem ser vendidos/trocados/anunciados
  ascensionStats?: Record<string, number>; // Atributos passivos aleatórios da ascensão
  actionMoves?: number[]; // índices dos moves (dex.moves) em "Ações" (máx 4)
  loyaltyBonus?: {
    allPct: number; // soma cumulativa do bônus em todos os stats (ex: 0.02 = +2%)
    statPcts?: Partial<Record<"hp"|"atk"|"def"|"spa"|"spd"|"spe", number>>; // bônus por stat sorteado
  };
  hungerUpdatedAt?: number; // ms — último cálculo de decaimento de fome
}

export type LoyaltyStatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";
export const LOYALTY_STATS: LoyaltyStatKey[] = ["hp","atk","def","spa","spd","spe"];
export const STRAWBERRY_LOYALTY_GAIN = 10;

// ===== Fome (hunger) =====
// Decai 5% a cada 20 minutos reais. Pets com fome < 20% não podem entrar
// em batalha nem ser definidos como líder da party.
export const HUNGER_TICK_MS = 20 * 60 * 1000;
export const HUNGER_DECAY_PER_TICK = 5;
export const HUNGER_BATTLE_MIN = 20;
export const STRAWBERRY_HUNGER_GAIN = 30;
export const LEMON_HUNGER_GAIN = 20;

export function isStarving(pet: PetInstance): boolean {
  return (pet.fome ?? 100) < HUNGER_BATTLE_MIN;
}

// Aplica o decaimento de fome desde o último update. Retorna o pet
// atualizado (ou o mesmo objeto se nada mudou).
export function decayHungerForPet(pet: PetInstance, now: number = Date.now()): PetInstance {
  const last = pet.hungerUpdatedAt ?? now;
  const elapsed = now - last;
  if (elapsed < HUNGER_TICK_MS) {
    if (pet.hungerUpdatedAt == null) return { ...pet, hungerUpdatedAt: now };
    return pet;
  }
  const ticks = Math.floor(elapsed / HUNGER_TICK_MS);
  const nextFome = Math.max(0, (pet.fome ?? 100) - ticks * HUNGER_DECAY_PER_TICK);
  return { ...pet, fome: nextFome, hungerUpdatedAt: last + ticks * HUNGER_TICK_MS };
}

export function feedHunger(pet: PetInstance, amount: number): PetInstance {
  const fome = Math.min(100, (pet.fome ?? 100) + amount);
  return { ...pet, fome, hungerUpdatedAt: Date.now() };
}

export const FAINT_REVIVE_MS = 3 * 60 * 1000;

// Bônus de XP por raridade (raridades maiores ganham +20% e mais)
export const RARITY_XP_BONUS: Record<Rarity, number> = {
  common: 1.0, uncommon: 1.0, rare: 1.2, epic: 1.2, legendary: 1.5, mythic: 1.5, mythic_shiny: 2.0,
};

// Chance (por turno) de pokémons raros/épicos curarem 10% do HP em batalha
export const RARITY_HEAL_CHANCE: Record<Rarity, number> = {
  common: 0, uncommon: 0, rare: 0.10, epic: 0.10, legendary: 0.15, mythic: 0.15, mythic_shiny: 0.20,
};

// Sorteia um bônus de status para pets 2★/3★ (rare/epic): 5% de chance de vir +5%
export function rollStatBoost(rarity: Rarity): number {
  if (rarity === "rare" || rarity === "epic") {
    if (Math.random() < 0.05) return 1.05;
  }
  if (rarity === "mythic" && Math.random() < 0.10) return 1.05;
  return 1.0;
}


export const SPECIES_BASE: Record<Species, { hp: number; atk: number; def: number; spa: number; spd: number; spe: number; rarity: Rarity; goldRange: [number, number]; crystalChance: number; catchMod: number; minLv: number }> = {
  charmeleon: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.04, catchMod: 1.1, minLv: 12 },
  bulbasaur:  { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 1 },
  vulpix:     { hp: 38, atk: 41, def: 40, spa: 50, spd: 65, spe: 65, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 3 },
  jigglypuff: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20, rarity: "common", goldRange: [4, 10], crystalChance: 0.01, catchMod: 0.8, minLv: 1 },
  caterpie:   { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45, rarity: "common", goldRange: [3, 8], crystalChance: 0, catchMod: 0.6, minLv: 1 },
  charmander: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 1 },
  squirtle:   { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 1 },
  charizard:  { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100, rarity: "epic", goldRange: [40, 70], crystalChance: 0.25, catchMod: 1.6, minLv: 28 },
  ivysaur:    { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60, rarity: "rare", goldRange: [18, 30], crystalChance: 0.08, catchMod: 1.2, minLv: 14 },
  venusaur:   { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80, rarity: "epic", goldRange: [40, 70], crystalChance: 0.22, catchMod: 1.55, minLv: 30 },
  butterfree: { hp: 60, atk: 45, def: 50, spa: 90, spd: 80, spe: 70, rarity: "rare", goldRange: [16, 28], crystalChance: 0.08, catchMod: 1.15, minLv: 10 },
  bulbasaur_hat: { hp: 50, atk: 55, def: 55, spa: 70, spd: 70, spe: 50, rarity: "rare", goldRange: [20, 32], crystalChance: 0.12, catchMod: 1.2, minLv: 8 },
  pikachu:    { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.05, catchMod: 1.0, minLv: 4 },
  sandslash:  { hp: 75, atk: 100, def: 110, spa: 45, spd: 55, spe: 65, rarity: "rare", goldRange: [22, 36], crystalChance: 0.1, catchMod: 1.3, minLv: 16 },
  mewtwo:     { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130, rarity: "mythic", goldRange: [80, 140], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  onix:       { hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70, rarity: "rare", goldRange: [18, 30], crystalChance: 0.09, catchMod: 1.3, minLv: 12 },
  pinsir:     { hp: 65, atk: 125, def: 100, spa: 55, spd: 70, spe: 85, rarity: "epic", goldRange: [35, 60], crystalChance: 0.18, catchMod: 1.5, minLv: 22 },
  magmar:     { hp: 65, atk: 95, def: 57, spa: 100, spd: 85, spe: 93, rarity: "rare", goldRange: [22, 38], crystalChance: 0.12, catchMod: 1.35, minLv: 18 },
  hitmonchan: { hp: 50, atk: 105, def: 79, spa: 35, spd: 110, spe: 76, rarity: "rare", goldRange: [20, 34], crystalChance: 0.1, catchMod: 1.3, minLv: 16 },
  golem:      { hp: 80, atk: 120, def: 130, spa: 55, spd: 65, spe: 45, rarity: "epic", goldRange: [38, 65], crystalChance: 0.2, catchMod: 1.55, minLv: 25 },
  aerodactyl: { hp: 80, atk: 105, def: 65, spa: 60, spd: 75, spe: 130, rarity: "epic", goldRange: [42, 70], crystalChance: 0.22, catchMod: 1.6, minLv: 26 },
  arbok:           { hp: 60, atk: 95, def: 69, spa: 65, spd: 79, spe: 80, rarity: "rare", goldRange: [22, 36], crystalChance: 0.1, catchMod: 1.3, minLv: 14 },
  charizard_shiny: { hp: 90, atk: 95, def: 85, spa: 120, spd: 95, spe: 110, rarity: "mythic", goldRange: [90, 160], crystalChance: 0.55, catchMod: 2.1, minLv: 90 },
  charizard_alt:   { hp: 88, atk: 92, def: 84, spa: 118, spd: 92, spe: 108, rarity: "mythic", goldRange: [85, 150], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  moltres:         { hp: 90, atk: 100, def: 90, spa: 125, spd: 85, spe: 90, rarity: "mythic", goldRange: [100, 170], crystalChance: 0.6, catchMod: 2.2, minLv: 90 },
  zapdos:          { hp: 90, atk: 90, def: 85, spa: 125, spd: 90, spe: 100, rarity: "mythic", goldRange: [100, 170], crystalChance: 0.6, catchMod: 2.2, minLv: 90 },
  articuno:        { hp: 90, atk: 85, def: 100, spa: 95, spd: 125, spe: 85, rarity: "mythic", goldRange: [100, 170], crystalChance: 0.6, catchMod: 2.2, minLv: 90 },
  mew:             { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100, rarity: "mythic", goldRange: [120, 200], crystalChance: 0.7, catchMod: 2.4, minLv: 90 },
  lucario:         { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90, rarity: "mythic", goldRange: [110, 190], crystalChance: 0.65, catchMod: 2.3, minLv: 90 },
  virizion:        { hp: 91, atk: 90, def: 72, spa: 90, spd: 129, spe: 108, rarity: "epic", goldRange: [90, 160], crystalChance: 0.55, catchMod: 2.1, minLv: 80 },
  raikou:          { hp: 90, atk: 85, def: 75, spa: 115, spd: 100, spe: 115, rarity: "epic", goldRange: [95, 170], crystalChance: 0.6, catchMod: 2.15, minLv: 82 },
  suicune:         { hp: 100, atk: 75, def: 115, spa: 90, spd: 115, spe: 85, rarity: "mythic", goldRange: [120, 200], crystalChance: 0.7, catchMod: 2.35, minLv: 88 },
  suicune_shiny:   { hp: 110, atk: 85, def: 125, spa: 100, spd: 125, spe: 95, rarity: "mythic_shiny", goldRange: [160, 260], crystalChance: 0.85, catchMod: 2.6, minLv: 92 },
  luxray_f:        { hp: 80, atk: 120, def: 79, spa: 95, spd: 79, spe: 70, rarity: "epic", goldRange: [85, 150], crystalChance: 0.5, catchMod: 2.0, minLv: 78 },

  dragonite:       { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80, rarity: "mythic", goldRange: [110, 180], crystalChance: 0.65, catchMod: 2.3, minLv: 90 },
  metapod:    { hp: 50, atk: 20, def: 55, spa: 25, spd: 25, spe: 30, rarity: "common", goldRange: [4, 9], crystalChance: 0, catchMod: 0.7, minLv: 4 },
  beedrill:   { hp: 65, atk: 90, def: 40, spa: 45, spd: 80, spe: 75, rarity: "rare", goldRange: [18, 30], crystalChance: 0.09, catchMod: 1.25, minLv: 12 },
  pidgey:     { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56, rarity: "common", goldRange: [4, 10], crystalChance: 0.01, catchMod: 0.85, minLv: 2 },
  pidgeot:    { hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101, rarity: "epic", goldRange: [38, 65], crystalChance: 0.2, catchMod: 1.55, minLv: 24 },
  vileplume:  { hp: 75, atk: 80, def: 85, spa: 110, spd: 90, spe: 50, rarity: "epic", goldRange: [36, 60], crystalChance: 0.18, catchMod: 1.5, minLv: 22 },
  tangela:    { hp: 65, atk: 55, def: 115, spa: 100, spd: 40, spe: 60, rarity: "rare", goldRange: [20, 32], crystalChance: 0.1, catchMod: 1.3, minLv: 14 },
  kabutops:   { hp: 60, atk: 115, def: 105, spa: 65, spd: 70, spe: 80, rarity: "epic", goldRange: [40, 68], crystalChance: 0.2, catchMod: 1.55, minLv: 26 },
  lapras:     { hp: 130, atk: 85, def: 80, spa: 85, spd: 95, spe: 60, rarity: "epic", goldRange: [50, 85], crystalChance: 0.25, catchMod: 1.6, minLv: 28 },
  vaporeon:   { hp: 130, atk: 65, def: 60, spa: 110, spd: 95, spe: 65, rarity: "epic", goldRange: [45, 75], crystalChance: 0.22, catchMod: 1.55, minLv: 24 },
  dragonair:  { hp: 61, atk: 84, def: 65, spa: 70, spd: 70, spe: 70, rarity: "epic", goldRange: [40, 70], crystalChance: 0.2, catchMod: 1.5, minLv: 22 },
  gyarados:        { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81, rarity: "epic", goldRange: [50, 85], crystalChance: 0.25, catchMod: 1.6, minLv: 28 },
  jolteon:         { hp: 65, atk: 65, def: 60, spa: 110, spd: 95, spe: 130, rarity: "epic", goldRange: [45, 75], crystalChance: 0.22, catchMod: 1.55, minLv: 24 },
  jolteon_shiny:   { hp: 70, atk: 70, def: 65, spa: 115, spd: 100, spe: 135, rarity: "mythic", goldRange: [90, 160], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  vaporeon_shiny:  { hp: 140, atk: 70, def: 65, spa: 115, spd: 100, spe: 70, rarity: "mythic", goldRange: [90, 160], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  flareon:         { hp: 65, atk: 130, def: 60, spa: 95, spd: 110, spe: 65, rarity: "epic", goldRange: [45, 75], crystalChance: 0.22, catchMod: 1.55, minLv: 24 },
  flareon_shiny:   { hp: 70, atk: 135, def: 65, spa: 100, spd: 115, spe: 70, rarity: "mythic", goldRange: [90, 160], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  snorlax:         { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30, rarity: "epic", goldRange: [50, 90], crystalChance: 0.25, catchMod: 1.65, minLv: 30 },
  dragonite_shiny: { hp: 100, atk: 140, def: 100, spa: 105, spd: 105, spe: 85, rarity: "mythic_shiny", goldRange: [140, 220], crystalChance: 0.75, catchMod: 2.5, minLv: 90 },
  mew_alt:         { hp: 110, atk: 110, def: 110, spa: 110, spd: 110, spe: 110, rarity: "mythic_shiny", goldRange: [150, 230], crystalChance: 0.8, catchMod: 2.6, minLv: 90 },
  raichu:          { hp: 60, atk: 90, def: 55, spa: 90, spd: 80, spe: 110, rarity: "epic", goldRange: [40, 70], crystalChance: 0.2, catchMod: 1.5, minLv: 22 },
  weedle:          { hp: 40, atk: 35, def: 30, spa: 20, spd: 20, spe: 50, rarity: "common", goldRange: [3, 8], crystalChance: 0, catchMod: 0.7, minLv: 2 },
  weedle_shiny:    { hp: 45, atk: 40, def: 35, spa: 25, spd: 25, spe: 55, rarity: "rare", goldRange: [25, 50], crystalChance: 0.15, catchMod: 1.2, minLv: 6 },
  kakuna:          { hp: 45, atk: 25, def: 50, spa: 25, spd: 25, spe: 35, rarity: "common", goldRange: [4, 9], crystalChance: 0, catchMod: 0.7, minLv: 4 },
  kakuna_shiny:    { hp: 50, atk: 30, def: 55, spa: 30, spd: 30, spe: 40, rarity: "rare", goldRange: [25, 50], crystalChance: 0.15, catchMod: 1.2, minLv: 8 },
  metapod_shiny:   { hp: 55, atk: 25, def: 60, spa: 30, spd: 30, spe: 35, rarity: "rare", goldRange: [25, 50], crystalChance: 0.15, catchMod: 1.2, minLv: 8 },
  butterfree_shiny:{ hp: 70, atk: 50, def: 55, spa: 100, spd: 90, spe: 75, rarity: "mythic", goldRange: [90, 160], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  rattata_f:       { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72, rarity: "common", goldRange: [3, 8], crystalChance: 0, catchMod: 0.8, minLv: 2 },
  raticate_f:      { hp: 55, atk: 81, def: 60, spa: 50, spd: 70, spe: 97, rarity: "rare", goldRange: [18, 32], crystalChance: 0.09, catchMod: 1.25, minLv: 12 },
  sandshrew:       { hp: 50, atk: 75, def: 85, spa: 20, spd: 30, spe: 40, rarity: "uncommon", goldRange: [8, 15], crystalChance: 0.03, catchMod: 1.0, minLv: 5 },
  sandshrew_shiny: { hp: 55, atk: 80, def: 90, spa: 25, spd: 35, spe: 45, rarity: "rare", goldRange: [28, 55], crystalChance: 0.15, catchMod: 1.25, minLv: 10 },
  sandslash_shiny: { hp: 85, atk: 110, def: 120, spa: 50, spd: 60, spe: 75, rarity: "mythic", goldRange: [95, 165], crystalChance: 0.5, catchMod: 2.0, minLv: 90 },
  ekans:           { hp: 35, atk: 60, def: 44, spa: 40, spd: 54, spe: 55, rarity: "uncommon", goldRange: [8, 15], crystalChance: 0.03, catchMod: 1.0, minLv: 5 },
  fearow:          { hp: 65, atk: 90, def: 65, spa: 61, spd: 61, spe: 100, rarity: "rare", goldRange: [22, 38], crystalChance: 0.1, catchMod: 1.3, minLv: 14 },
  pidgeotto:       { hp: 63, atk: 60, def: 55, spa: 50, spd: 50, spe: 71, rarity: "uncommon", goldRange: [12, 22], crystalChance: 0.05, catchMod: 1.05, minLv: 8 },
  wartortle:       { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58, rarity: "rare", goldRange: [20, 35], crystalChance: 0.1, catchMod: 1.25, minLv: 12 },
  wartortle_shiny: { hp: 65, atk: 68, def: 85, spa: 70, spd: 85, spe: 63, rarity: "epic", goldRange: [40, 70], crystalChance: 0.2, catchMod: 1.5, minLv: 18 },
  blastoise:       { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78, rarity: "epic", goldRange: [45, 75], crystalChance: 0.22, catchMod: 1.55, minLv: 28 },
  blastoise_shiny: { hp: 90, atk: 95, def: 115, spa: 100, spd: 120, spe: 90, rarity: "mythic", goldRange: [100, 180], crystalChance: 0.55, catchMod: 2.1, minLv: 90 },
  // ===== Pack POKÉDEX (Ruby M) =====
  abra:            { hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.05, catchMod: 1.0, minLv: 8 },
  kadabra:         { hp: 40, atk: 35, def: 30, spa: 120, spd: 70, spe: 105, rarity: "rare", goldRange: [22, 36], crystalChance: 0.12, catchMod: 1.3, minLv: 16 },
  arcanine:        { hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95, rarity: "epic", goldRange: [42, 72], crystalChance: 0.22, catchMod: 1.55, minLv: 26 },
  growlithe:       { hp: 55, atk: 70, def: 45, spa: 70, spd: 50, spe: 60, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.04, catchMod: 1.0, minLv: 5 },
  bellsprout:      { hp: 50, atk: 75, def: 35, spa: 70, spd: 30, spe: 40, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 4 },
  gloom:           { hp: 60, atk: 65, def: 70, spa: 85, spd: 75, spe: 40, rarity: "rare", goldRange: [18, 30], crystalChance: 0.09, catchMod: 1.2, minLv: 14 },
  oddish:          { hp: 45, atk: 50, def: 55, spa: 75, spd: 65, spe: 30, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 4 },
  clefable:        { hp: 95, atk: 70, def: 73, spa: 95, spd: 90, spe: 60, rarity: "epic", goldRange: [40, 68], crystalChance: 0.2, catchMod: 1.5, minLv: 24 },
  clefairy:        { hp: 70, atk: 45, def: 48, spa: 60, spd: 65, spe: 35, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.05, catchMod: 1.05, minLv: 6 },
  cubone:          { hp: 50, atk: 50, def: 95, spa: 40, spd: 50, spe: 35, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.05, catchMod: 1.05, minLv: 8 },
  diglett:         { hp: 10, atk: 55, def: 25, spa: 35, spd: 45, spe: 95, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 0.95, minLv: 4 },
  magnemite:       { hp: 25, atk: 35, def: 70, spa: 95, spd: 55, spe: 45, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.05, catchMod: 1.0, minLv: 6 },
  machamp:         { hp: 90, atk: 130, def: 80, spa: 65, spd: 85, spe: 55, rarity: "epic", goldRange: [42, 70], crystalChance: 0.22, catchMod: 1.6, minLv: 26 },
  machoke:         { hp: 80, atk: 100, def: 70, spa: 50, spd: 60, spe: 45, rarity: "rare", goldRange: [22, 36], crystalChance: 0.1, catchMod: 1.3, minLv: 16 },
  machop:          { hp: 70, atk: 80, def: 50, spa: 35, spd: 35, spe: 35, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.04, catchMod: 1.0, minLv: 6 },
  mankey:          { hp: 40, atk: 80, def: 35, spa: 35, spd: 45, spe: 70, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.04, catchMod: 1.0, minLv: 6 },
  primeape:        { hp: 65, atk: 105, def: 60, spa: 60, spd: 70, spe: 95, rarity: "epic", goldRange: [38, 65], crystalChance: 0.2, catchMod: 1.5, minLv: 22 },
  meowth:          { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90, rarity: "uncommon", goldRange: [10, 20], crystalChance: 0.05, catchMod: 1.0, minLv: 5 },
  persian:         { hp: 65, atk: 70, def: 60, spa: 65, spd: 65, spe: 115, rarity: "rare", goldRange: [22, 38], crystalChance: 0.12, catchMod: 1.3, minLv: 14 },
  nidoking:        { hp: 81, atk: 102, def: 77, spa: 85, spd: 75, spe: 85, rarity: "epic", goldRange: [42, 70], crystalChance: 0.22, catchMod: 1.55, minLv: 26 },
  nidoran_f:       { hp: 55, atk: 47, def: 52, spa: 40, spd: 40, spe: 41, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 4 },
  nidorina:        { hp: 70, atk: 62, def: 67, spa: 55, spd: 55, spe: 56, rarity: "rare", goldRange: [18, 30], crystalChance: 0.09, catchMod: 1.25, minLv: 14 },
  ninetales:       { hp: 73, atk: 76, def: 75, spa: 100, spd: 100, spe: 100, rarity: "epic", goldRange: [40, 68], crystalChance: 0.22, catchMod: 1.55, minLv: 24 },
  paras:           { hp: 35, atk: 70, def: 55, spa: 45, spd: 55, spe: 25, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 4 },
  parasect:        { hp: 60, atk: 95, def: 80, spa: 60, spd: 80, spe: 30, rarity: "rare", goldRange: [22, 38], crystalChance: 0.1, catchMod: 1.3, minLv: 16 },
  poliwag:         { hp: 40, atk: 50, def: 40, spa: 40, spd: 40, spe: 90, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 4 },
  poliwhirl:       { hp: 65, atk: 65, def: 65, spa: 50, spd: 50, spe: 90, rarity: "rare", goldRange: [20, 34], crystalChance: 0.1, catchMod: 1.25, minLv: 14 },
  poliwrath:       { hp: 90, atk: 95, def: 95, spa: 70, spd: 90, spe: 70, rarity: "epic", goldRange: [42, 70], crystalChance: 0.22, catchMod: 1.55, minLv: 26 },
  psyduck:         { hp: 50, atk: 52, def: 48, spa: 65, spd: 50, spe: 55, rarity: "uncommon", goldRange: [10, 18], crystalChance: 0.05, catchMod: 1.0, minLv: 6 },
  venonat:         { hp: 60, atk: 55, def: 50, spa: 40, spd: 55, spe: 45, rarity: "uncommon", goldRange: [8, 14], crystalChance: 0.03, catchMod: 1.0, minLv: 5 },
  venomoth:        { hp: 70, atk: 65, def: 60, spa: 90, spd: 75, spe: 90, rarity: "rare", goldRange: [22, 36], crystalChance: 0.12, catchMod: 1.3, minLv: 16 },
  zubat:           { hp: 40, atk: 45, def: 35, spa: 30, spd: 40, spe: 55, rarity: "common", goldRange: [4, 10], crystalChance: 0.01, catchMod: 0.85, minLv: 3 },
  blaziken:        { hp: 80, atk: 120, def: 70, spa: 110, spd: 70, spe: 80, rarity: "epic", goldRange: [80, 150], crystalChance: 0.4, catchMod: 1.9, minLv: 36 },
};

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.1,
  rare: 1.25,
  epic: 1.45,
  legendary: 1.6,
  mythic: 1.75,
  mythic_shiny: 2.1
};

export function xpToNext(level: number) {
  return Math.floor(2 * (10 + level * level * 8));
}

export function calcMaxHp(pet: PetInstance) {
  const b = SPECIES_BASE[pet.species];
  const rw = RARITY_WEIGHT[pet.rarity];
  const boost = pet.statBoost || 1;
  const lb = pet.loyaltyBonus;
  const allMul = 1 + (lb?.allPct ?? 0);
  const hpMul = 1 + (lb?.statPcts?.hp ?? 0);
  const baseHp = Math.floor(((2 * b.hp * pet.level) / 50 + pet.level + 10) * rw * boost * allMul * hpMul);
  const ascBonus = pet.ascensionStats?.hp || 0;
  return baseHp + ascBonus;
}
export function calcStat(pet: PetInstance, key: "atk"|"def"|"spa"|"spd"|"spe") {
  const b = SPECIES_BASE[pet.species][key];
  const rw = RARITY_WEIGHT[pet.rarity];
  const boost = pet.statBoost || 1;
  const lb = pet.loyaltyBonus;
  const allMul = 1 + (lb?.allPct ?? 0);
  const statMul = 1 + (lb?.statPcts?.[key] ?? 0);
  const baseStat = Math.floor(((2 * b * pet.level) / 50 + 5) * rw * boost * allMul * statMul);
  const ascBonus = pet.ascensionStats?.[key] || 0;
  return baseStat + ascBonus;
}

// Distribuição global de raridade: qualquer Pokémon pode rolar raro/épico/mítico.
// Probabilidades alvo: mítico 0.2%, épico 1.5%, raro 8%, restante = raridade base da espécie.
// Sempre usa o maior entre o sorteio e a raridade base (Charizard nunca cai pra "common").
export function rollRarity(species: Species): Rarity {
  const base = SPECIES_BASE[species].rarity;
  const order: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "mythic_shiny"];
  const r = Math.random();
  let rolled: Rarity = "common";
  if (r < 0.002) rolled = "mythic";
  else if (r < 0.002 + 0.015) rolled = "epic";
  else if (r < 0.002 + 0.015 + 0.08) rolled = "rare";
  else rolled = base;
  const idx = Math.max(order.indexOf(rolled), order.indexOf(base));
  return order[idx];
}

export function makePet(species: Species, level = 1, rarity?: Rarity): PetInstance {
  const r = rarity ?? rollRarity(species);
  const sb = rollStatBoost(r);
  const tempPet = {
    uid: crypto.randomUUID(),
    species, level, xp: 0, hp: 0, maxHp: 0,
    fome: 100, lealdade: 1, rarity: r, faintedAt: null, statBoost: sb,
    hungerUpdatedAt: Date.now(),
  };
  const maxHp = calcMaxHp(tempPet as PetInstance);
  return { ...tempPet, hp: maxHp, maxHp } as PetInstance;
}

// Alimenta o pet com um morango: +10 lealdade e +30 de fome. Ao chegar a 100
// de lealdade aplica bônus (+2% em todos stats + 3% em um stat aleatório) e
// reseta lealdade pra 1.
export function feedStrawberry(pet: PetInstance): { pet: PetInstance; leveled: boolean; bonusStat?: LoyaltyStatKey } {
  let lealdade = (pet.lealdade ?? 1) + STRAWBERRY_LOYALTY_GAIN;
  let leveled = false;
  let bonusStat: LoyaltyStatKey | undefined;
  let lb = pet.loyaltyBonus ?? { allPct: 0, statPcts: {} };
  if (lealdade >= 100) {
    leveled = true;
    bonusStat = LOYALTY_STATS[Math.floor(Math.random() * LOYALTY_STATS.length)];
    lb = {
      allPct: +(lb.allPct + 0.02).toFixed(4),
      statPcts: { ...(lb.statPcts ?? {}), [bonusStat]: +((lb.statPcts?.[bonusStat] ?? 0) + 0.03).toFixed(4) },
    };
    lealdade = 1;
  }
  const prevMax = pet.maxHp;
  const fome = Math.min(100, (pet.fome ?? 100) + STRAWBERRY_HUNGER_GAIN);
  const updated: PetInstance = { ...pet, lealdade, loyaltyBonus: lb, fome, hungerUpdatedAt: Date.now() };
  if (leveled) {
    const newMax = calcMaxHp(updated);
    updated.maxHp = newMax;
    updated.hp = Math.min(newMax, pet.hp + Math.max(0, newMax - prevMax));
  }
  return { pet: updated, leveled, bonusStat };
}

export function rollAscensionStats(level: number): Record<string, number> {
  const stats = ["hp", "atk", "def", "spa", "spd", "spe"];
  const result: Record<string, number> = {};
  const points = 5 + level * 5; // Mais pontos por nível de ascensão
  
  for (let i = 0; i < points; i++) {
    const s = stats[Math.floor(Math.random() * stats.length)];
    const val = s === "hp" ? 10 : 2;
    result[s] = (result[s] || 0) + val;
  }
  return result;
}

export function gainXp(pet: PetInstance, amount: number): PetInstance {
  let { level, xp } = pet;
  xp += amount;
  let leveled = false;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    leveled = true;
  }
  const maxHp = calcMaxHp(pet);
  return { ...pet, level, xp, maxHp, hp: leveled ? maxHp : Math.min(pet.hp, maxHp) };
}


export function isFainted(pet: PetInstance) {
  return pet.hp <= 0 || !!pet.faintedAt;
}

// ===== Balls =====
export type BallId = "pokeball" | "greatball" | "fastball" | "ultraball" | "safariball" | "masterball";
export const BALLS: Record<BallId, { name: string; price: number; baseRate: number; icon: string }> = {
  pokeball:   { name: "POKEBALL",    price: 50,   baseRate: 0.45, icon: "🔴" },
  greatball:  { name: "GREAT BALL",  price: 150,  baseRate: 0.60, icon: "🔵" },
  fastball:   { name: "FAST BALL",   price: 220,  baseRate: 0.70, icon: "🟡" },
  ultraball:  { name: "ULTRA BALL",  price: 900,  baseRate: 0.92, icon: "⚫" },
  safariball: { name: "SAFARI BALL", price: 600,  baseRate: 0.80, icon: "🟢" },
  masterball: { name: "MASTER BALL", price: 50,   baseRate: 1.00, icon: "🟣" },
};
// Mythic-tier wild only allows ultraball+ (and safari/master). pokeball/greatball/fastball fail.
export const BALL_BLOCK_MYTHIC: Record<BallId, boolean> = {
  pokeball: true, greatball: true, fastball: true,
  ultraball: false, safariball: false, masterball: false,
};
export function catchChance(ball: BallId, target: PetInstance) {
  if (ball === "masterball") return 1; // 100% sempre
  // Míticos têm captura fixa em 10% (exceto masterball).
  if (target.rarity === "mythic" || target.rarity === "mythic_shiny" || target.rarity === "legendary") {
    if (BALL_BLOCK_MYTHIC[ball]) return 0;
    return 0.10;
  }
  const b = BALLS[ball];
  const hpRatio = target.hp / target.maxHp;
  const sp = SPECIES_BASE[target.species];
  let ch = (b.baseRate * (1 - hpRatio * 0.5)) / (sp.catchMod * 0.85 * RARITY_WEIGHT[target.rarity]);
  // Modificadores por raridade do encontro: raro +5%, épico −40%.
  if (target.rarity === "rare") ch *= 1.05;
  else if (target.rarity === "epic") ch *= 0.60;
  return Math.max(0.05, Math.min(0.98, ch));
}

// ===== Shop / Items =====
export type ShopItem = {
  id: string; name: string; desc: string; price: number; currency: "gold" | "crystal" | "ruby"; icon: string;
};
export const SHOP: ShopItem[] = [
  { id: "pokeball",   name: "Pokeball",        desc: "Captura basica",          price: 50,   currency: "gold",    icon: "🔴" },
  { id: "greatball",  name: "Great Ball",      desc: "Captura media",           price: 300,  currency: "crystal", icon: "🔵" },
  { id: "fastball",   name: "Fast Ball",       desc: "Captura media/alta",      price: 350,  currency: "crystal", icon: "🟡" },
  { id: "safariball", name: "Safari Ball",     desc: "Captura alta (safari)",   price: 400,  currency: "crystal", icon: "🟢" },
  { id: "ultraball",  name: "Ultra Ball",      desc: "Captura altissima",       price: 500,  currency: "crystal", icon: "⚫" },
  { id: "masterball", name: "Master Ball",     desc: "Captura 100% garantida",  price: 10000, currency: "ruby", icon: "🟣" },
  { id: "potion",    name: "Pocao 20%",       desc: "Cura 20% HP",            price: 80,   currency: "gold",    icon: "🧪" },
  { id: "revive",    name: "Revive",          desc: "Revive pet desmaiado",   price: 400,  currency: "gold",    icon: "💖" },
  { id: "incenseXp", name: "Incenso de XP",   desc: "+5% XP e +chance raro (10min)", price: 700, currency: "gold", icon: "🍯" },
  { id: "incenseRare", name: "Incenso Raro",   desc: "+15% XP e ++chance raro (15min)", price: 100, currency: "ruby", icon: "🍯" },
  { id: "incenseEpic", name: "Incenso Épico",   desc: "+30% XP e +++chance especial (20min)", price: 40, currency: "crystal", icon: "🍯" },
  { id: "egg",       name: "Ovo Misterioso",  desc: "Choca pet aleatorio",    price: 30,   currency: "ruby", icon: "🥚" },
  { id: "vipPass",   name: "Aventure Rules",  desc: "Passe VIP +AUTO (30 dias)", price: 350, currency: "ruby", icon: "📕" },
  { id: "skinAura",  name: "Skin Aura",       desc: "Aura dourada cosmetica", price: 25,   currency: "crystal", icon: "✨" },
];

// ===== Market =====
export interface MarketListing {
  id: string;
  sellerId: string;
  kind: "pet" | "item";
  petData?: PetInstance;
  itemId?: string;
  qty?: number;
  price: number;
  currency: "gold" | "crystal";
}

// ====== Overlay base ======
function Panel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,20,8,0.96)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
      <div className="gb-font w-[92%]"
        style={{ height: "88%", display: "flex", flexDirection: "column", fontSize: 8, background: "var(--gb-screen)", border: "3px solid var(--gb-darkest)", borderRadius: 8, color: "var(--gb-darkest)", boxShadow: "0 10px 30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.15)", overflow: "hidden" }}>
        <div className="flex items-center justify-between border-b-2 px-2 py-1 flex-shrink-0" style={{ borderColor: "var(--gb-darkest)" }}>
          <span>— {title} —</span>
          <button onClick={onClose} className="gb-font" style={{ background: "var(--gb-darkest)", color: "var(--gb-lightest)", border: "none", padding: "2px 6px", fontSize: 8 }}>X</button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

// ===================================================================
// Safira+ Shop Overlay — mesmo padrão visual da BAG
// ===================================================================
const SAFIRA_BG = "linear-gradient(180deg, rgba(186,221,247,0.96), rgba(220,236,251,0.96))";
const SAFIRA_PANEL = "rgba(255,255,255,0.85)";
const SAFIRA_PANEL_SOLID = "rgba(255,255,255,0.92)";
const SAFIRA_TEXT = "#1e3a8a";
const SAFIRA_ACCENT = "#2563eb";
const SAFIRA_SHADOW = "0 4px 16px rgba(59,130,246,0.18), inset 0 0 0 1px rgba(255,255,255,0.9)";
const SAFIRA_SHADOW_SM = "0 2px 8px rgba(59,130,246,0.12), inset 0 0 0 1px rgba(255,255,255,0.9)";
const SAFIRA_PRIMARY = "linear-gradient(180deg, #60a5fa, #2563eb)";

function SafiraShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-2 py-2"
      style={{ background: SAFIRA_BG, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex flex-col w-full max-w-[440px]" style={{ height: "96%", gap: 8, color: SAFIRA_TEXT, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: SAFIRA_PANEL, borderRadius: 18, padding: "6px 12px", boxShadow: SAFIRA_SHADOW,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ width: 28 }} />
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2, color: SAFIRA_ACCENT,
            display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ opacity: 0.6 }}>➤</span>{title}<span style={{ opacity: 0.6, transform: "scaleX(-1)", display: "inline-block" }}>➤</span>
          </span>
          <button onClick={onClose} aria-label="Fechar"
            style={{ width: 28, height: 28, borderRadius: 10, border: "none", cursor: "pointer",
              background: SAFIRA_PRIMARY, color: "#fff", fontWeight: 800, fontSize: 14,
              boxShadow: "0 2px 6px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.3)" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SafiraTabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon: React.ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ background: SAFIRA_PANEL, borderRadius: 18, padding: 6, boxShadow: SAFIRA_SHADOW,
      display: "grid", gridTemplateColumns: `repeat(${tabs.length}, 1fr)`, gap: 4 }}>
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "4px 2px",
              borderRadius: 12, border: "none", cursor: "pointer",
              background: active ? SAFIRA_PRIMARY : "transparent",
              color: active ? "#fff" : SAFIRA_ACCENT,
              boxShadow: active ? "0 3px 10px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.4)" : "none" }}>
            {t.icon}
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.4 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SafiraPricePill({ price, currency, can }: { price: number; currency: "gold" | "crystal" | "ruby"; can: boolean }) {
  const bg = !can
    ? "linear-gradient(180deg, #cbd5e1, #94a3b8)"
    : currency === "gold"
      ? "linear-gradient(180deg, #fde68a, #f59e0b)"
      : currency === "ruby"
        ? "linear-gradient(180deg, #fca5a5, #dc2626)"
        : "linear-gradient(180deg, #c4b5fd, #7c3aed)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
      background: bg, color: "#fff", borderRadius: 999, padding: "3px 10px",
      fontSize: 10, fontWeight: 800, opacity: can ? 1 : 0.6,
      boxShadow: "0 2px 6px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)",
      textShadow: "0 1px 0 rgba(0,0,0,0.25)" }}>
      {currency === "gold" ? <GoldCoin size={12} /> : currency === "ruby" ? <span style={{ fontSize: 11 }}>♦</span> : <CrystalGem size={10} />}
      <span>{price}</span>
    </span>
  );
}

// ====== Shop Overlay ======
export function ShopOverlay({
  gold, crystal, ruby = 0, onClose, onBuy,
}: { gold: number; crystal: number; ruby?: number; onClose: () => void; onBuy: (it: ShopItem, qty: number) => void }) {
  type Cat = "all" | "balls" | "potions" | "heal" | "keys" | "premium";
  const [cat, setCat] = useState<Cat>("all");
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<ShopItem | null>(null);
  const [pickQty, setPickQty] = useState(1);

  const ballIds = new Set(["pokeball", "greatball", "fastball", "safariball", "ultraball", "masterball"]);
  const healIds = new Set(["potion", "revive"]);
  const potionIds = new Set(["potion"]);
  const keyIds = new Set(["egg", "vipPass", "skinAura"]);

  const catOf = (it: ShopItem): Exclude<Cat, "all"> => {
    if (ballIds.has(it.id)) return "balls";
    if (it.currency === "crystal" || it.currency === "ruby") return "premium";
    if (potionIds.has(it.id)) return "potions";
    if (healIds.has(it.id)) return "heal";
    if (keyIds.has(it.id)) return "keys";
    return "potions";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHOP.filter((it) => (cat === "all" || catOf(it) === cat) && (!q || it.name.toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, query]);

  const CATS: { id: Cat; label: string; icon: React.ReactNode }[] = [
    { id: "all",      label: "TODOS",   icon: <span style={{ fontSize: 16 }}>▦</span> },
    { id: "balls",    label: "BOLAS",   icon: <img src={iconPokeball} alt="" width={18} height={18} className="pixelated" /> },
    { id: "potions",  label: "POÇÕES",  icon: <span style={{ fontSize: 16 }}>🧪</span> },
    { id: "heal",     label: "CURA",    icon: <span style={{ fontSize: 16 }}>💖</span> },
    { id: "keys",     label: "CHAVES",  icon: <span style={{ fontSize: 16 }}>🔑</span> },
    { id: "premium",  label: "PREMIUM", icon: <span style={{ fontSize: 16 }}>✨</span> },
  ];

  const bal = (cur: "gold" | "crystal" | "ruby") => (cur === "gold" ? gold : cur === "ruby" ? ruby : crystal);
  const maxAfford = pick ? Math.max(1, Math.floor(bal(pick.currency) / pick.price)) : 1;
  const safeQty = Math.max(1, Math.min(pickQty, maxAfford));
  const openPick = (it: ShopItem) => { setPick(it); setPickQty(1); };
  const confirmBuy = () => { if (pick) { onBuy(pick, safeQty); setPick(null); } };

  return (
    <SafiraShell title="LOJA" onClose={onClose}>
      {/* Saldo */}
      <div style={{ background: SAFIRA_PANEL, borderRadius: 18, padding: "6px 12px", boxShadow: SAFIRA_SHADOW,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#a16207" }}>
          <GoldCoin size={16} /><span>{gold}</span>
        </span>
        <span style={{ fontSize: 10, opacity: 0.65, letterSpacing: 1, fontWeight: 700 }}>BEM-VINDO!</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>
          <CrystalGem size={14} /><span>{crystal}</span>
        </span>
      </div>

      <SafiraTabs<Cat> tabs={CATS} value={cat} onChange={setCat} />

      {/* Busca */}
      <div style={{ flex: "0 0 auto", background: SAFIRA_PANEL, borderRadius: 14, padding: "5px 10px",
        boxShadow: SAFIRA_SHADOW_SM, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ opacity: 0.5, fontSize: 12 }}>🔍</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar item..."
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12, color: SAFIRA_TEXT }} />
      </div>

      {/* Lista (rola) */}
      <div className="custom-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, paddingRight: 2 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 20, color: "#64748b", fontSize: 11 }}>
            Nenhum item nesta categoria.
          </div>
        )}
        {filtered.map((it) => {
          const can = bal(it.currency) >= it.price;
          const premium = it.currency === "crystal" || it.currency === "ruby";
          const ballImg = SHOP_BALL_ICONS[it.id];
          const itemImg =
            it.id === "revive" ? iconRevive :
            it.id === "incenseXp" ? iconIncense :
            it.id === "vipPass" ? iconVip : null;
          return (
            <button key={it.id} type="button" disabled={!can} onClick={() => can && openPick(it)}
              style={{
                background: SAFIRA_PANEL_SOLID, borderRadius: 14, padding: "8px 8px 6px",
                border: "none", cursor: can ? "pointer" : "not-allowed", textAlign: "left",
                boxShadow: SAFIRA_SHADOW_SM, opacity: can ? 1 : 0.55,
                display: "flex", flexDirection: "column", gap: 4, position: "relative",
              }}>
              {premium && (
                <span style={{ position: "absolute", top: 4, right: 6, fontSize: 12, color: "#f59e0b" }}>★</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10,
                  background: "linear-gradient(180deg, #eff6ff, #dbeafe)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.5)" }}>
                  {ballImg ? <img src={ballImg} alt={it.name} className="pixelated" width={28} height={28} /> :
                    itemImg ? <img src={itemImg} alt={it.name} className="pixelated" width={28} height={28} /> :
                    <span style={{ fontSize: 22 }}>{it.icon}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: SAFIRA_ACCENT, letterSpacing: 0.3, lineHeight: 1.1 }}>
                    {it.name.toUpperCase()}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 9.5, color: "#64748b", lineHeight: 1.2,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {it.desc}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                <SafiraPricePill price={it.price} currency={it.currency} can={can} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal de quantidade */}
      {pick && (
        <div onClick={() => setPick(null)}
          style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 12 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(180deg, #ffffff, #eff6ff)", borderRadius: 18, padding: 14,
              minWidth: 260, maxWidth: "92%", color: SAFIRA_TEXT, fontFamily: "system-ui, sans-serif",
              boxShadow: "0 12px 40px rgba(37,99,235,0.45), inset 0 0 0 1px rgba(255,255,255,0.9)" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: SAFIRA_ACCENT, letterSpacing: 1, textAlign: "center", marginBottom: 4 }}>
              {pick.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", textAlign: "center", marginBottom: 10 }}>
              {pick.price} {pick.currency === "gold" ? "G" : pick.currency === "ruby" ? "♦" : "💎"} cada · máx {maxAfford}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(180deg, #f87171, #dc2626)", color: "#fff", fontSize: 18, fontWeight: 800,
                  boxShadow: "0 2px 6px rgba(220,38,38,0.4)" }}>−</button>
              <div style={{ minWidth: 64, textAlign: "center", fontSize: 20, fontWeight: 800, color: SAFIRA_ACCENT,
                padding: "6px 10px", background: "#fff", borderRadius: 12, boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.6)" }}>
                {safeQty}
              </div>
              <button onClick={() => setPickQty((q) => Math.min(maxAfford, q + 1))}
                style={{ width: 36, height: 36, borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(180deg, #4ade80, #16a34a)", color: "#fff", fontSize: 18, fontWeight: 800,
                  boxShadow: "0 2px 6px rgba(22,163,74,0.4)" }}>+</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {[1, 5, 10, maxAfford].filter((v, i, a) => v >= 1 && a.indexOf(v) === i).map((v) => (
                <button key={v} onClick={() => setPickQty(v)}
                  style={{ background: "rgba(219,234,254,0.7)", color: SAFIRA_ACCENT, border: "none",
                    borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
                    boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.6)" }}>
                  {v === maxAfford ? "MAX" : `×${v}`}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, textAlign: "center", marginBottom: 10, color: "#475569" }}>
              Total: <b style={{ color: SAFIRA_ACCENT }}>{pick.price * safeQty}</b> {pick.currency === "gold" ? "G" : pick.currency === "ruby" ? "♦" : "💎"}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPick(null)} style={{ flex: 1, background: "rgba(148,163,184,0.25)", color: "#475569",
                border: "none", borderRadius: 12, padding: "8px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                CANCELAR
              </button>
              <button onClick={confirmBuy} style={{ flex: 1, background: SAFIRA_PRIMARY, color: "#fff",
                border: "none", borderRadius: 12, padding: "8px", fontSize: 11, fontWeight: 800, cursor: "pointer",
                boxShadow: "0 3px 10px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                COMPRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </SafiraShell>
  );
}

// ====== Market Overlay (Safira+) ======
export function MarketOverlay({
  gold, crystal, market, onClose, onBuy,
  team, inventory, onPost,
}: {
  gold: number; crystal: number; market: MarketListing[];
  onClose: () => void; onBuy: (l: MarketListing) => void;
  team: PetInstance[]; inventory: Record<string, number>;
  onPost: (l: MarketListing, sourceUid?: string, srcItem?: { id: string; qty: number }) => void;
}) {
  type Tab = "buy" | "sell";
  const [tab, setTab] = useState<Tab>("buy");
  const [query, setQuery] = useState("");
  const [pickKind, setPickKind] = useState<"pet" | "item">("pet");
  const [target, setTarget] = useState("");
  const [price, setPrice] = useState(100);
  const [qty, setQty] = useState(1);
  const [currency, setCurrency] = useState<"gold" | "crystal">("gold");

  const itemEntries = Object.entries(inventory).filter(([k, q]) => q > 0 && !k.startsWith("event_") && k !== "egg_rare");
  const sellablePets = team.filter((p) => !p.locked);

  const filteredMarket = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return market;
    return market.filter((l) => {
      const label = l.kind === "pet" && l.petData ? l.petData.species : (l.itemId || "");
      return label.toLowerCase().includes(q);
    });
  }, [market, query]);

  const post = () => {
    if (!target) return;
    if (pickKind === "pet") {
      const pet = sellablePets.find((p) => p.uid === target);
      if (!pet || pet.locked) return;
      onPost({ id: crypto.randomUUID(), sellerId: "VOCE", kind: "pet", petData: { ...pet }, price, currency }, pet.uid);
    } else {
      if (target.startsWith("event_") || target === "egg_rare") return;
      if ((inventory[target] || 0) < qty) return;
      onPost({ id: crypto.randomUUID(), sellerId: "VOCE", kind: "item", itemId: target, qty, price, currency }, undefined, { id: target, qty });
    }
    setTarget("");
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "buy",  label: "COMPRAR", icon: <span style={{ fontSize: 16 }}>🛒</span> },
    { id: "sell", label: "VENDER",  icon: <span style={{ fontSize: 16 }}>🏷️</span> },
  ];

  return (
    <SafiraShell title="MARKET" onClose={onClose}>
      {/* Saldo */}
      <div style={{ background: SAFIRA_PANEL, borderRadius: 18, padding: "6px 12px", boxShadow: SAFIRA_SHADOW,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#a16207" }}>
          <GoldCoin size={16} /><span>{gold}</span>
        </span>
        <span style={{ fontSize: 10, opacity: 0.65, letterSpacing: 1, fontWeight: 700 }}>MERCADO</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>
          <CrystalGem size={14} /><span>{crystal}</span>
        </span>
      </div>

      <SafiraTabs<Tab> tabs={TABS} value={tab} onChange={setTab} />

      {tab === "buy" ? (
        <>
          <div style={{ background: SAFIRA_PANEL, borderRadius: 14, padding: "5px 10px",
            boxShadow: SAFIRA_SHADOW_SM, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ opacity: 0.5, fontSize: 12 }}>🔍</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar anúncio..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12, color: SAFIRA_TEXT }} />
          </div>
          <div className="custom-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 2 }}>
            {filteredMarket.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: 11 }}>— Sem anúncios —</div>
            )}
            {filteredMarket.map((l) => {
              const can = l.currency === "gold" ? gold >= l.price : crystal >= l.price;
              const rcol = l.kind === "pet" && l.petData ? RARITY_COLOR[l.petData.rarity] : "#94a3b8";
              return (
                <div key={l.id} style={{ background: SAFIRA_PANEL_SOLID, borderRadius: 14,
                  padding: "8px 10px", display: "flex", alignItems: "center", gap: 10,
                  boxShadow: SAFIRA_SHADOW_SM }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10,
                    background: "linear-gradient(180deg, #eff6ff, #dbeafe)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.5)" }}>
                    {l.kind === "pet" && l.petData ? (
                      <span style={{ width: 24, height: 24, borderRadius: "50%", background: rcol,
                        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5)" }} />
                    ) : (
                      <ItemBox size={28} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {l.kind === "pet" && l.petData ? (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 800, color: SAFIRA_ACCENT, lineHeight: 1.1 }}>
                          {l.petData.species.toUpperCase()} · Lv{l.petData.level}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: rcol, lineHeight: 1.2 }}>
                          {RARITY_NAME[l.petData.rarity]}
                        </div>
                        <div style={{ fontSize: 9, color: "#64748b" }}>por {l.sellerId}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 800, color: SAFIRA_ACCENT, lineHeight: 1.1 }}>
                          {l.itemId?.toUpperCase()} ×{l.qty}
                        </div>
                        <div style={{ fontSize: 9, color: "#64748b" }}>por {l.sellerId}</div>
                      </>
                    )}
                  </div>
                  <button onClick={() => can && onBuy(l)} disabled={!can}
                    style={{ border: "none", borderRadius: 999, padding: "5px 10px", cursor: can ? "pointer" : "not-allowed",
                      background: can ? SAFIRA_PRIMARY : "linear-gradient(180deg,#cbd5e1,#94a3b8)",
                      color: "#fff", fontSize: 10, fontWeight: 800,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      boxShadow: can ? "0 2px 6px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.3)" : "none",
                      opacity: can ? 1 : 0.6 }}>
                    {l.currency === "gold" ? <GoldCoin size={12} /> : <CrystalGem size={10} />}
                    <span>{l.price}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="custom-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2 }}>
          <div style={{ background: SAFIRA_PANEL_SOLID, borderRadius: 18, padding: 12, boxShadow: SAFIRA_SHADOW,
            display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {(["pet", "item"] as const).map((k) => {
                const active = pickKind === k;
                return (
                  <button key={k} onClick={() => { setPickKind(k); setTarget(""); }}
                    style={{ border: "none", borderRadius: 12, padding: "6px 8px", cursor: "pointer",
                      background: active ? SAFIRA_PRIMARY : "rgba(219,234,254,0.7)",
                      color: active ? "#fff" : SAFIRA_ACCENT, fontSize: 11, fontWeight: 800, letterSpacing: 1,
                      boxShadow: active ? "0 3px 10px rgba(37,99,235,0.4)" : "inset 0 0 0 1px rgba(147,197,253,0.5)" }}>
                    {k === "pet" ? "PET" : "ITEM"}
                  </button>
                );
              })}
            </div>

            <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>SELECIONE</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              style={{ background: "#fff", border: "none", borderRadius: 12, padding: "8px 10px",
                fontSize: 12, color: SAFIRA_TEXT, fontWeight: 600,
                boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.6)", outline: "none" }}>
              <option value="">-- escolher --</option>
              {pickKind === "pet"
                ? sellablePets.map((p) => <option key={p.uid} value={p.uid}>{p.species.toUpperCase()} Lv{p.level} ({RARITY_NAME[p.rarity]})</option>)
                : itemEntries.map(([id, q]) => <option key={id} value={id}>{id.toUpperCase()} x{q}</option>)}
            </select>

            {pickKind === "item" && (
              <>
                <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>QUANTIDADE</label>
                <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value))}
                  style={{ background: "#fff", border: "none", borderRadius: 12, padding: "8px 10px",
                    fontSize: 12, color: SAFIRA_TEXT, fontWeight: 600,
                    boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.6)", outline: "none" }} />
              </>
            )}

            <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>PREÇO</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="number" min={1} value={price} onChange={(e) => setPrice(Math.max(1, +e.target.value))}
                style={{ flex: 1, background: "#fff", border: "none", borderRadius: 12, padding: "8px 10px",
                  fontSize: 12, color: SAFIRA_TEXT, fontWeight: 700,
                  boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.6)", outline: "none" }} />
              <button onClick={() => setCurrency(currency === "gold" ? "crystal" : "gold")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 14px",
                  background: currency === "gold"
                    ? "linear-gradient(180deg, #fde68a, #f59e0b)"
                    : "linear-gradient(180deg, #c4b5fd, #7c3aed)",
                  color: "#fff", border: "none", borderRadius: 12, fontSize: 11, fontWeight: 800,
                  cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.35)",
                  textShadow: "0 1px 0 rgba(0,0,0,0.25)" }}>
                {currency === "gold" ? <GoldCoin size={13} /> : <CrystalGem size={11} />}
                <span>{currency === "gold" ? "GOLD" : "CRYSTAL"}</span>
              </button>
            </div>

            <button onClick={post}
              style={{ background: SAFIRA_PRIMARY, color: "#fff", border: "none", borderRadius: 14,
                padding: "10px 12px", fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.3)", marginTop: 4 }}>
              ✦ ANUNCIAR ✦
            </button>
            <p style={{ fontSize: 9, color: "#64748b", textAlign: "center", margin: 0 }}>
              Pets vendidos saem do seu time.
            </p>
          </div>
        </div>
      )}
    </SafiraShell>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "var(--gb-darkest)" : "var(--gb-lightest)",
    color: active ? "var(--gb-lightest)" : "var(--gb-darkest)",
    border: "2px solid var(--gb-darkest)", padding: "3px 6px", fontSize: 8,
  };
}

function fancyTabStyle(active: boolean): React.CSSProperties {
  return {
    background: active
      ? "linear-gradient(180deg, var(--gb-darkest), #2a3a1c)"
      : "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15))",
    color: active ? "var(--gb-lightest)" : "var(--gb-darkest)",
    border: "2px solid var(--gb-darkest)",
    borderRadius: 6,
    padding: "6px 8px",
    fontSize: 11,
    letterSpacing: 1,
    boxShadow: active
      ? "inset 0 2px 4px rgba(0,0,0,0.4)"
      : "0 2px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
  };
}

// ====== Stats Overlay ======
function DexTypes({ species }: { species: Species }) {
  const dex = getDex(species);
  return (
    <div style={{ marginTop: 12, background: "rgba(15,23,42,0.55)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(148,163,184,0.12)" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8", marginBottom: 8 }}>ELEMENTO</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {dex.types.map((t) => (
          <span key={t} style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 0.5, padding: "5px 10px", borderRadius: 999,
            background: TYPE_COLOR[t], color: "#0f172a",
            boxShadow: `0 2px 8px ${TYPE_COLOR[t]}66, inset 0 1px 0 rgba(255,255,255,0.4)`,
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            <span>{TYPE_ICON[t]}</span>{t.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

function DexMoves({ pet, onUpdate }: { pet: PetInstance; onUpdate?: (np: PetInstance) => void }) {
  const dex = getDex(pet.species);
  const level = pet.level;
  const unlockedIdx = [0, 1, 2, 3].filter((i) => isMoveUnlocked(i, level));
  const actions = (pet.actionMoves && pet.actionMoves.length > 0)
    ? pet.actionMoves.filter((i) => unlockedIdx.includes(i)).slice(0, 4)
    : unlockedIdx.slice(0, 4);
  const editable = !!onUpdate;
  const [swapFor, setSwapFor] = React.useState<number | null>(null);

  const setActions = (next: number[]) => {
    onUpdate?.({ ...pet, actionMoves: next.slice(0, 4) });
  };
  const addAction = (i: number) => {
    if (actions.includes(i)) return;
    if (actions.length >= 4) { setSwapFor(i); return; }
    setActions([...actions, i]);
  };
  const removeAction = (i: number) => {
    if (actions.length <= 1) return; // mantém ao menos 1
    setActions(actions.filter((x) => x !== i));
  };
  const swapAction = (oldI: number, newI: number) => {
    setActions(actions.map((x) => (x === oldI ? newI : x)));
    setSwapFor(null);
  };

  return (
    <div style={{ marginTop: 12, background: "rgba(15,23,42,0.55)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(148,163,184,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8" }}>ATAQUES</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b" }}>Ações em batalha: {actions.length}/4</span>
      </div>
      {swapFor !== null && (
        <div style={{ marginBottom: 8, padding: 10, borderRadius: 10, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.45)" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#fde68a", marginBottom: 6, letterSpacing: 0.5 }}>
            SUBSTITUIR POR <span style={{ color: "#fff" }}>{dex.moves[swapFor].name.toUpperCase()}</span> — escolha qual remover:
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {actions.map((i) => (
              <button key={i} onClick={() => swapAction(i, swapFor)} style={{
                textAlign: "left", padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.3)",
                background: "rgba(15,23,42,0.6)", color: "#f1f5f9", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                <span style={{ marginRight: 6 }}>{dex.moves[i].icon}</span>{dex.moves[i].name}
              </button>
            ))}
            <button onClick={() => setSwapFor(null)} style={{
              padding: "5px 8px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.25)",
              background: "transparent", color: "#94a3b8", fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gap: 6 }}>
        {dex.moves.map((mv, i) => {
          const unlocked = isMoveUnlocked(i, level);
          const reqLv = MOVE_UNLOCK_LEVEL[i];
          const inActions = actions.includes(i);
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "26px 1fr auto", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 10,
              background: inActions
                ? "linear-gradient(90deg, rgba(34,197,94,0.22), rgba(15,23,42,0.6))"
                : unlocked ? "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(15,23,42,0.6))" : "rgba(15,23,42,0.4)",
              border: inActions
                ? "1px solid rgba(34,197,94,0.55)"
                : unlocked ? "1px solid rgba(59,130,246,0.35)" : "1px dashed rgba(148,163,184,0.25)",
              opacity: unlocked ? 1 : 0.55,
            }}>
              <span style={{ fontSize: 18, textAlign: "center", filter: unlocked ? "none" : "grayscale(1)" }}>{unlocked ? mv.icon : "🔒"}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: unlocked ? "#f1f5f9" : "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mv.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{mv.desc} · {mv.power}</div>
              </div>
              {unlocked ? (
                editable ? (
                  inActions ? (
                    <button onClick={() => removeAction(i)} disabled={actions.length <= 1} style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 0.5, padding: "4px 8px", borderRadius: 999,
                      background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.5)",
                      cursor: actions.length <= 1 ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                    }}>✓ EM AÇÕES</button>
                  ) : (
                    <button onClick={() => addAction(i)} style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 0.5, padding: "4px 8px", borderRadius: 999,
                      background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.5)",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}>+ AÇÕES</button>
                  )
                ) : (
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: 0.5, padding: "3px 7px", borderRadius: 999,
                    background: "rgba(34,197,94,0.2)", color: "#86efac",
                    border: "1px solid rgba(34,197,94,0.4)", whiteSpace: "nowrap",
                  }}>{mv.power.toUpperCase()}</span>
                )
              ) : (
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 0.5, padding: "3px 7px", borderRadius: 999,
                  background: "rgba(15,23,42,0.7)", color: "#fbbf24",
                  border: "1px solid rgba(251,191,36,0.4)", whiteSpace: "nowrap",
                }}>Lv {reqLv}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatsOverlay({ pet, onClose, gif, onUpdate, morangoCount = 0, onUseStrawberry, limaoCount = 0, onUseLemon }: { pet: PetInstance; onClose: () => void; gif: string; onUpdate?: (np: PetInstance) => void; morangoCount?: number; onUseStrawberry?: () => void; limaoCount?: number; onUseLemon?: () => void }) {
  const xpNeed = xpToNext(pet.level);
  const sb = pet.statBoost ?? 1;
  const stats = {
    atk: calcStat(pet, "atk"),
    def: calcStat(pet, "def"),
    spa: calcStat(pet, "spa"),
    spd: calcStat(pet, "spd"),
    spe: calcStat(pet, "spe"),
  };

  const rarityCol = RARITY_COLOR[pet.rarity];
  const isGradient = rarityCol.startsWith("linear-gradient");
  const rarityGlow = isGradient ? "#f59e0b" : rarityCol;
  const rarityBg = isGradient ? rarityCol : `linear-gradient(135deg, ${rarityCol}, ${rarityCol}cc)`;
  const fainted = !!pet.faintedAt;
  const hpPct = Math.max(0, Math.min(100, (pet.hp / Math.max(1, pet.maxHp)) * 100));
  const hpColor = hpPct > 50 ? "linear-gradient(90deg,#22c55e,#16a34a)" : hpPct > 20 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#ef4444,#b91c1c)";

  const totalBase = stats.atk + stats.def + stats.spa + stats.spd + stats.spe;

  const Vital = ({ label, cur, max, gradient, icon }: { label: string; cur: number; max: number; gradient: string; icon: string }) => {
    const pct = Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100));
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#e2e8f0", marginBottom: 3, letterSpacing: 0.5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span>{icon}</span>{label}</span>
          <span style={{ color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>{cur}<span style={{ opacity: 0.5 }}> / {max}</span></span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "rgba(15,23,42,0.85)", border: "1px solid rgba(148,163,184,0.2)", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: gradient, borderRadius: 999, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)", transition: "width .3s ease" }} />
        </div>
      </div>
    );
  };

  const StatRow = ({ label, v, color, icon }: { label: string; v: number; color: string; icon: string }) => {
    const pct = Math.max(4, Math.min(100, (v / 200) * 100));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 42px", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 18, textAlign: "center" }}>{icon}</span>{label}
        </span>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(15,23,42,0.85)", overflow: "hidden", border: "1px solid rgba(148,163,184,0.15)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{v}</span>
      </div>
    );
  };

  const ascension = pet.ascensionStats || {};
  const ascKeys = Object.keys(ascension).filter((k) => (ascension as Record<string, number>)[k]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#020617",
        backgroundImage: `radial-gradient(circle at center, ${rarityGlow}22, transparent 70%), linear-gradient(180deg, #0b1226, #020617)`,
        padding: 8,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        zIndex: 50,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 440, maxHeight: "94%", overflow: "hidden",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: 20,
        border: "1px solid rgba(148,163,184,0.18)",
        boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 80px ${rarityGlow}33, inset 0 1px 0 rgba(255,255,255,0.08)`,
        display: "flex", flexDirection: "column",
      }}>
        {/* HERO */}
        <div style={{
          position: "relative", padding: "16px 16px 14px", overflow: "hidden",
          background: `${rarityBg}`,
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top, rgba(255,255,255,0.25), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
            <button onClick={onClose} aria-label="Fechar" style={{
              width: 30, height: 30, borderRadius: 10, border: "none", cursor: "pointer",
              background: "rgba(15,23,42,0.55)", color: "#fff", fontWeight: 800, fontSize: 16,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.15)",
            }}>×</button>
          </div>
          <div style={{ position: "relative", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{
              position: "relative", width: 96, height: 96, borderRadius: 24,
              background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.25), 0 8px 20px rgba(0,0,0,0.35)`,
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${rarityGlow}66, transparent 70%)`, filter: "blur(4px)" }} />
              <img src={gif} alt={pet.species} className="pixelated" width={80} height={80} style={{ position: "relative", imageRendering: "pixelated", filter: fainted ? "grayscale(1) brightness(0.6)" : "drop-shadow(0 4px 6px rgba(0,0,0,0.4))" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, color: "#fff" }}>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.5, textShadow: "0 2px 4px rgba(0,0,0,0.35)", textTransform: "capitalize" }}>{pet.species.replace(/_/g, " ")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 999, background: "rgba(15,23,42,0.55)", color: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)" }}>
                  Lv. {pet.level}
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 999, background: "rgba(255,255,255,0.95)", color: "#0f172a" }}>
                  {RARITY_NAME[pet.rarity]}
                </span>
                {sb > 1 && (
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 999, background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#7c2d12", boxShadow: "0 0 12px rgba(251,191,36,0.5)" }}>
                    ✦ +5%
                  </span>
                )}
                {fainted && (
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 999, background: "#7f1d1d", color: "#fecaca" }}>
                    DESMAIADO
                  </span>
                )}
                {pet.locked && (
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 999, background: "rgba(15,23,42,0.55)", color: "#fde68a" }}>
                    🔒 EVENTO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: 14, overflowY: "auto", flex: 1 }}>
          {/* Vitals */}
          <div style={{ background: "rgba(15,23,42,0.55)", borderRadius: 14, padding: 12, border: "1px solid rgba(148,163,184,0.12)" }}>
            <Vital label="HP" cur={pet.hp} max={pet.maxHp} gradient={hpColor} icon="❤" />
            <Vital label="EXPERIÊNCIA" cur={pet.xp} max={xpNeed} gradient="linear-gradient(90deg,#60a5fa,#2563eb)" icon="✦" />
            <Vital label="FOME" cur={pet.fome} max={100} gradient="linear-gradient(90deg,#fbbf24,#d97706)" icon="🍖" />
            {isStarving(pet) && (
              <div style={{ marginTop: 4, marginBottom: 8, padding: "6px 10px", borderRadius: 10, background: "rgba(220,38,38,0.18)", border: "1px solid rgba(248,113,113,0.55)", color: "#fecaca", fontSize: 10, fontWeight: 800, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>⚠</span> COM FOME! Não pode lutar nem ser líder. Alimente com 🍓 ou 🍋.
              </div>
            )}
            <div style={{ marginBottom: 0 }}>
              <Vital label="LEALDADE" cur={pet.lealdade} max={100} gradient="linear-gradient(90deg,#c084fc,#9333ea)" icon="❦" />
            </div>
            {(pet.loyaltyBonus && (pet.loyaltyBonus.allPct > 0 || Object.keys(pet.loyaltyBonus.statPcts ?? {}).length > 0)) && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {pet.loyaltyBonus.allPct > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 999, background: "rgba(168,85,247,0.18)", color: "#e9d5ff", border: "1px solid rgba(168,85,247,0.45)" }}>
                    ❦ TODOS +{(pet.loyaltyBonus.allPct * 100).toFixed(0)}%
                  </span>
                )}
                {Object.entries(pet.loyaltyBonus.statPcts ?? {}).map(([k, v]) => (
                  <span key={k} style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 999, background: "rgba(236,72,153,0.18)", color: "#fbcfe8", border: "1px solid rgba(236,72,153,0.45)" }}>
                    {k.toUpperCase()} +{(((v as number) || 0) * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            )}
            {onUseStrawberry && (
              <button
                onClick={onUseStrawberry}
                disabled={morangoCount <= 0}
                style={{
                  marginTop: 8, width: "100%", padding: "7px 10px", borderRadius: 10,
                  background: morangoCount > 0
                    ? "linear-gradient(90deg, rgba(244,63,94,0.35), rgba(190,18,60,0.45))"
                    : "rgba(15,23,42,0.5)",
                  border: morangoCount > 0 ? "1px solid rgba(251,113,133,0.55)" : "1px dashed rgba(148,163,184,0.25)",
                  color: morangoCount > 0 ? "#fecdd3" : "#64748b",
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.5, cursor: morangoCount > 0 ? "pointer" : "not-allowed",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>🍓</span> USAR MORANGO (+10 LEAL. · +30 FOME) <span style={{ opacity: 0.7, fontSize: 10 }}>×{morangoCount}</span>
              </button>
            )}
            {onUseLemon && (
              <button
                onClick={onUseLemon}
                disabled={limaoCount <= 0}
                style={{
                  marginTop: 6, width: "100%", padding: "7px 10px", borderRadius: 10,
                  background: limaoCount > 0
                    ? "linear-gradient(90deg, rgba(250,204,21,0.32), rgba(202,138,4,0.45))"
                    : "rgba(15,23,42,0.5)",
                  border: limaoCount > 0 ? "1px solid rgba(250,204,21,0.55)" : "1px dashed rgba(148,163,184,0.25)",
                  color: limaoCount > 0 ? "#fef9c3" : "#64748b",
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.5, cursor: limaoCount > 0 ? "pointer" : "not-allowed",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>🍋</span> USAR LIMÃO (+20 FOME) <span style={{ opacity: 0.7, fontSize: 10 }}>×{limaoCount}</span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ marginTop: 12, background: "rgba(15,23,42,0.55)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(148,163,184,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8" }}>ATRIBUTOS</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>TOTAL <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 900 }}>{totalBase}</span></span>
            </div>
            <StatRow label="ATAQUE"   v={stats.atk} icon="⚔" color="linear-gradient(90deg,#f87171,#dc2626)" />
            <StatRow label="DEFESA"   v={stats.def} icon="🛡" color="linear-gradient(90deg,#fbbf24,#d97706)" />
            <StatRow label="SP. ATK"  v={stats.spa} icon="✦" color="linear-gradient(90deg,#a78bfa,#7c3aed)" />
            <StatRow label="SP. DEF"  v={stats.spd} icon="❉" color="linear-gradient(90deg,#34d399,#059669)" />
            <div style={{ marginBottom: -1 }}>
              <StatRow label="VELOCIDADE" v={stats.spe} icon="⚡" color="linear-gradient(90deg,#60a5fa,#2563eb)" />
            </div>
          </div>

          {/* Tipos / Elementos */}
          <DexTypes species={pet.species} />

          {/* Moveset */}
          <DexMoves pet={pet} onUpdate={onUpdate} />

          {/* Ascension */}
          {ascKeys.length > 0 && (
            <div style={{ marginTop: 12, background: "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(168,85,247,0.15))", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(251,146,60,0.3)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#fdba74", marginBottom: 6 }}>✦ ASCENSÃO</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ascKeys.map((k) => (
                  <span key={k} style={{ fontSize: 10, fontWeight: 700, padding: "4px 9px", borderRadius: 999, background: "rgba(15,23,42,0.6)", color: "#fde68a", boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.35)" }}>
                    {k.toUpperCase()} +{(ascension as Record<string, number>)[k]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
