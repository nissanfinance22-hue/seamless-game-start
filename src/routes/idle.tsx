import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FlaskConical, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import navInicio from "@/assets/icons/nav-inicio.png";
import navPokemon from "@/assets/icons/nav-pokemon.png";
import navMochila from "@/assets/icons/nav-mochila.png";
import navBatalha from "@/assets/icons/nav-batalha.png";
import navMelhorias from "@/assets/icons/nav-melhorias.png";
import navColecao from "@/assets/icons/nav-colecao.png";
import navLoja from "@/assets/icons/nav-loja.png";
import navWallet from "@/assets/icons/nav-wallet.png";
import navMarket from "@/assets/icons/nav-market.png";

import chestClosedImg from "@/assets/icons/chest-closed.png";
import chestOpenImg from "@/assets/icons/chest-open.png";
import ballPokeImg from "@/assets/items/icon-pokeball.png";
import ballGreatImg from "@/assets/items/icon-greatball.png";
import ballUltraImg from "@/assets/items/icon-ultraball.png";
import potionNewImg from "@/assets/items/icon-potion.png";
import chestAmuletImg from "@/assets/items/icon-chest-amulet.png";
import bagIconImg from "@/assets/items/icon-bag.png";
import reviveIconImg from "@/assets/items/icon-revive.png";
import berryIconImg from "@/assets/items/icon-berry.png";
import keyIconImg from "@/assets/items/icon-key.png";
import fxSlashImg from "@/assets/items/fx-slash.png";
import autoIconImg from "@/assets/items/icon-auto.png";
import bookAtkImg from "@/assets/icons/book-atk.png";
import bookDefImg from "@/assets/icons/book-def.png";
import bookExpImg from "@/assets/icons/book-exp.png";
import potionIconAsset from "@/assets/potion-icon.png.asset.json";
import houseLarImg from "@/assets/house-lar.png";
import houseLabImg from "@/assets/house-lab.png";
import walletHero from "@/assets/wallet-exchange.jpg";

import { GuestGate } from "@/components/GuestGate";
import { loadIdentity, type LocalIdentity } from "@/components/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import { assetUrl } from "@/lib/assetUrl";
import { loadLatestValid, saveNow } from "@/lib/localSave";
import type { PetInstance, Species, Rarity } from "@/game/systems";
import { SPECIES_BASE, makePet, calcMaxHp } from "@/game/systems";
import trainerSheet from "@/assets/trainer.png";
import skinPedroAsset from "@/assets/skins/pedro.webp.asset.json";
import skinPhoneAsset from "@/assets/skins/phone.webp.asset.json";
import skinGokuAsset from "@/assets/skins/goku.webp.asset.json";
import virizionAsset from "@/assets/legends/virizion.gif.asset.json";
import raikouAsset from "@/assets/legends/raikou.gif.asset.json";
import suicuneAsset from "@/assets/legends/suicune.gif.asset.json";
import suicuneShinyAsset from "@/assets/legends/suicune-shiny.gif.asset.json";
import luxrayFAsset from "@/assets/legends/luxray-f.gif.asset.json";

const SKINS: { id: string; label: string; url: string | null }[] = [
  { id: "default", label: "Treinador Clássico", url: null },
  { id: "pedro", label: "Pedro Dancer", url: assetUrl(skinPedroAsset.url) },
  { id: "phone", label: "Phone 036", url: assetUrl(skinPhoneAsset.url) },
  { id: "goku", label: "Goku", url: assetUrl(skinGokuAsset.url) },
];
const SKIN_KEY = "rubym.skin.v1";
import bgmAsset from "@/assets/audio/bgm.mp3.asset.json";
import sfxLevelUpAsset from "@/assets/audio/level-up.mp3.asset.json";
import sfxClickAsset from "@/assets/audio/click.mp3.asset.json";
import sfxBonusAsset from "@/assets/audio/bonus.mp3.asset.json";
import sfxChestOpenAsset from "@/assets/audio/chest-open.mp3.asset.json";

// Sprite constants (mesmo layout do modo Explorar)
const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 } as const;
type Dir = keyof typeof DIR_ROW;

// ============ assets ============
import idleArenaAsset from "@/assets/idle-arena.jpg.asset.json";
import trophyIconAsset from "@/assets/trophy-icon.png.asset.json";
import mapFlorestaAsset from "@/assets/map-floresta-secreta.png.asset.json";
import mapSnowAsset from "@/assets/map-snow-valley.png.asset.json";
import mapDesertAsset from "@/assets/map-desert.png.asset.json";
import mapCaveAsset from "@/assets/map-cave1.png.asset.json";
import mapTerraAsset from "@/assets/map-terra-hornet.jpg.asset.json";
import hornetCocoonAsset from "@/assets/hornet-cocoon.png.asset.json";
import fireLakeAsset from "@/assets/fire-lake.png.asset.json";
import mapVenofogoOrangeAsset from "@/assets/map-lava-valley.jpg.asset.json";
import redLakeAsset from "@/assets/red-lake.png.asset.json";
import volcanoAsset from "@/assets/volcano.png.asset.json";
import mapBeachUrl from "@/assets/map-beach-idle.png";
import collectIconImg from "@/assets/icons/collect-icon.png";
import rubyGemAsset from "@/assets/ruby-gem.png.asset.json";
import crystalRedAsset from "@/assets/items/icon-crystal-red.png.asset.json";
const crystalRedImg = crystalRedAsset.url;
import crystalGreenAsset from "@/assets/items/icon-crystal-green.png.asset.json";
const crystalGreenImg = crystalGreenAsset.url;
import treeOakAsset from "@/assets/tree-oak.png.asset.json";
import treePineAsset from "@/assets/tree-pine.png.asset.json";
import rockBoulderAsset from "@/assets/rock-boulder.png.asset.json";
import bushBerryAsset from "@/assets/bush-berry.png.asset.json";
import rockLavaAsset from "@/assets/rock-lava.png.asset.json";

// Pokemon GIFs (reusa os que já existem no projeto)
import charizardGif from "@/assets/charizard.gif";
import pikachuGif from "@/assets/pikachu.gif";
import dragoniteGif from "@/assets/dragonite.gif";
import bulbasaurGif from "@/assets/bulbasaur.gif";
import charmanderGif from "@/assets/charmander.gif";
import squirtleGif from "@/assets/squirtle.gif";
import rattataFAsset from "@/assets/rattata-f.gif.asset.json";
import pidgeyGif from "@/assets/pidgey.gif";
import beedrillGif from "@/assets/beedrill.gif";
import butterfreeGif from "@/assets/butterfree.gif";
import pinsirGif from "@/assets/pinsir.gif";
import golemGif from "@/assets/golem.gif";
import jolteonIdleAsset from "@/assets/jolteon.gif.asset.json";
import laprasIdleAsset from "@/assets/lapras.gif.asset.json";
import blazikenIdleAsset from "@/assets/blaziken.gif.asset.json";
const jolteonGif = jolteonIdleAsset.url;
const laprasGif = laprasIdleAsset.url;
const blazikenGif = blazikenIdleAsset.url;
import zubatAsset from "@/assets/zubat.gif.asset.json";
import ekansAsset from "@/assets/ekans.gif.asset.json";
import machopAsset from "@/assets/machop.gif.asset.json";
import diglettAsset from "@/assets/diglett.gif.asset.json";
import meowthAsset from "@/assets/meowth.gif.asset.json";
import psyduckAsset from "@/assets/psyduck.gif.asset.json";
import lucarioAuraAsset from "@/assets/lucario-aura.webp.asset.json";
import mewAuraAsset from "@/assets/mew-aura.webp.asset.json";


const IDLE_KEY = "rubym.idle.v1";
const MP_SESSION_KEY = "rubym.multiplayer.session.v1";
const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
const idleArenaUrl = assetUrl(idleArenaAsset.url);
const mapFlorestaUrl = assetUrl(mapFlorestaAsset.url);
const mapSnowUrl = assetUrl(mapSnowAsset.url);
const mapDesertUrl = assetUrl(mapDesertAsset.url);
const mapCaveUrl = assetUrl(mapCaveAsset.url);
const mapTerraUrl = assetUrl(mapTerraAsset.url);
const hornetCocoonUrl = assetUrl(hornetCocoonAsset.url);
const fireLakeUrl = assetUrl(fireLakeAsset.url);
const mapVenofogoOrangeUrl = assetUrl(mapVenofogoOrangeAsset.url);
const redLakeUrl = assetUrl(redLakeAsset.url);
const volcanoUrl = assetUrl(volcanoAsset.url);
const rubyGemUrl = assetUrl(rubyGemAsset.url);
const treeOakUrl = assetUrl(treeOakAsset.url);
const treePineUrl = assetUrl(treePineAsset.url);
const rockBoulderUrl = assetUrl(rockBoulderAsset.url);
const bushBerryUrl = assetUrl(bushBerryAsset.url);
const rockLavaUrl = assetUrl(rockLavaAsset.url);
const rattataFUrl = assetUrl(rattataFAsset.url);
const zubatUrl = assetUrl(zubatAsset.url);
const ekansUrl = assetUrl(ekansAsset.url);
const machopUrl = assetUrl(machopAsset.url);
const diglettUrl = assetUrl(diglettAsset.url);
const meowthUrl = assetUrl(meowthAsset.url);
const psyduckUrl = assetUrl(psyduckAsset.url);
const lucarioAuraUrl = assetUrl(lucarioAuraAsset.url);
const mewAuraUrl = assetUrl(mewAuraAsset.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gameDb = supabase as any;

const potionIconUrl = assetUrl(potionIconAsset.url);
const bgmUrl = assetUrl(bgmAsset.url);
const sfxLevelUpUrl = assetUrl(sfxLevelUpAsset.url);
const sfxClickUrl = assetUrl(sfxClickAsset.url);
const sfxBonusUrl = assetUrl(sfxBonusAsset.url);
const sfxChestOpenUrl = assetUrl(sfxChestOpenAsset.url);

type IdleMapId = "arena" | "terra" | "venofogo" | "praia" | "neve" | "deserto" | "floresta" | "caverna";
// element: só descritivo; cycle: quando presente, mapa abre a cada `cycleMs` por `openMs`
type IdleMapDef = {
  name: string; diff: string; bg: string; rate: number; minLevel: number;
  element: string;
  cycle?: { cycleMs: number; openMs: number };
};
const IDLE_MAPS: Record<IdleMapId, IdleMapDef> = {
  arena:    { name: "Vale Verdejante",         diff: "Fácil",     bg: idleArenaUrl,    rate: 1.0, minLevel: 1,  element: "Grama"    },
  terra:    { name: "Ninho de Marimbondo",     diff: "Fácil+",    bg: mapTerraUrl,     rate: 1.2, minLevel: 5,  element: "Terra"    },
  venofogo: { name: "Pântano em Chamas",       diff: "Médio",     bg: mapVenofogoOrangeUrl, rate: 1.8, minLevel: 20, element: "Veneno/Fogo" },
  praia:    { name: "Praia Coral",             diff: "Fácil+",    bg: mapBeachUrl,     rate: 1.3, minLevel: 15, element: "Água"     },
  neve:     { name: "Vale Verdejante de Neve", diff: "Médio",     bg: mapSnowUrl,      rate: 1.6, minLevel: 30, element: "Gelo"     },
  deserto:  { name: "Deserto Escaldante",      diff: "Médio+",    bg: mapDesertUrl,    rate: 2.0, minLevel: 50, element: "Fogo"     },
  floresta: { name: "Floresta Sombria",        diff: "Difícil",   bg: mapFlorestaUrl,  rate: 2.6, minLevel: 70, element: "Sombrio"  },
  caverna:  { name: "Caverna Rochosa",         diff: "Extremo",   bg: mapCaveUrl,      rate: 3.5, minLevel: 90, element: "Pedra",
              cycle: { cycleMs: 2.5 * 60 * 60 * 1000, openMs: 30 * 60 * 1000 } },
};
// Retorna se a caverna está atualmente aberta e ms para o próximo evento (abrir/fechar)
function caveWindow(now: number = Date.now()): { open: boolean; msUntilChange: number } {
  const c = IDLE_MAPS.caverna.cycle!;
  const t = now % c.cycleMs;
  if (t < c.openMs) return { open: true, msUntilChange: c.openMs - t };
  return { open: false, msUntilChange: c.cycleMs - t };
}

const GIF: Partial<Record<Species, string>> = {
  charizard: charizardGif, pikachu: pikachuGif,
  dragonite: dragoniteGif,
  bulbasaur: bulbasaurGif, charmander: charmanderGif, squirtle: squirtleGif,
  rattata_f: rattataFUrl, pidgey: pidgeyGif, zubat: zubatUrl,
  ekans: ekansUrl, machop: machopUrl, diglett: diglettUrl,
  meowth: meowthUrl, psyduck: psyduckUrl,
  lucario: lucarioAuraUrl, mew: mewAuraUrl,
  beedrill: beedrillGif, butterfree: butterfreeGif,
  pinsir: pinsirGif, golem: golemGif, jolteon: jolteonGif, lapras: laprasGif,
  blaziken: blazikenGif,
  virizion: assetUrl(virizionAsset.url), raikou: assetUrl(raikouAsset.url),
  suicune: assetUrl(suicuneAsset.url), suicune_shiny: assetUrl(suicuneShinyAsset.url),
  luxray_f: assetUrl(luxrayFAsset.url),
};

// Pokémons cujo sprite é uma spritesheet 4x4 (linhas = down/left/right/up, 4 frames de walk)
const SPRITE_SHEET: Partial<Record<Species, string>> = {
  lucario: lucarioAuraUrl,
  mew: mewAuraUrl,
};


const ENEMY_POOL: Species[] = ["rattata_f", "pidgey", "zubat", "ekans", "machop", "diglett", "meowth", "psyduck"];

// ============ Obstáculos com colisão ============
type Obstacle = {
  id: number;
  x: number; y: number;      // posição da BASE (chão) no mundo
  w: number; h: number;      // tamanho renderizado em px
  src: string;
  blocks: boolean;           // só pedras bloqueiam; árvores ficam visuais/transparentes ao passar
  collideR: number;          // raio de colisão em px (a partir da base)
};
// Gera obstáculos espalhados de forma determinística (mesma disposição sempre)
function buildObstacles(worldW: number, worldH: number, mapId: IdleMapId = "arena"): Obstacle[] {
  // PRNG determinístico simples
  let seed = mapId === "terra" ? 98765 : 12345;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  // Pântano em Chamas (venofogo): MESMA composição do Vale Verdejante (arena),
  // porém re-tematizada — árvores/matos de fogo, 2 lagos de lava e um vulcão central.
  if (mapId === "venofogo") {
    const kinds = [
      { src: rockLavaUrl, w: 56, h: 50, collideR: 8, blocks: true },
    ];
    const list: Obstacle[] = [];
    let id = 1;

    // 2 lagos de lava pequenos (posições espelhadas, fora do centro)
    const lakeSpots: { x: number; y: number }[] = [
      { x: worldW * 0.22, y: worldH * 0.30 },
      { x: worldW * 0.78, y: worldH * 0.72 },
    ];
    for (const c of lakeSpots) {
      list.push({ id: id++, x: c.x, y: c.y, w: 130, h: 130, src: redLakeUrl, blocks: true, collideR: 52 });
    }

    // Vulcão central (grande, bloqueia — substitui o "centro limpo" do arena)
    const volcano = { x: worldW * 0.5, y: worldH * 0.5 };
    list.push({ id: id++, x: volcano.x, y: volcano.y, w: 240, h: 240, src: volcanoUrl, blocks: true, collideR: 96 });

    // Distribuição espalhada IDÊNTICA ao arena (mesmo seed, mesmos parâmetros),
    // apenas evitando lagos e o vulcão.
    const MIN_GAP = 60;
    let tries = 0;
    while (list.length < 18 && tries < 2000) {
      tries++;
      const k = kinds[Math.floor(rand() * kinds.length)];
      const x = 60 + rand() * (worldW - 120);
      const y = 80 + rand() * (worldH - 160);
      if (Math.hypot(x - volcano.x, y - volcano.y) < 180) continue;
      let nearLake = false;
      for (const c of lakeSpots) if (Math.hypot(x - c.x, y - c.y) < 130) { nearLake = true; break; }
      if (nearLake) continue;
      let ok = true;
      for (const o of list) if (Math.hypot(x - o.x, y - o.y) < MIN_GAP) { ok = false; break; }
      if (!ok) continue;
      list.push({ id: id++, x, y, w: k.w, h: k.h, src: k.src, blocks: k.blocks, collideR: k.collideR });
    }
    return list;
  }




  // Mapa Terra (Ninho de Marimbondo): 4 casulos gigantes espalhados com Beedrill/Butterfree ao redor
  if (mapId === "terra") {
    const kinds = [
      { src: treeOakUrl,     w: 110, h: 124, collideR: 0,  blocks: false },
      { src: rockBoulderUrl, w:  86, h:  76, collideR: 10, blocks: true  },
    ];
    const list: Obstacle[] = [];
    let id = 1;

    // 4 casulos espalhados (cantos + centro deslocado)
    const cocoonSpots: { x: number; y: number }[] = [
      { x: worldW * 0.28, y: worldH * 0.30 },
      { x: worldW * 0.72, y: worldH * 0.28 },
      { x: worldW * 0.30, y: worldH * 0.72 },
      { x: worldW * 0.74, y: worldH * 0.70 },
    ];
    for (const c of cocoonSpots) {
      list.push({ id: id++, x: c.x, y: c.y, w: 150, h: 180, src: hornetCocoonUrl, blocks: true, collideR: 42 });
      // Beedrill e Butterfree flutuando perto do casulo (decorativos, sem colisão)
      list.push({ id: id++, x: c.x - 60, y: c.y - 18, w: 40, h: 40, src: beedrillGif, blocks: false, collideR: 0 });
      list.push({ id: id++, x: c.x + 60, y: c.y - 10, w: 40, h: 40, src: butterfreeGif, blocks: false, collideR: 0 });
    }

    // Enxame extra de Beedrill/Butterfree bem espalhados pelo mapa
    const swarm: string[] = [beedrillGif, butterfreeGif];
    let sTries = 0;
    let placed = 0;
    while (placed < 30 && sTries < 1500) {
      sTries++;
      const src = swarm[Math.floor(rand() * swarm.length)];
      const x = 80 + rand() * (worldW - 160);
      const y = 100 + rand() * (worldH - 200);
      let ok = true;
      for (const o of list) if (Math.hypot(x - o.x, y - o.y) < 120) { ok = false; break; }
      if (!ok) continue;
      list.push({ id: id++, x, y, w: 38, h: 38, src, blocks: false, collideR: 0 });
      placed++;
    }

    // Poucas árvores/pedras espalhadas evitando zonas dos casulos
    const MIN_GAP = 130;
    let tries = 0;
    while (list.length < cocoonSpots.length * 3 + 14 && tries < 2500) {
      tries++;
      const k = kinds[Math.floor(rand() * kinds.length)];
      const x = 80 + rand() * (worldW - 160);
      const y = 100 + rand() * (worldH - 200);
      // afastar de qualquer casulo
      let nearCocoon = false;
      for (const c of cocoonSpots) if (Math.hypot(x - c.x, y - c.y) < 260) { nearCocoon = true; break; }
      if (nearCocoon) continue;
      let ok = true;
      for (const o of list) if (Math.hypot(x - o.x, y - o.y) < MIN_GAP) { ok = false; break; }
      if (!ok) continue;
      list.push({ id: id++, x, y, w: k.w, h: k.h, src: k.src, blocks: k.blocks, collideR: k.collideR });
    }
    return list;
  }

  const kinds = [
    { src: treeOakUrl,     w: 110, h: 124, collideR: 0,  blocks: false },
    { src: treePineUrl,    w:  90, h: 132, collideR: 0,  blocks: false },
    { src: rockBoulderUrl, w:  86, h:  76, collideR: 10, blocks: true  },
    { src: bushBerryUrl,   w:  64, h:  60, collideR: 0,  blocks: false },
  ];
  const list: Obstacle[] = [];
  const MIN_GAP = 60;
  const CENTER_CLEAR = 180; // não spawnar em cima da posição inicial (centro)
  let id = 1;
  let tries = 0;
  while (list.length < 90 && tries < 4000) {
    tries++;
    const k = kinds[Math.floor(rand() * kinds.length)];
    const x = 60 + rand() * (worldW - 120);
    const y = 80 + rand() * (worldH - 160);
    if (Math.hypot(x - worldW / 2, y - worldH / 2) < CENTER_CLEAR) continue;
    let ok = true;
    for (const o of list) {
      if (Math.hypot(x - o.x, y - o.y) < MIN_GAP) { ok = false; break; }
    }
    if (!ok) continue;
    list.push({ id: id++, x, y, w: k.w, h: k.h, src: k.src, blocks: k.blocks, collideR: k.collideR });
  }
  return list;
}

type Task = { id: string; title: string; reward: number; progress: number; target: number; done: boolean };
type IdleState = {
  startedAt: number;
  lastTickAt: number;
  pending: { gold: number; rubies: number; crystals: number };
  totals: { gold: number; captured: number };
  currentMap: IdleMapId;
  tasks: Task[];
  mapsUnlocked: number;
  caughtSpecies: Species[];
  seenSpecies: Species[]; // Pokédex — inimigos derrotados em duelo
  collection?: CollectionEntry[]; // TODAS as capturas (com repetidos), c/ nível, para fragmentar
  craftPoints?: number; // pontos obtidos ao fragmentar pokémons da coleção
  items: Record<string, number>;
  bank: { gold: number; crystals: number }; // moedas coletadas (spendáveis na loja)
  buffs: { atk: number; def: number; expMult: number; expMultUntil?: number; goldMult?: number; goldMultUntil?: number; honeyUntil?: number }; // livros de xp/vip são temporários (1h); honey = incenso de mel 10min
  autoHeal: { enabled: boolean; threshold: number }; // auto usa poção quando HP% <= threshold
  autoBattle?: { enabled: boolean; useBall: boolean; preferredBall: "auto" | "pokeball" | "greatball" | "ultraball"; captureHpPct: number };
};

export type CollectionEntry = { uid: string; species: Species; level: number; rarity: Rarity; capturedAt: number };

export const CRAFT_BY_RARITY: Record<Rarity, number> = {
  common: 1,
  uncommon: 3,
  rare: 8,
  epic: 20,
  legendary: 60,
  mythic: 200,
  mythic_shiny: 600,
};

const DEFAULT_TASKS = (): Task[] => [
  { id: "t1", title: "Derrote 30 Pokémon selvagens", reward: 200, progress: 0, target: 30, done: false },
  { id: "t2", title: "Colete 5000 de ouro offline",   reward: 150, progress: 0, target: 5000, done: false },
  { id: "t3", title: "Capture 10 Pokémon",            reward: 100, progress: 0, target: 10, done: false },
];

// Itens farmáveis (drop aleatório dos inimigos derrotados)
const ITEM_ICONS: Record<string, LucideIcon> = {
  potion: FlaskConical, pokeball: Sparkles,
};
const ITEM_COLORS: Record<string, string> = {
  potion: "#ff6b8a", pokeball: "#ff5252",
  greatball: "#4a7bff", ultraball: "#f5cf6b",
  chest_amulet: "#f5cf6b",
  revive: "#ff5b8a", berry: "#4a7bff", key: "#f5cf6b",
  book_atk: "#ff5252", book_def: "#4a7bff", book_exp: "#5ec26a",
  book_exp_big: "#8bffb0", book_exp_max: "#ffd94d", book_vip: "#ffb347",
};
const ITEM_IMG: Record<string, string> = {
  potion: potionNewImg,
  pokeball: ballPokeImg, greatball: ballGreatImg, ultraball: ballUltraImg,
  chest_amulet: chestAmuletImg,
  revive: reviveIconImg, berry: berryIconImg, key: keyIconImg,
  book_atk: bookAtkImg, book_def: bookDefImg, book_exp: bookExpImg,
  book_exp_big: bookExpImg, book_exp_max: bookExpImg, book_vip: bookExpImg,
};
const ITEM_POOL: { id: string; name: string; icon: string; chance: number }[] = [
  { id: "potion",    name: "Poção",     icon: "🧪", chance: 0.30 },
  { id: "pokeball",  name: "Pokébola",  icon: "🔴", chance: 0.15 },
  { id: "berry",     name: "Berry",     icon: "🫐", chance: 0.12 },
  { id: "revive",    name: "Revive",    icon: "💖", chance: 0.05 },
  { id: "key",       name: "Chave",     icon: "🗝", chance: 0.03 },
];

// Loja — Pokébolas por gold, livros por cristal
type ShopBall = { id: "pokeball" | "greatball" | "ultraball" | "masterball"; name: string; price: number; img: string; captureMult: number };
const SHOP_BALLS: ShopBall[] = [
  { id: "pokeball",   name: "Pokébola",   price: 500,    img: ballPokeImg,  captureMult: 1 },
  { id: "greatball",  name: "Great Ball", price: 5000,   img: ballGreatImg, captureMult: 2 },
  { id: "ultraball",  name: "Ultra Ball", price: 10000,  img: ballUltraImg, captureMult: 3 },
  
];
type ShopBook = { id: "book_atk" | "book_def" | "book_exp" | "book_exp_big" | "book_exp_max" | "book_vip" | "book_vip_30" | "book_vip_60"; name: string; desc: string; price: number; img: string };
const SHOP_BOOKS: ShopBook[] = [
  { id: "book_atk", name: "Livro de Ataque", desc: "+10% de dano permanente por uso", price: 20, img: bookAtkImg },
  { id: "book_def", name: "Livro de Defesa", desc: "-10% de dano recebido por uso",  price: 20, img: bookDefImg },
  { id: "book_exp", name: "Livro de EXP",    desc: "+30% EXP em batalhas por 1 hora",   price: 30, img: bookExpImg },
  
  { id: "book_vip_30", name: "Livro VIP 30d ✦✦", desc: "+30% ouro e +30% EXP por 30 DIAS", price: 500, img: bookExpImg },
  { id: "book_vip_60", name: "Livro VIP 60d ✦✦✦", desc: "+40% ouro e +40% EXP por 60 DIAS", price: 1000, img: bookExpImg },
];


const POTION_PRICE = 100;
const POTION_HEAL_PCT = 0.5;

// Espécies desbloqueadas por nível do líder — spawn cresce com o progresso
const LEVEL_UNLOCKS: { minLv: number; species: Species[] }[] = [
  { minLv: 1,  species: ["rattata_f", "pidgey"] },
  { minLv: 3,  species: ["zubat", "ekans"] },
  { minLv: 6,  species: ["meowth", "psyduck"] },
  { minLv: 10, species: ["diglett", "machop"] },
  { minLv: 15, species: ["bulbasaur", "charmander", "squirtle"] },
  { minLv: 18, species: ["jolteon", "lapras"] },
  { minLv: 20, species: ["pikachu"] },
  { minLv: 25, species: ["pinsir", "golem"] },
  { minLv: 30, species: ["dragonite", "charizard"] },
  { minLv: 36, species: ["blaziken"] },
];
function speciesUnlockedFor(lv: number): Species[] {
  const list: Species[] = [];
  for (const u of LEVEL_UNLOCKS) if (lv >= u.minLv) list.push(...u.species);
  return list.length ? list : ["rattata_f"];
}

function loadIdle(): IdleState {
  if (typeof window === "undefined") return freshIdle();
  try {
    const raw = localStorage.getItem(IDLE_KEY);
    if (raw) return { ...freshIdle(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return freshIdle();
}
function freshIdle(): IdleState {
  const now = Date.now();
  return {
    startedAt: now, lastTickAt: now,
    pending: { gold: 0, rubies: 0, crystals: 0 },
    totals: { gold: 0, captured: 0 },
    currentMap: "arena",
    tasks: DEFAULT_TASKS(),
    mapsUnlocked: 3,
    caughtSpecies: [],
    seenSpecies: [],
    collection: [],
    craftPoints: 0,
    items: {},
    bank: { gold: 0, crystals: 0 },
    buffs: { atk: 0, def: 0, expMult: 0, expMultUntil: 0, goldMult: 0, goldMultUntil: 0, honeyUntil: 0 },
    autoHeal: { enabled: false, threshold: 0.5 },
    autoBattle: { enabled: true, useBall: true, preferredBall: "auto", captureHpPct: 1 },
  };
}
function saveIdle(s: IdleState) {
  try { localStorage.setItem(IDLE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

const IDLE_HP_MULT = 6;
function calcIdleMaxHp(pet: PetInstance) {
  return calcMaxHp(pet) * IDLE_HP_MULT;
}

// ===== Energia por raridade (regen passivo 0→100) =====
// Comum/Incomum: 20 min · Raro: 5 min · Épico/Lendário: 3 min · Mítico: infinita
const ENERGY_REGEN_MS: Partial<Record<Rarity, number>> = {
  common: 30 * 60 * 1000, uncommon: 50 * 60 * 1000,
  rare: 110 * 60 * 1000, epic: 180 * 60 * 1000, legendary: 180 * 60 * 1000,
  mythic: 0, mythic_shiny: 0,
};

const ENERGY_MAX = 100;
const ENERGY_DRAIN_PER_KILL = 8;
const AZUL_REST_MS = 5 * 60 * 1000;
const AZUL_REST_COST = 5; // diamantes
type PetEnergyExt = PetInstance & { energy?: number; energyRegenAt?: number; azulRestUntil?: number; azulRestFromEnergy?: number };
function petCurrentEnergy(pet: PetInstance, now: number = Date.now()): number {
  const p = pet as PetEnergyExt;
  const regen = ENERGY_REGEN_MS[pet.rarity] ?? 20 * 60 * 1000;
  if (regen === 0) return ENERGY_MAX;
  if (p.azulRestUntil && p.azulRestUntil > now) {
    const start = p.azulRestUntil - AZUL_REST_MS;
    const t = Math.max(0, Math.min(1, (now - start) / AZUL_REST_MS));
    const base = p.azulRestFromEnergy ?? p.energy ?? ENERGY_MAX;
    return Math.round(base + (ENERGY_MAX - base) * t);
  }
  const stored = p.energy ?? ENERGY_MAX;
  const regenAt = p.energyRegenAt ?? now;
  const gain = ((now - regenAt) / regen) * ENERGY_MAX;
  return Math.max(0, Math.min(ENERGY_MAX, Math.round(stored + gain)));
}
function petMsToFull(pet: PetInstance, now: number = Date.now()): number {
  const p = pet as PetEnergyExt;
  if ((ENERGY_REGEN_MS[pet.rarity] ?? 0) === 0) return 0;
  if (p.azulRestUntil && p.azulRestUntil > now) return p.azulRestUntil - now;
  const cur = petCurrentEnergy(pet, now);
  if (cur >= ENERGY_MAX) return 0;
  const regen = ENERGY_REGEN_MS[pet.rarity] ?? 20 * 60 * 1000;
  return Math.round(((ENERGY_MAX - cur) / ENERGY_MAX) * regen);
}
function petIsExhausted(pet: PetInstance, now: number = Date.now()): boolean {
  const infinite = (ENERGY_REGEN_MS[pet.rarity] ?? 0) === 0;
  if (infinite) return false;
  const p = pet as PetEnergyExt;
  if (p.azulRestUntil && p.azulRestUntil > now) return true;
  return petCurrentEnergy(pet, now) <= 0;
}
function fmtMS(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}


// ============ Default team (usa save se existir) — APENAS 1 pokemon ============
type SaveShape = { party?: PetInstance[] };
function loadTeam(): PetInstance[] {
  const save = loadLatestValid<SaveShape>();
  if (save?.party && save.party.length > 0) {
    const leader = save.party[0];
    // upgrade forçado: se ainda for o antigo default (charizard lv15), troca por charmander lv1
    if (leader.species === "charizard" && leader.level === 15 && (leader.xp ?? 0) === 0) {
      return [makePet("charmander", 1)];
    }
    return save.party.slice(0, 1);
  }
  return [makePet("charmander", 1)];
}


function fmtHMS(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
function fmtK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(Math.floor(n));
}

function getMultiplayerSessionId(baseId: string) {
  if (typeof window === "undefined") return baseId;
  try {
    let id = sessionStorage.getItem(MP_SESSION_KEY);
    if (!id) {
      const suffix = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      id = `${baseId}:${suffix}`;
      sessionStorage.setItem(MP_SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${baseId}:${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// ============ Route ============
export const Route = createFileRoute("/idle")({
  head: () => ({
    meta: [
      { title: "Modo Idle — Ruby M" },
      { name: "description", content: "Modo idle: seus Pokémon batalham e evoluem sozinhos." },
    ],
  }),
  component: () => (
    <GuestGate>
      <IdlePage />
    </GuestGate>
  ),
});

// ============ Page ============
function IdlePage() {
  const identity = loadIdentity();
  const navigate = useNavigate();
  const [team, setTeam] = useState<PetInstance[]>(() => loadTeam());
  // Pokémon fora do time enquanto descansam na Casa Azul (voltam ao time cheios)
  const [restingBench, setRestingBench] = useState<PetInstance[]>([]);
  // HP atual do meu pokémon (o líder toma dano dos inimigos)
  const [leaderHp, setLeaderHp] = useState<number>(() => {
    const initTeam = loadTeam();
    const l = initTeam[0];
    return l ? Math.max(l.hp ?? 0, calcIdleMaxHp(l)) : 0;
  });
  const [leveledAt, setLeveledAt] = useState<number>(0);
  const [levelToast, setLevelToast] = useState<{ level: number; gains: string[]; bonus: string; ts: number } | null>(null);
  const prevLevelRef = useRef<number>(0);
  useEffect(() => {
    if (!levelToast) return;
    const t = setTimeout(() => setLevelToast(null), 5000);
    return () => clearTimeout(t);
  }, [levelToast]);
  // alvo atual (para virar o pokémon) — id do inimigo que estamos atacando
  const [, setAttackTargetId] = useState<number | null>(null);
  const [idle, setIdle] = useState<IdleState>(() => loadIdle());
  const [now, setNow] = useState(() => Date.now());
  // ===== Incenso de Mel (buff temporário do Ninho de Marimbondo) =====
  const honeyUntilRef = useRef<number>(idle.buffs.honeyUntil ?? 0);
  useEffect(() => { honeyUntilRef.current = idle.buffs.honeyUntil ?? 0; }, [idle.buffs.honeyUntil]);
  const [honeyShop, setHoneyShop] = useState<null | { x: number; y: number }>(null);
  const HONEY_PRICE = 3000;
  const HONEY_DURATION_MS = 10 * 60 * 1000;
  const HONEY_BONUS = 0.10; // +10% drop, xp, def, velocidade
  // ===== Escolha do inicial (declarada cedo p/ gatear loops do jogo) =====
  const [starterChosen, setStarterChosen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try { return !!localStorage.getItem("rubym.starter.chosen"); } catch { return true; }
  });
  const starterChosenRef = useRef(starterChosen);
  useEffect(() => { starterChosenRef.current = starterChosen; }, [starterChosen]);
  // ===== Descanso nas casas (Lar demora 1h, Casa Azul restaura em 5 min) =====
  const REST_DURATION_LAR_MS = 5 * 1000;            // 5 segundos (cura HP)
  const REST_DURATION_BLUE_MS = 5 * 60 * 1000;      // 5 minutos (Casa Azul — energia)
  const [restingUntil, setRestingUntil] = useState<number | null>(null);
  const [restingStart, setRestingStart] = useState<number | null>(null);
  const [restingKind, setRestingKind] = useState<"lar" | "azul" | null>(null);
  const restingRef = useRef<boolean>(false);
  useEffect(() => { restingRef.current = restingUntil !== null; }, [restingUntil]);
  // ===== Interação com prédios do mundo =====
  const [nearBuilding, setNearBuilding] = useState<"lab" | "lar" | "azul" | null>(null);
  const [eggOpenResult, setEggOpenResult] = useState<{ sp: string; rarity: string } | null>(null);

  // ===== Detalhes de Pokémon (modal ao clicar no card) + Casa Azul picker =====
  const [petDetailUid, setPetDetailUid] = useState<string | null>(null);
  const [azulPickerOpen, setAzulPickerOpen] = useState(false);
  const [azulPreselectUid, setAzulPreselectUid] = useState<string | null>(null);
  const [colecaoDetailUid, setColecaoDetailUid] = useState<string | null>(null);
  const [eventToast, setEventToast] = useState<{ id: number; icon: string; title: string; sub?: string; color: string } | null>(null);
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const [attackAnim, setAttackAnim] = useState<{ id: number; fromX: number; fromY: number; toX: number; toY: number; ts: number; crit: boolean } | null>(null);
  const [, setAnimTick] = useState(0);
  const attackAnimIdRef = useRef(1);
  useEffect(() => {
    if (!attackAnim) return;
    let raf: number;
    const loop = () => { setAnimTick((n) => n + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [attackAnim]);
  const autoBattleRef = useRef(idle.autoBattle ?? { enabled: true, useBall: true, preferredBall: "auto" as const, captureHpPct: 1 });
  useEffect(() => { if (idle.autoBattle) autoBattleRef.current = idle.autoBattle; }, [idle.autoBattle]);
  const onPickTeamFromColecao = (entry: CollectionEntry) => {
    const newPet = { ...makePet(entry.species, entry.level, entry.rarity), uid: entry.uid };
    setTeam((tm) => {
      const idx = tm.findIndex((p) => p.uid === entry.uid);
      if (idx >= 0) {
        const arr = [...tm];
        const [p] = arr.splice(idx, 1);
        setLeaderHp(calcIdleMaxHp(p));
        return [p, ...arr];
      }
      if (tm.length >= 5) {
        const arr = tm.slice(0, 4);
        setLeaderHp(calcIdleMaxHp(newPet));
        return [newPet, ...arr];
      }
      setLeaderHp(calcIdleMaxHp(newPet));
      return [newPet, ...tm];
    });
    setTab("batalha");
  };
  const eventToastIdRef = useRef(1);
  const pushEvent = (icon: string, title: string, sub?: string, color: string = "#f5cf6b") => {
    const id = eventToastIdRef.current++;
    setEventToast({ id, icon, title, sub, color });
    setTimeout(() => setEventToast((t) => (t && t.id === id ? null : t)), 4200);
  };
  const [energyTick, setEnergyTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setEnergyTick((n) => n + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  // Fecha a caverna: expulsa o treinador quando o ciclo terminar
  useEffect(() => {
    if (idle.currentMap !== "caverna") return;
    const w = caveWindow();
    if (!w.open) {
      setIdle((s) => ({ ...s, currentMap: "arena" }));
      pushChat(`⛰ Caverna Rochosa fechou. Você foi levado ao Vale Verdejante.`, "info");
      pushEvent("⛰", "CAVERNA FECHADA", "Volte quando reabrir", "#a08770");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyTick, idle.currentMap]);
  // Se o líder ficar sem energia: promove o próximo pokémon com energia.
  // Se nenhum tiver, o personagem PARA (guardas nos ticks de movimento e batalha).
  useEffect(() => {
    setTeam((tm) => {
      if (tm.length < 2) return tm;
      const now = Date.now();
      if (!petIsExhausted(tm[0], now)) return tm;
      const idx = tm.findIndex((p) => !petIsExhausted(p, now));
      if (idx <= 0) return tm;
      const next = [tm[idx], ...tm.filter((_, i) => i !== idx)];
      pushChat(`⚡ ${tm[0].species.replace(/_/g, " ")} sem energia. ${next[0].species.replace(/_/g, " ")} assumiu o comando.`, "info");
      setLeaderHp(calcIdleMaxHp(next[0]));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyTick]);
  // Bônus único: +1.000.000 ouro e +100 💎 (aplica 1x por conta local)
  useEffect(() => {
    try {
      if (localStorage.getItem("rubym.bonus.mkt.v1") === "1") return;
      setIdle((s) => ({ ...s, bank: { ...s.bank, gold: s.bank.gold + 1_000_000, crystals: s.bank.crystals + 100 } }));
      localStorage.setItem("rubym.bonus.mkt.v1", "1");
      pushChat("🎁 Bônus recebido: +1.000.000 ouro e +100 💎", "cap");
    } catch { /* ignore */ }
  }, []); // eslint-disable-line




  type Enemy = { sp: Species; hp: number; maxHp: number; id: number; x: number; y: number; face: "left" | "right"; aggressive?: boolean; aggroR?: number; elite?: boolean; level: number; rarity: Rarity; eventLegendary?: boolean };
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  type FxKind = "myDmg" | "enemyDmg" | "xp" | "gold" | "capture" | "crit";
  const [fx, setFx] = useState<{ id: number; x: number; y: number; text: string; kind: FxKind }[]>([]);
  type Chest = { id: number; x: number; y: number; opened: boolean; openedAt?: number; purple?: boolean };
  const [chests, setChests] = useState<Chest[]>([]);
  
  const enemyIdRef = useRef(1);
  const chestIdRef = useRef(1);
  const fxIdRef = useRef(1);
  const [tab, setTab] = useState<"inicio" | "pokemon" | "mochila" | "batalha" | "melhorias" | "colecao" | "pokedex" | "loja" | "wallet" | "market" | "config" | "tarefas">("batalha");
  const [skinId, setSkinId] = useState<string>(() => {
    if (typeof window === "undefined") return "default";
    try { return localStorage.getItem(SKIN_KEY) || "default"; } catch { return "default"; }
  });
  useEffect(() => {
    try { localStorage.setItem(SKIN_KEY, skinId); } catch { /* ignore */ }
  }, [skinId]);
  const skinUrl = SKINS.find((s) => s.id === skinId)?.url ?? null;
  // Auto-battle / chat / WASD
  const [auto, setAuto] = useState(true);
  const autoRef = useRef(true);
  useEffect(() => { autoRef.current = auto; }, [auto]);

  // ==== ÁUDIO ====
  const [audioSettings, setAudioSettings] = useState(() => {
    if (typeof window === "undefined") return { music: true, sfx: true, musicVol: 0.20, sfxVol: 0.45 };
    try {
      const raw = localStorage.getItem("rubym.idle.audio");
      if (raw) return { music: true, sfx: true, musicVol: 0.20, sfxVol: 0.45, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { music: true, sfx: true, musicVol: 0.20, sfxVol: 0.45 };
  });
  useEffect(() => {
    try { localStorage.setItem("rubym.idle.audio", JSON.stringify(audioSettings)); } catch { /* ignore */ }
  }, [audioSettings]);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const a = new Audio(bgmUrl);
    a.loop = true;
    a.volume = audioSettings.musicVol;
    bgmRef.current = a;
    // autoplay policy: só toca após primeira interação
    const start = () => {
      if (!audioSettings.music) return;
      a.play().catch(() => { /* ignora */ });
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      a.pause(); a.src = "";
    };
  }, []); // eslint-disable-line
  useEffect(() => {
    const a = bgmRef.current; if (!a) return;
    a.volume = audioSettings.musicVol;
    if (audioSettings.music) { a.play().catch(() => {}); } else { a.pause(); }
  }, [audioSettings.music, audioSettings.musicVol]);
  const playSfx = (url: string) => {
    if (!audioSettings.sfx) return;
    try {
      const a = new Audio(url);
      a.volume = audioSettings.sfxVol;
      a.play().catch(() => {});
    } catch { /* ignore */ }
  };
  const playClick = () => playSfx(sfxClickUrl);
  const playLevelUp = () => playSfx(sfxLevelUpUrl);
  const playBonus = () => playSfx(sfxBonusUrl);
  const playChestOpen = () => playSfx(sfxChestOpenUrl);

  // Weather (rain / snow / clear) — estilo pixel RPG
  const [weather, setWeather] = useState<"rain" | "snow" | "clear">("clear");
  useEffect(() => {
    // alterna: clear (30s) -> rain (35s) -> clear (25s) -> snow (35s) -> loop
    const seq: ("clear" | "rain" | "snow")[] = ["clear", "rain", "clear", "snow"];
    const durs = [30000, 35000, 25000, 35000];
    let idx = 0;
    setWeather(seq[0]);
    const tick = () => {
      idx = (idx + 1) % seq.length;
      setWeather(seq[idx]);
      to = setTimeout(tick, durs[idx]);
    };
    let to = setTimeout(tick, durs[0]);
    return () => clearTimeout(to);
  }, []);
  // Partículas pré-geradas
  const rainDrops = useMemo(() => {
    const arr: { left: number; delay: number; dur: number; len: number; op: number; w: number }[] = [];
    for (let i = 0; i < 140; i++) {
      const near = Math.random() < 0.35;
      arr.push({
        left: Math.random() * 110 - 5,
        delay: Math.random() * 1.4,
        dur: near ? 0.35 + Math.random() * 0.2 : 0.55 + Math.random() * 0.35,
        len: near ? 18 + Math.round(Math.random() * 12) : 8 + Math.round(Math.random() * 10),
        op: near ? 0.55 + Math.random() * 0.3 : 0.18 + Math.random() * 0.25,
        w: near ? 1.4 : 1,
      });
    }
    return arr;
  }, []);
  const snowFlakes = useMemo(() => {
    const arr: { left: number; delay: number; dur: number; size: number; drift: number; op: number }[] = [];
    for (let i = 0; i < 70; i++) {
      arr.push({
        left: Math.random() * 100,
        delay: Math.random() * 6,
        dur: 5 + Math.random() * 6,
        size: 2 + Math.round(Math.random() * 3),
        drift: (Math.random() * 40 - 20),
        op: 0.55 + Math.random() * 0.45,
      });
    }
    return arr;
  }, []);


  type ChatMsg = { id: number; text: string; kind: "info" | "dmg" | "hit" | "cap" | "lv" | "chest" };
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatIdRef = useRef(1);
  const pushChat = (text: string, kind: ChatMsg["kind"] = "info") => {
    setChat((prev) => {
      const next = [...prev, { id: chatIdRef.current++, text, kind }];
      return next.slice(-40);
    });
  };
  // Chat global (cooldown 10 min por jogador)
  const [chatInput, setChatInput] = useState("");
  const [chatCooldownUntil, setChatCooldownUntil] = useState<number>(0);
  const [chatTick, setChatTick] = useState(0);
  useEffect(() => {
    if (chatCooldownUntil <= Date.now()) return;
    const iv = setInterval(() => setChatTick((n) => n + 1), 1000);
    return () => clearInterval(iv);
  }, [chatCooldownUntil]);

  // WASD
  const keysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(k)) {
        keysRef.current.add(k);
      }
    };
    const ku = (e: KeyboardEvent) => { keysRef.current.delete(e.key.toLowerCase()); };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  // ---- Mundo em pixels + câmera que segue o treinador ----
  const WORLD_W = 1920;
  const WORLD_H = 1920;
  const ATTACK_RANGE = 90; // px
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewSize, setViewSize] = useState({ w: 800, h: 680 });
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setViewSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ---- Obstáculos com colisão (posições determinísticas) ----
  const obstacles = useMemo(() => buildObstacles(WORLD_W, WORLD_H, idle.currentMap), [idle.currentMap]);

  // ---- Prédios do mundo (Laboratório + Lar) ----
  type Building = { key: "lab" | "lar" | "azul"; label: string; emoji: string; color: string; x: number; y: number; w: number; h: number; interactR: number };
  const BUILDINGS = useMemo<Building[]>(() => [
    { key: "lab",  label: "Laboratório", emoji: "🔬", color: "#c084fc", x: 520,  y: 640, w: 148, h: 168, interactR: 100 },
    { key: "lar",  label: "Lar",         emoji: "🏠", color: "#5ec26a", x: 1400, y: 640, w: 148, h: 168, interactR: 100 },
    { key: "azul", label: "Casa Azul",   emoji: "🏡", color: "#4a9eff", x: 1600, y: 640, w: 148, h: 168, interactR: 100 },
  ], []);

  const TRAINER_R = 10; // raio do treinador
  const collidesWithAny = (x: number, y: number) => {
    for (const o of obstacles) {
      if (!o.blocks) continue;
      if (Math.hypot(x - o.x, y - o.y) < o.collideR + TRAINER_R) return true;
    }
    return false;
  };
  const nearestBlockingObstacle = (x: number, y: number) => {
    let nearest: Obstacle | null = null;
    let nearestD = Infinity;
    for (const o of obstacles) {
      if (!o.blocks) continue;
      const d = Math.hypot(x - o.x, y - o.y);
      if (d < nearestD) { nearestD = d; nearest = o; }
    }
    return nearest ? { obstacle: nearest, distance: nearestD } : null;
  };
  const getCoveringObstacle = (x: number, y: number) => {
    for (const o of obstacles) {
      const left = o.x - o.w / 2;
      const right = o.x + o.w / 2;
      const top = o.y - o.h + 8;
      const bottom = o.y + 8;
      if (x >= left && x <= right && y >= top && y <= bottom) return o.id;
    }
    return null;
  };

  const [trainerPos, setTrainerPos] = useState({ x: WORLD_W / 2, y: WORLD_H / 2 });
  const [walkStep, setWalkStep] = useState(0);
  const [walkDir, setWalkDir] = useState<Dir>("right");
  const walkDirRef = useRef<Dir>("right");
  const [pokemonFace, setPokemonFace] = useState<"left" | "right">("right");
  const pokemonFaceRef = useRef<"left" | "right">("right");
  const [moving, setMoving] = useState(true);
  // Alvo de deslocamento automático (clicar em "Ir ao Lar", "Ir ao Lab", "Ir Floresta")
  const walkTargetRef = useRef<{ x: number; y: number; label: string; onArrive?: () => void; resumeAuto?: boolean } | null>(null);
  const [walkingTo, setWalkingTo] = useState<string | null>(null);
  const [bigMapOpen, setBigMapOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeMsg, setCodeMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const CRYSTAL_CODE_KEY = "rubym.idlerbmCode.used";
  const GOLD_CODE_KEY = "rubym.goldrbmCode.used";
  const redeemCrystalCode = () => {
    const c = codeInput.trim().toLowerCase();
    if (c === "idlerbm") {
      try {
        if (localStorage.getItem(CRYSTAL_CODE_KEY) === "1") {
          setCodeMsg({ kind: "err", text: "Este código já foi resgatado." });
          return;
        }
        localStorage.setItem(CRYSTAL_CODE_KEY, "1");
      } catch { /* ignore */ }
      setIdle((s) => ({ ...s, bank: { ...s.bank, crystals: s.bank.crystals + 10000 } }));
      setCodeMsg({ kind: "ok", text: "+10.000 💎 cristais!" });
      setCodeInput("");
      return;
    }
    if (c === "goldrbm") {
      try {
        if (localStorage.getItem(GOLD_CODE_KEY) === "1") {
          setCodeMsg({ kind: "err", text: "Este código já foi resgatado." });
          return;
        }
        localStorage.setItem(GOLD_CODE_KEY, "1");
      } catch { /* ignore */ }
      setIdle((s) => ({ ...s, bank: { ...s.bank, gold: s.bank.gold + 10000 } }));
      setCodeMsg({ kind: "ok", text: "+10.000 🪙 gold!" });
      setCodeInput("");
      return;
    }
    setCodeMsg({ kind: "err", text: "Código inválido." });
  };


  useEffect(() => {
    const iv = setInterval(() => setWalkStep((s) => (moving ? (s + 1) % 4 : 0)), 180);
    return () => clearInterval(iv);
  }, [moving]);

  // ===== Multiplayer: presença por mapa via Supabase Realtime =====
  type RemotePlayer = { id: string; userId: string; name: string; x: number; y: number; dir: Dir; step: number; leaderSp?: Species; ts: number };
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const trainerPosRef = useRef(trainerPos);
  useEffect(() => { trainerPosRef.current = trainerPos; }, [trainerPos]);
  const walkStepRef = useRef(walkStep);
  useEffect(() => { walkStepRef.current = walkStep; }, [walkStep]);
  const leaderSpRef = useRef<Species | undefined>(team[0]?.species);
  useEffect(() => { leaderSpRef.current = team[0]?.species; }, [team]);
  useEffect(() => {
    if (!identity?.id) return;
    const mapId = idle.currentMap;
    const meUserId = identity.id;
    const meId = getMultiplayerSessionId(meUserId);
    const meName = identity.name || "Treinador";
    const ch = supabase.channel(`idle-map-${mapId}`, {
      config: { presence: { key: meId }, broadcast: { self: false } },
    });
    const payloadNow = (): RemotePlayer => ({
      id: meId, userId: meUserId, name: meName,
      x: trainerPosRef.current.x, y: trainerPosRef.current.y,
      dir: walkDirRef.current, step: walkStepRef.current,
      leaderSp: leaderSpRef.current, ts: Date.now(),
    });
    const savePresence = async (payload: RemotePlayer) => {
      try {
        await gameDb.from("players").upsert({
          id: payload.id,
          name: payload.name,
          map: mapId,
          x: Math.round(payload.x),
          y: Math.round(payload.y),
          dir: payload.dir,
          leader_species: payload.leaderSp ?? null,
          leader_rarity: null,
          level: team[0]?.level ?? 1,
          trainer_level: team[0]?.level ?? 1,
          craft_points: idle.craftPoints ?? 0,
          updated_at: new Date().toISOString(),
        });
      } catch { /* multiplayer continua via realtime */ }
    };
    const loadPresence = async () => {
      try {
        const since = new Date(Date.now() - 12_000).toISOString();
        const { data } = await gameDb
          .from("players")
          .select("id,name,map,x,y,dir,leader_species,updated_at")
          .eq("map", mapId)
          .gte("updated_at", since);
        if (!data) return;
        setRemotePlayers((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          for (const row of data as any[]) {
            if (!row?.id || row.id === meId) continue;
            byId.set(row.id, {
              id: String(row.id),
              userId: String(row.id).split(":")[0] || String(row.id),
              name: String(row.name || "Treinador"),
              x: Number(row.x) || WORLD_W / 2,
              y: Number(row.y) || WORLD_H / 2,
              dir: (["down", "left", "right", "up"].includes(row.dir) ? row.dir : "down") as Dir,
              step: byId.get(row.id)?.step ?? 0,
              leaderSp: row.leader_species || undefined,
              ts: new Date(row.updated_at || Date.now()).getTime(),
            });
          }
          return Array.from(byId.values()).filter((p) => p.id !== meId && Date.now() - p.ts < 12_000);
        });
      } catch { /* ignore */ }
    };
    const applyState = () => {
      const state = ch.presenceState<RemotePlayer>();
      const list: RemotePlayer[] = [];
      for (const key of Object.keys(state)) {
        if (key === meId) continue;
        const entry = state[key]?.[0];
        if (entry) list.push({ ...entry, ts: Date.now() });
      }
      setRemotePlayers(list);
    };
    ch.on("presence", { event: "sync" }, applyState);
    ch.on("presence", { event: "join" }, applyState);
    ch.on("presence", { event: "leave" }, applyState);
    ch.on("broadcast", { event: "pos" }, (payload: { payload?: unknown }) => {
      const p = payload.payload as RemotePlayer;
      if (!p || p.id === meId) return;
      setRemotePlayers((prev) => {
        const others = prev.filter((r) => r.id !== p.id);
        return [...others, { ...p, ts: Date.now() }];
      });
    });
    const trackNow = () => ch.track(payloadNow());
    ch.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await trackNow();
      }
    });
    void savePresence(payloadNow());
    void loadPresence();
    // Presença + broadcast ~4x/s (redundância p/ garantir sincronia)
    const iv = setInterval(() => {
      const payload = payloadNow();
      void ch.track(payload);
      void ch.send({ type: "broadcast", event: "pos", payload });
    }, 250);
    const dbIv = setInterval(() => {
      const payload = payloadNow();
      void savePresence(payload);
      void loadPresence();
    }, 1_500);
    const prune = setInterval(() => {
      const cutoff = Date.now() - 12_000;
      setRemotePlayers((prev) => prev.filter((p) => p.ts >= cutoff));
    }, 2_000);
    return () => {
      clearInterval(iv);
      clearInterval(dbIv);
      clearInterval(prune);
      void supabase.removeChannel(ch);
      void gameDb.from("players").delete().eq("id", meId);
      setRemotePlayers([]);
    };
  }, [identity?.id, identity?.name, idle.currentMap, idle.totals.captured, idle.craftPoints, team]);

  // ===== Canal global de capturas (visível pra todos os jogadores) =====
  const captureChanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (!identity?.id) return;
    const ch = supabase.channel("rubym-captures-global");
    ch.on("broadcast", { event: "capture" }, (payload: { payload?: unknown }) => {
      const p = payload.payload as { id: string; name: string; sp: string; rarity: string; chancePct: number };
      if (!p || p.id === identity.id) return;
      const spName = String(p.sp).replace(/_/g, " ").toUpperCase();
      pushChat(`🌍 ${p.name} capturou ${spName} (${p.rarity} · ${p.chancePct.toFixed(1)}%)`, "cap");
    });
    ch.on("broadcast", { event: "say" }, (payload: { payload?: unknown }) => {
      const p = payload.payload as { id: string; name: string; text: string };
      if (!p || p.id === identity.id) return;
      const safe = String(p.text).slice(0, 140);
      pushChat(`💬 ${p.name}: ${safe}`, "info");
    });
    ch.subscribe();

    captureChanRef.current = ch;
    return () => {
      captureChanRef.current = null;
      void supabase.removeChannel(ch);
    };
  }, [identity?.id]);



  const [zoom, setZoom] = useState(0.75);
  // ===== Ranking Global =====
  type RankRow = {
    id: string;
    name: string;
    level: number;
    trainer_level: number;
    craft_points: number;
    leader_species: string | null;
    leader_rarity: string | null;
    guild_name: string | null;
  };
  type RankMode = "level" | "trainer" | "craft";
  const [rankOpen, setRankOpen] = useState(false);
  const [rankRows, setRankRows] = useState<RankRow[]>([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankMode, setRankMode] = useState<RankMode>("level");
  useEffect(() => {
    if (!rankOpen) return;
    let cancelled = false;
    setRankLoading(true);
    (async () => {
      try {
        const orderCol = rankMode === "trainer" ? "trainer_level" : rankMode === "craft" ? "craft_points" : "level";
        const { data } = await gameDb
          .from("players")
          .select("id,name,level,trainer_level,craft_points,leader_species,leader_rarity,guild_name")
          .order(orderCol, { ascending: false })
          .limit(50);
        if (!cancelled) setRankRows((data as RankRow[] | null) ?? []);
      } catch { /* ignore */ }
      finally { if (!cancelled) setRankLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [rankOpen, rankMode]);
  const viewW = viewSize.w / zoom;
  const viewH = viewSize.h / zoom;
  const camX = Math.max(0, Math.min(Math.max(0, WORLD_W - viewW), trainerPos.x - viewW / 2));
  const camY = Math.max(0, Math.min(Math.max(0, WORLD_H - viewH), trainerPos.y - viewH / 2));

  // ---- Offline catch-up (uma vez ao montar) ----
  useEffect(() => {
    setIdle((prev) => {
      const elapsed = Math.min(OFFLINE_CAP_MS, Date.now() - prev.lastTickAt);
      const leader = team[0];
      const lvFactor = 1 + ((leader?.level ?? 5) / 40);
      const rate = IDLE_MAPS[prev.currentMap].rate * lvFactor;
      const goldGain = (elapsed / 1000) * 0.8 * rate;
      const rubyGain = (elapsed / 1000) * 0.02 * rate;
      const crystalGain = (elapsed / 1000) * 0.01 * rate;
      const next: IdleState = {
        ...prev,
        lastTickAt: Date.now(),
        pending: {
          gold: prev.pending.gold + goldGain,
          rubies: prev.pending.rubies + rubyGain,
          crystals: prev.pending.crystals + crystalGain,
        },
      };
      saveIdle(next);
      return next;
    });
    if (starterChosenRef.current) setEnemies(spawnEnemies());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Movimento do treinador: caça o inimigo mais próximo ----
  const stuckRef = useRef<{ id: number; count: number }>({ id: 0, count: 0 });
  const blacklistRef = useRef<Map<number, number>>(new Map()); // id -> expiresAt
  useEffect(() => {
    const iv = setInterval(() => {
      if (!starterChosenRef.current) return;
      if (restingRef.current) { if (moving) setMoving(false); return; }
      // ---- Modo manual (WASD) — só se NÃO houver destino clicado ----
      if (!autoRef.current && !walkTargetRef.current) {
        const keys = keysRef.current;
        let dx = 0, dy = 0;
        if (keys.has("w") || keys.has("arrowup")) dy -= 1;
        if (keys.has("s") || keys.has("arrowdown")) dy += 1;
        if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
        if (keys.has("d") || keys.has("arrowright")) dx += 1;
        if (dx === 0 && dy === 0) { if (moving) setMoving(false); return; }
        if (!moving) setMoving(true);
        const mag = Math.hypot(dx, dy) || 1;
        const speed = 14 * (Date.now() < honeyUntilRef.current ? 1 + HONEY_BONUS : 1);
        const stepX = (dx / mag) * speed;
        const stepY = (dy / mag) * speed;
        const nd: Dir = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");
        if (nd !== walkDirRef.current) { walkDirRef.current = nd; setWalkDir(nd); }
        const nextFace = dx >= 0 ? "right" : "left";
        if (dx !== 0 && nextFace !== pokemonFaceRef.current) {
          pokemonFaceRef.current = nextFace; setPokemonFace(nextFace);
        }
        setTrainerPos((tp) => {
          const clampX = (v: number) => Math.max(20, Math.min(WORLD_W - 20, v));
          const clampY = (v: number) => Math.max(20, Math.min(WORLD_H - 20, v));
          let nx = clampX(tp.x + stepX), ny = clampY(tp.y + stepY);
          if (collidesWithAny(nx, ny)) {
            nx = clampX(tp.x + stepX);
            if (collidesWithAny(nx, tp.y)) nx = tp.x;
            ny = clampY(tp.y + stepY);
            if (collidesWithAny(nx, ny)) ny = tp.y;
          }
          return { x: nx, y: ny };
        });
        return;
      }


      // ---- Deslocamento em direção a um destino escolhido (Lar / Lab / outro mapa) ----
      const wt = walkTargetRef.current;
      if (wt) {
        setTrainerPos((tp) => {
          const dx = wt.x - tp.x;
          const dy = wt.y - tp.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 40) {
            const resume = wt.resumeAuto;
            walkTargetRef.current = null;
            setWalkingTo(null);
            wt.onArrive?.();
            if (resume) setAuto(true);
            if (moving) setMoving(false);
            return tp;
          }
          if (!moving) setMoving(true);
          const speed = 14 * (Date.now() < honeyUntilRef.current ? 1 + HONEY_BONUS : 1);
          const stepX = (dx / dist) * speed;
          const stepY = (dy / dist) * speed;
          const nd: Dir = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? "right" : "left")
            : (dy > 0 ? "down" : "up");
          if (nd !== walkDirRef.current) { walkDirRef.current = nd; setWalkDir(nd); }
          const nextFace = dx >= 0 ? "right" : "left";
          if (nextFace !== pokemonFaceRef.current) {
            pokemonFaceRef.current = nextFace; setPokemonFace(nextFace);
          }
          const clampX = (v: number) => Math.max(20, Math.min(WORLD_W - 20, v));
          const clampY = (v: number) => Math.max(20, Math.min(WORLD_H - 20, v));
          return { x: clampX(tp.x + stepX), y: clampY(tp.y + stepY) };
        });
        return;
      }

      if (!autoRef.current) { if (moving) setMoving(false); return; }
      // Sem energia em NENHUM pokémon: personagem para (não farm/duela)
      {
        const nowE = Date.now();
        if (team.length === 0 || team.every((p) => petIsExhausted(p, nowE))) {
          if (moving) setMoving(false);
          return;
        }
      }
      setTrainerPos((tp) => {
        const nowT = Date.now();
        // limpa blacklist expirada
        for (const [k, v] of blacklistRef.current) if (v < nowT) blacklistRef.current.delete(k);

        // Alvos candidatos: baús fechados (prioridade se mais próximos) + inimigos vivos
        const openChests = chests.filter((c) => !c.opened);
        const alive = enemies.filter((e) => e.hp > 0 && !blacklistRef.current.has(e.id));
        const enemyPool = alive.length > 0 ? alive : enemies.filter((e) => e.hp > 0);

        type Tgt = { x: number; y: number; kind: "enemy" | "chest"; id: number; range: number };
        const candidates: Tgt[] = [
          ...openChests.map((c) => ({ x: c.x, y: c.y, kind: "chest" as const, id: c.id, range: 30 })),
          ...enemyPool.map((e) => ({ x: e.x, y: e.y, kind: "enemy" as const, id: e.id, range: ATTACK_RANGE * 0.7 })),
        ];
        if (candidates.length === 0) return tp;
        candidates.sort((a, b) =>
          ((a.x - tp.x) ** 2 + (a.y - tp.y) ** 2) - ((b.x - tp.x) ** 2 + (b.y - tp.y) ** 2)
        );
        const target = candidates[0];
        const dx = target.x - tp.x;
        const dy = target.y - tp.y;
        const dist = Math.hypot(dx, dy);
        if (dist < target.range) {
          if (moving) setMoving(false);
          return tp;
        }
        if (!moving) setMoving(true);
        const speed = 12 * (Date.now() < honeyUntilRef.current ? 1 + HONEY_BONUS : 1);
        const stepX = (dx / dist) * speed;
        const stepY = (dy / dist) * speed;
        const nd: Dir = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");
        if (nd !== walkDirRef.current) {
          walkDirRef.current = nd;
          setWalkDir(nd);
        }
        const nextFace = dx >= 0 ? "right" : "left";
        if (nextFace !== pokemonFaceRef.current) {
          pokemonFaceRef.current = nextFace;
          setPokemonFace(nextFace);
        }
        // AUTO: sem colisão — anda em linha reta atravessando obstáculos
        const clampX = (v: number) => Math.max(20, Math.min(WORLD_W - 20, v));
        const clampY = (v: number) => Math.max(20, Math.min(WORLD_H - 20, v));
        return { x: clampX(tp.x + stepX), y: clampY(tp.y + stepY) };
      });

      // ---- Inimigos agressivos perseguem o pokémon do treinador ----
      setEnemies((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;
        const tx = trainerPos.x;
        const ty = trainerPos.y;
        const next = prev.map((e) => {
          if (!e.aggressive || e.hp <= 0) return e;
          const dx = tx - e.x;
          const dy = ty - e.y;
          const dist = Math.hypot(dx, dy);
          const aggroR = e.aggroR ?? 180;
          if (dist < 50 || dist > aggroR) return e;
          const speed = 6;
          const nx = e.x + (dx / dist) * speed;
          const ny = e.y + (dy / dist) * speed;
          if (collidesWithAny(nx, ny)) return e;
          changed = true;
          return { ...e, x: nx, y: ny, face: (dx >= 0 ? "right" : "left") as "left" | "right" };
        });
        return changed ? next : prev;
      });
    }, 120);
    return () => clearInterval(iv);
  }, [enemies, moving, obstacles, chests]);

  // ---- Tick de batalha (só ataca quando estiver perto do alvo) ----
  useEffect(() => {
    const iv = setInterval(() => {
      if (!starterChosenRef.current) return;
      if (restingRef.current) return;
      setNow(Date.now());

      const leader = team[0];
      if (!leader) return;
      // Se o meu pokémon está desmaiado: não faz nada (precisa reviver)
      if (leaderHp <= 0) return;
      // Líder sem energia (e nenhum reserva usável): não ataca nem farma
      if (petIsExhausted(leader)) return;
      if (!autoBattleRef.current?.enabled) return;

      setEnemies((prev) => {
        if (prev.length === 0) return spawnEnemies();
        const alive = prev.filter((e) => e.hp > 0);
        if (alive.length === 0) return spawnEnemies();
        // acha o mais próximo do treinador
        let target = alive[0];
        let bestD = Infinity;
        for (const e of alive) {
          const d = (e.x - trainerPos.x) ** 2 + (e.y - trainerPos.y) ** 2;
          if (d < bestD) { bestD = d; target = e; }
        }
        // só entra em combate se estiver perto (raio do ataque)
        if (Math.sqrt(bestD) > ATTACK_RANGE) return prev;
        // marca alvo atual (para virar o pokémon na direção dele)
        setAttackTargetId(target.id);
        const attackFace = target.x >= trainerPos.x ? "right" : "left";
        if (attackFace !== pokemonFaceRef.current) {
          pokemonFaceRef.current = attackFace;
          setPokemonFace(attackFace);
        }

        // Calcula posição atual do pokémon líder (mesmo cálculo do render)
        const dir = walkDirRef.current;
        const fOffX = dir === "right" ? -78 : dir === "left" ? 78 : 0;
        const fOffY = dir === "up" ? 72 : dir === "down" ? -58 : 46;
        const followerAtX = trainerPos.x + fOffX;
        const followerAtY = trainerPos.y + fOffY;

        const base = SPECIES_BASE[leader.species];
        // CRIT: base 5% + 0.3%/nível + 0.5% por ponto de crit ascension, cap 60%
        const critAsc = (leader.ascensionStats as Record<string, number> | undefined)?.crit ?? 0;
        const critChance = Math.min(0.6, 0.05 + leader.level * 0.003 + critAsc * 0.005);
        const isCrit = Math.random() < critChance;
        let dmg = Math.floor((5 + leader.level * 0.8 + base.atk * 0.12 + Math.random() * 5) * (1 + idle.buffs.atk));
        if (isCrit) dmg = Math.floor(dmg * 1.8);

        // Lunge: pokémon avança em direção ao inimigo
        const animId = attackAnimIdRef.current++;
        setAttackAnim({ id: animId, fromX: followerAtX, fromY: followerAtY, toX: target.x, toY: target.y, ts: Date.now(), crit: isCrit });
        setTimeout(() => setAttackAnim((a) => (a && a.id === animId ? null : a)), 420);

        // Dano do meu pokémon → aparece EM CIMA DO INIMIGO (com pequeno delay = impacto do lunge)
        setTimeout(() => {
          pushFxAt(target.x, target.y - 34, isCrit ? `CRIT ${dmg}!` : `${dmg}`, isCrit ? "crit" : "myDmg");
        }, 180);
        pushChat(`${isCrit ? "CRÍTICO! " : ""}Você causou ${dmg} de dano em ${target.sp.replace(/_/g, " ")}.`, "dmg");

        // Contra-ataque do inimigo: dano no meu pokémon (reduzido pelo buff de def)
        const eBase = SPECIES_BASE[target.sp];
        const eliteMult = target.elite ? 2.5 : 1;
        const honeyActive = Date.now() < (idle.buffs.honeyUntil ?? 0);
        const honeyDef = honeyActive ? HONEY_BONUS : 0;
        const eDmg = Math.max(1, Math.floor((2 + eBase.atk * 0.045 + Math.random() * 3) * eliteMult * Math.max(0.1, 1 - idle.buffs.def - honeyDef)));
        // Dano recebido → aparece EM CIMA DO MEU POKÉMON, com um respiro após o meu golpe
        setTimeout(() => {
          pushFxAt(followerAtX, followerAtY - 34, `-${eDmg}`, "enemyDmg");
        }, 480);
        setLeaderHp((h) => {
          let nh = Math.max(0, h - eDmg);
          pushChat(`${target.sp.replace(/_/g, " ")} causou ${eDmg} de dano em você.`, "hit");
          // Auto-poção: se HP% <= threshold, consome 1 poção
          const leaderNow = team[0];
          if (leaderNow && idle.autoHeal.enabled && nh > 0) {
            const maxHp = calcIdleMaxHp(leaderNow);
            if (nh / maxHp <= idle.autoHeal.threshold && (idle.items.potion ?? 0) > 0) {
              const heal = Math.floor(maxHp * POTION_HEAL_PCT);
              nh = Math.min(maxHp, nh + heal);
              setIdle((s) => ({ ...s, items: { ...s.items, potion: (s.items.potion ?? 0) - 1 } }));
              pushFxAt(followerAtX, followerAtY - 60, `AUTO +${heal} HP`, "gold");
              pushChat(`🧪 Auto-Poção usada (+${heal} HP).`, "info");
            }
          }
          if (nh <= 0) {
            pushFxAt(followerAtX, followerAtY - 70, "DESMAIOU!", "enemyDmg");
            pushChat(`Seu Pokémon desmaiou!`, "hit");
          }
          return nh;
        });


        const next = prev.map((e) => e.id === target.id
          ? { ...e, hp: e.hp - dmg, face: (trainerPos.x < e.x ? "left" : "right") as "left" | "right" }
          : e);
        const killedNow = next.find((e) => e.id === target.id && e.hp <= 0);
        if (killedNow) {
          const expActive = !!(idle.buffs.expMultUntil && Date.now() < idle.buffs.expMultUntil);
          const goldActive = !!(idle.buffs.goldMultUntil && Date.now() < idle.buffs.goldMultUntil);
          const goldMult = 1 + (goldActive ? (idle.buffs.goldMult ?? 0) : 0);
          // Bônus de drop pela raridade do líder
          const leaderRarity = team[0]?.rarity ?? "common";
          const rarityDropBonus: Partial<Record<Rarity, number>> = {
            rare: 0.03, epic: 0.07, legendary: 0.10, mythic: 0.15, mythic_shiny: 0.20,
          };
          const rarityBonus = rarityDropBonus[leaderRarity] ?? 0;
          const totalMult = goldMult * (1 + rarityBonus);
          const honeyActiveKill = Date.now() < (idle.buffs.honeyUntil ?? 0);
          const honeyMult = honeyActiveKill ? 1 + HONEY_BONUS : 1;
          const xpBase = Math.floor((60 + Math.random() * 100) * (1 + (expActive ? idle.buffs.expMult : 0)) * (1 + rarityBonus) * honeyMult * 0.5);
          const xp = Math.max(1, xpBase);
          // Vale Verdejante de Neve: drop reduzido; outros mapas com ganhos maiores
          const baseGold = idle.currentMap === "neve"
            ? (2 + Math.floor(Math.random() * 4))
            : Math.floor(35 + Math.random() * 55);
          const gold = Math.max(1, Math.floor(baseGold * totalMult));
          pushFxAt(target.x, target.y - 50, `+${xp} EXP`, "xp");
          const bonusParts: string[] = [];
          if (expActive) bonusParts.push(`EXP+${Math.round(idle.buffs.expMult * 100)}%`);
          if (goldActive) bonusParts.push(`Ouro+${Math.round((idle.buffs.goldMult ?? 0) * 100)}%`);
          if (rarityBonus > 0) bonusParts.push(`Líder ${leaderRarity}+${Math.round(rarityBonus * 100)}%`);
          const suffix = bonusParts.length ? ` (${bonusParts.join(" · ")})` : "";
          pushChat(`+${xp} EXP · +${gold} ouro${suffix}`, "info");
          // drops (sem pokébola de drop — agora vem só da loja)
          const drops: string[] = [];
          for (const it of ITEM_POOL) {
            if (it.id === "pokeball") continue;
            if (Math.random() < it.chance * (1 + rarityBonus) * honeyMult) drops.push(it.id);
          }

          // XP para o líder + drena energia de TODOS do time
          setTeam((tm) => {
            if (tm.length === 0) return tm;
            const now = Date.now();
            return tm.map((p, idx) => {
              const curE = petCurrentEnergy(p, now);
              const regen = ENERGY_REGEN_MS[p.rarity] ?? 20 * 60 * 1000;
              const newE = regen === 0 ? ENERGY_MAX : Math.max(0, curE - ENERGY_DRAIN_PER_KILL);
              if (idx === 0) {
                const newXp = (p.xp ?? 0) + xp;
                let lv = p.level;
                let remaining = newXp;
                while (lv < 3000 && remaining >= 100 + lv * 20) { remaining -= 100 + lv * 20; lv += 1; }
                if (lv >= 3000) remaining = 0;
                return {
                  ...p, level: lv, xp: remaining,
                  hp: Math.min(leaderHp, calcIdleMaxHp({ ...p, level: lv })),
                  energy: newE, energyRegenAt: now,
                } as PetInstance;
              }
              return { ...p, energy: newE, energyRegenAt: now } as PetInstance;
            });
          });



          // Tentativa de captura — SÓ com pokébola
          setIdle((s) => {
            const nt = s.tasks.map((t) =>
              t.id === "t1" && !t.done
                ? { ...t, progress: Math.min(t.target, t.progress + 1), done: t.progress + 1 >= t.target }
                : t);
            const newItems = { ...s.items };
            for (const id of drops) newItems[id] = (newItems[id] ?? 0) + 1;

            // escolhe bola conforme preferência
            const abCfg = autoBattleRef.current;
            const useBall = abCfg?.useBall !== false;
            const pref = abCfg?.preferredBall ?? "auto";
            const isEventLegSel = !!target.eventLegendary;
            let usedBall: ShopBall | null = null;
            if (useBall) {
              if (pref !== "auto") {
                const b = SHOP_BALLS.find((x) => x.id === pref);
                if (b && (newItems[b.id] ?? 0) > 0) usedBall = b;
              }
              if (!usedBall) {
                // Auto: contra eventos prefere master → ultra; senão evita master
                const order = isEventLegSel
                  ? ["masterball", "ultraball", "greatball", "pokeball"]
                  : ["ultraball", "greatball", "pokeball"]; // master reservada para eventos
                for (const id of order) {
                  const b = SHOP_BALLS.find((x) => x.id === id);
                  if (b && (newItems[b.id] ?? 0) > 0) { usedBall = b; break; }
                }
              }
            }
            let captured = false;
            let capturedPet: PetInstance | null = null;
            const isEventLeg = !!target.eventLegendary;
            // Se for lendário do evento, pokébola comum não é lançada
            if (isEventLeg && usedBall && usedBall.id === "pokeball") {
              pushFxAt(target.x, target.y - 70, "Pokébola comum não serve!", "enemyDmg");
              usedBall = null;
            }
            if (usedBall) {
              newItems[usedBall.id] = (newItems[usedBall.id] ?? 0) - 1;
              const baseChance = 0.05; // difícil: 5% base (com bola comum)
              if (isEventLeg && usedBall.id === "greatball") {
                captured = false; // Great sempre falha em lendários do evento
              } else if (isEventLeg && usedBall.id === "masterball") {
                captured = true; // Master captura garantido
              } else if (isEventLeg) {
                // Ultra: chance muito baixa (~2%) contra lendários do evento
                captured = usedBall.id === "ultraball" ? Math.random() < 0.02 : false;
              } else {
                captured = Math.random() < baseChance * usedBall.captureMult;
              }
              if (captured) {
                const np = makePet(target.sp, 5);
                capturedPet = np;
                const rarityLabelMap: Record<string, string> = {
                  common: "Comum", uncommon: "Incomum", rare: "Raro",
                  epic: "Épico", legendary: "Lendário", mythic: "Mítico", mythic_shiny: "Mítico ✦",
                };
                const rarityColorMap: Record<string, string> = {
                  common: "#c8b8d0", uncommon: "#5ec26a", rare: "#6bd4ff",
                  epic: "#c084fc", legendary: "#f5cf6b", mythic: "#ff6b3d", mythic_shiny: "#ff97e1",
                };
                const rLabel = rarityLabelMap[np.rarity] ?? String(np.rarity);
                const rColor = rarityColorMap[np.rarity] ?? "#f5cf6b";
                pushFxAt(target.x, target.y - 70, `★ ${usedBall.name.toUpperCase()} ★`, "capture");
                pushFxAt(target.x, target.y - 100, `${rLabel.toUpperCase()}!`, "capture");
                pushChat(`★ Capturado (${rLabel}) com ${usedBall.name}: ${target.sp.replace(/_/g, " ").toUpperCase()}!`, "cap");
                // fx visual: contorna a chat com a cor da raridade (via console info)
                void rColor;
                // Broadcast global da captura
                try {
                  const chancePct = baseChance * usedBall.captureMult * 100;
                  void captureChanRef.current?.send({
                    type: "broadcast",
                    event: "capture",
                    payload: {
                      id: identity?.id ?? "anon",
                      name: identity?.name ?? "Treinador",
                      sp: target.sp,
                      rarity: rLabel,
                      chancePct,
                    },
                  });
                } catch { /* ignore */ }
                playBonus();
                // Adiciona ao time
                setTeam((tm) => {
                  if (tm.length >= 5) {
                    pushChat(`Time cheio (5/5). ${target.sp.replace(/_/g, " ").toUpperCase()} foi para a Coleção.`, "info");
                    return tm;
                  }
                  return [...tm, np];
                });

              } else {
                pushFxAt(target.x, target.y - 70, `${usedBall.name} falhou`, "enemyDmg");
                pushChat(`✗ ${usedBall.name} falhou em capturar ${target.sp.replace(/_/g, " ").toUpperCase()}.`, "hit");
              }
            } else {
              pushFxAt(target.x, target.y - 70, "sem pokébola", "enemyDmg");
              pushChat(`Sem Pokébolas no estoque — compre na loja para capturar.`, "info");
            }

            const capturedInc = captured ? 1 : 0;
            const nt2 = nt.map((t) => (t.id === "t3" && !t.done && capturedInc)
              ? { ...t, progress: Math.min(t.target, t.progress + 1), done: t.progress + 1 >= t.target }
              : t);
            const newCaught = captured && !s.caughtSpecies.includes(target.sp)
              ? [...s.caughtSpecies, target.sp]
              : s.caughtSpecies;
            const newSeen = s.seenSpecies.includes(target.sp)
              ? s.seenSpecies
              : [...s.seenSpecies, target.sp];
            const prevCol = s.collection ?? [];
            const newCollection = capturedPet
              ? [...prevCol, { uid: capturedPet.uid, species: capturedPet.species, level: capturedPet.level, rarity: capturedPet.rarity, capturedAt: Date.now() }]
              : prevCol;
            return {
              ...s,
              pending: { ...s.pending, gold: s.pending.gold + gold },
              totals: { gold: s.totals.gold + gold, captured: s.totals.captured + capturedInc },
              tasks: nt2,
              items: newItems,
              caughtSpecies: newCaught,
              seenSpecies: newSeen,
              collection: newCollection,
            };
          });
        }
        const survivors = next.filter((e) => e.hp > 0);
        if (survivors.length === 0) return spawnEnemies();
        return next;
      });
      // Accrue passivo por segundo
      setIdle((s) => {
        const lvFactor = 1 + ((leader?.level ?? 5) / 40);
        const rate = IDLE_MAPS[s.currentMap].rate * lvFactor;
        const inc = { g: 0.8 * rate, r: 0.02 * rate, c: 0.01 * rate };
        const ns: IdleState = {
          ...s,
          lastTickAt: Date.now(),
          pending: {
            gold: s.pending.gold + inc.g,
            rubies: s.pending.rubies + inc.r,
            crystals: s.pending.crystals + inc.c,
          },
        };
        const nt = ns.tasks.map((t) => t.id === "t2" && !t.done
          ? { ...t, progress: Math.min(t.target, Math.floor(ns.pending.gold + ns.totals.gold)), done: (ns.pending.gold + ns.totals.gold) >= t.target }
          : t);
        return { ...ns, tasks: nt };
      });
    }, 900);
    return () => clearInterval(iv);
  }, [team, trainerPos, leaderHp]);


  useEffect(() => { saveIdle(idle); }, [idle]);

  // Reconcilia: qualquer pokémon no time/bench que não esteja na coleção é adicionado (retroativo).
  useEffect(() => {
    setIdle((s) => {
      const col = s.collection ?? [];
      const known = new Set(col.map((e) => e.uid));
      const missing: CollectionEntry[] = [];
      for (const p of [...team, ...restingBench]) {
        if (!known.has(p.uid)) {
          missing.push({ uid: p.uid, species: p.species, level: p.level, rarity: p.rarity, capturedAt: Date.now() });
        }
      }
      if (missing.length === 0) return s;
      return { ...s, collection: [...col, ...missing] };
    });
  }, [team, restingBench]);

  useEffect(() => {
    const iv = setInterval(() => {
      const save = (loadLatestValid<SaveShape>() ?? {}) as SaveShape;
      saveNow({ ...save, party: [...team, ...restingBench] });
    }, 15_000);
    return () => clearInterval(iv);
  }, [team, restingBench]);

  // Detecta level up e dispara aura + fx
  useEffect(() => {
    const lv = team[0]?.level ?? 0;
    if (prevLevelRef.current === 0) { prevLevelRef.current = lv; return; }
    if (lv > prevLevelRef.current) {
      const gained = lv - prevLevelRef.current;
      prevLevelRef.current = lv;
      setLeveledAt(Date.now());
      // ===== Atributos aleatórios + bônus fixo por nível =====
      const STAT_KEYS = ["hp","atk","def","spa","spd","spe","crit"] as const;
      const statLabel: Record<string, string> = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE", crit: "CRIT" };
      let bonusStat: string = "atk";
      let randomSummary: string[] = [];
      setTeam((tm) => {
        const l = tm[0]; if (!l) return tm;
        const asc: Record<string, number> = { ...(l.ascensionStats ?? {}) };
        const rollCount: Record<string, number> = {};
        for (let g = 0; g < gained; g++) {
          // 3 pontos aleatórios distribuídos + 1 stat bônus com +2
          for (let i = 0; i < 3; i++) {
            const k = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
            // hp ganha mais pontos brutos por ser stat de base maior
            const pts = k === "hp" ? 2 : 1;
            asc[k] = (asc[k] ?? 0) + pts;
            rollCount[k] = (rollCount[k] ?? 0) + pts;
          }
          bonusStat = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
          const bonusPts = bonusStat === "hp" ? 4 : 2;
          asc[bonusStat] = (asc[bonusStat] ?? 0) + bonusPts;
          rollCount[bonusStat] = (rollCount[bonusStat] ?? 0) + bonusPts;
        }
        randomSummary = Object.entries(rollCount)
          .map(([k, v]) => `+${v} ${statLabel[k]}`);
        const updated = { ...l, ascensionStats: asc };
        return [{ ...updated, hp: calcIdleMaxHp(updated) }, ...tm.slice(1)];
      });
      // cura ao subir de nível — chamada após setTeam, mas leaderHp é reset pelo maxHp novo
      setTimeout(() => {
        const cur = team[0];
        if (cur) setLeaderHp(calcIdleMaxHp({ ...cur, level: lv, ascensionStats: { ...(cur.ascensionStats ?? {}) } }));
      }, 0);
      pushFxAt(trainerPos.x, trainerPos.y - 70, `LV ${lv}!`, "xp");
      pushFxAt(trainerPos.x, trainerPos.y - 100, `✨ BÔNUS +${statLabel[bonusStat]}`, "gold");
      pushChat(`⬆ Nível ${lv}! Atributos ganhos: ${randomSummary.join(", ")}`, "lv");
      setLevelToast({ level: lv, gains: randomSummary, bonus: statLabel[bonusStat], ts: Date.now() });
      playLevelUp();

    } else {
      prevLevelRef.current = lv;
    }
  }, [team]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==== Guarda de nível: o nível de cada Pokémon nunca pode regredir ====
  const maxLevelRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const all = [...team, ...restingBench];
    for (const p of all) {
      const prev = maxLevelRef.current[p.uid] ?? 0;
      if ((p.level ?? 0) > prev) maxLevelRef.current[p.uid] = p.level;
    }
    let teamChanged = false;
    const fixedTeam = team.map((p) => {
      const mx = maxLevelRef.current[p.uid] ?? 0;
      if ((p.level ?? 0) < mx) { teamChanged = true; return { ...p, level: mx }; }
      return p;
    });
    if (teamChanged) setTeam(fixedTeam);
    let benchChanged = false;
    const fixedBench = restingBench.map((p) => {
      const mx = maxLevelRef.current[p.uid] ?? 0;
      if ((p.level ?? 0) < mx) { benchChanged = true; return { ...p, level: mx }; }
      return p;
    });
    if (benchChanged) setRestingBench(fixedBench);
  }, [team, restingBench]);

  // ==== Evento Lendário: 5 pokémon raros aparecem a cada 30 min (rotativo) ====
  const LEGEND_INTERVAL_MS = 30 * 60 * 1000;
  const LEGEND_DURATION_MS = 3 * 60 * 1000;
  const LEGEND_ROSTER: { sp: Species; label: string; rarity: Rarity; level: number; icon: string; color: string; weather?: "snow" | "rain" }[] = [
    { sp: "virizion",      label: "VIRIZION",      rarity: "epic",         level: 80, icon: "🌿", color: "#7ef2a2" },
    { sp: "raikou",        label: "RAIKOU",        rarity: "epic",         level: 82, icon: "⚡", color: "#f5cf6b" },
    { sp: "luxray_f",      label: "LUXRAY ♀",      rarity: "epic",         level: 78, icon: "⚡", color: "#5ec2ff" },
    { sp: "suicune",       label: "SUICUNE",       rarity: "mythic",       level: 88, icon: "❄", color: "#8ec5ff", weather: "rain" },
    { sp: "suicune_shiny", label: "SUICUNE ✦",     rarity: "mythic_shiny", level: 92, icon: "💠", color: "#ff97e1", weather: "snow" },
  ];
  const legendIdxRef = useRef(0);
  const [legendUntil, setLegendUntil] = useState<{ until: number; weather?: "snow" | "rain" } | null>(null);
  useEffect(() => {
    const trigger = () => {
      const pick = LEGEND_ROSTER[Math.floor(Math.random() * LEGEND_ROSTER.length)];
      legendIdxRef.current++;
      const until = Date.now() + LEGEND_DURATION_MS;
      setLegendUntil({ until, weather: pick.weather });
      if (pick.weather) setWeather(pick.weather);
      setEnemies((prev) => {
        if (prev.some((e) => e.sp === pick.sp)) return prev;
        let x = 200, y = 200, tries = 0;
        do {
          x = 200 + Math.random() * (WORLD_W - 400);
          y = 200 + Math.random() * (WORLD_H - 400);
          tries++;
        } while (collidesWithAny(x, y) && tries < 20);
        const petA = makePet(pick.sp, pick.level);
        const hpMult = pick.rarity === "mythic_shiny" ? 4 : pick.rarity === "mythic" ? 3.2 : 2.6;
        const hp = Math.floor(calcIdleMaxHp(petA) * hpMult);
        return [
          ...prev,
          { sp: pick.sp, hp, maxHp: hp, id: enemyIdRef.current++, x, y, face: "left", aggressive: false, aggroR: 0, elite: true, level: pick.level, rarity: pick.rarity, eventLegendary: true } as Enemy,
        ];
      });
      const rarityLabel = pick.rarity === "mythic_shiny" ? "MÍTICO ✦" : pick.rarity === "mythic" ? "MÍTICO" : "ÉPICO";
      pushEvent(pick.icon, `EVENTO ${rarityLabel}`, `${pick.label} apareceu! Só ULTRA/MASTER captura.`, pick.color);
      pushChat(`★ EVENTO ${rarityLabel}: ${pick.label} ${pick.icon} apareceu! Pokébola comum NÃO funciona, Great sempre falha — use ULTRA ou MASTER!`, "cap");
    };
    const firstTo = setTimeout(trigger, 45_000);
    const iv = setInterval(trigger, LEGEND_INTERVAL_MS);
    return () => { clearTimeout(firstTo); clearInterval(iv); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Enquanto o evento estiver ativo, força o clima escolhido
  useEffect(() => {
    if (!legendUntil || legendUntil.until <= Date.now() || !legendUntil.weather) return;
    setWeather(legendUntil.weather);
    const iv = setInterval(() => {
      if (!legendUntil || Date.now() >= legendUntil.until) { clearInterval(iv); return; }
      if (legendUntil.weather) setWeather(legendUntil.weather);
    }, 1500);
    return () => clearInterval(iv);
  }, [legendUntil]);




  // Revive: consome 50 gold do banco (ou 50 gold pendente)
  const revive = () => {
    const l = team[0]; if (!l) return;
    let did = false;
    setIdle((s) => {
      if (s.bank.gold >= 50) {
        did = true;
        return { ...s, bank: { ...s.bank, gold: s.bank.gold - 50 } };
      }
      if (s.pending.gold >= 50) {
        did = true;
        return { ...s, pending: { ...s.pending, gold: s.pending.gold - 50 } };
      }
      return s;
    });

    // aplica com pequeno delay para garantir que o setIdle rodou
    setTimeout(() => {
      if (did) {
        setLeaderHp(calcIdleMaxHp(l));
        pushFxAt(trainerPos.x, trainerPos.y - 40, "REVIVEU!", "gold");
      } else {
        pushFxAt(trainerPos.x, trainerPos.y - 40, "SEM REVIVE!", "enemyDmg");
      }
    }, 0);
  };

  // Lança bola manualmente em um inimigo (clique)
  const throwBallAt = (enemyId: number) => {
    const target = enemies.find((e) => e.id === enemyId);
    if (!target || target.hp <= 0) return;
    const abCfg = autoBattleRef.current;
    const pref = abCfg?.preferredBall ?? "auto";
    // seleciona bola
    let usedBall: ShopBall | null = null;
    if (pref !== "auto") {
      const b = SHOP_BALLS.find((x) => x.id === pref);
      if (b && (idle.items[b.id] ?? 0) > 0) usedBall = b;
    }
    if (!usedBall) {
      for (const b of [...SHOP_BALLS].reverse()) {
        if ((idle.items[b.id] ?? 0) > 0) { usedBall = b; break; }
      }
    }
    if (!usedBall) {
      pushFxAt(target.x, target.y - 60, "sem pokébola", "enemyDmg");
      pushChat(`Sem Pokébolas — compre na loja.`, "info");
      return;
    }
    const isEventLeg = !!target.eventLegendary;
    if (isEventLeg && usedBall.id === "pokeball") {
      pushFxAt(target.x, target.y - 60, "Pokébola comum não serve!", "enemyDmg");
      pushChat(`${target.sp.replace(/_/g, " ").toUpperCase()} é um lendário do evento — use ULTRA ou MASTER.`, "info");
      return;
    }
    const hpPct = target.hp / target.maxHp;
    // chance manual: base 8%, escala até 45% conforme hp% baixa; multiplicada pelo bônus da bola
    let chance: number;
    if (isEventLeg && usedBall.id === "greatball") {
      chance = 0; // Great sempre falha em lendários do evento
    } else if (isEventLeg && usedBall.id === "masterball") {
      chance = 1; // Master captura garantido
    } else if (isEventLeg) {
      chance = usedBall.id === "ultraball" ? 0.02 : 0; // Ultra: 2% fixo; qualquer outra falha
    } else {
      const base = 0.08 + (1 - hpPct) * 0.37;
      chance = Math.min(0.95, base * usedBall.captureMult);
    }
    const success = Math.random() < chance;
    const ballId = usedBall.id;
    const ballName = usedBall.name;
    setIdle((s) => ({ ...s, items: { ...s.items, [ballId]: Math.max(0, (s.items[ballId] ?? 0) - 1) } }));
    pushFxAt(target.x, target.y - 40, `${ballName}!`, "capture");
    if (success) {
      const np = makePet(target.sp, 5);
      const rarityLabelMap: Record<string, string> = {
        common: "Comum", uncommon: "Incomum", rare: "Raro",
        epic: "Épico", legendary: "Lendário", mythic: "Mítico", mythic_shiny: "Mítico ✦",
      };
      const rLabel = rarityLabelMap[np.rarity] ?? String(np.rarity);
      pushFxAt(target.x, target.y - 70, `★ CAPTUROU! ★`, "capture");
      pushChat(`★ Capturado manualmente (${rLabel}) com ${ballName}: ${target.sp.replace(/_/g, " ").toUpperCase()}!`, "cap");
      playBonus();
      setEnemies((prev) => prev.filter((e) => e.id !== enemyId));
      setTeam((tm) => {
        if (tm.length >= 5) {
          pushChat(`Time cheio (5/5). ${target.sp.replace(/_/g, " ").toUpperCase()} foi para a Coleção.`, "info");
          return tm;
        }
        return [...tm, np];
      });
      setIdle((s) => ({
        ...s,
        totals: { ...s.totals, captured: s.totals.captured + 1 },
        caughtSpecies: s.caughtSpecies.includes(target.sp) ? s.caughtSpecies : [...s.caughtSpecies, target.sp],
        collection: [...(s.collection ?? []), { uid: np.uid, species: np.species, level: np.level, rarity: np.rarity, capturedAt: Date.now() }],
      }));
    } else {
      pushFxAt(target.x, target.y - 70, `${ballName} falhou`, "enemyDmg");
      pushChat(`✗ ${ballName} falhou (HP ${Math.round(hpPct * 100)}%).`, "hit");
    }
  };



  // Usar item da mochila
  const useItem = (id: string) => {
    const l = team[0]; if (!l) return;
    const have = (idle.items[id] ?? 0);
    if (have <= 0) { pushChat(`Você não tem ${id}.`, "info"); return; }
    const maxHp = calcIdleMaxHp(l);
    if (id === "potion") {
      if (leaderHp <= 0) { pushChat(`Poção não revive. Reviva por 50 ouro.`, "info"); return; }
      const heal = Math.floor(maxHp * 0.5);
      setLeaderHp((h) => Math.min(maxHp, h + heal));
      setIdle((s) => ({ ...s, items: { ...s.items, [id]: have - 1 } }));
      pushFxAt(trainerPos.x, trainerPos.y - 40, `+${heal} HP`, "gold");
      pushChat(`Você usou Poção (+${heal} HP).`, "info");
    } else if (id === "pokeball" || id === "greatball" || id === "ultraball") {
      pushChat(`As Pokébolas são usadas automaticamente ao derrotar inimigos.`, "info");
    } else if (id === "berry") {
      if (leaderHp <= 0) { pushChat(`Berry não revive. Use um Revive.`, "info"); return; }
      setLeaderHp(maxHp);
      setIdle((s) => ({ ...s, items: { ...s.items, [id]: have - 1 } }));
      pushFxAt(trainerPos.x, trainerPos.y - 40, `HP CHEIO!`, "gold");
      pushChat(`Você usou Berry (HP totalmente restaurado).`, "info");
    } else if (id === "revive") {
      if (leaderHp > 0) { pushChat(`Seu líder está de pé.`, "info"); return; }
      setLeaderHp(maxHp);
      setIdle((s) => ({ ...s, items: { ...s.items, [id]: have - 1 } }));
      pushFxAt(trainerPos.x, trainerPos.y - 40, `REVIVEU!`, "gold");
      pushChat(`Você usou Revive (+HP cheio).`, "cap");
    } else if (id === "key") {
      pushChat(`Guarde as Chaves para trocar no Mercado.`, "info");
    } else if (id === "book_atk") {
      setIdle((s) => ({ ...s, items: { ...s.items, [id]: have - 1 }, buffs: { ...s.buffs, atk: s.buffs.atk + 0.10 } }));
      pushFxAt(trainerPos.x, trainerPos.y - 40, "ATK +10%", "capture");
      pushChat(`Livro de Ataque usado (+10% dano permanente).`, "cap");
    } else if (id === "book_def") {
      setIdle((s) => ({ ...s, items: { ...s.items, [id]: have - 1 }, buffs: { ...s.buffs, def: s.buffs.def + 0.10 } }));
      pushFxAt(trainerPos.x, trainerPos.y - 40, "DEF +10%", "capture");
      pushChat(`Livro de Defesa usado (-10% dano recebido).`, "cap");
    } else if (id === "book_exp" || id === "book_exp_big" || id === "book_exp_max") {
      const add = id === "book_exp" ? 0.30 : id === "book_exp_big" ? 0.50 : 1.00;
      const pct = Math.round(add * 100);
      setIdle((s) => {
        const active = !!(s.buffs.expMultUntil && Date.now() < s.buffs.expMultUntil);
        const base = active ? s.buffs.expMult : 0;
        return {
          ...s,
          items: { ...s.items, [id]: have - 1 },
          buffs: { ...s.buffs, expMult: base + add, expMultUntil: Date.now() + 3600_000 },
        };
      });
      pushFxAt(trainerPos.x, trainerPos.y - 40, `EXP +${pct}% · 1h`, "capture");
      pushChat(`Livro de EXP usado (+${pct}% EXP por 1 hora).`, "cap");
    } else if (id === "book_vip") {
      const add = 0.20;
      setIdle((s) => {
        const now = Date.now();
        const expActive = !!(s.buffs.expMultUntil && now < s.buffs.expMultUntil);
        const goldActive = !!(s.buffs.goldMultUntil && now < s.buffs.goldMultUntil);
        const baseExp = expActive ? s.buffs.expMult : 0;
        const baseGold = goldActive ? (s.buffs.goldMult ?? 0) : 0;
        return {
          ...s,
          items: { ...s.items, [id]: have - 1 },
          buffs: {
            ...s.buffs,
            expMult: baseExp + add, expMultUntil: now + 3600_000,
            goldMult: baseGold + add, goldMultUntil: now + 3600_000,
          },
        };
      });
      pushFxAt(trainerPos.x, trainerPos.y - 40, "VIP +20% OURO/EXP · 1h", "capture");
      pushChat(`Livro VIP ✦ usado (+20% ouro e +20% EXP por 1 hora).`, "cap");
    } else if (id === "egg_common" || id === "egg_rare" || id === "egg_epic" || id === "egg_mystic" || id === "egg_aura") {
      openEgg(id as EggId);
    }
  };

  // ===== OVOS =====
  // (Rarity é importada de @/game/systems)
  const RARITY_LABEL: Record<Rarity, string> = {
    common: "Comum", uncommon: "Incomum", rare: "Raro",
    epic: "Épico", legendary: "Lendário", mythic: "Mítico", mythic_shiny: "Mítico ✦",
  };
  const RARITY_COLOR: Record<Rarity, string> = {
    common: "#c8b8d0", uncommon: "#5ec26a", rare: "#6bd4ff",
    epic: "#c084fc", legendary: "#f5cf6b", mythic: "#ff6b3d", mythic_shiny: "#ff97e1",
  };
  type EggId = "egg_common" | "egg_rare" | "egg_epic" | "egg_mystic" | "egg_aura";
  const EGG_TIERS: Record<EggId, { weights: Partial<Record<Rarity, number>> }> = {
    // Compat com saves antigos
    egg_common: { weights: { common: 70, uncommon: 25, rare: 5 } },
    egg_rare:   { weights: { uncommon: 20, rare: 55, epic: 22, legendary: 3 } },
    egg_epic:   { weights: { rare: 20, epic: 50, legendary: 25, mythic: 5 } },
    // Ovo Místico — único da loja, pode sair qualquer raridade
    egg_mystic: { weights: { common: 25, uncommon: 25, rare: 22, epic: 16, legendary: 9, mythic: 2, mythic_shiny: 1 } },
    // Ovo Aura — sempre mítico (Lucario ou Mew com aura)
    egg_aura:   { weights: { mythic: 100 } },
  };

  const rollEggRarity = (tier: EggId): Rarity => {
    const w = EGG_TIERS[tier].weights;
    const entries = Object.entries(w) as [Rarity, number][];
    const total = entries.reduce((s, [, v]) => s + v, 0);
    let r = Math.random() * total;
    for (const [k, v] of entries) { r -= v; if (r <= 0) return k; }
    return "common";
  };
  const openEgg = (eggId: EggId) => {
    const have = idle.items[eggId] ?? 0;
    if (have <= 0) { pushChat(`Você não tem esse ovo.`, "info"); return; }
    const leaderLv = team[0]?.level ?? 5;
    let sp: Species;
    if (eggId === "egg_aura") {
      sp = (Math.random() < 0.5 ? "lucario" : "mew") as Species;
    } else {
      const unlocked = speciesUnlockedFor(leaderLv);
      sp = unlocked[Math.floor(Math.random() * unlocked.length)] as Species;
    }
    const rarity = rollEggRarity(eggId);
    const pet = makePet(sp, Math.max(1, leaderLv), rarity as Rarity);

    setIdle((s) => ({
      ...s,
      items: { ...s.items, [eggId]: (s.items[eggId] ?? 0) - 1 },
      caughtSpecies: s.caughtSpecies.includes(sp as Species) ? s.caughtSpecies : [...s.caughtSpecies, sp as Species],
      seenSpecies: s.seenSpecies.includes(sp as Species) ? s.seenSpecies : [...s.seenSpecies, sp as Species],
      collection: [
        ...(s.collection ?? []),
        { uid: pet.uid, species: pet.species, level: pet.level, rarity: pet.rarity, capturedAt: Date.now() },
      ],
    }));
    // Adiciona ao time se houver vaga (mesma regra da captura)
    setTeam((tm) => {
      if (tm.length >= 5) {
        pushChat(`Time cheio (5/5). ${String(sp).toUpperCase()} foi para a Coleção.`, "info");
        return tm;
      }
      return [...tm, pet];
    });
    // Espelha no save principal para compat com a tela clássica
    try {
      const raw = localStorage.getItem("rubym.save.v2");
      const save = raw ? JSON.parse(raw) : {};
      save.party = [...(save.party ?? []), pet];
      localStorage.setItem("rubym.save.v2", JSON.stringify(save));
    } catch { /* ignore */ }
    setEggOpenResult({ sp: String(sp), rarity });
    pushChat(`🥚 Ovo chocou: ${String(sp).toUpperCase()} — ${RARITY_LABEL[rarity]}! Stats bonificados pela raridade.`, "cap");
    pushFxAt(trainerPos.x, trainerPos.y - 70, `${RARITY_LABEL[rarity].toUpperCase()}!`, "capture");

  };

  // Loja — apenas 1 ovo místico (500 cristais), raridade totalmente aleatória
  const SHOP_EGGS: { id: EggId; name: string; price: number; currency: "gold" | "crystals"; desc: string; color: string }[] = [
    { id: "egg_mystic", name: "Ovo Místico", price: 1000, currency: "crystals", desc: "Raridade aleatória: comum → mítico ✦ (item raro)", color: "#ff97e1" },
    { id: "egg_aura",   name: "Ovo da Aura", price: 10,   currency: "gold",     desc: "Choca Lucario ou Mew (com aura mítica) ✨", color: "#6bd4ff" },
  ];

  const buyEgg = (e: typeof SHOP_EGGS[number]) => {
    setIdle((s) => {
      if (e.currency === "gold" && s.bank.gold < e.price) { pushChat(`Ouro insuficiente para ${e.name}.`, "info"); return s; }
      if (e.currency === "crystals" && s.bank.crystals < e.price) { pushChat(`Cristais insuficientes para ${e.name}.`, "info"); return s; }
      pushChat(`Comprou ${e.name}. Vá no Inventário e USE para chocar.`, "cap");
      return {
        ...s,
        bank: e.currency === "gold"
          ? { ...s.bank, gold: s.bank.gold - e.price }
          : { ...s.bank, crystals: s.bank.crystals - e.price },
        items: { ...s.items, [e.id]: (s.items[e.id] ?? 0) + 1 },
      };
    });
  };

  // Fragmentar Pokémon da coleção -> pontos de craft por raridade
  const fragmentCollection = (uid: string) => {
    setIdle((s) => {
      const col = s.collection ?? [];
      const entry = col.find((e) => e.uid === uid);
      if (!entry) return s;
      const gain = CRAFT_BY_RARITY[entry.rarity] ?? 1;
      pushChat(`⚒️ ${entry.species.replace(/_/g, " ").toUpperCase()} fragmentado (+${gain} pts de craft).`, "cap");
      return {
        ...s,
        collection: col.filter((e) => e.uid !== uid),
        craftPoints: (s.craftPoints ?? 0) + gain,
      };
    });
  };






  function spawnEnemies(): Enemy[] {
    const leaderLv = team[0]?.level ?? 10;
    const count = 10 + Math.floor(Math.random() * 4); // 10-13 pokemons no mundo
    const placed: { x: number; y: number }[] = [];
    const MIN_DIST = 220; // px entre inimigos (nao ficam colados)
    const arr: Enemy[] = [];
    let attempts = 0;
    while (arr.length < count && attempts < count * 30) {
      attempts++;
      const x = 120 + Math.random() * (WORLD_W - 240);
      const y = 120 + Math.random() * (WORLD_H - 240);
      // distancia minima do treinador (300px) para não spawnar em cima
      const dt = Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2);
      if (dt < 300) continue;
      let ok = true;
      for (const p of placed) {
        if (Math.hypot(x - p.x, y - p.y) < MIN_DIST) { ok = false; break; }
      }
      if (!ok) continue;
      // evita spawn em cima de obstáculos
      if (collidesWithAny(x, y)) continue;
      placed.push({ x, y });
      const elite = Math.random() < 0.40; // 40% dos inimigos são "elites" perigosos
      const maxTeamLv = team.reduce((m, p) => Math.max(m, p.level), 0);
      let pool = speciesUnlockedFor(leaderLv);
      // No Ninho de Marimbondo, com um Pokémon nv 30+ no time, aparecem Beedrill/Butterfree selvagens capturáveis
      if (idle.currentMap === "terra" && maxTeamLv >= 30) {
        pool = ["beedrill", "butterfree", "blaziken", "pinsir", "golem", "jolteon", "lapras"] as Species[];
      }
      // Pântano em Chamas: pool temático veneno + fogo
      if (idle.currentMap === "venofogo") {
        pool = ["blaziken", "charmander", "charmeleon", "charizard", "magmar", "arcanine", "growlithe",
                "ekans", "arbok", "zubat", "venonat", "venomoth", "beedrill", "weedle", "kakuna"] as Species[];
      }
      const sp = pool[Math.floor(Math.random() * pool.length)];
      // Pokémons selvagens pareados com o nível do líder (±1) pra não ter desvantagem.
      // Elites levam +1 nível e, raramente (5%), aparece um "forte" com +2/+4.
      const rareStrong = Math.random() < 0.05;
      const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0 ou +1
      const baseLv = rareStrong
        ? leaderLv + 2 + Math.floor(Math.random() * 3)
        : Math.max(1, leaderLv + jitter);
      const lv = elite ? baseLv + 1 : baseLv;
      const pet = makePet(sp, lv);
      const hp = Math.floor(calcIdleMaxHp(pet) * (elite ? 1.6 : 1));
      const isAggro = elite || Math.random() < 0.18;
      const aggroR = elite ? 260 : 170 + Math.floor(Math.random() * 60); // 170-230
      arr.push({ sp, hp, maxHp: hp, id: enemyIdRef.current++, x, y, face: "left", aggressive: isAggro, aggroR, elite, level: lv, rarity: pet.rarity });
    }
    // Aviso de aparição rara (épico+)
    const rareOnes = arr.filter((e) => e.rarity === "epic" || e.rarity === "legendary" || e.rarity === "mythic" || e.rarity === "mythic_shiny");
    for (const r of rareOnes) {
      const label = r.rarity === "mythic_shiny" ? "MÍTICO SHINY" : r.rarity.toUpperCase();
      const color = r.rarity === "mythic_shiny" ? "#ffd94d" : r.rarity === "mythic" ? "#ff5252" : r.rarity === "legendary" ? "#ff8b3d" : "#c084fc";
      pushEvent("★", `${label} À VISTA!`, `${r.sp.replace(/_/g, " ").toUpperCase()} apareceu no mapa`, color);
      pushChat(`★ ${label}: ${r.sp.replace(/_/g, " ").toUpperCase()} apareceu no mapa!`, "cap");
    }
    return arr;
  }

  function pushFxAt(x: number, y: number, text: string, kind: FxKind) {
    const id = fxIdRef.current++;
    setFx((prev) => [...prev, { id, x, y, text, kind }]);
    const ttl = kind === "crit" ? 1900 : kind === "myDmg" || kind === "enemyDmg" ? 1500 : 1200;
    setTimeout(() => setFx((prev) => prev.filter((f) => f.id !== id)), ttl);
  }



  const activeTime = now - idle.startedAt;
  const map = IDLE_MAPS[idle.currentMap];

  const collect = () => {
    setIdle((s) => {
      const gold = Math.floor(s.pending.gold);
      const rubies = Math.floor(s.pending.rubies);
      const crystals = Math.floor(s.pending.crystals);
      try {
        const raw = localStorage.getItem("rubym.save.v2");
        if (raw) {
          const save = JSON.parse(raw);
          save.gold = (save.gold ?? 0) + gold;
          save.rubies = (save.rubies ?? 0) + rubies;
          save.crystals = (save.crystals ?? 0) + crystals;
          localStorage.setItem("rubym.save.v2", JSON.stringify(save));
        }
      } catch { /* ignore */ }
      pushFxAt(trainerPos.x, trainerPos.y - 60, `+${gold} ouro · +${crystals} 💎`, "gold");
      return {
        ...s,
        pending: { gold: 0, rubies: 0, crystals: 0 },
        bank: { gold: s.bank.gold + gold, crystals: s.bank.crystals + crystals },
      };
    });
  };

  const claimTask = (tid: string) => {
    setIdle((s) => {
      const t = s.tasks.find((x) => x.id === tid);
      if (!t || !t.done) return s;
      return {
        ...s,
        tasks: s.tasks.filter((x) => x.id !== tid),
        pending: { ...s.pending, rubies: s.pending.rubies + t.reward },
      };
    });
  };

  // ===== Loja =====
  const buyBall = (b: ShopBall) => {
    setIdle((s) => {
      if (s.bank.gold < b.price) {
        pushChat(`Ouro insuficiente para ${b.name}.`, "info");
        return s;
      }
      pushFxAt(trainerPos.x, trainerPos.y - 40, `+1 ${b.name}`, "capture");
      pushChat(`Comprou 1 ${b.name} por ${b.price} ouro.`, "cap");
      return {
        ...s,
        bank: { ...s.bank, gold: s.bank.gold - b.price },
        items: { ...s.items, [b.id]: (s.items[b.id] ?? 0) + 1 },
      };
    });
  };
  // ===== Carteira: câmbio ouro ↔ cristal =====
  // 1 💎 = 1000 ouro (compra); vende 1 💎 por 800 ouro (spread do câmbio)
  const exchange = (dir: "g2c" | "c2g", amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setIdle((s) => {
      if (dir === "g2c") {
        const cost = 1000 * amount;
        if (s.bank.gold < cost) { pushChat(`Ouro insuficiente para ${amount} 💎.`, "info"); return s; }
        pushChat(`Câmbio: −${cost} ouro → +${amount} 💎`, "cap");
        return { ...s, bank: { ...s.bank, gold: s.bank.gold - cost, crystals: s.bank.crystals + amount } };
      } else {
        if (s.bank.crystals < amount) { pushChat(`Cristais insuficientes.`, "info"); return s; }
        const gain = 800 * amount;
        pushChat(`Câmbio: −${amount} 💎 → +${gain} ouro`, "cap");
        return { ...s, bank: { ...s.bank, crystals: s.bank.crystals - amount, gold: s.bank.gold + gain } };
      }
    });
  };
  // ===== Mercado: vender itens da mochila por ouro =====
  const MARKET_SELL_PRICE: Record<string, number> = {
    pokeball: 200, greatball: 1800, ultraball: 3500,
    chest_amulet: 900, potion: 40,
    berry: 60, revive: 300, key: 500,
  };
  // ===== Mercado P2P (Supabase) =====
  const isVip = () => {
    const until = idle.buffs?.goldMultUntil ?? 0;
    return until > Date.now();
  };
  const listMarketItem = async (itemId: string, qty: number, price: number): Promise<boolean> => {
    if (!identity?.id) { pushChat("Faça login para anunciar.", "info"); return false; }
    if (!isVip()) { pushChat("✦ Anunciar no mercado é exclusivo VIP. Use um Livro VIP na Loja.", "info"); return false; }
    const have = idle.items[itemId] ?? 0;
    if (have < qty) { pushChat("Estoque insuficiente para anunciar.", "info"); return false; }
    if (qty < 1 || price < 1 || price > 100_000_000) { pushChat("Quantidade ou preço inválido.", "info"); return false; }
    const { error } = await supabase.from("market_listings").insert({
      seller_id: identity.id,
      seller_name: identity.name || "Treinador",
      kind: "item",
      item_id: itemId,
      qty,
      price,
      currency: "gold",
    });
    if (error) { pushChat(`Falha ao anunciar: ${error.message}`, "info"); return false; }
    // remove item do estoque local (custódia do anúncio)
    setIdle((s) => ({ ...s, items: { ...s.items, [itemId]: (s.items[itemId] ?? 0) - qty } }));
    pushChat(`📢 Anúncio criado: ${qty}x ${itemId} por ${price} ouro.`, "cap");
    return true;
  };
  const buyMarketListing = async (listing: { id: string; seller_id: string; item_id: string; qty: number; price: number }): Promise<boolean> => {
    if (!identity?.id) { pushChat("Faça login para comprar.", "info"); return false; }
    if (listing.seller_id === identity.id) { pushChat("Você não pode comprar seu próprio anúncio.", "info"); return false; }
    if (idle.bank.gold < listing.price) { pushChat("Ouro insuficiente.", "info"); return false; }
    const { data, error } = await supabase
      .from("market_listings")
      .update({ buyer_id: identity.id, sold_at: new Date().toISOString() })
      .eq("id", listing.id)
      .is("sold_at", null)
      .select("id")
      .maybeSingle();
    if (error || !data) { pushChat("Anúncio não está mais disponível.", "info"); return false; }
    setIdle((s) => ({
      ...s,
      bank: { ...s.bank, gold: s.bank.gold - listing.price },
      items: { ...s.items, [listing.item_id]: (s.items[listing.item_id] ?? 0) + listing.qty },
    }));
    pushChat(`🛒 Comprou ${listing.qty}x ${listing.item_id} por ${listing.price} ouro.`, "cap");
    return true;
  };
  const cancelMarketListing = async (listing: { id: string; item_id: string; qty: number; seller_id: string }): Promise<boolean> => {
    if (identity?.id !== listing.seller_id) return false;
    const { error } = await supabase.from("market_listings").delete().eq("id", listing.id).is("sold_at", null);
    if (error) { pushChat(`Falha ao cancelar: ${error.message}`, "info"); return false; }
    setIdle((s) => ({ ...s, items: { ...s.items, [listing.item_id]: (s.items[listing.item_id] ?? 0) + listing.qty } }));
    pushChat(`Anúncio cancelado — ${listing.qty}x ${listing.item_id} devolvido.`, "info");
    return true;
  };

  const sellItem = (id: string, qty = 1) => {
    setIdle((s) => {
      const have = s.items[id] ?? 0;
      if (have < qty) { pushChat(`Você não tem ${qty}x ${id}.`, "info"); return s; }
      const unit = MARKET_SELL_PRICE[id] ?? 0;
      if (unit <= 0) { pushChat(`Este item não é vendável.`, "info"); return s; }
      const gain = unit * qty;
      pushChat(`Vendeu ${qty}x ${id} por ${gain} ouro.`, "cap");
      return {
        ...s,
        bank: { ...s.bank, gold: s.bank.gold + gain },
        items: { ...s.items, [id]: have - qty },
      };
    });
  };

  const buyPotion = (qty = 1) => {
    setIdle((s) => {
      const cost = POTION_PRICE * qty;
      if (s.bank.gold < cost) { pushChat(`Ouro insuficiente para ${qty} Poção.`, "info"); return s; }
      pushChat(`Comprou ${qty} Poção por ${cost} ouro.`, "cap");
      return {
        ...s,
        bank: { ...s.bank, gold: s.bank.gold - cost },
        items: { ...s.items, potion: (s.items.potion ?? 0) + qty },
      };
    });
  };
  const buyBook = (bk: ShopBook) => {
    setIdle((s) => {
      if (s.bank.crystals < bk.price) {
        pushChat(`Cristais insuficientes para ${bk.name}.`, "info");
        return s;
      }
      // Aplica o efeito direto (aparece em Melhorias na hora, sem passar pela mochila)
      let newBuffs = {
        atk: s.buffs?.atk ?? 0,
        def: s.buffs?.def ?? 0,
        expMult: s.buffs?.expMult ?? 0,
        expMultUntil: s.buffs?.expMultUntil ?? 0,
        goldMult: s.buffs?.goldMult ?? 0,
        goldMultUntil: s.buffs?.goldMultUntil ?? 0,
      };
      let msg = "";
      const now = Date.now();
      if (bk.id === "book_atk") {
        newBuffs.atk = newBuffs.atk + 0.10;
        msg = `+10% ATK permanente`;
      } else if (bk.id === "book_def") {
        newBuffs.def = newBuffs.def + 0.10;
        msg = `-10% dano recebido permanente`;
      } else if (bk.id === "book_vip" || bk.id === "book_vip_30" || bk.id === "book_vip_60") {
        const cfg = bk.id === "book_vip_60"
          ? { add: 0.40, ms: 60 * 24 * 3600_000, label: "60 dias" }
          : bk.id === "book_vip_30"
            ? { add: 0.30, ms: 30 * 24 * 3600_000, label: "30 dias" }
            : { add: 0.20, ms: 3600_000, label: "1 hora" };
        const expStill = (newBuffs.expMultUntil ?? 0) > now;
        const goldStill = (newBuffs.goldMultUntil ?? 0) > now;
        newBuffs.expMult = Math.max(expStill ? newBuffs.expMult : 0, cfg.add);
        newBuffs.expMultUntil = Math.max(newBuffs.expMultUntil ?? 0, now + cfg.ms);
        newBuffs.goldMult = Math.max(goldStill ? newBuffs.goldMult : 0, cfg.add);
        newBuffs.goldMultUntil = Math.max(newBuffs.goldMultUntil ?? 0, now + cfg.ms);
        msg = `+${Math.round(cfg.add * 100)}% ouro e EXP por ${cfg.label}`;
      } else {
        const add = bk.id === "book_exp" ? 0.30 : bk.id === "book_exp_big" ? 0.50 : 1.00;
        const stillActive = (newBuffs.expMultUntil ?? 0) > now;
        const base = stillActive ? newBuffs.expMult : 0;
        newBuffs.expMult = base + add;
        newBuffs.expMultUntil = now + 3600_000;
        msg = `+${Math.round(add * 100)}% EXP por 1h`;
      }
      pushFxAt(trainerPos.x, trainerPos.y - 40, msg, "capture");
      pushChat(`Comprou e aplicou ${bk.name} (${msg}).`, "cap");
      return {
        ...s,
        bank: { ...s.bank, crystals: s.bank.crystals - bk.price },
        buffs: newBuffs,
      };
    });
  };

  const CHEST_AMULET_PRICE = 2500;
  const buyChestAmulet = () => {
    setIdle((s) => {
      if (s.bank.gold < CHEST_AMULET_PRICE) {
        pushChat(`Ouro insuficiente para Amuleto do Baú.`, "info");
        return s;
      }
      pushFxAt(trainerPos.x, trainerPos.y - 40, `+1 Amuleto do Baú`, "capture");
      pushChat(`Comprou 1 Amuleto do Baú — +1 baú aparece no mapa.`, "cap");
      return {
        ...s,
        bank: { ...s.bank, gold: s.bank.gold - CHEST_AMULET_PRICE },
        items: { ...s.items, chest_amulet: (s.items.chest_amulet ?? 0) + 1 },
      };
    });
  };


  // ===== Baús espalhados no mapa =====
  function spawnChests(count = 4): Chest[] {
    const arr: Chest[] = [];
    let tries = 0;
    while (arr.length < count && tries < 200) {
      tries++;
      const x = 140 + Math.random() * (WORLD_W - 280);
      const y = 140 + Math.random() * (WORLD_H - 280);
      if (Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2) < 260) continue;
      if (collidesWithAny(x, y)) continue;
      let ok = true;
      for (const c of arr) if (Math.hypot(x - c.x, y - c.y) < 260) { ok = false; break; }
      if (!ok) continue;
      arr.push({ id: chestIdRef.current++, x, y, opened: false, purple: false });
    }
    return arr;
  }

  // alvo de baús no mapa (2 base + 1 por Amuleto do Baú comprado, máx 6)
  const chestTarget = Math.min(6, 2 + (idle.items?.chest_amulet ?? 0));

  // spawna baús no início e mantém sempre `chestTarget` no mapa
  useEffect(() => {
    const initial = spawnChests(chestTarget);
    setChests(initial);
    const iv = setInterval(() => {
      setChests((prev) => {
        const remaining = prev.filter((c) => !c.opened || (Date.now() - (c.openedAt ?? 0) < 4000));
        const active = remaining.filter((c) => !c.opened);
        if (active.length >= chestTarget) return remaining;
        const needed = Math.max(1, chestTarget - active.length);
        const news = spawnChests(needed);
        return [...remaining, ...news];
      });
    }, 8000);
    // Spawn EXTRA garantido a cada 10 min: um baú COMUM novo (até o teto máx=6)
    const ivExtra = setInterval(() => {
      setChests((prev) => {
        const active = prev.filter((c) => !c.opened);
        if (active.length >= 6) return prev;
        const news = spawnChests(1);
        if (news.length > 0) pushEvent("🎁", "NOVO BAÚ NO MAPA", "Aproxime-se para abrir", "#ffa64a");
        return [...prev, ...news];
      });
    }, 10 * 60 * 1000);
    return () => { clearInterval(iv); clearInterval(ivExtra); };
  }, [chestTarget]); // eslint-disable-line


  // detecta proximidade e abre baú
  useEffect(() => {
    const iv = setInterval(() => {
      const openedRef: { c: Chest | null } = { c: null };
      setChests((prev) => {
        const next = prev.map((c) => {
          if (c.opened) return c;
          if (Math.hypot(c.x - trainerPos.x, c.y - trainerPos.y) < 46) {
            openedRef.c = c;
            return { ...c, opened: true, openedAt: Date.now() };
          }
          return c;
        });
        return next;
      });
      const oc = openedRef.c;
      if (oc) {
        // Abrir baú custa ~10s de energia do líder
        setTeam((tm) => {
          if (tm.length === 0) return tm;
          const l = tm[0];
          const regen = ENERGY_REGEN_MS[l.rarity] ?? 20 * 60 * 1000;
          if (regen === 0) return tm; // mítico não cansa
          const now = Date.now();
          const curE = petCurrentEnergy(l, now);
          const drain = Math.max(1, Math.round((10_000 / regen) * ENERGY_MAX));
          const newE = Math.max(0, curE - drain);
          return [{ ...l, energy: newE, energyRegenAt: now } as PetInstance, ...tm.slice(1)];
        });

        const gain = 200 + Math.floor(Math.random() * 200);
        const roll = Math.random();
        const bonusCrystal = roll < 0.30 ? 1 : 0;
        const bonusBall = (!bonusCrystal && roll < 0.55) ? 1 : 0;
        const parts = [`+${gain} ouro`];
        if (bonusCrystal) parts.push("+1 💎");
        if (bonusBall) parts.push("+1 Pokébola");
        pushFxAt(oc.x, oc.y - 50, parts.join(" · "), "gold");
        pushChat(`Baú aberto! ${parts.join(" · ")}`, "chest");
        playChestOpen();
        setIdle((s) => ({
          ...s,
          bank: { ...s.bank, gold: s.bank.gold + gain, crystals: s.bank.crystals + bonusCrystal },
          totals: { ...s.totals, gold: s.totals.gold + gain },
          items: {
            ...s.items,
            pokeball: bonusBall ? (s.items.pokeball ?? 0) + 1 : (s.items.pokeball ?? 0),
          },
        }));
      }
    }, 300);
    return () => clearInterval(iv);
  }, [trainerPos.x, trainerPos.y, idle.items]); // eslint-disable-line

  // ---- Detecta proximidade dos prédios (Lab / Lar) ----
  useEffect(() => {
    let near: "lab" | "lar" | "azul" | null = null;
    for (const b of BUILDINGS) {
      const dx = trainerPos.x - b.x;
      const dy = trainerPos.y - (b.y - b.h / 2);
      if (Math.hypot(dx, dy) < b.interactR) { near = b.key; break; }
    }
    setNearBuilding((cur) => (cur === near ? cur : near));
  }, [trainerPos.x, trainerPos.y, BUILDINGS]);



  // ===== pickStarter (starterChosen state está declarada no topo) =====

  const pickStarter = (sp: "charmander" | "bulbasaur" | "squirtle") => {
    const pet = makePet(sp, 5);
    setTeam([pet]);
    setLeaderHp(calcIdleMaxHp(pet));
    try {
      localStorage.setItem("rubym.starter.chosen", "1");
      const raw = localStorage.getItem("rubym.save.v2");
      const save = raw ? JSON.parse(raw) : {};
      save.party = [pet];
      localStorage.setItem("rubym.save.v2", JSON.stringify(save));
    } catch { /* ignore */ }
    setStarterChosen(true);
    pushChat(`Você escolheu ${sp.toUpperCase()} como seu Pokémon inicial!`, "cap");
  };

  // ===== Reset da conta (Laboratório) =====
  const resetAccount = () => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "⚠ Resetar conta?\n\nIsso vai APAGAR seu Pokémon, itens, ouro, cristais, coleção e todo progresso. Você vai escolher um novo inicial. Ação irreversível."
    );
    if (!ok) return;
    try {
      localStorage.removeItem("rubym.starter.chosen");
      localStorage.removeItem("rubym.idle.v1");
      localStorage.removeItem("rubym.save.v2");
    } catch { /* ignore */ }
    window.location.reload();
  };

  // ===== Descansar em casa =====
  const restAtHome = (kind: "lar" | "azul" = "lar") => {
    const l = team[0];
    if (!l) return;
    if (restingUntil) return;
    const now = Date.now();
    const dur = kind === "azul" ? REST_DURATION_BLUE_MS : REST_DURATION_LAR_MS;
    setRestingStart(now);
    setRestingUntil(now + dur);
    setRestingKind(kind);
    setMoving(false);
    setNearBuilding(null);
    const label = kind === "azul" ? "🏡 Casa Azul (5 min)" : "🏠 Lar (1 hora)";
    pushChat(`${label} — descansando... todo o time será curado.`, "info");
  };

  // ===== Casa Azul: colocar 1 Pokémon para restaurar energia em 5 min por 5💎 =====
  const restPetInAzul = (uid: string) => {
    const now = Date.now();
    if (idle.bank.crystals < AZUL_REST_COST) {
      pushChat(`Cristais insuficientes (precisa ${AZUL_REST_COST}💎).`, "info");
      return;
    }
    const save = (loadLatestValid<SaveShape>() ?? {}) as SaveShape;
    const party = save.party ?? team;
    const pet = party.find((p) => p.uid === uid);
    if (!pet) return;
    const p = pet as PetEnergyExt;
    if (p.azulRestUntil && p.azulRestUntil > now) {
      pushChat(`${pet.species.toUpperCase()} já está descansando.`, "info");
      return;
    }
    const curE = petCurrentEnergy(pet, now);
    if (curE >= ENERGY_MAX) {
      pushChat(`${pet.species.toUpperCase()} já está com energia cheia.`, "info");
      return;
    }
    const restingPet: PetInstance = { ...pet, energy: curE, energyRegenAt: now, azulRestUntil: now + AZUL_REST_MS, azulRestFromEnergy: curE } as PetInstance;
    // Salva o pet descansando na party (preserva) mas remove do time ativo
    const newParty = party.map((x) => x.uid === uid ? restingPet : x);
    saveNow({ ...save, party: newParty });
    setTeam((tm) => {
      const filtered = tm.filter((x) => x.uid !== uid);
      // Ajusta HP do novo líder se o líder saiu
      if (tm[0]?.uid === uid && filtered[0]) {
        setLeaderHp(calcIdleMaxHp(filtered[0]));
      }
      return filtered;
    });
    setRestingBench((b) => [...b.filter((x) => x.uid !== uid), restingPet]);
    setIdle((s) => ({ ...s, bank: { ...s.bank, crystals: s.bank.crystals - AZUL_REST_COST } }));
    pushChat(`🏡 ${pet.species.toUpperCase()} saiu do time para descansar (5 min) · -${AZUL_REST_COST}💎`, "info");
    pushEvent("🏡", "DESCANSO INICIADO", `${pet.species.toUpperCase()} · 5 min`, "#4a9eff");
    setAzulPickerOpen(false);
    setAzulPreselectUid(null);
    // Ao terminar: energia cheia + volta pro time
    setTimeout(() => {
      const s2 = (loadLatestValid<SaveShape>() ?? {}) as SaveShape;
      const refreshed = { ...restingPet, energy: ENERGY_MAX, energyRegenAt: Date.now(), azulRestUntil: undefined, azulRestFromEnergy: undefined } as PetInstance;
      const p2 = (s2.party ?? []).map((x) => x.uid === uid ? refreshed : x);
      saveNow({ ...s2, party: p2 });
      setRestingBench((b) => b.filter((x) => x.uid !== uid));
      setTeam((tm) => {
        if (tm.some((x) => x.uid === uid)) return tm;
        if (tm.length >= 5) return tm; // se time está cheio, fica só na party
        const next = [...tm, refreshed];
        if (next.length === 1) setLeaderHp(calcIdleMaxHp(refreshed));
        return next;
      });
      pushChat(`⚡ ${refreshed.species.toUpperCase()} voltou ao time com energia cheia!`, "cap");
      pushEvent("⚡", "ENERGIA CHEIA", "Pokémon pronto para a batalha", "#7fc4ff");
    }, AZUL_REST_MS + 250);
  };

  // Completa o descanso
  useEffect(() => {
    if (restingUntil === null) return;
    const remaining = restingUntil - Date.now();
    const t = setTimeout(() => {
      const l = team[0];
      if (l) setLeaderHp(calcIdleMaxHp(l));
      setRestingUntil(null);
      setRestingStart(null);
      setRestingKind(null);
      pushChat("💤 Descanso concluído! HP totalmente restaurado.", "cap");
      pushFxAt(trainerPos.x, trainerPos.y - 60, "+HP MÁX", "gold");
    }, Math.max(0, remaining));
    return () => clearTimeout(t);
  }, [restingUntil]); // eslint-disable-line react-hooks/exhaustive-deps
  // Tick de UI para atualizar barra de progresso do descanso
  const [restNowTick, setRestNowTick] = useState(0);
  useEffect(() => {
    if (restingUntil === null) return;
    const iv = setInterval(() => {
      setRestNowTick((n) => n + 1);
      // FX flutuantes de cura sobre o treinador
      pushFxAt(trainerPos.x + (Math.random() * 40 - 20), trainerPos.y - 20 - Math.random() * 30, "💚", "gold");
    }, 700);
    return () => clearInterval(iv);
  }, [restingUntil]); // eslint-disable-line react-hooks/exhaustive-deps







  // (map único: Vale Verdejante)


  const followerOffsetX = walkDir === "right" ? -78 : walkDir === "left" ? 78 : 0;
  const followerOffsetY = walkDir === "up" ? 72 : walkDir === "down" ? -58 : 46;
  const followerX = trainerPos.x + followerOffsetX;
  const followerY = trainerPos.y + followerOffsetY;
  const transparentObstacleIds = new Set(
    [getCoveringObstacle(trainerPos.x, trainerPos.y), getCoveringObstacle(followerX, followerY)]
      .filter((id): id is number => id !== null)
  );

  return (
    <div style={{
      height: "100vh",
      background: "#0b0510",
      color: "#f3e5c5",
      fontFamily: "'Trebuchet MS', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {levelToast && (
        <div style={{
          position: "fixed", top: 90, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, pointerEvents: "none",
          background: "linear-gradient(135deg, rgba(61,43,82,0.98), rgba(106,61,138,0.98))",
          border: "2px solid #f5cf6b",
          borderRadius: 12, padding: "12px 20px",
          boxShadow: "0 8px 40px rgba(245,207,107,0.5), 0 0 60px rgba(126,242,122,0.4)",
          textAlign: "center", minWidth: 260,
          animation: "lvToastIn 300ms ease-out",
        }}>
          <div style={{ color: "#f5cf6b", fontWeight: 900, fontSize: 20, letterSpacing: 1, textShadow: "0 2px 6px #000" }}>
            ⬆ NÍVEL {levelToast.level}!
          </div>
          <div style={{ color: "#7ef27a", fontSize: 13, fontWeight: 700, marginTop: 6 }}>
            {levelToast.gains.join("  ·  ")}
          </div>
          <div style={{ color: "#f5cf6b", fontSize: 12, marginTop: 4 }}>
            ✨ Bônus extra: <strong>+{levelToast.bonus}</strong>
          </div>
        </div>
      )}


      <div className="idle-grid" style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 240px) 1fr minmax(220px, 240px)",
        gridTemplateRows: "1fr auto",
        gap: 8, padding: 8,
        height: "100vh",
        overflow: "hidden",
      }}>


        {/* ============ COLUNA ESQUERDA ============ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0, overflow: "hidden" }}>
          <Panel title="SUA EQUIPE" accent="#c92a2a">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {team.map((p) => (
                <TeamRow key={p.uid} pet={p} onClick={() => setPetDetailUid(p.uid)} energyTick={energyTick} />
              ))}
              <button style={smallBtn} onClick={() => setTab("pokemon")}>Ver todos</button>
            </div>
          </Panel>

          {/* Chat ocupa todo o espaço restante — sem rolagem externa */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Panel title="REGISTRO DE BATALHA" accent="#1e3a5f">
              <div style={{
                height: "calc(100vh - 380px)", minHeight: 160,
                overflowY: "auto", display: "flex", flexDirection: "column-reverse",
                gap: 4, fontSize: 11, lineHeight: 1.35,
                background: "#0e0818", borderRadius: 6, padding: 6,
                border: "1px solid rgba(107,212,255,0.15)",
              }}>
                {[...chat].reverse().map((m) => {
                  const color =
                    m.kind === "chest" ? "#ffa64a" :
                    m.kind === "cap" ? "#ffd94d" :
                    m.kind === "lv" ? "#6bd4ff" :
                    m.kind === "hit" ? "#ff6b6b" :
                    m.kind === "dmg" ? "#f5cf6b" : "#c8b8d0";
                  const prefix =
                    m.kind === "chest" ? "🎁" :
                    m.kind === "cap" ? "★" :
                    m.kind === "lv" ? "⬆" :
                    m.kind === "hit" ? "✖" :
                    m.kind === "dmg" ? "⚔" : "•";
                  return (
                    <div key={m.id} style={{ color, textShadow: "1px 1px 0 #000", fontWeight: m.kind === "chest" ? 800 : 400 }}>
                      <span style={{ opacity: 0.7, marginRight: 4 }}>{prefix}</span>{m.text}
                    </div>
                  );
                })}
                {chat.length === 0 && (
                  <div style={{ color: "#6a5a7c", fontStyle: "italic" }}>Nenhum evento ainda...</div>
                )}
              </div>
              {/* Composer do chat global — cooldown 10 min por jogador */}
              {(() => {
                void chatTick;
                const now = Date.now();
                const remainMs = Math.max(0, chatCooldownUntil - now);
                const onCd = remainMs > 0;
                const mm = Math.floor(remainMs / 60000);
                const ss = Math.floor((remainMs % 60000) / 1000).toString().padStart(2, "0");
                const send = () => {
                  const text = chatInput.trim().slice(0, 140);
                  if (!text || onCd) return;
                  const name = identity?.name ?? "Treinador";
                  pushChat(`💬 ${name}: ${text}`, "info");
                  void captureChanRef.current?.send({
                    type: "broadcast",
                    event: "say",
                    payload: { id: identity?.id ?? "self", name, text },
                  });
                  setChatInput("");
                  setChatCooldownUntil(Date.now() + 10 * 60 * 1000);
                };
                return (
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                      placeholder={onCd ? `Aguarde ${mm}:${ss}` : "Falar no chat geral (1x a cada 10 min)"}
                      maxLength={140}
                      disabled={onCd}
                      style={{
                        flex: 1, background: "#0e0818", color: "#f3e5c5",
                        border: "1px solid rgba(107,212,255,0.25)", borderRadius: 6,
                        padding: "6px 8px", fontSize: 11, outline: "none",
                        opacity: onCd ? 0.6 : 1,
                      }}
                    />
                    <button
                      onClick={send}
                      disabled={onCd || !chatInput.trim()}
                      style={{
                        background: onCd ? "#3a1010" : "#1e3a5f", color: "#fff",
                        border: "1px solid rgba(107,212,255,0.4)", borderRadius: 6,
                        padding: "6px 10px", fontSize: 11, fontWeight: 800,
                        cursor: onCd ? "not-allowed" : "pointer",
                      }}
                    >
                      {onCd ? `${mm}:${ss}` : "Enviar"}
                    </button>
                  </div>
                );
              })()}
            </Panel>
          </div>
        </div>





        {/* ============ CENTRO — ARENA (viewport com câmera) ============ */}
        <div
          ref={viewportRef}
          onClick={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest && t.closest("button, a, input, select, textarea")) return;
            const rect = viewportRef.current?.getBoundingClientRect();
            if (!rect) return;
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const wx = camX + sx / zoom;
            const wy = camY + sy / zoom;
            walkTargetRef.current = { x: wx, y: wy, label: "destino", resumeAuto: autoRef.current };
            setWalkingTo("destino");
            setAuto(false);
          }}
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            background: "#1a3d1a",
            minHeight: 520,
            height: "calc(100vh - 110px)",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
            cursor: "crosshair",
          }}
        >


          {/* ===== Controles (zoom + config + ranking) ===== */}
          <div style={{
            position: "absolute", top: 8, right: 8, zIndex: 55,
            pointerEvents: "auto", display: "flex", flexDirection: "column", gap: 4,
          }}>
            {(() => {
              const ZOOM_LEVELS = [0.5, 0.6, 0.7, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];
              const curIdx = (() => {
                let best = 0, bd = Infinity;
                for (let i = 0; i < ZOOM_LEVELS.length; i++) {
                  const d = Math.abs(ZOOM_LEVELS[i] - zoom);
                  if (d < bd) { bd = d; best = i; }
                }
                return best;
              })();
              return (
                <>
                  <button onClick={() => { playClick(); setZoom(ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, curIdx + 1)]); }} style={zoomBtn}>+</button>
                  <div style={{ ...zoomBtn, cursor: "default", fontSize: 10 }}>{Math.round(zoom * 100)}%</div>
                  <button onClick={() => { playClick(); setZoom(ZOOM_LEVELS[Math.max(0, curIdx - 1)]); }} style={zoomBtn}>−</button>
                </>
              );
            })()}
            <button onClick={() => { playClick(); setTab("config"); }} style={{ ...zoomBtn, marginTop: 6, fontSize: 14 }} title="Configurações">⚙</button>
            <button
              onClick={() => { playClick(); setRankOpen(true); }}
              style={{
                ...zoomBtn,
                padding: 0,
                background: "transparent",
                border: "none",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Ranking — Top 20 níveis"
            >
              <img
                src={assetUrl(trophyIconAsset.url)}
                alt="Ranking"
                width={30}
                height={30}
                style={{ imageRendering: "pixelated", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }}
                draggable={false}
              />
            </button>
          </div>



          {/* Clima estilo pixel-RPG */}
          {weather !== "clear" && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 40,
              pointerEvents: "none", overflow: "hidden",
              imageRendering: "pixelated",
            }}>
              {weather === "rain" && (
                <>
                  <div className="wx-rain-tint" />
                  <div className="wx-mist" />
                  {rainDrops.map((d, i) => (
                    <span key={i} className="wx-drop" style={{
                      left: `${d.left}%`,
                      width: d.w,
                      height: d.len,
                      opacity: d.op,
                      animationDelay: `-${d.delay}s`,
                      animationDuration: `${d.dur}s`,
                    }} />
                  ))}
                  <div className="wx-flash" />
                </>
              )}
              {weather === "snow" && (
                <>
                  <div className="wx-snow-tint" />
                  {snowFlakes.map((s, i) => (
                    <span key={i} className="wx-flake" style={{
                      left: `${s.left}%`,
                      width: s.size,
                      height: s.size,
                      opacity: s.op,
                      animationDelay: `-${s.delay}s`,
                      animationDuration: `${s.dur}s`,
                      ["--drift" as string]: `${s.drift}px`,
                    } as React.CSSProperties} />
                  ))}
                </>
              )}
              <div style={{
                position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                background: "rgba(11,5,16,0.75)",
                border: `1px solid ${weather === "rain" ? "rgba(140,201,255,0.5)" : "rgba(230,243,255,0.55)"}`,
                color: weather === "rain" ? "#bcdcff" : "#f2faff",
                padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                letterSpacing: 0.5, imageRendering: "pixelated",
                fontFamily: "'Press Start 2P', 'Trebuchet MS', monospace",
                textShadow: "1px 1px 0 #000",
              }}>
                {weather === "rain" ? "CHUVA" : "NEVE"}
              </div>
            </div>
          )}


            {/* Contador de jogadores online removido a pedido do usuário */}




          {/* MUNDO — camada em px que se move sob a câmera */}
          <div style={{
            position: "absolute",
            left: 0, top: 0,
            width: WORLD_W, height: WORLD_H,
            transform: `scale(${zoom}) translate3d(${-camX}px, ${-camY}px, 0)`,
            transformOrigin: "0 0",
            transition: "transform 120ms linear",
            backgroundImage: `url(${map.bg})`,
            backgroundSize: `${WORLD_W}px ${WORLD_H}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}>

            {/* Obstáculos (árvores, pedras) — z-index pela BASE (y) para o treinador passar por trás */}
            {obstacles.map((o) => (
              <img key={`obs-${o.id}`} src={o.src} alt="" style={{
                position: "absolute",
                left: o.x - o.w / 2,
                top: o.y - o.h + 8, // âncora na base
                width: o.w, height: o.h,
                opacity: transparentObstacleIds.has(o.id) ? 0.38 : 1,
                imageRendering: "pixelated",
                pointerEvents: "none",
                transition: "opacity 120ms linear",
                zIndex: Math.round(o.y),
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
              }} />
            ))}

            {/* Clique nos casulos (Ninho de Marimbondo) — só se tiver Pokémon abelha */}
            {idle.currentMap === "terra" && obstacles.filter((o) => o.src === hornetCocoonUrl).map((o) => {
              const beeIds: Species[] = ["weedle", "weedle_shiny", "kakuna", "kakuna_shiny", "beedrill"];
              const hasBee = team.some((p) => beeIds.includes(p.species)) || idle.caughtSpecies.some((s) => beeIds.includes(s));
              return (
                <button
                  key={`cocoon-btn-${o.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasBee) {
                      pushChat("🐝 Precisa de um Pokémon abelha (Weedle, Kakuna ou Beedrill) para se aproximar do casulo!", "info");
                      return;
                    }
                    setHoneyShop({ x: o.x, y: o.y - o.h });
                  }}
                  title={hasBee ? "Ninho de Marimbondo — Comprar Incenso de Mel" : "Requer Pokémon abelha"}
                  style={{
                    position: "absolute",
                    left: o.x - o.w / 2,
                    top: o.y - o.h + 8,
                    width: o.w, height: o.h,
                    background: "transparent",
                    border: hasBee ? "2px dashed rgba(255,214,80,0.85)" : "2px dashed rgba(255,255,255,0.25)",
                    borderRadius: 12,
                    cursor: hasBee ? "pointer" : "not-allowed",
                    zIndex: Math.round(o.y) + 1,
                    padding: 0,
                    boxShadow: hasBee ? "0 0 12px rgba(255,214,80,0.55)" : "none",
                    animation: hasBee ? "lvglow 1.6s ease-in-out infinite" : "none",
                  }}
                />
              );
            })}

            {/* Modal do Ranking Global */}
            {rankOpen && createPortal(
              <div
                onClick={() => setRankOpen(false)}
                style={{
                  position: "fixed", inset: 0,
                  background: "radial-gradient(ellipse at center, rgba(30,15,50,0.85), rgba(0,0,0,0.92))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 2147483647, padding: 16,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  fontFamily: "inherit",
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: "min(640px, 96vw)", maxHeight: "88vh", display: "flex", flexDirection: "column",
                    background: "linear-gradient(180deg, #1a0f2a 0%, #241536 50%, #2b1a3d 100%)",
                    border: "2px solid #ffd94d",
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,214,80,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                    color: "#ffe9a8",
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 18px",
                    background: "linear-gradient(180deg, rgba(255,214,80,0.18), rgba(255,214,80,0.02))",
                    borderBottom: "1px solid rgba(255,214,80,0.35)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={assetUrl(trophyIconAsset.url)} alt="" style={{ width: 32, height: 32, imageRendering: "pixelated", filter: "drop-shadow(0 0 6px rgba(255,214,80,0.7))" }} />
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: "#ffd94d", letterSpacing: 0.5 }}>RANKING GLOBAL</div>
                        <div style={{ fontSize: 10, opacity: 0.7 }}>Top 50 treinadores do mundo</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setRankOpen(false)}
                      style={{
                        background: "rgba(255,214,80,0.12)", border: "1px solid rgba(255,214,80,0.4)",
                        color: "#ffe9a8", cursor: "pointer", fontSize: 18, width: 32, height: 32,
                        borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >×</button>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 6, padding: "10px 14px 0", background: "rgba(0,0,0,0.2)" }}>
                    {([
                      { k: "level", label: "🐉 Nível Pokémon" },
                      { k: "trainer", label: "🎓 Nível Treinador" },
                      { k: "craft", label: "⚒️ Pontos de Craft" },
                    ] as { k: RankMode; label: string }[]).map((t) => {
                      const active = rankMode === t.k;
                      return (
                        <button
                          key={t.k}
                          onClick={() => setRankMode(t.k)}
                          style={{
                            flex: 1, padding: "8px 6px", fontSize: 11, fontWeight: 700,
                            background: active ? "linear-gradient(180deg, #ffd94d, #d99b1a)" : "rgba(255,255,255,0.04)",
                            color: active ? "#2b1a0a" : "#ffe9a8",
                            border: `1px solid ${active ? "#ffd94d" : "rgba(255,214,80,0.2)"}`,
                            borderRadius: "8px 8px 0 0",
                            cursor: "pointer",
                            borderBottom: active ? "none" : "1px solid rgba(255,214,80,0.2)",
                          }}
                        >{t.label}</button>
                      );
                    })}
                  </div>

                  {/* List */}
                  <div style={{ overflow: "auto", padding: 14, flex: 1 }}>
                    {rankLoading ? (
                      <div style={{ textAlign: "center", padding: 40, opacity: 0.7 }}>Carregando ranking…</div>
                    ) : rankRows.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 40, opacity: 0.7 }}>Nenhum treinador encontrado.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {rankRows.map((r, i) => {
                          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                          const topColor = i === 0 ? "#ffd94d" : i === 1 ? "#e5e5e5" : i === 2 ? "#d99b1a" : "#ffe9a8";
                          const mainVal = rankMode === "trainer" ? r.trainer_level : rankMode === "craft" ? r.craft_points : r.level;
                          const mainLabel = rankMode === "trainer" ? "Treinador Lv" : rankMode === "craft" ? "Craft" : "Pokémon Lv";
                          return (
                            <div key={r.id} style={{
                              display: "grid",
                              gridTemplateColumns: "48px 1fr auto",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 12px",
                              background: i < 3
                                ? "linear-gradient(90deg, rgba(255,214,80,0.15), rgba(255,214,80,0.03))"
                                : "rgba(255,255,255,0.03)",
                              border: `1px solid ${i < 3 ? "rgba(255,214,80,0.4)" : "rgba(255,255,255,0.06)"}`,
                              borderRadius: 10,
                              boxShadow: i < 3 ? "0 2px 8px rgba(255,214,80,0.1)" : "none",
                            }}>
                              <div style={{ fontWeight: 800, color: topColor, fontSize: i < 3 ? 22 : 15, textAlign: "center" }}>{medal}</div>
                              <div style={{ overflow: "hidden", minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {r.name}
                                  {r.guild_name && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.75, color: "#a5d0ff" }}>[{r.guild_name}]</span>}
                                </div>
                                <div style={{ fontSize: 10, opacity: 0.7, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ textTransform: "capitalize" }}>
                                    ⭐ {(r.leader_species ?? "—").replace(/_/g, " ")}
                                  </span>
                                  <span>🎓 Tr {r.trainer_level}</span>
                                  <span>⚒️ {r.craft_points}</span>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>{mainLabel}</div>
                                <div style={{ fontWeight: 900, fontSize: 20, color: topColor, lineHeight: 1 }}>{mainVal}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Popup do Incenso de Mel */}
            {honeyShop && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: Math.max(20, Math.min(WORLD_W - 300, honeyShop.x - 140)),
                  top: Math.max(20, honeyShop.y - 40),
                  width: 280,
                  background: "linear-gradient(180deg, #2a1a0a, #3d2410)",
                  border: "2px solid #ffd94d",
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(255,214,80,0.35)",
                  padding: 14,
                  zIndex: 999999,
                  color: "#ffe9a8",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#ffd94d" }}>🍯 Incenso de Mel</div>
                  <button onClick={() => setHoneyShop(null)} style={{ background: "transparent", border: "none", color: "#ffe9a8", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.45, marginBottom: 10, opacity: 0.9 }}>
                  Ativa por <b>10 minutos</b>:<br />
                  • +10% Drop<br />
                  • +10% EXP<br />
                  • +10% Defesa<br />
                  • +10% Velocidade
                </div>
                {(() => {
                  const active = Date.now() < (idle.buffs.honeyUntil ?? 0);
                  const remaining = Math.max(0, Math.ceil(((idle.buffs.honeyUntil ?? 0) - Date.now()) / 1000));
                  const mm = Math.floor(remaining / 60);
                  const ss = String(remaining % 60).padStart(2, "0");
                  return active ? (
                    <div style={{ fontSize: 12, marginBottom: 8, color: "#8bffb0" }}>
                      ✨ Ativo — {mm}:{ss} restantes
                    </div>
                  ) : null;
                })()}
                <button
                  onClick={() => {
                    setIdle((s) => {
                      if (s.bank.gold < HONEY_PRICE) {
                        pushChat(`Ouro insuficiente. Preço: ${HONEY_PRICE} 🪙`, "info");
                        return s;
                      }
                      const base = Math.max(Date.now(), s.buffs.honeyUntil ?? 0);
                      pushChat(`🍯 Incenso de Mel ativado por 10 min! +10% drop/xp/def/velocidade`, "info");
                      return {
                        ...s,
                        bank: { ...s.bank, gold: s.bank.gold - HONEY_PRICE },
                        buffs: { ...s.buffs, honeyUntil: base + HONEY_DURATION_MS },
                      };
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "linear-gradient(180deg, #ffd94d, #d99b1a)",
                    color: "#2a1a0a",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Comprar por {HONEY_PRICE} 🪙
                </button>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6, textAlign: "center" }}>
                  Ouro no banco: {Math.floor(idle.bank.gold)} 🪙
                </div>
              </div>
            )}



            {/* Prédios do mundo — Laboratório e Lar (SVG estilizado) */}
            {BUILDINGS.map((b) => {
              const active = nearBuilding === b.key;
              return (
                <div
                  key={`bld-${b.key}`}
                  style={{
                    position: "absolute",
                    left: b.x - b.w / 2,
                    top: b.y - b.h + 8,
                    width: b.w, height: b.h,
                    zIndex: Math.round(b.y),
                    pointerEvents: "none",
                    filter: active
                      ? `drop-shadow(0 0 14px ${b.color}) drop-shadow(0 4px 4px rgba(0,0,0,0.55))`
                      : "drop-shadow(0 4px 4px rgba(0,0,0,0.55))",
                    transition: "filter 180ms ease",
                  }}
                >
                  <img
                    src={b.key === "lab" ? houseLabImg : houseLarImg}
                    alt={b.label}
                    width={b.w}
                    height={b.h}
                    style={{
                      display: "block",
                      width: b.w,
                      height: b.h,
                      imageRendering: "pixelated",
                      userSelect: "none",
                      // Tinge o telhado de azul para a Casa Azul
                      filter: b.key === "azul"
                        ? "hue-rotate(180deg) saturate(1.4) brightness(1.05)"
                        : undefined,
                    }}
                    draggable={false}
                  />
                  {/* Placa flutuante */}
                  <div style={{
                    position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(11,5,16,0.9)", color: b.color,
                    border: `1px solid ${b.color}`, borderRadius: 4,
                    padding: "2px 8px", fontSize: 11, fontWeight: 800, letterSpacing: 1,
                    whiteSpace: "nowrap",
                  }}>
                    {b.emoji} {b.label.toUpperCase()}
                  </div>
                </div>
              );
            })}



            {/* Inimigos espalhados pelo mapa */}
            {enemies.map((e) => {
              const src = GIF[e.sp];
              if (!src) return null;
              const dead = e.hp <= 0;
              const face = e.face ?? "left";
              const sx = face === "left" ? 1 : -1;
              const scale = (e.sp === "dragonite" || e.sp === "charizard") ? 1.7 : (e.sp === "golem" ? 1.15 : 1);
              const size = Math.round(46 * scale);
              // Cristal + aura por raridade — cristal vermelho = raro+, verde = comum/incomum
              const rarityAura: Record<Rarity, string> = {
                common: "rgba(200,200,200,0.55)",
                uncommon: "rgba(94,194,106,0.85)",
                rare: "rgba(107,212,255,0.95)",
                epic: "rgba(192,132,252,0.95)",
                legendary: "rgba(245,207,107,1)",
                mythic: "rgba(255,107,61,1)",
                mythic_shiny: "rgba(255,151,225,1)",
              };
              const auraColor = rarityAura[e.rarity];
              const isRareUp = e.rarity !== "common" && e.rarity !== "uncommon";
              const crystal = isRareUp ? "🔴" : "🟢";
              const showAura = e.rarity !== "common";
              const auraStrength = e.rarity === "mythic" || e.rarity === "mythic_shiny" ? 22
                : e.rarity === "legendary" ? 18
                : e.rarity === "epic" ? 14
                : e.rarity === "rare" ? 10 : 6;
              return (
                <div key={e.id}
                  onClick={(ev) => { ev.stopPropagation(); if (!dead) throwBallAt(e.id); }}
                  title="Clique para lançar Pokébola"
                  style={{
                  position: "absolute", left: e.x, top: e.y,
                  width: size, height: size,
                  transform: `translate(-50%, -50%) scaleX(${sx})`,
                  opacity: dead ? 0 : 1,
                  transition: "opacity 400ms, transform 160ms",
                  filter: showAura
                    ? `drop-shadow(0 0 ${auraStrength}px ${auraColor}) drop-shadow(0 0 ${auraStrength / 2}px ${auraColor}) drop-shadow(0 3px 2px rgba(0,0,0,0.55))`
                    : (e.aggressive ? "drop-shadow(0 0 6px rgba(255,60,60,0.9)) drop-shadow(0 3px 2px rgba(0,0,0,0.55))" : "drop-shadow(0 3px 2px rgba(0,0,0,0.55))"),
                  zIndex: Math.round(e.y),
                  cursor: dead ? "default" : "pointer",
                }}>
                  <img src={src} alt="" style={{ width: "100%", imageRendering: "pixelated" }} />
                  {/* Nível + cristal de raridade */}
                  <div style={{
                    position: "absolute", top: -14, left: "50%",
                    transform: `translateX(-50%) scaleX(${sx})`,
                    color: e.elite ? "#ff4a4a" : "#eadfe8",
                    fontSize: 10, fontWeight: 700, lineHeight: 1,
                    textShadow: "1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000",
                    whiteSpace: "nowrap", pointerEvents: "none",
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    <span style={{ fontSize: 9 }}>{crystal}</span>
                    Lv.{e.level}
                  </div>
                  <div style={{
                    position: "absolute", bottom: -6, left: 4, right: 4, height: 5,
                    background: "#3a1010", borderRadius: 2, transform: `scaleX(${sx})`,
                    border: "1px solid rgba(0,0,0,0.6)",
                  }}>
                    <div style={{
                      width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%`,
                      height: "100%", background: e.hp > e.maxHp * 0.4 ? "#5ec26a" : "#e34a4a",
                      borderRadius: 2, transition: "width 200ms",
                    }} />
                  </div>
                </div>
              );
            })}

            {/* Baús espalhados */}
            {chests.map((c) => (
              <div key={`chest-${c.id}`} style={{
                position: "absolute", left: c.x, top: c.y,
                width: 56, height: 56,
                transform: "translate(-50%, -50%)",
                zIndex: Math.round(c.y),
                pointerEvents: "none",
              }}>
                {!c.opened && (
                  <div className="chest-idle" style={{
                    position: "absolute", inset: -8, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(245,207,107,0.35) 0%, rgba(245,207,107,0) 65%)",
                    filter: "blur(2px)",
                  }} />
                )}
                <img
                  src={c.opened ? chestOpenImg : chestClosedImg}
                  alt=""
                  className={c.opened ? "chest-pop" : ""}
                  style={{
                    width: "100%", height: "100%",
                    imageRendering: "pixelated",
                    filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.6))",
                  }}
                />
              </div>
            ))}



            {/* Treinador */}
            <div style={{
              position: "absolute",
              left: trainerPos.x, top: trainerPos.y,
              width: 56, height: 56,
              transform: "translate(-50%, -50%)",
              transition: "left 120ms linear, top 120ms linear",
              filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.6))",
              zIndex: Math.round(trainerPos.y),
            }}>
              <div style={{
                width: "100%", height: "100%",
                backgroundImage: `url(${skinUrl ?? trainerSheet})`,
                backgroundSize: "400% 400%",
                backgroundPosition: `${walkStep * 33.333}% ${DIR_ROW[walkDir] * 33.333}%`,
                imageRendering: "pixelated",
              }} />
            </div>

            {/* Outros jogadores no mesmo mapa */}
            {remotePlayers.map((rp) => {
              const rpLeaderSrc = rp.leaderSp ? GIF[rp.leaderSp] : undefined;
              return (
                <div key={rp.id} style={{
                  position: "absolute",
                  left: rp.x, top: rp.y,
                  width: 56, height: 56,
                  transform: "translate(-50%, -50%)",
                  transition: "left 220ms linear, top 220ms linear",
                  filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.6))",
                  zIndex: Math.round(rp.y),
                  pointerEvents: "none",
                }}>
                  {/* Nome */}
                  <div style={{
                    position: "absolute", left: "50%", top: -18,
                    transform: "translateX(-50%)",
                    fontSize: 10, fontWeight: 700,
                    color: "#fff",
                    textShadow: "0 0 3px #000, 1px 1px 0 #000, -1px -1px 0 #000",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                    background: "rgba(20,40,80,0.55)",
                    padding: "1px 5px", borderRadius: 4,
                    border: "1px solid rgba(107,178,255,0.6)",
                  }}>{rp.name}</div>
                  <div style={{
                    width: "100%", height: "100%",
                    backgroundImage: `url(${trainerSheet})`,
                    backgroundSize: "400% 400%",
                    backgroundPosition: `${rp.step * 33.333}% ${DIR_ROW[rp.dir] * 33.333}%`,
                    imageRendering: "pixelated",
                    filter: "hue-rotate(140deg) saturate(1.1)",
                  }} />
                  {rpLeaderSrc && (
                    rp.leaderSp && SPRITE_SHEET[rp.leaderSp] ? (
                      <div style={{
                        position: "absolute", left: 34, top: 20,
                        width: 36, height: 36,
                        backgroundImage: `url(${SPRITE_SHEET[rp.leaderSp]})`,
                        backgroundSize: "400% 400%",
                        backgroundPosition: `${rp.step * 33.333}% ${DIR_ROW[rp.dir] * 33.333}%`,
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                      }} />
                    ) : (
                      <img src={rpLeaderSrc} alt="" style={{
                        position: "absolute", left: 34, top: 20,
                        width: 36, height: 36,
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                      }} />
                    )
                  )}

                </div>
              );
            })}

            {/* Anel de cura durante o descanso */}
            {restingUntil !== null && (
              <>
                <div style={{
                  position: "absolute",
                  left: trainerPos.x - 60, top: trainerPos.y - 60,
                  width: 120, height: 120, borderRadius: "50%",
                  border: "3px solid #5ec26a",
                  boxShadow: "0 0 40px #5ec26a, inset 0 0 30px #5ec26a88",
                  animation: "chest-pop 1.2s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute",
                  left: trainerPos.x - 30, top: trainerPos.y - 90,
                  fontSize: 24, pointerEvents: "none",
                  animation: "chest-pop 900ms ease-in-out infinite",
                }}>💤💚</div>
              </>
            )}

            {/* Pokémon do jogador segue o treinador */}
            {(() => {
              const leader = team[0];
              const leaderSp = leader?.species ?? "charmander";
              const leaderSrc = GIF[leaderSp];
              if (!leaderSrc || !leader) return null;
              const leaderMax = calcIdleMaxHp(leader);
              const hpPct = Math.max(0, (leaderHp / leaderMax) * 100);
              const xpNeeded = 100 + leader.level * 20;
              const xpPct = Math.min(100, ((leader.xp ?? 0) / xpNeeded) * 100);
              const fainted = leaderHp <= 0;
              const faceScale = pokemonFace === "right" ? -1 : 1;
              const auraOn = Date.now() - leveledAt < 1400;
              // Lunge: avança 45% do caminho até o alvo e volta (curva senoidal)
              let lungeX = 0, lungeY = 0;
              if (attackAnim) {
                const dt = Math.min(1, (Date.now() - attackAnim.ts) / 380);
                const wave = Math.sin(dt * Math.PI); // 0 → 1 → 0
                lungeX = (attackAnim.toX - attackAnim.fromX) * 0.45 * wave;
                lungeY = (attackAnim.toY - attackAnim.fromY) * 0.45 * wave;
              }
              const leaderX = followerX + lungeX;
              const leaderY = followerY + lungeY;
              return (
                <div style={{
                  position: "absolute",
                  left: leaderX, top: leaderY,
                  width: 54, height: 54,
                  transform: "translate(-50%, -50%)",
                  transition: attackAnim ? "none" : "left 160ms linear, top 160ms linear",
                  filter: `drop-shadow(0 3px 3px rgba(0,0,0,0.55)) ${fainted ? "grayscale(1) brightness(0.6)" : ""}`,
                  opacity: fainted ? 0.5 : 1,
                  zIndex: Math.round(leaderY),
                }}>
                  {auraOn && (
                    <>
                      <div className="lvaura-glow" style={{
                        position: "absolute", inset: -28, borderRadius: "50%",
                        pointerEvents: "none",
                      }} />
                      <div className="lvaura-ring" style={{
                        position: "absolute", inset: -18, borderRadius: "50%",
                        pointerEvents: "none",
                      }} />
                      <div className="lvaura-ring2" style={{
                        position: "absolute", inset: -10, borderRadius: "50%",
                        pointerEvents: "none",
                      }} />
                      {[0,1,2,3,4,5,6,7].map((i) => (
                        <span key={i} className="lvaura-spark" style={{
                          ["--i" as string]: i,
                        } as React.CSSProperties} />
                      ))}
                    </>
                  )}
                  {SPRITE_SHEET[leaderSp] ? (
                    <div style={{
                      width: "100%", height: "100%",
                      backgroundImage: `url(${SPRITE_SHEET[leaderSp]})`,
                      backgroundSize: "400% 400%",
                      backgroundPosition: `${(moving ? walkStep : 0) * 33.333}% ${DIR_ROW[walkDir] * 33.333}%`,
                      imageRendering: "pixelated",
                      filter: fainted ? "grayscale(1) brightness(0.6)" : undefined,
                    }} />
                  ) : (
                    <img src={leaderSrc} alt="" className={!moving && !fainted ? "attackbob" : ""}
                      style={{
                        width: "100%", imageRendering: "pixelated",
                        "--face-scale": faceScale,
                        transform: `scaleX(${faceScale})`,
                      } as React.CSSProperties} />
                  )}

                  {/* Barra HP */}
                  <div style={{
                    position: "absolute", bottom: -8, left: 4, right: 4, height: 6,
                    background: "#3a1010", borderRadius: 3, border: "1px solid rgba(0,0,0,0.6)",
                  }}>
                    <div style={{
                      width: `${hpPct}%`, height: "100%",
                      background: hpPct > 40 ? "#5ec26a" : hpPct > 15 ? "#f5cf6b" : "#e34a4a",
                      borderRadius: 3, transition: "width 250ms",
                    }} />
                  </div>
                  {/* Barra XP */}
                  <div style={{
                    position: "absolute", bottom: -16, left: 4, right: 4, height: 4,
                    background: "#0e1a2a", borderRadius: 2, border: "1px solid rgba(0,0,0,0.6)",
                  }}>
                    <div style={{
                      width: `${xpPct}%`, height: "100%",
                      background: "#6bd4ff", borderRadius: 2, transition: "width 250ms",
                    }} />
                  </div>
                  <div style={{
                    position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                    fontSize: 11, color: "#fff", fontWeight: 700,
                    textShadow: "1px 1px 0 #000",
                    whiteSpace: "nowrap",
                  }}>
                    Lv.{leader.level} · {Math.floor(leaderHp)}/{leaderMax}
                  </div>
                </div>
              );
            })()}

            {/* Slash / impacto de ataque */}
            {attackAnim && (() => {
              const dt = Math.min(1, (Date.now() - attackAnim.ts) / 380);
              const opacity = dt < 0.6 ? 1 : 1 - (dt - 0.6) / 0.4;
              const scale = 0.6 + dt * 0.8;
              const size = attackAnim.crit ? 88 : 64;
              return (
                <img key={attackAnim.id} src={fxSlashImg} alt="" style={{
                  position: "absolute",
                  left: attackAnim.toX, top: attackAnim.toY,
                  width: size, height: size,
                  transform: `translate(-50%, -50%) scale(${scale}) rotate(${attackAnim.crit ? dt * 90 : 0}deg)`,
                  opacity,
                  pointerEvents: "none",
                  filter: attackAnim.crit ? "drop-shadow(0 0 12px #ffd94d) drop-shadow(0 0 6px #ff3b3b)" : "drop-shadow(0 0 6px #ffb84d)",
                  imageRendering: "pixelated",
                  zIndex: 7,
                }} />
              );
            })()}

            {/* Efeitos flutuantes (coords do mundo) */}
            {fx.map((f) => {
              const color =
                f.kind === "crit" ? "#ffd94d" :
                f.kind === "myDmg" ? "#f5cf6b" :
                f.kind === "enemyDmg" ? "#ff3b3b" :
                f.kind === "xp" ? "#6bd4ff" :
                f.kind === "capture" ? "#ffd94d" :
                "#e0f5a0";
              const isDmg = f.kind === "myDmg" || f.kind === "enemyDmg";
              const isCrit = f.kind === "crit";
              return (
                <div key={f.id} className="fxpop" style={{
                  position: "absolute",
                  left: f.x, top: f.y,
                  color,
                  fontWeight: 900,
                  fontSize: isCrit ? 30 : isDmg ? 22 : f.kind === "capture" ? 20 : 18,
                  letterSpacing: isCrit ? 1 : 0,
                  textShadow: isCrit
                    ? "0 0 8px #ff3b3b, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
                    : "2px 2px 0 rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                  transform: "translate(-50%, -50%)",
                  zIndex: 8,
                }}>
                  {f.kind === "myDmg" ? `-${f.text}` : f.text}
                </div>
              );
            })}
          </div>

          {/* ============ UI FIXA (não rola com o mapa) ============ */}
          {/* Header do mapa */}
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(11,5,16,0.75)", padding: "8px 12px",
            borderRadius: 8, border: "1px solid rgba(245,207,107,0.3)",
            zIndex: 10,
          }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{map.name}</div>
            <div style={{ fontSize: 11, color: "#c8b8d0" }}>Dificuldade: {map.diff} · Lv {team[0]?.level ?? 1}</div>
            <div style={{ fontSize: 11, color: "#c8b8d0" }}>Tempo ativo: <span style={{ color: "#f5cf6b" }}>{fmtHMS(activeTime)}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 12, fontWeight: 700 }}>
              <span title="Ouro no banco" style={{ color: "#f4c430" }}>● {fmtK(idle.bank.gold)}</span>
              <span title="Cristais" style={{ color: "#5eead4", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <img src={crystalGreenImg} alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} />
                {Math.floor(idle.bank.crystals)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span title="Pokébola" style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                <img src={ballPokeImg} alt="" width={18} height={18} style={{ imageRendering: "pixelated" }} />
                {idle.items.pokeball ?? 0}
              </span>
              <span title="Great Ball" style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                <img src={ballGreatImg} alt="" width={18} height={18} style={{ imageRendering: "pixelated" }} />
                {idle.items.greatball ?? 0}
              </span>
              <span title="Ultra Ball" style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                <img src={ballUltraImg} alt="" width={18} height={18} style={{ imageRendering: "pixelated" }} />
                {idle.items.ultraball ?? 0}
              </span>
            </div>
            <div style={{ fontSize: 10, color: "#8a7a9c", marginTop: 6, fontStyle: "italic" }}>
              🔬 Laboratório · 🏠 Lar aparecem no mapa. Ande até eles.
            </div>

          </div>



          {/* Overlay de DESCANSO — congela o jogo, cura no final */}
          {restingUntil !== null && restingStart !== null && (() => {
            const totalDur = restingKind === "azul" ? REST_DURATION_BLUE_MS : REST_DURATION_LAR_MS;
            const elapsed = Math.min(totalDur, Math.max(0, Date.now() - restingStart));
            const remaining = Math.max(0, restingUntil - Date.now());
            const pct = Math.min(100, (elapsed / totalDur) * 100);
            const mm = Math.floor(remaining / 60000);
            const ss = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");
            const accent = restingKind === "azul" ? "#4a9eff" : "#5ec26a";
            const label = restingKind === "azul" ? "Descansando na Casa Azul" : "Descansando no Lar";
            return (
              <>
                <div style={{
                  position: "absolute", top: 10, right: 10, zIndex: 12,
                  background: "rgba(11,5,16,0.92)", border: `2px solid ${accent}`,
                  borderRadius: 10, padding: "10px 14px", minWidth: 200,
                  boxShadow: `0 0 24px ${accent}66`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 22, animation: "chest-pop 900ms ease-in-out infinite" }}>💤</span>
                    <div>
                      <div style={{ fontWeight: 800, color: "#fff", fontSize: 13 }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#c8ffd6" }}>Restam <b>{mm}:{ss}</b></div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "#1a0f26", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${accent}, #a7f3a0)`, transition: "width 200ms" }} />
                  </div>
                </div>
              </>
            );
          })()}
          {/* tick invisível pra forçar rerender enquanto descansa */}
          {restingUntil !== null && <span style={{ display: "none" }}>{restNowTick}</span>}



          {/* Prompt de interação com prédio */}
          {nearBuilding && (() => {
            const bColor = nearBuilding === "lab" ? "#c084fc" : nearBuilding === "azul" ? "#4a9eff" : "#5ec26a";
            const bEmoji = nearBuilding === "lab" ? "🔬" : nearBuilding === "azul" ? "🏡" : "🏠";
            const bLabel = nearBuilding === "lab" ? "Laboratório" : nearBuilding === "azul" ? "Casa Azul" : "Lar";
            const bDesc = nearBuilding === "lab"
              ? "Resetar sua jornada"
              : nearBuilding === "azul"
                ? "Restaura energia em 5 min"
                : "Descansar (leva 1 hora)";
            const bAction = nearBuilding === "lab" ? "RESETAR" : "DESCANSAR";
            return (
              <div style={{
                position: "absolute", bottom: 78, left: "50%", transform: "translateX(-50%)",
                background: "rgba(11,5,16,0.95)",
                border: `2px solid ${bColor}`,
                borderRadius: 10, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 12, zIndex: 20,
                boxShadow: `0 0 20px ${bColor}66`,
                animation: "chest-pop 220ms ease-out",
              }}>
                <span style={{ fontSize: 24 }}>{bEmoji}</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 13 }}>{bLabel}</div>
                  <div style={{ fontSize: 10, color: "#c8b8d0" }}>{bDesc}</div>
                </div>
                <button
                  onClick={() => {
                    if (nearBuilding === "lab") resetAccount();
                    else if (nearBuilding === "azul") { setAzulPickerOpen(true); setNearBuilding(null); }
                    else restAtHome("lar");
                  }}
                  style={{
                    background: bColor,
                    color: "#0b0510", border: "none", borderRadius: 6,
                    padding: "8px 14px", fontWeight: 900, fontSize: 12,
                    letterSpacing: 1, cursor: "pointer",
                  }}
                >{bAction}</button>
              </div>
            );
          })()}

          {/* Faixa BATALHA AUTOMÁTICA / DESMAIADO */}

          {leaderHp <= 0 ? (
            <div style={{
              position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
              background: "rgba(60,0,0,0.95)", border: "2px solid #f5cf6b",
              borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14,
              zIndex: 15,
            }}>
              <span style={{ fontSize: 26 }}>💀</span>
              <div>
                <div style={{ fontWeight: 800, color: "#fff" }}>Pokémon desmaiado</div>
                <div style={{ fontSize: 11, color: "#f5cf6b" }}>
                  Custa 50 ouro para reviver
                </div>
              </div>
              <button onClick={revive} style={{ ...smallBtn, background: "#5ec26a", color: "#0b0510", border: "none", fontWeight: 800, padding: "8px 16px" }}>
                REVIVER
              </button>
            </div>
          ) : (() => {
            const ab = idle.autoBattle ?? { enabled: true, useBall: true, preferredBall: "auto" as const, captureHpPct: 1 };
            const setAB = (patch: Partial<typeof ab>) => setIdle((s) => ({ ...s, autoBattle: { ...(s.autoBattle ?? ab), ...patch } }));
            const on = ab.enabled;
            return (
            <div style={{
              position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              {showAutoSettings && (
                <div style={{
                  background: "rgba(11,5,16,0.98)", border: "1px solid rgba(245,207,107,0.5)",
                  borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8,
                  minWidth: 240, color: "#eadfe8", fontSize: 11, boxShadow: "0 6px 20px rgba(0,0,0,0.55)",
                }}>
                  <div style={{ fontWeight: 800, color: "#f5cf6b", fontSize: 12, letterSpacing: 1 }}>⚙ CONFIGURAR AUTO</div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span>Usar Pokébola</span>
                    <input type="checkbox" checked={ab.useBall} onChange={(e) => setAB({ useBall: e.target.checked })} />
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ color: "#c8b8d0" }}>Pokébola preferida</span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(["auto","pokeball","greatball","ultraball"] as const).map((p) => {
                        const label = p === "auto" ? "Auto" : p === "pokeball" ? "Poké" : p === "greatball" ? "Great" : "Ultra";
                        const sel = ab.preferredBall === p;
                        return (
                          <button key={p} onClick={() => setAB({ preferredBall: p })} disabled={!ab.useBall} style={{
                            background: sel ? "#f5cf6b" : "rgba(255,255,255,0.06)",
                            color: sel ? "#0b0510" : "#eadfe8", border: "1px solid rgba(245,207,107,0.4)",
                            borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700,
                            cursor: ab.useBall ? "pointer" : "not-allowed", opacity: ab.useBall ? 1 : 0.5,
                          }}>{label}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ color: "#c8b8d0" }}>Auto-Poção HP% ≤ {Math.round((idle.autoHeal?.threshold ?? 0.5) * 100)}%</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="range" min={0.1} max={0.9} step={0.05}
                        value={idle.autoHeal?.threshold ?? 0.5}
                        onChange={(e) => setIdle((s) => ({ ...s, autoHeal: { ...(s.autoHeal ?? { enabled: false, threshold: 0.5 }), threshold: parseFloat(e.target.value) } }))}
                        style={{ flex: 1 }}
                      />
                      <input type="checkbox"
                        checked={idle.autoHeal?.enabled ?? false}
                        onChange={(e) => setIdle((s) => ({ ...s, autoHeal: { ...(s.autoHeal ?? { enabled: false, threshold: 0.5 }), enabled: e.target.checked } }))}
                        title="Ativar auto-poção"
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#8f8296", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 6 }}>
                    💡 Clique em um Pokémon selvagem para lançar a Pokébola manualmente.
                  </div>
                </div>
              )}
              <div style={{
                background: "rgba(11,5,16,0.9)", border: "1px solid rgba(245,207,107,0.4)",
                borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <button
                  onClick={() => setAB({ enabled: !on })}
                  title={on ? "Auto-batalha ATIVA (clique para desativar)" : "Auto-batalha desativada (clique para ativar)"}
                  style={{
                    background: "transparent", border: "none", padding: 0, cursor: "pointer",
                    width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <img
                    src={autoIconImg}
                    alt="Auto"
                    width={40}
                    height={40}
                    style={{
                      width: 40, height: 40, imageRendering: "pixelated",
                      filter: on
                        ? "drop-shadow(0 0 6px #5ec26a) drop-shadow(0 0 10px rgba(94,194,106,0.6))"
                        : "grayscale(1) opacity(0.55)",
                      animation: on ? "autoIconPulse 1.2s ease-in-out infinite, autoIconSpin 6s linear infinite" : "none",
                      transformOrigin: "50% 50%",
                    }}
                  />
                </button>
                <div style={{ fontSize: 10, color: "#c8b8d0", minWidth: 90 }}>
                  Lv.{team[0]?.level ?? 1} · EXP {team[0]?.xp ?? 0}/{100 + (team[0]?.level ?? 1) * 20}
                </div>
                <button
                  onClick={() => setShowAutoSettings((v) => !v)}
                  title="Configurar"
                  style={{
                    background: showAutoSettings ? "#f5cf6b" : "rgba(255,255,255,0.06)",
                    color: showAutoSettings ? "#0b0510" : "#f5cf6b",
                    border: "1px solid rgba(245,207,107,0.5)",
                    borderRadius: 8, width: 30, height: 30, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}
                >⚙</button>
              </div>
            </div>
            );
          })()}


          {/* ===== OVERLAY DE ABAS (Pokémon / Mochila / Coleção) ===== */}
          {tab !== "batalha" && (
            <TabOverlay
              tab={tab}
              onClose={() => setTab("batalha")}
              leader={team[0]}
              team={team}
              onReorderTeam={(nt) => { setTeam(nt); if (nt[0]) setLeaderHp(calcIdleMaxHp(nt[0])); }}
              leaderHp={leaderHp}
              items={idle.items}
              caughtSpecies={idle.caughtSpecies}
              seenSpecies={idle.seenSpecies}
              totals={idle.totals}
              collection={idle.collection ?? []}
              craftPoints={idle.craftPoints ?? 0}
              onFragmentCollection={fragmentCollection}
              gifMap={GIF}
              onPickTeam={(entry) => onPickTeamFromColecao(entry)}
              onUseItem={useItem}
              bank={idle.bank}
              buffs={idle.buffs}
              onBuyBall={buyBall}
              onBuyBook={buyBook}
              onBuyPotion={buyPotion}
              onBuyEgg={buyEgg}
              shopEggs={SHOP_EGGS}

              onBuyChestAmulet={buyChestAmulet}
              chestAmuletOwned={idle.items?.chest_amulet ?? 0}
              autoHeal={idle.autoHeal}
              setAutoHeal={(next) => setIdle((s) => ({ ...s, autoHeal: next }))}
              audioSettings={audioSettings}
              setAudioSettings={setAudioSettings}
              tasks={idle.tasks}
              onClaimTask={claimTask}
              onOpenColecaoDetail={(uid) => setColecaoDetailUid(uid)}
              onExchange={exchange}
              onSellItem={sellItem}
              marketSellPrices={MARKET_SELL_PRICE}
              identity={identity}
              onListMarket={listMarketItem}
              onBuyMarket={buyMarketListing}
              onCancelMarket={cancelMarketListing}
              isVip={isVip()}
              skinId={skinId}
              setSkinId={setSkinId}



            />
          )}
        </div>


        {/* ============ COLUNA DIREITA ============ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0, overflowY: "auto" }}>
          <Panel title="MAPA ATUAL" accent="#3d2b52">
            {(() => {
              const leaderLv = team[0]?.level ?? 1;
              const goTo = (label: string, x: number, y: number, onArrive?: () => void) => {
                walkTargetRef.current = { x, y, label, onArrive, resumeAuto: autoRef.current };
                setWalkingTo(label);
                setAuto(false);
                pushChat(`Indo para ${label}…`, "info");
              };
              type GateDef = {
                key: string;
                target: IdleMapId;
                x: number; y: number;
                arriveX: number; arriveY: number;
                color: string;
              };
              // Fluxo: arena → praia → neve → deserto → floresta → caverna
              const gatesByMap: Record<IdleMapId, GateDef[]> = {
                arena: [
                  { key: "to-praia", target: "praia",    x: WORLD_W - 60, y: 60,           arriveX: 100,          arriveY: WORLD_H - 100, color: "#5cd3ff" },
                  { key: "to-neve",  target: "neve",     x: WORLD_W / 2,  y: 40,           arriveX: WORLD_W / 2,  arriveY: WORLD_H - 100, color: "#9bd8ff" },
                  { key: "to-flor",  target: "floresta", x: WORLD_W - 60, y: WORLD_H / 2,  arriveX: 100,          arriveY: WORLD_H / 2,   color: "#7ef27a" },
                  { key: "to-terra", target: "terra",    x: WORLD_W / 2,  y: WORLD_H - 40, arriveX: WORLD_W / 2,  arriveY: 100,           color: "#d9873a" },
                ],
                terra: [
                  { key: "to-arena",    target: "arena",    x: WORLD_W / 2, y: 40,           arriveX: WORLD_W / 2, arriveY: WORLD_H - 100, color: "#7ef27a" },
                  { key: "to-venofogo", target: "venofogo", x: WORLD_W / 2, y: WORLD_H - 40, arriveX: WORLD_W / 2, arriveY: 100,           color: "#ff5c2e" },
                ],
                venofogo: [
                  { key: "to-terra", target: "terra", x: WORLD_W / 2, y: 40, arriveX: WORLD_W / 2, arriveY: WORLD_H - 100, color: "#d9873a" },
                ],
                praia: [
                  { key: "to-arena",   target: "arena",   x: WORLD_W - 60, y: 60,          arriveX: 100,           arriveY: WORLD_H - 100, color: "#7ef27a" },
                  { key: "to-deserto", target: "deserto", x: 60,           y: WORLD_H / 2, arriveX: WORLD_W - 100, arriveY: WORLD_H / 2,   color: "#f5b25c" },
                ],
                neve: [
                  { key: "to-arena",   target: "arena",   x: WORLD_W / 2, y: WORLD_H - 40, arriveX: WORLD_W / 2,  arriveY: 100,           color: "#7ef27a" },
                  { key: "to-caverna", target: "caverna", x: 60,          y: 60,           arriveX: WORLD_W - 100, arriveY: WORLD_H - 100, color: "#a08770" },
                ],
                deserto: [
                  { key: "to-praia",    target: "praia",    x: WORLD_W - 60, y: WORLD_H / 2, arriveX: 100,           arriveY: WORLD_H / 2, color: "#5cd3ff" },
                  { key: "to-floresta", target: "floresta", x: 60,           y: WORLD_H / 2, arriveX: WORLD_W - 100, arriveY: WORLD_H / 2, color: "#7ef27a" },
                ],
                floresta: [
                  { key: "to-arena",   target: "arena",   x: 60,           y: WORLD_H / 2,  arriveX: WORLD_W - 100, arriveY: WORLD_H / 2, color: "#7ef27a" },
                  { key: "to-deserto", target: "deserto", x: WORLD_W - 60, y: WORLD_H / 2,  arriveX: 100,           arriveY: WORLD_H / 2, color: "#f5b25c" },
                ],
                caverna: [
                  { key: "to-neve", target: "neve", x: WORLD_W - 60, y: WORLD_H - 40, arriveX: 100, arriveY: 100, color: "#9bd8ff" },
                ],
              };
              const currentGates = gatesByMap[idle.currentMap] ?? [];
              const travelToGate = (g: GateDef) => {
                const targetMap = IDLE_MAPS[g.target];
                const unlocked = leaderLv >= targetMap.minLevel;
                if (!unlocked) {
                  pushChat(`Precisa nível ${targetMap.minLevel} para ir a ${targetMap.name}.`, "info");
                  return;
                }
                if (targetMap.cycle) {
                  const w = caveWindow();
                  if (!w.open) {
                    pushChat(`⛰ ${targetMap.name} fechada. Abre em ${fmtMS(w.msUntilChange)}.`, "info");
                    return;
                  }
                }
                playClick();
                goTo(targetMap.name, g.x, g.y, () => {
                  setIdle((s) => ({ ...s, currentMap: g.target }));
                  setTrainerPos({ x: g.arriveX, y: g.arriveY });
                  pushChat(`Chegou em ${targetMap.name}!`, "cap");
                });
              };

              const renderMap = (interactive: boolean, big: boolean) => (
                <div style={{
                  width: big ? "100%" : "min(100%, calc(180px * " + (WORLD_W / WORLD_H) + "))",
                  aspectRatio: `${WORLD_W} / ${WORLD_H}`, borderRadius: 6, overflow: "hidden",
                  background: `url(${map.bg}) center/cover`, position: "relative",
                  border: "1px solid rgba(245,207,107,0.4)",
                  margin: "0 auto",
                }}>
                  {/* Prédios (clicáveis) */}
                  {BUILDINGS.map((b) => (
                    <button
                      key={b.key}
                      title={`Ir ao ${b.label}`}
                      onClick={interactive ? () => { goTo(b.label, b.x, b.y - 40); if (big) setBigMapOpen(false); } : undefined}
                      className={interactive ? "map-pulse-dot" : undefined}
                      style={{
                        position: "absolute",
                        left: `${(b.x / WORLD_W) * 100}%`,
                        top: `${(b.y / WORLD_H) * 100}%`,
                        transform: "translate(-50%,-50%)",
                        fontSize: big ? 22 : 12, lineHeight: 1,
                        background: "transparent", border: "none", padding: 0,
                        cursor: interactive ? "pointer" : "default",
                        filter: interactive ? `drop-shadow(0 0 ${big ? 8 : 4}px ${b.color})` : "none",
                      }}
                    >{b.emoji}</button>
                  ))}
                  {/* Portais para outros mapas */}
                  {currentGates.map((g) => {
                    const targetMap = IDLE_MAPS[g.target];
                    const unlocked = leaderLv >= targetMap.minLevel;
                    const label = unlocked ? targetMap.name : `${targetMap.name} (Lv ${targetMap.minLevel})`;
                    return (
                      <button
                        key={g.key}
                        onClick={interactive ? () => { travelToGate(g); if (big) setBigMapOpen(false); } : undefined}
                        title={label}
                        className={interactive && unlocked ? "map-pulse-dot" : undefined}
                        style={{
                          position: "absolute",
                          left: `${(g.x / WORLD_W) * 100}%`,
                          top: `${(g.y / WORLD_H) * 100}%`,
                          transform: "translate(-50%,-50%)",
                          width: big ? 26 : 12, height: big ? 26 : 12, borderRadius: "50%",
                          background: unlocked ? g.color : "#5a5a5a",
                          border: `2px solid ${unlocked ? "#eafff0" : "#8a8a8a"}`,
                          cursor: interactive && unlocked ? "pointer" : "not-allowed",
                          padding: 0,
                          boxShadow: unlocked ? `0 0 ${big ? 12 : 6}px ${g.color}` : "none",
                        }}
                      />
                    );
                  })}
                  {/* Inimigos */}
                  {enemies.filter((e) => e.hp > 0).map((e) => (
                    <div key={e.id} style={{
                      position: "absolute",
                      left: `${(e.x / WORLD_W) * 100}%`,
                      top: `${(e.y / WORLD_H) * 100}%`,
                      width: big ? 9 : 5, height: big ? 9 : 5, borderRadius: "50%",
                      background: e.elite ? "#f5cf6b" : "#e34a4a",
                      transform: "translate(-50%,-50%)",
                      boxShadow: "0 0 3px #000",
                    }} />
                  ))}
                  {/* Baús */}
                  {chests.filter((c) => !c.opened).map((c) => (
                    <div key={c.id} style={{
                      position: "absolute",
                      left: `${(c.x / WORLD_W) * 100}%`,
                      top: `${(c.y / WORLD_H) * 100}%`,
                      width: big ? 9 : 5, height: big ? 9 : 5, borderRadius: 1,
                      background: "#f4c430",
                      transform: "translate(-50%,-50%)",
                    }} />
                  ))}
                  {/* Outros jogadores no mesmo mapa */}
                  {remotePlayers.map((rp) => (
                    <div key={`mm-${rp.id}`} title={rp.name} style={{
                      position: "absolute",
                      left: `${(rp.x / WORLD_W) * 100}%`,
                      top: `${(rp.y / WORLD_H) * 100}%`,
                      width: big ? 12 : 7, height: big ? 12 : 7, borderRadius: "50%",
                      background: "#c084fc",
                      border: "2px solid #fff",
                      transform: "translate(-50%,-50%)",
                      boxShadow: "0 0 6px #c084fc",
                    }} />
                  ))}
                  {/* Treinador */}
                  <div style={{
                    position: "absolute",
                    left: `${(trainerPos.x / WORLD_W) * 100}%`,
                    top: `${(trainerPos.y / WORLD_H) * 100}%`,
                    width: big ? 16 : 9, height: big ? 16 : 9, borderRadius: "50%",
                    background: "#6bd4ff",
                    border: "2px solid #fff",
                    transform: "translate(-50%,-50%)",
                    boxShadow: "0 0 8px #6bd4ff",
                  }} />

                </div>
              );

              return (
                <>
                  <div style={{ position: "relative" }}>
                    {renderMap(true, false)}
                    <button
                      onClick={() => { playClick(); setBigMapOpen(true); }}
                      title="Abrir mapa grande"
                      style={{
                        position: "absolute", top: 4, right: 4,
                        background: "rgba(11,5,16,0.8)", border: "1px solid #f5cf6b",
                        color: "#f5cf6b", borderRadius: 4, padding: "2px 6px",
                        fontSize: 11, fontWeight: 800, cursor: "pointer",
                      }}
                    >⛶</button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: "#c8b8d0", textAlign: "center" }}>
                    {map.name} · {map.diff}
                    {walkingTo && <div style={{ color: "#7ef27a", marginTop: 2 }}>→ {walkingTo}…</div>}
                  </div>

                  {bigMapOpen && (
                    <div
                      onClick={() => setBigMapOpen(false)}
                      style={{
                        position: "fixed", inset: 0, zIndex: 9998,
                        background: "rgba(0,0,0,0.85)", display: "grid", placeItems: "center",
                        padding: 24, cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: "#0b0510", border: "3px solid #f5cf6b",
                          borderRadius: 14, padding: 16, maxWidth: 720, width: "100%",
                          cursor: "default", boxShadow: "0 0 60px rgba(245,207,107,0.4)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ color: "#f5cf6b", fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>
                            🗺 {map.name} — clique num ponto pra viajar
                          </div>
                          <button
                            onClick={() => setBigMapOpen(false)}
                            style={{ background: "#3a1010", border: "1px solid #f5cf6b", color: "#f5cf6b", borderRadius: 6, padding: "4px 10px", fontWeight: 800, cursor: "pointer" }}
                          >✕</button>
                        </div>
                        {renderMap(true, true)}
                        <div style={{ marginTop: 10, fontSize: 12, color: "#c8b8d0", textAlign: "center" }}>
                          🏠 Lar · 🔬 Laboratório · {currentGates.map((g) => {
                            const tm = IDLE_MAPS[g.target];
                            const ok = leaderLv >= tm.minLevel;
                            return (
                              <span key={g.key} style={{ color: ok ? g.color : "#8a7a9c", marginRight: 8 }}>
                                ● {tm.name}{ok ? "" : ` (Lv ${tm.minLevel})`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </Panel>


          {/* COLETA — logo abaixo do mapa, destaque */}
          <div style={{
            background: "linear-gradient(135deg, #2a1a3e, #3d2b52)",
            border: "2px solid #f5cf6b",
            borderRadius: 10, padding: 10,
            boxShadow: "0 4px 14px rgba(245,207,107,0.25)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "#f5cf6b", fontWeight: 900, fontSize: 12, letterSpacing: 1 }}>COLETA</span>
              <span style={{ color: "#f5cf6b", fontWeight: 700, fontSize: 11 }}>⏱ {fmtHMS(Math.min(OFFLINE_CAP_MS, activeTime))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
              <span title="Ouro" style={{ color: "#f4c430" }}>● {fmtK(idle.pending.gold)}</span>
              <span title="Cristais">💎 {Math.floor(idle.pending.crystals)}</span>
            </div>
            <button
              onClick={collect}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #7ef27a, #5ec26a)",
                color: "#0b0510",
                border: "2px solid #f5cf6b",
                borderRadius: 8,
                padding: "8px 12px",
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: 1.2,
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(126,242,122,0.5)",
                textShadow: "0 1px 0 rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <img src={collectIconImg} alt="" width={26} height={26} style={{ imageRendering: "pixelated", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
              COLETAR
            </button>
          </div>




          {/* Botão de Tarefas — abre overlay com a lista completa */}
          <button
            onClick={() => { playClick(); setTab("tarefas"); }}
            style={{
              background: "linear-gradient(135deg, #3d2b52, #6a3d8a)",
              border: "2px solid #f5cf6b",
              borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              color: "#fff", fontWeight: 800, letterSpacing: 0.5,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src={crystalRedImg} alt="" style={{ width: 20, imageRendering: "pixelated" }} />
              TAREFAS
            </span>
            <span style={{ fontSize: 11, color: "#f5cf6b", fontWeight: 700 }}>
              {idle.tasks.filter((t) => t.done).length}/{idle.tasks.length} pronto{idle.tasks.length === 1 ? "" : "s"}
            </span>
          </button>

          <Panel title="PROGRESSO GLOBAL" accent="#3d2b52">
            <ProgressRow icon="🔴" label="Pokémon Capturados" value={idle.totals.captured} target={151} />
            <ProgressRow icon="🗺" label="Mapas Desbloqueados" value={idle.mapsUnlocked} target={25} />
          </Panel>

          <div style={{
            background: "linear-gradient(135deg, #7a1c1c, #c92a2a)",
            border: "2px solid #f5cf6b",
            borderRadius: 10, padding: 10,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 12 }}>MODO IDLE ATIVO</div>
              <div style={{ fontSize: 10, color: "#f5cf6b" }}>Ganhos continuam offline!</div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "radial-gradient(circle, #e94141 0 40%, #fff 40% 55%, #333 55%)",
              flexShrink: 0,
            }} />
          </div>
        </div>


        {/* ============ NAV INFERIOR ============ */}
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", gap: 4, background: "linear-gradient(180deg,#0b0510 0%,#160a20 100%)", padding: "8px 0", borderTop: "1px solid rgba(245,207,107,0.15)" }}>
          {([
            { id: "inicio",   label: "Início",   img: navInicio,    color: "#f5cf6b" },
            { id: "pokemon",  label: "Pokémon",  img: navPokemon,   color: "#ff5252" },
            { id: "mochila",  label: "Mochila",  img: bagIconImg,   color: "#ffd66b" },
            
            { id: "melhorias",label: "Melhorias",img: navMelhorias, color: "#7ef27a" },
            { id: "colecao",  label: "Coleção",  img: navColecao,   color: "#ff5c8a" },
            { id: "pokedex",  label: "Pokédex",  img: navColecao,   color: "#e11d48" },
            { id: "loja",     label: "Loja",     img: navLoja,      color: "#6bd4ff" },
            { id: "wallet",   label: "Carteira", img: navWallet,    color: "#ffd66b" },
            { id: "market",   label: "Mercado",  img: navMarket,    color: "#ff9d3d" },
          ] as const).map((t) => {

            const active = tab === t.id;
            const showActive = active;
            const color = t.color;
            return (
              <button
                key={t.id}
                onClick={() => {
                  playClick();
                  setTab(t.id as typeof tab);
                }}
                title={t.label}
                style={{
                  flex: 1, maxWidth: 130,
                  background: showActive ? `linear-gradient(180deg, ${color}33 0%, ${color}11 100%)` : "transparent",
                  color: showActive ? color : "#c8b8d0",
                  border: showActive ? `1px solid ${color}88` : "1px solid transparent",
                  padding: "8px 6px", cursor: "pointer",
                  borderRadius: 10, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4, fontSize: 11, position: "relative",
                  transition: "background 150ms, color 150ms, border-color 150ms",
                  boxShadow: showActive ? `0 0 14px ${color}66, inset 0 1px 0 ${color}44` : "none",
                }}
              >
                <img
                  src={t.img}
                  alt=""
                  width={34}
                  height={34}
                  style={{
                    width: 34, height: 34, imageRendering: "pixelated",
                    filter: showActive
                      ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 2px 2px rgba(0,0,0,0.5))`
                      : "drop-shadow(0 2px 2px rgba(0,0,0,0.6)) saturate(0.85) brightness(0.9)",
                    transform: active ? "translateY(-2px) scale(1.08)" : "none",
                    transition: "transform 150ms, filter 150ms",
                  }}
                />
                <span style={{ fontWeight: showActive ? 700 : 500, letterSpacing: 0.3 }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        /* ===== Layout responsivo ===== */
        @media (max-width: 1400px) {
          .idle-grid { grid-template-columns: 210px 1fr 210px !important; gap: 6px !important; padding: 6px !important; }
        }
        @media (max-width: 1200px) {
          .idle-grid { grid-template-columns: 190px 1fr 190px !important; }
        }
        @media (max-width: 1024px) {
          .idle-grid { grid-template-columns: 170px 1fr 170px !important; }
        }

        @keyframes fxpop {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { transform: translateY(-6px) scale(1.15); opacity: 1; }
          100% { transform: translateY(-36px) scale(0.9); opacity: 0; }
        }
        .fxpop { animation: fxpop 1.2s ease-out forwards; }
        @keyframes shakex { 0%,100%{transform: scaleX(-1) translateX(0)} 25%{transform:scaleX(-1) translateX(-3px)} 75%{transform:scaleX(-1) translateX(3px)} }
        @keyframes attackbob { 0%,100% { transform: scaleX(var(--face-scale, 1)) translateX(0) } 50% { transform: scaleX(var(--face-scale, 1)) translateX(12px) } }
        .attackbob { animation: attackbob 0.8s ease-in-out infinite; }
        /* ===== Level-up green aura ===== */
        @keyframes lvglow {
          0%   { transform: scale(0.6); opacity: 0; filter: blur(6px); }
          25%  { transform: scale(1.1); opacity: 1; filter: blur(4px); }
          100% { transform: scale(1.8); opacity: 0; filter: blur(10px); }
        }
        .lvaura-glow {
          background: radial-gradient(circle,
            rgba(180,255,150,0.85) 0%,
            rgba(90,220,110,0.55) 30%,
            rgba(40,180,80,0.25) 55%,
            rgba(20,120,60,0) 80%);
          animation: lvglow 1.4s ease-out forwards;
          mix-blend-mode: screen;
        }
        @keyframes lvring {
          0%   { transform: scale(0.5); opacity: 0; box-shadow: 0 0 0 0 rgba(140,255,160,0.9), inset 0 0 12px rgba(180,255,180,0.7); }
          25%  { opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; box-shadow: 0 0 30px 8px rgba(140,255,160,0), inset 0 0 30px rgba(180,255,180,0); }
        }
        .lvaura-ring {
          border: 2px solid rgba(180,255,180,0.9);
          background: transparent;
          animation: lvring 1.3s ease-out forwards;
        }
        .lvaura-ring2 {
          border: 2px solid rgba(120,240,140,0.7);
          background: transparent;
          animation: lvring 1.5s 0.15s ease-out forwards;
        }
        @keyframes lvspark {
          0%   { transform: rotate(calc(var(--i) * 45deg)) translateY(0) scale(0.4); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: rotate(calc(var(--i) * 45deg)) translateY(-46px) scale(1.1); opacity: 0; }
        }
        .lvaura-spark {
          position: absolute; left: 50%; top: 50%;
          width: 6px; height: 12px;
          margin: -6px 0 0 -3px;
          border-radius: 50%;
          background: radial-gradient(circle, #eaffd0 0%, #7ef27a 45%, rgba(60,180,80,0) 75%);
          box-shadow: 0 0 8px rgba(150,255,150,0.9), 0 0 16px rgba(90,240,110,0.6);
          animation: lvspark 1.1s ease-out forwards;
          pointer-events: none;
          transform-origin: 50% 50%;
        }
        .shake { animation: shakex 0.25s infinite; }

        /* ===== Weather — Pixel RPG style ===== */
        .wx-rain-tint {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg,
              rgba(30,45,75,0.42) 0%,
              rgba(30,45,75,0.22) 55%,
              rgba(30,45,75,0.10) 100%);
          pointer-events: none;
        }
        .wx-mist {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 50% 100%, rgba(180,200,230,0.18), transparent 60%),
            radial-gradient(ellipse at 20% 30%, rgba(200,215,240,0.08), transparent 55%);
          filter: blur(1px);
          pointer-events: none;
          animation: wx-mist-drift 12s ease-in-out infinite alternate;
        }
        @keyframes wx-mist-drift {
          0%   { transform: translateX(0); opacity: 0.85; }
          100% { transform: translateX(20px); opacity: 1; }
        }
        .wx-snow-tint {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            rgba(200,220,240,0.28) 0%,
            rgba(200,220,240,0.10) 50%,
            transparent 100%);
          pointer-events: none;
        }
        .wx-drop {
          position: absolute;
          top: -30px;
          display: block;
          background: linear-gradient(180deg,
            rgba(220,235,255,0) 0%,
            rgba(220,235,255,0.35) 40%,
            rgba(240,248,255,0.9) 100%);
          box-shadow: 0 0 3px rgba(200,225,255,0.5);
          transform: rotate(14deg);
          transform-origin: top center;
          border-radius: 2px;
          animation-name: wx-drop-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        @keyframes wx-drop-fall {
          0%   { transform: translate3d(0, -30px, 0) rotate(14deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate3d(-30vh, 115vh, 0) rotate(14deg); opacity: 0; }
        }
        .wx-flash {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 10%, rgba(230,235,255,0.35), transparent 55%);
          animation: wx-flash 9s ease-in-out infinite;
          pointer-events: none;
          opacity: 0;
        }
        @keyframes wx-flash {
          0%, 88%, 100% { opacity: 0; }
          89%           { opacity: 0.9; }
          90%           { opacity: 0.1; }
          91%           { opacity: 0.8; }
          92%           { opacity: 0; }
        }
        .wx-flake {
          position: absolute;
          top: -10px;
          display: block;
          background: #ffffff;
          box-shadow:
            0 0 2px rgba(255,255,255,0.9),
            0 0 4px rgba(200,220,255,0.6);
          border-radius: 0; /* pixel look */
          image-rendering: pixelated;
          animation-name: wx-flake-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes wx-flake-fall {
          0%   { transform: translate3d(0, -10px, 0); }
          50%  { transform: translate3d(var(--drift, 0px), 55vh, 0); }
          100% { transform: translate3d(calc(var(--drift, 0px) * -0.5), 110vh, 0); }
        }


        /* ===== Baús ===== */
        @keyframes chest-bob {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-4px); }
        }
        .chest-idle { animation: chest-bob 1.8s ease-in-out infinite; }
        @keyframes chest-pop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .chest-pop { animation: chest-pop 380ms ease-out; }
        @keyframes evt-slide {
          0% { opacity: 0; transform: translate(-50%, -14px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }


      `}</style>

      {identity && (
        <div style={{ position: "fixed", bottom: 8, left: 8, fontSize: 10, color: "#8a7a9c", zIndex: 100 }}>
          {identity.name}
        </div>
      )}

      {/* Botão flutuante: resgatar código */}
      <button
        onClick={() => { setCodeOpen(true); setCodeMsg(null); }}
        title="Resgatar código"
        style={{
          position: "fixed", bottom: 12, right: 12, zIndex: 100,
          background: "linear-gradient(180deg,#3a2a5c,#1a1030)",
          border: "1px solid #f5cf6b", color: "#f5cf6b",
          borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 800,
          fontFamily: "monospace", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >🔑 Código</button>

      {codeOpen && (
        <div
          onClick={() => setCodeOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(360px, 100%)",
              background: "linear-gradient(180deg,#1c0f2e,#0b0510)",
              border: "1px solid #f5cf6b", borderRadius: 10, padding: 16,
              color: "#f3e5c5", fontFamily: "monospace",
              boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 800, color: "#f5cf6b" }}>🔑 Resgatar código</div>
              <button onClick={() => setCodeOpen(false)} style={{
                background: "transparent", border: "none", color: "#f3e5c5", cursor: "pointer", fontSize: 16,
              }}>✕</button>
            </div>
            <div style={{ fontSize: 11, color: "#c8b8d0", marginBottom: 8 }}>
              Digite um código secreto para receber recompensas.
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") redeemCrystalCode(); }}
                placeholder="código…"
                autoFocus
                spellCheck={false}
                style={{
                  flex: 1, background: "#0b0510", color: "#f3e5c5",
                  border: "1px solid #4a3a6c", borderRadius: 6, padding: "6px 8px",
                  fontFamily: "monospace", fontSize: 13, outline: "none",
                }}
              />
              <button
                onClick={redeemCrystalCode}
                style={{
                  background: "linear-gradient(180deg,#f5cf6b,#c99a2e)",
                  color: "#1a1030", border: "none", borderRadius: 6,
                  padding: "6px 12px", fontWeight: 800, cursor: "pointer",
                  fontFamily: "monospace", fontSize: 12,
                }}
              >Resgatar</button>
            </div>
            {codeMsg && (
              <div style={{
                marginTop: 10, padding: "6px 8px", borderRadius: 6, fontSize: 12,
                background: codeMsg.kind === "ok" ? "rgba(126,242,122,0.12)" : "rgba(227,74,74,0.12)",
                border: `1px solid ${codeMsg.kind === "ok" ? "#7ef27a" : "#e34a4a"}`,
                color: codeMsg.kind === "ok" ? "#7ef27a" : "#ffb0b0",
              }}>{codeMsg.text}</div>
            )}
          </div>
        </div>
      )}





      {/* ===== Popup do ovo chocando ===== */}
      {eggOpenResult && (() => {
        const rarityColorMap: Record<string, string> = {
          common: "#c8b8d0", uncommon: "#5ec26a", rare: "#6bd4ff",
          epic: "#c084fc", legendary: "#f5cf6b", mythic: "#ff6b3d", mythic_shiny: "#ff97e1",
        };
        const rarityLabelMap: Record<string, string> = {
          common: "Comum", uncommon: "Incomum", rare: "Raro",
          epic: "Épico", legendary: "Lendário", mythic: "Mítico", mythic_shiny: "Mítico ✦",
        };
        const c = rarityColorMap[eggOpenResult.rarity] ?? "#f5cf6b";
        const label = rarityLabelMap[eggOpenResult.rarity] ?? eggOpenResult.rarity;
        return (
          <div
            onClick={() => setEggOpenResult(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 950,
              background: "rgba(6,3,12,0.88)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20, cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <div style={{
              background: "linear-gradient(160deg, #1a0f26 0%, #2a1638 100%)",
              border: `3px solid ${c}`, borderRadius: 16,
              padding: 32, maxWidth: 380, width: "100%",
              boxShadow: `0 0 40px ${c}aa`,
              textAlign: "center",
              animation: "chest-pop 380ms ease-out",
            }}>
              <div style={{ fontSize: 12, color: "#8a7a9c", letterSpacing: 3, marginBottom: 4 }}>OVO CHOCOU!</div>
              <div style={{
                margin: "10px auto 16px", width: 90, height: 104,
                borderRadius: "45% / 55%",
                background: `radial-gradient(circle at 30% 25%, #fff, ${c} 55%, ${c}88 100%)`,
                border: `3px solid ${c}`,
                boxShadow: `0 0 24px ${c}, inset 0 -10px 20px rgba(0,0,0,0.3)`,
              }} />
              <div style={{
                fontSize: 24, fontWeight: 900, color: "#fff",
                letterSpacing: 2, textTransform: "uppercase",
              }}>
                {eggOpenResult.sp.replace(/_/g, " ")}
              </div>
              <div style={{
                marginTop: 8, display: "inline-block",
                padding: "4px 14px", borderRadius: 20,
                background: c, color: "#0b0510",
                fontSize: 12, fontWeight: 900, letterSpacing: 2,
              }}>
                {label.toUpperCase()}
              </div>
              <div style={{ marginTop: 16, fontSize: 11, color: "#b8a8c8" }}>
                Foi adicionado ao seu time/coleção com stats bonificados pela raridade.
              </div>
              <div style={{ marginTop: 12, fontSize: 10, color: "#8a7a9c" }}>Clique para fechar</div>
            </div>
          </div>
        );
      })()}

      {/* ===== Modal de escolha do inicial ===== */}


      {!starterChosen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(11,5,16,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "linear-gradient(160deg, #1a0f26 0%, #2a1638 100%)",
            border: "2px solid #f5cf6b", borderRadius: 14,
            padding: 28, maxWidth: 720, width: "100%",
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
          }}>
            <h2 style={{ color: "#f5cf6b", fontSize: 22, marginBottom: 6, textAlign: "center", fontWeight: 900 }}>
              Escolha seu Pokémon inicial!
            </h2>
            <div style={{ color: "#b8a8c8", fontSize: 13, textAlign: "center", marginBottom: 22 }}>
              Você vai começar a jornada com este Pokémon (nível 5).
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {([
                { sp: "charmander" as const, name: "Charmander", img: charmanderGif, color: "#ff6b3d", desc: "Fogo — ataque forte" },
                { sp: "bulbasaur"  as const, name: "Bulbasaur",  img: bulbasaurGif,  color: "#5ec26a", desc: "Planta — equilibrado" },
                { sp: "squirtle"   as const, name: "Squirtle",   img: squirtleGif,   color: "#6bd4ff", desc: "Água — defensivo" },
              ]).map((c) => (
                <button key={c.sp} onClick={() => pickStarter(c.sp)}
                  style={{
                    background: "linear-gradient(160deg, #1a0f26 0%, #251638 100%)",
                    border: `2px solid ${c.color}`, borderRadius: 12, padding: 16,
                    cursor: "pointer", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 8, transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <img src={c.img} alt={c.name} width={96} height={96}
                    style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 10px ${c.color}88)` }} />
                  <div style={{ color: c.color, fontWeight: 900, fontSize: 16 }}>{c.name}</div>
                  <div style={{ color: "#b8a8c8", fontSize: 11, textAlign: "center" }}>{c.desc}</div>
                  <div style={{
                    marginTop: 4, padding: "6px 14px", background: c.color, color: "#0b0510",
                    borderRadius: 6, fontWeight: 800, fontSize: 12,
                  }}>ESCOLHER</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal: detalhes do Pokémon (energia + tempo) ===== */}
      {petDetailUid && (() => {
        void energyTick;
        const save = (loadLatestValid<SaveShape>() ?? {}) as SaveShape;
        const party = save.party ?? team;
        const pet = party.find((p) => p.uid === petDetailUid) ?? team.find((p) => p.uid === petDetailUid);
        if (!pet) return null;
        const now = Date.now();
        const maxHp = calcIdleMaxHp(pet);
        const hp = pet.uid === team[0]?.uid ? leaderHp : (pet.hp ?? maxHp);
        const energy = petCurrentEnergy(pet, now);
        const msFull = petMsToFull(pet, now);
        const infinite = (ENERGY_REGEN_MS[pet.rarity] ?? 0) === 0;
        const resting = !!(pet as PetEnergyExt).azulRestUntil && ((pet as PetEnergyExt).azulRestUntil! > now);
        const src = GIF[pet.species];
        return (
          <div onClick={() => setPetDetailUid(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "grid", placeItems: "center", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(180deg,#1a1030,#0e0818)", border: "2px solid #f5cf6b", borderRadius: 12, padding: 18, minWidth: 300, maxWidth: 380, color: "#eadfe8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 72, height: 72, background: "#0b0510", borderRadius: 8, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid #f5cf6b55" }}>
                  {src && <img src={src} alt="" style={{ width: "90%", imageRendering: "pixelated" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{pet.species.replace(/_/g, " ").toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: "#b8a8c8" }}>Lv.{pet.level} · {pet.rarity}</div>
                </div>
                <button onClick={() => setPetDetailUid(null)} style={{ background: "#3a1010", border: "1px solid #f5cf6b", color: "#f5cf6b", borderRadius: 6, padding: "4px 10px", fontWeight: 800, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span>❤️ HP</span><span>{hp}/{maxHp}</span></div>
                <div style={{ height: 8, background: "#3a1010", borderRadius: 4, marginTop: 3 }}>
                  <div style={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`, height: "100%", background: "#5ec26a", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>⚡ Energia {resting ? "(descansando)" : ""}</span>
                  <span>{infinite ? "∞ MÍTICO" : `${energy}/100`}</span>
                </div>
                <div style={{ height: 8, background: "#0e2438", borderRadius: 4, marginTop: 3 }}>
                  <div style={{ width: `${infinite ? 100 : energy}%`, height: "100%", background: resting ? "#7fc4ff" : (energy > 30 ? "#4a9eff" : "#ff7a3d"), borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: "#c8b8d0", marginTop: 4, textAlign: "right" }}>
                  {infinite ? "Não cansa" : (msFull > 0 ? `Cheia em ${fmtMS(msFull)}` : "Energia cheia")}
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 10, color: "#8a7a9c" }}>
                XP {pet.xp ?? 0}/{100 + pet.level * 20}
              </div>
              {!infinite && !resting && energy < ENERGY_MAX && (
                <button
                  onClick={() => {
                    const uid = pet.uid;
                    const azul = BUILDINGS.find((b) => b.key === "azul");
                    if (!azul) return;
                    setPetDetailUid(null);
                    setAzulPreselectUid(uid);
                    walkTargetRef.current = {
                      x: azul.x, y: azul.y - 40, label: "Casa Azul",
                      onArrive: () => { setAzulPickerOpen(true); },
                      resumeAuto: autoRef.current,
                    };
                    setWalkingTo("Casa Azul");
                    setAuto(false);
                    pushChat(`🏡 Indo à Casa Azul para deixar ${pet.species.toUpperCase()} descansar...`, "info");
                  }}
                  style={{ marginTop: 14, width: "100%", background: "#4a9eff", color: "#0b0510", border: "none", borderRadius: 8, padding: "10px", fontWeight: 900, cursor: "pointer" }}
                >🏡 Levar à Casa Azul (5💎 · 5 min)</button>
              )}

            </div>
          </div>
        );
      })()}

      {/* ===== Modal: Casa Azul — escolher Pokémon para descansar ===== */}
      {azulPickerOpen && (() => {
        void energyTick;
        const save = (loadLatestValid<SaveShape>() ?? {}) as SaveShape;
        const party = save.party ?? team;
        const now = Date.now();
        return (
          <div onClick={() => { setAzulPickerOpen(false); setAzulPreselectUid(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "grid", placeItems: "center", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(180deg,#0a1830,#0e0818)", border: "2px solid #4a9eff", borderRadius: 12, padding: 18, width: 380, maxHeight: "80vh", overflow: "auto", color: "#eadfe8" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: "#7fc4ff" }}>🏡 CASA AZUL</div>
                  <div style={{ fontSize: 11, color: "#c8b8d0" }}>Restaura 100 de energia em 5 min · custa {AZUL_REST_COST}💎</div>
                </div>
                <button onClick={() => setAzulPickerOpen(false)} style={{ background: "#0a1830", border: "1px solid #4a9eff", color: "#7fc4ff", borderRadius: 6, padding: "4px 10px", fontWeight: 800, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#8fd0ff" }}>Seu saldo: 💎 {idle.bank.crystals}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {party.map((p) => {
                  const infinite = (ENERGY_REGEN_MS[p.rarity] ?? 0) === 0;
                  const resting = !!(p as PetEnergyExt).azulRestUntil && ((p as PetEnergyExt).azulRestUntil! > now);
                  const energy = petCurrentEnergy(p, now);
                  const src = GIF[p.species];
                  const canPick = !infinite && !resting && energy < ENERGY_MAX && idle.bank.crystals >= AZUL_REST_COST;
                  const label = infinite ? "MÍTICO (não cansa)" : resting ? `Descansando (${fmtMS(((p as PetEnergyExt).azulRestUntil!) - now)})` : `${energy}/100`;
                  return (
                    <div key={p.uid} style={{ display: "flex", gap: 8, alignItems: "center", background: p.uid === azulPreselectUid ? "#12305a" : "#0a1830", border: `1px solid ${p.uid === azulPreselectUid ? "#7fc4ff" : "#4a9eff33"}`, padding: 8, borderRadius: 8, boxShadow: p.uid === azulPreselectUid ? "0 0 12px #4a9eff55" : undefined }}>
                      <div style={{ width: 44, height: 44, background: "#0b0510", borderRadius: 6, display: "grid", placeItems: "center", overflow: "hidden" }}>
                        {src ? <img src={src} alt="" style={{ width: "90%", imageRendering: "pixelated" }} /> : <span>❓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{p.species.replace(/_/g, " ").toUpperCase()}</div>
                        <div style={{ fontSize: 10, color: "#c8b8d0" }}>Lv.{p.level} · {p.rarity}</div>
                        <div style={{ fontSize: 10, color: resting ? "#7fc4ff" : (energy < 30 ? "#ff7a3d" : "#8fd0ff") }}>⚡ {label}</div>
                      </div>
                      <button
                        disabled={!canPick}
                        onClick={() => restPetInAzul(p.uid)}
                        style={{
                          background: canPick ? "#4a9eff" : "#2a3a4a",
                          color: canPick ? "#0b0510" : "#5a6a7a",
                          border: "none", borderRadius: 6, padding: "6px 10px",
                          fontWeight: 900, fontSize: 11, cursor: canPick ? "pointer" : "not-allowed",
                        }}
                      >{resting ? "Ativo" : `Deixar (${AZUL_REST_COST}💎)`}</button>
                    </div>
                  );
                })}
                {party.length === 0 && <div style={{ fontSize: 11, color: "#8a7a9c" }}>Nenhum Pokémon na sua equipe.</div>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Modal: Detalhes da Coleção ===== */}
      {colecaoDetailUid && (() => {
        const entry = idle.collection?.find((p) => p.uid === colecaoDetailUid);
        if (!entry) return null;
        const sp = entry.species;
        const base = SPECIES_BASE[sp];
        const rarityColor: Partial<Record<Rarity, string>> = {
          common: "#8b6a30", uncommon: "#5ec26a", rare: "#4a9eff",
          epic: "#c084fc", legendary: "#ff8b3d", mythic: "#ff5252", mythic_shiny: "#ffd94d",
        };
        const rColor = rarityColor[entry.rarity] ?? rarityColor[base.rarity] ?? "#8b6a30";
        const src = GIF[sp];
        const lore = SPECIES_LORE[sp] ?? RARITY_LORE[base.rarity] ?? "Um Pokémon único, com história ainda por contar.";
        const isCurrent = team[0]?.uid === entry.uid;
        return (
          <div onClick={() => setColecaoDetailUid(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "grid", placeItems: "center", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: "linear-gradient(180deg, #fff8e5 0%, #f5e6c8 100%)",
              border: `3px solid ${rColor}`,
              borderRadius: 14, padding: 20, width: 420, maxHeight: "85vh", overflow: "auto",
              color: "#4a3010", boxShadow: `0 0 30px ${rColor}77, 0 8px 24px rgba(0,0,0,0.5)`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#8b6a30", fontWeight: 900, letterSpacing: 2 }}>REGISTRO ✦</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#4a3010", fontFamily: "Georgia, serif" }}>
                    {sp.replace(/_/g, " ").toUpperCase()}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, padding: "3px 10px", borderRadius: 12, background: rColor, color: "#fff", display: "inline-block", fontWeight: 900, letterSpacing: 1 }}>
                    {entry.rarity.toUpperCase()} · Nv. {entry.level}
                  </div>
                </div>
                <button onClick={() => setColecaoDetailUid(null)} style={{ background: "#b8862a", border: "none", color: "#fff9e8", borderRadius: 6, padding: "4px 10px", fontWeight: 900, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, alignItems: "center" }}>
                <div style={{
                  width: 120, height: 120, background: "linear-gradient(180deg,#fff,#e8d4a8)",
                  border: `2px solid ${rColor}`, borderRadius: 10, display: "grid", placeItems: "center",
                  boxShadow: `inset 0 0 20px ${rColor}55`,
                }}>
                  {src && <img src={src} alt="" style={{ width: 96, height: 96, imageRendering: "pixelated" }} />}
                </div>
                <div style={{ fontSize: 13, fontStyle: "italic", color: "#5a4020", lineHeight: 1.5 }}>&ldquo;{lore}&rdquo;</div>
              </div>
              <div style={{ marginTop: 14, background: "rgba(255,255,255,0.5)", border: "1px solid #b8862a55", borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 11, color: "#6b4a10", letterSpacing: 2, marginBottom: 6 }}>ATRIBUTOS BASE</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, fontSize: 12 }}>
                  {(["hp","atk","def","spa","spd","spe"] as const).map((k) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 4, padding: "4px 8px" }}>
                      <div style={{ fontSize: 9, color: "#8b6a30", fontWeight: 700 }}>{k.toUpperCase()}</div>
                      <div style={{ fontWeight: 800, color: "#4a3010" }}>{base[k]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "#6b4a10" }}>
                Ouro por derrota: <b>{base.goldRange[0]}-{base.goldRange[1]}</b> · Nível mínimo: <b>{base.minLv}</b>
              </div>
              {!isCurrent && (
                <button
                  onClick={() => { onPickTeamFromColecao(entry); setColecaoDetailUid(null); }}
                  style={{ marginTop: 14, width: "100%", background: "linear-gradient(180deg,#5ec26a,#3d7a4a)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 900, cursor: "pointer", letterSpacing: 1 }}
                >COLOCAR NO TIME</button>
              )}
              {isCurrent && (
                <div style={{ marginTop: 14, textAlign: "center", color: "#3d7a4a", fontWeight: 900 }}>★ Este está no seu time</div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ===== Toast de evento (aviso simples e elegante) ===== */}
      {eventToast && (
        <div key={eventToast.id} style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
          zIndex: 9998, pointerEvents: "none",
          animation: "evt-slide 300ms ease-out",
        }}>
          <div style={{
            background: "linear-gradient(180deg, rgba(11,5,16,0.95), rgba(26,15,38,0.95))",
            border: `1px solid ${eventToast.color}`,
            borderRadius: 999, padding: "8px 16px 8px 12px",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: `0 4px 18px rgba(0,0,0,0.5), 0 0 14px ${eventToast.color}55`,
            color: "#eadfe8",
          }}>
            <span style={{ fontSize: 18 }}>{eventToast.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: eventToast.color, letterSpacing: 1 }}>{eventToast.title}</div>
              {eventToast.sub && <div style={{ fontSize: 10, color: "#c8b8d0", marginTop: 1 }}>{eventToast.sub}</div>}
            </div>
          </div>
        </div>
      )}
    </div>

  );
}


// ============ Componentes visuais ============
function Panel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#1a0f26",
      border: "1px solid rgba(245,207,107,0.2)",
      borderRadius: 10, overflow: "hidden",
    }}>
      <div style={{
        background: accent, color: "#fff",
        padding: "6px 10px", fontWeight: 700, fontSize: 12,
        letterSpacing: 1,
      }}>{title}</div>
      <div style={{ padding: 10 }}>{children}</div>
    </div>
  );
}

function TeamRow({ pet, onClick, energyTick }: { pet: PetInstance; onClick?: () => void; energyTick?: number }) {
  void energyTick; // força re-render por segundo p/ atualizar barra de energia
  const src = GIF[pet.species];
  const now = Date.now();
  const energy = petCurrentEnergy(pet, now);
  const msFull = petMsToFull(pet, now);
  const infinite = (ENERGY_REGEN_MS[pet.rarity] ?? 0) === 0;
  const resting = !!(pet as PetEnergyExt).azulRestUntil && ((pet as PetEnergyExt).azulRestUntil! > now);
  if (!src) {
    return (
      <div onClick={onClick} style={{ display: "flex", gap: 8, alignItems: "center", background: "#2a1a3a", padding: 6, borderRadius: 6, cursor: onClick ? "pointer" : undefined }}>
        <div style={{ width: 48, height: 48, background: "#0b0510", borderRadius: 6, display: "grid", placeItems: "center", fontSize: 20 }}>❓</div>
        <div style={{ flex: 1, fontSize: 12 }}>
          <div style={{ fontWeight: 600 }}>{pet.species.replace(/_/g, " ").toUpperCase()}</div>
          <div style={{ fontSize: 10, color: "#b8a8c8" }}>Lv.{pet.level}</div>
        </div>
      </div>
    );
  }
  const maxHp = calcIdleMaxHp(pet);
  const hp = pet.hp ?? maxHp;
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const ePct = Math.max(0, Math.min(100, energy));
  const exhausted = !infinite && energy <= 0;
  return (
    <div onClick={onClick} title={exhausted ? "Sem energia — descanse na Casa Azul" : "Clique para ver detalhes"} style={{ display: "flex", gap: 8, alignItems: "center", background: exhausted ? "#1a1a1a" : "#2a1a3a", padding: 6, borderRadius: 6, cursor: onClick ? "pointer" : undefined, border: resting ? "1px solid #4a9eff" : (exhausted ? "1px solid #555" : undefined), opacity: exhausted ? 0.65 : 1 }}>
      <div style={{
        width: 48, height: 48, background: "#0b0510", borderRadius: 6,
        display: "grid", placeItems: "center", overflow: "hidden", position: "relative",
      }}>
        <img src={src} alt="" style={{ width: "90%", imageRendering: "pixelated", filter: exhausted ? "grayscale(1) brightness(0.7)" : undefined }} />
        {resting && <span style={{ position: "absolute", top: 1, right: 2, fontSize: 10 }}>🏡</span>}
        {exhausted && <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 18, textShadow: "0 0 4px #000" }}>🔒</span>}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
          <span>{pet.species.replace(/_/g, " ").toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 10, color: "#b8a8c8" }}>Lv.{pet.level} <span style={{ float: "right" }}>{hp}/{maxHp}</span></div>
        <div style={{ height: 4, background: "#3a1010", borderRadius: 2, marginTop: 2 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct > 40 ? "#5ec26a" : "#e34a4a", borderRadius: 2 }} />
        </div>
        {(() => {
          const xpNeeded = 100 + pet.level * 20;
          const xp = pet.xp ?? 0;
          const xpPct = Math.max(0, Math.min(100, (xp / xpNeeded) * 100));
          return (
            <>
              <div style={{ fontSize: 9, color: "#ffd94d", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                <span>EXP</span><span>{xp}/{xpNeeded}</span>
              </div>
              <div style={{ height: 3, background: "#3a2a10", borderRadius: 2, marginTop: 1 }}>
                <div style={{ width: `${xpPct}%`, height: "100%", background: "#ffd94d", borderRadius: 2 }} />
              </div>
            </>
          );
        })()}
        <div style={{ fontSize: 9, color: "#8fd0ff", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
          <span>⚡ {infinite ? "∞" : `${energy}/100`}</span>
          <span style={{ color: "#c8b8d0" }}>{infinite ? "MÍTICO" : (msFull > 0 ? fmtMS(msFull) : "cheia")}</span>
        </div>
        <div style={{ height: 3, background: "#0e2438", borderRadius: 2, marginTop: 1 }}>
          <div style={{ width: `${infinite ? 100 : ePct}%`, height: "100%", background: resting ? "#7fc4ff" : (energy > 30 ? "#4a9eff" : "#ff7a3d"), borderRadius: 2 }} />
        </div>

      </div>
    </div>
  );
}


function ProgressRow({ icon, label, value, target }: { icon: string; label: string; value: number; target: number }) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span>{icon} {label}</span>
        <span style={{ color: "#f5cf6b" }}>{value}/{target}</span>
      </div>
      <div style={{ height: 5, background: "#3a1010", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#5ec26a", borderRadius: 2 }} />
      </div>
    </div>
  );
}

// HUD topo — chip elegante para moeda/cristal
function HudChip({ color, label, icon }: { color: string; label: string; icon: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: `linear-gradient(180deg, ${color}22, ${color}08)`,
      border: `1px solid ${color}66`,
      padding: "3px 8px", borderRadius: 6,
      color, fontWeight: 800, textShadow: "1px 1px 0 #000",
    }}>
      <span>{icon}</span><span>{label}</span>
    </span>
  );
}
function HudBall({ img, count, color }: { img: string; count: number; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      opacity: count > 0 ? 1 : 0.5,
    }} title={`${count}`}>
      <img src={img} alt="" width={20} height={20}
        style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 4px ${color}88)` }} />
      <span style={{ color: "#eadfe8", fontWeight: 800, textShadow: "1px 1px 0 #000" }}>x{count}</span>
    </span>
  );
}

// ============ estilos ============
const smallBtn: React.CSSProperties = {
  background: "#2a1a3a", color: "#f3e5c5",
  border: "1px solid rgba(245,207,107,0.2)",
  padding: "6px 10px", borderRadius: 6, cursor: "pointer",
  fontSize: 11, fontWeight: 600,
};
const collectBtn: React.CSSProperties = {
  width: "100%", background: "linear-gradient(180deg, #f5cf6b, #d4a439)",
  color: "#3d2b0a", fontWeight: 800, letterSpacing: 1,
  border: "none", padding: "10px", borderRadius: 6, cursor: "pointer", fontSize: 13,
};
const pillBtn: React.CSSProperties = {
  display: "inline-block", background: "#c92a2a", color: "#fff",
  padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
  textDecoration: "none", boxShadow: "0 2px 8px rgba(201,42,42,0.4)",
};
const zoomBtn: React.CSSProperties = {
  width: 32, height: 28, background: "rgba(20,10,30,0.85)", color: "#f5cf6b",
  border: "1px solid rgba(245,207,107,0.4)", borderRadius: 6, cursor: "pointer",
  fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1,
};

// ============ Overlay das abas ============
function TabOverlay({
  tab, onClose, leader, team, onReorderTeam, leaderHp, items, caughtSpecies, seenSpecies, totals, collection, craftPoints, onFragmentCollection, gifMap, onPickTeam, onUseItem,
  bank, buffs, onBuyBall, onBuyBook, onBuyPotion, onBuyEgg, shopEggs, onBuyChestAmulet, chestAmuletOwned, autoHeal, setAutoHeal, audioSettings, setAudioSettings,
  tasks, onClaimTask, onOpenColecaoDetail, onExchange, onSellItem, marketSellPrices, identity, onListMarket, onBuyMarket, onCancelMarket, isVip, skinId, setSkinId,

}: {
  tab: string;
  onClose: () => void;
  leader: PetInstance | undefined;
  team: PetInstance[];
  onReorderTeam: (next: PetInstance[]) => void;
  leaderHp: number;
  items: Record<string, number>;
  caughtSpecies: Species[];
  seenSpecies: Species[];
  totals: { gold: number; captured: number };
  collection: CollectionEntry[];
  craftPoints: number;
  onFragmentCollection: (uid: string) => void;
  gifMap: Partial<Record<Species, string>>;
  onPickTeam: (entry: CollectionEntry) => void;
  onUseItem: (id: string) => void;
  bank: { gold: number; crystals: number };
  buffs: { atk: number; def: number; expMult: number; expMultUntil?: number; goldMult?: number; goldMultUntil?: number };
  onBuyBall: (b: ShopBall) => void;
  onBuyBook: (bk: ShopBook) => void;
  onBuyPotion: (qty?: number) => void;
  onBuyEgg: (e: { id: "egg_common" | "egg_rare" | "egg_epic" | "egg_mystic" | "egg_aura"; name: string; price: number; currency: "gold" | "crystals"; desc: string; color: string }) => void;
  shopEggs: { id: "egg_common" | "egg_rare" | "egg_epic" | "egg_mystic" | "egg_aura"; name: string; price: number; currency: "gold" | "crystals"; desc: string; color: string }[];

  onBuyChestAmulet: () => void;

  chestAmuletOwned: number;
  autoHeal: { enabled: boolean; threshold: number };
  setAutoHeal: (next: { enabled: boolean; threshold: number }) => void;
  audioSettings: { music: boolean; sfx: boolean; musicVol: number; sfxVol: number };
  setAudioSettings: React.Dispatch<React.SetStateAction<{ music: boolean; sfx: boolean; musicVol: number; sfxVol: number }>>;
  tasks: Task[];
  onClaimTask: (tid: string) => void;
  onOpenColecaoDetail: (uid: string) => void;
  onExchange: (dir: "g2c" | "c2g", amount: number) => void;
  onSellItem: (id: string, qty?: number) => void;
  marketSellPrices: Record<string, number>;
  identity: LocalIdentity | null;
  onListMarket: (itemId: string, qty: number, price: number) => Promise<boolean>;
  onBuyMarket: (l: { id: string; seller_id: string; item_id: string; qty: number; price: number }) => Promise<boolean>;
  onCancelMarket: (l: { id: string; item_id: string; qty: number; seller_id: string }) => Promise<boolean>;
  isVip: boolean;
  skinId: string;
  setSkinId: (id: string) => void;


}) {

  const title =
    tab === "pokemon"   ? "MEU POKÉMON" :
    tab === "mochila"   ? "MOCHILA" :
    tab === "colecao"   ? "COLEÇÃO" :
    tab === "pokedex"   ? "POKÉDEX" :
    tab === "loja"      ? "LOJA" :
    tab === "wallet"    ? "CARTEIRA" :
    tab === "market"    ? "MERCADO" :

    tab === "melhorias" ? "MELHORIAS" :
    tab === "config"    ? "CONFIGURAÇÕES" :
    tab === "tarefas"   ? "TAREFAS" :
    tab === "inicio"    ? "INÍCIO" : "";
  return (
    <div style={{
      position: "absolute", inset: 12, background: "rgba(11,5,16,0.96)",
      border: "1px solid rgba(245,207,107,0.3)", borderRadius: 12,
      zIndex: 20, padding: 16, overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#f5cf6b" }}>{title}</h2>
        <button onClick={onClose} style={{ ...smallBtn, background: "#c92a2a", color: "#fff", border: "none", padding: "6px 14px" }}>
          ← Voltar
        </button>
      </div>

      {tab === "pokemon" && leader && (
        <div>
          <PokemonDetail pet={leader} currentHp={leaderHp} src={gifMap[leader.species]} />
          <ActiveBonuses leaderRarity={leader.rarity} buffs={buffs} />
          <SpeciesLore species={leader.species} rarity={leader.rarity} />


          <h3 style={{ color: "#f5cf6b", fontSize: 14, margin: "18px 0 10px" }}>
            SEU TIME ({team.length}/5) — arraste com os botões para reordenar
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {team.map((p, i) => {
              const src = gifMap[p.species];
              const isLeader = i === 0;
              const move = (from: number, to: number) => {
                if (to < 0 || to >= team.length) return;
                const arr = [...team];
                const [x] = arr.splice(from, 1);
                arr.splice(to, 0, x);
                onReorderTeam(arr);
              };
              return (
                <div key={p.uid} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: 10,
                  background: isLeader ? "linear-gradient(90deg, #2a1a10, #1a0f26)" : "#1a0f26",
                  border: `1px solid ${isLeader ? "#f5cf6b88" : "rgba(245,207,107,0.2)"}`,
                  borderRadius: 8,
                }}>
                  <div style={{
                    width: 26, textAlign: "center", fontWeight: 900,
                    color: isLeader ? "#f5cf6b" : "#8a7a9c", fontSize: 12,
                  }}>{isLeader ? "★" : i + 1}</div>
                  {src && <img src={src} alt="" width={44} height={44} style={{ imageRendering: "pixelated" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#eadfe8", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                      {p.species.replace(/_/g, " ")}
                    </div>
                    <div style={{ color: "#b8a8c8", fontSize: 11 }}>Nível {p.level}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => move(i, i - 1)} disabled={i === 0}
                      style={{ ...smallBtn, padding: "6px 10px", opacity: i === 0 ? 0.4 : 1, cursor: i === 0 ? "not-allowed" : "pointer" }}>↑</button>
                    <button onClick={() => move(i, i + 1)} disabled={i === team.length - 1}
                      style={{ ...smallBtn, padding: "6px 10px", opacity: i === team.length - 1 ? 0.4 : 1, cursor: i === team.length - 1 ? "not-allowed" : "pointer" }}>↓</button>
                    {!isLeader && (
                      <button onClick={() => move(i, 0)}
                        style={{ ...smallBtn, padding: "6px 10px", background: "#c92a2a", color: "#fff", border: "none" }}>
                        Líder
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}





      {tab === "tarefas" && (
        <div>
          <div style={{ color: "#c8b8d0", fontSize: 13, marginBottom: 12 }}>
            Complete as tarefas para ganhar <img src={rubyGemUrl} alt="" style={{ width: 12, verticalAlign: "middle" }} /> rubis.
          </div>
          {tasks.length === 0 ? (
            <div style={{ color: "#8a7a9c", fontSize: 13, padding: 20, textAlign: "center" }}>
              Todas as tarefas foram concluídas! Aguarde novas em breve.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map((t) => (
                <div key={t.id} style={{
                  background: "linear-gradient(160deg, #1a0f26 0%, #251638 100%)",
                  border: `1px solid ${t.done ? "#5ec26a55" : "rgba(245,207,107,0.2)"}`,
                  borderRadius: 8, padding: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#eadfe8", fontWeight: 700, fontSize: 13 }}>{t.title}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5cf6b", fontWeight: 800 }}>
                      <img src={rubyGemUrl} alt="" style={{ width: 14 }} />
                      {t.reward}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#3a1010", borderRadius: 3 }}>
                    <div style={{
                      width: `${Math.min(100, (t.progress / t.target) * 100)}%`,
                      height: "100%", background: t.done ? "#5ec26a" : "#c92a2a",
                      borderRadius: 3, transition: "width 200ms",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span style={{ color: "#b8a8c8", fontSize: 11 }}>{t.progress}/{t.target}</span>
                    {t.done && (
                      <button onClick={() => onClaimTask(t.id)}
                        style={{ background: "#5ec26a", color: "#0b0510", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 800, cursor: "pointer" }}>
                        COLETAR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "mochila" && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
            padding: "14px 18px",
            background: "linear-gradient(135deg, #2a1638 0%, #3a1f5c 55%, #1a0f26 100%)",
            border: "2px solid #ffd66b",
            borderRadius: 14,
            boxShadow: "0 6px 22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,214,107,0.35)",
          }}>
            <img src={bagIconImg} alt="" width={64} height={64} style={{ imageRendering: "pixelated", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#ffd66b", fontSize: 18, fontWeight: 900, letterSpacing: 1, textShadow: "0 2px 0 #0b0510" }}>MOCHILA</div>
              <div style={{ color: "#c8b8d0", fontSize: 11, marginTop: 2 }}>
                {Object.values(items).filter((n) => n > 0).length} tipos · {Object.values(items).reduce((a, b) => a + (b > 0 ? b : 0), 0)} itens no total
              </div>
            </div>
          </div>
          {Object.entries(items).filter(([, n]) => n > 0).length === 0 ? (
            <div style={{
              color: "#8a7a9c", fontSize: 13, padding: 30, textAlign: "center",
              background: "rgba(20,10,35,0.55)", border: "1px dashed #4a3560", borderRadius: 12,
            }}>
              Sua mochila está vazia. Derrote Pokémon, abra baús ou visite a Loja!
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {(() => {
                const NAMES: Record<string, string> = {
                  potion: "Poção",
                  pokeball: "Pokébola", greatball: "Great Ball", ultraball: "Ultra Ball",
                  book_atk: "Livro Ataque", book_def: "Livro Defesa", book_exp: "Livro EXP",
                  book_exp_big: "Livro EXP Raro", book_exp_max: "Livro EXP Lendário", book_vip: "Livro VIP ✦",
                  book_vip_30: "Livro VIP 30d ✦✦", book_vip_60: "Livro VIP 60d ✦✦✦",
                  chest_amulet: "Amuleto do Baú",
                  egg_common: "Ovo Comum", egg_rare: "Ovo Raro", egg_epic: "Ovo Épico", egg_mystic: "Ovo Místico", egg_aura: "Ovo da Aura",
                };
                const EGG_COLORS: Record<string, string> = { egg_common: "#c8b8d0", egg_rare: "#6bd4ff", egg_epic: "#c084fc", egg_mystic: "#ff97e1", egg_aura: "#6bd4ff" };


                return Object.entries(items).filter(([, n]) => n > 0).map(([id, n]) => {
                  const isEgg = id.startsWith("egg_");
                  const color = isEgg ? (EGG_COLORS[id] ?? "#f5cf6b") : (ITEM_COLORS[id] ?? "#f5cf6b");
                  const img = ITEM_IMG[id];
                  const Icon = ITEM_ICONS[id] ?? Sparkles;
                  return (

                    <div key={id} style={{
                      background: "linear-gradient(160deg, #1a0f26 0%, #251638 100%)",
                      border: `1px solid ${color}44`, borderRadius: 10, padding: 12,
                      textAlign: "center", boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 ${color}22`,
                      display: "flex", flexDirection: "column", gap: 6, alignItems: "center",
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: `radial-gradient(circle at 30% 30%, ${color}33, ${color}11 60%, transparent)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${color}55`,
                      }}>
                        {isEgg ? (
                          <div style={{
                            width: 34, height: 40, borderRadius: "45% / 55%",
                            background: `radial-gradient(circle at 30% 25%, #fff, ${color} 55%)`,
                            border: `1.5px solid ${color}`,
                            boxShadow: `0 0 8px ${color}88`,
                          }} />
                        ) : img
                          ? <img src={img} alt="" width={40} height={40} style={{ imageRendering: "pixelated" }} />
                          : <Icon size={28} color={color} strokeWidth={2.2} />}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#eadfe8" }}>{NAMES[id] ?? id}</div>
                      <div style={{ fontSize: 13, color, fontWeight: 800 }}>x{n}</div>
                      <button
                        onClick={() => onUseItem(id)}
                        style={{
                          width: "100%", padding: "6px 8px", fontSize: 11, fontWeight: 700,
                          background: color, color: "#0b0510", border: "none",
                          borderRadius: 6, cursor: "pointer", letterSpacing: 0.5,
                        }}
                      >{isEgg ? "CHOCAR" : "USAR"}</button>

                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {tab === "colecao" && (
        <div style={{
          background: "linear-gradient(180deg, #f5e6c8 0%, #e8d4a8 100%)",
          border: "3px solid #b8862a",
          borderRadius: 14, padding: 18,
          boxShadow: "inset 0 0 24px rgba(184,134,42,0.25), 0 4px 18px rgba(0,0,0,0.4)",
        }}>
          {/* HUD topo da coleção */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 14, paddingBottom: 12,
            borderBottom: "2px solid rgba(184,134,42,0.5)",
          }}>
            <div>
              <div style={{ color: "#6b4a10", fontSize: 20, fontWeight: 900, letterSpacing: 3, fontFamily: "Georgia, serif" }}>
                ✦ COLEÇÃO ✦
              </div>
              <div style={{ color: "#8b6a30", fontSize: 12, marginTop: 2, fontStyle: "italic" }}>
                Registro particular do treinador
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ background: "#b8862a", color: "#fff9e8", fontWeight: 900, padding: "8px 14px", borderRadius: 20, fontSize: 12, boxShadow: "0 2px 8px rgba(184,134,42,0.5)" }}>
                {collection.length} NA COLEÇÃO
              </div>
              <div style={{ background: "#8b6a30", color: "#fff9e8", fontWeight: 900, padding: "8px 14px", borderRadius: 20, fontSize: 12 }}>
                {caughtSpecies.length} ESPÉCIES
              </div>
              <div style={{ background: "linear-gradient(180deg,#7c3aed,#4f26a4)", color: "#fff9e8", fontWeight: 900, padding: "8px 14px", borderRadius: 20, fontSize: 12, boxShadow: "0 2px 8px rgba(124,58,237,0.5)" }}>
                ⚒️ {craftPoints} PTS CRAFT
              </div>
            </div>
          </div>
          {collection.length === 0 ? (
            <div style={{ color: "#8b6a30", fontSize: 13, padding: 30, textAlign: "center", fontStyle: "italic" }}>
              Nenhum Pokémon capturado ainda. Continue a jornada — a taxa de captura é baixa (5%).
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {collection.slice().sort((a, b) => b.capturedAt - a.capturedAt).map((entry, i) => {
                const sp = entry.species;
                const isCurrent = leader?.species === sp && leader?.uid === entry.uid;
                const inTeam = team.some((p) => p.uid === entry.uid);
                const rarityColor: Partial<Record<Rarity, string>> = {
                  common: "#8b6a30", uncommon: "#5ec26a", rare: "#4a9eff",
                  epic: "#c084fc", legendary: "#ff8b3d", mythic: "#ff5252", mythic_shiny: "#ffd94d",
                };
                const rColor = rarityColor[entry.rarity] ?? "#8b6a30";
                const gain = CRAFT_BY_RARITY[entry.rarity] ?? 1;
                return (
                  <div
                    key={entry.uid}
                    style={{
                      background: "linear-gradient(180deg, #fff8e5, #f5e6c8)",
                      border: `2px solid ${isCurrent ? "#5ec26a" : "#b8862a"}`,
                      borderRadius: 10, padding: 10, textAlign: "center",
                      position: "relative",
                      boxShadow: `0 2px 8px rgba(0,0,0,0.15), inset 0 0 12px ${rColor}22`,
                      display: "flex", flexDirection: "column", gap: 4,
                    }}
                  >
                    <div style={{ position: "absolute", top: 4, left: 6, fontSize: 9, fontWeight: 900, color: "#8b6a30", letterSpacing: 1 }}>
                      #{String(i + 1).padStart(3, "0")}
                    </div>
                    {inTeam && (
                      <div style={{ position: "absolute", top: 4, right: 6, fontSize: 9, fontWeight: 900, color: "#3d7a4a" }}>★ TIME</div>
                    )}
                    <button
                      onClick={() => onOpenColecaoDetail(entry.uid)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      title="Ver detalhes"
                    >
                      {gifMap[sp] && <img src={gifMap[sp]} alt="" style={{ width: 64, height: 64, imageRendering: "pixelated", marginTop: 6 }} />}
                      <div style={{ fontSize: 11, marginTop: 2, color: "#4a3010", fontWeight: 800 }}>{sp.replace(/_/g, " ").toUpperCase()}</div>
                    </button>
                    <div style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, background: rColor, color: "#fff", alignSelf: "center", fontWeight: 800, letterSpacing: 1 }}>
                      {entry.rarity.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b4a10", fontWeight: 900 }}>
                      Nv. {entry.level}
                    </div>
                    <button
                      onClick={() => {
                        if (inTeam) { alert("Retire do time antes de fragmentar."); return; }
                        if (!confirm(`Fragmentar ${sp.toUpperCase()} (Nv.${entry.level}) por +${gain} pts de craft?`)) return;
                        onFragmentCollection(entry.uid);
                      }}
                      disabled={inTeam}
                      style={{
                        marginTop: 2, padding: "5px 6px", fontSize: 10, fontWeight: 900,
                        background: inTeam ? "#c8b8a0" : "linear-gradient(180deg,#7c3aed,#4f26a4)",
                        color: "#fff", border: "none", borderRadius: 6,
                        cursor: inTeam ? "not-allowed" : "pointer", letterSpacing: 0.5,
                      }}
                      title={inTeam ? "No time — não pode fragmentar" : `+${gain} pts de craft`}
                    >⚒️ FRAGMENTAR +{gain}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {tab === "pokedex" && (
        <div style={{
          background: "linear-gradient(180deg, #2a0510, #1a0510)",
          border: "2px solid #e11d48",
          borderRadius: 10, padding: 14,
          boxShadow: "inset 0 0 30px rgba(225,29,72,0.25)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #e11d4855",
          }}>
            <div>
              <div style={{ color: "#ff6b8a", fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>
                📕 POKÉDEX
              </div>
              <div style={{ color: "#ffb3c1", fontSize: 11, marginTop: 2 }}>
                Registro de Pokémon enfrentados em duelos
              </div>
            </div>
            <div style={{
              background: "#e11d48", color: "#fff", fontWeight: 900,
              padding: "6px 14px", borderRadius: 20, fontSize: 13,
              boxShadow: "0 0 12px #e11d4888",
            }}>
              {seenSpecies.length} REGISTRADO{seenSpecies.length === 1 ? "" : "S"}
            </div>
          </div>
          {seenSpecies.length === 0 ? (
            <div style={{ color: "#ffb3c1", fontSize: 13, padding: 30, textAlign: "center", fontStyle: "italic" }}>
              Nenhum Pokémon registrado ainda. Derrote inimigos em batalha para registrá-los!
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
              {seenSpecies.map((sp, i) => {
                const caught = caughtSpecies.includes(sp);
                return (
                  <div key={sp} style={{
                    background: "linear-gradient(180deg, #3a0a1a, #1a0510)",
                    border: `2px solid ${caught ? "#ffd94d" : "#e11d48"}`,
                    borderRadius: 8, padding: 8, textAlign: "center",
                    boxShadow: caught ? "0 0 10px #ffd94d55" : "0 0 8px #e11d4844",
                  }}>
                    <div style={{ fontSize: 9, color: "#ff6b8a", fontWeight: 800, letterSpacing: 1 }}>
                      Nº {String(i + 1).padStart(3, "0")}
                    </div>
                    {gifMap[sp] && <img src={gifMap[sp]} alt="" style={{ width: 56, height: 56, imageRendering: "pixelated" }} />}
                    <div style={{ fontSize: 11, marginTop: 2, color: "#fff", fontWeight: 700 }}>
                      {sp.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div style={{ fontSize: 9, marginTop: 4, color: caught ? "#ffd94d" : "#ff6b8a", fontWeight: 800 }}>
                      {caught ? "★ CAPTURADO" : "✓ VISTO"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {tab === "loja" && (
        <div>
          <div style={{
            display: "flex", gap: 12, marginBottom: 16, padding: "10px 14px",
            background: "linear-gradient(180deg, #1a0f26, #251638)",
            border: "1px solid rgba(245,207,107,0.25)", borderRadius: 8,
            alignItems: "center", justifyContent: "space-around", fontWeight: 800,
          }}>
            <span style={{ color: "#f4c430" }}>● Ouro: {fmtK(bank.gold)}</span>
            <span style={{ color: "#c084fc" }}>💎 Cristais: {Math.floor(bank.crystals)}</span>
          </div>

          <h3 style={{ color: "#6bd4ff", fontSize: 15, margin: "6px 0 10px" }}>Poções — pagas em ouro</h3>
          <div style={{
            background: "linear-gradient(160deg, #0f1f2e 0%, #16324a 100%)",
            border: "1px solid #6bd4ff55", borderRadius: 12, padding: 14, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 40 }}>🧪</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontWeight: 800, color: "#eadfe8" }}>Poção</div>
              <div style={{ fontSize: 11, color: "#b8a8c8" }}>Recupera {Math.round(POTION_HEAL_PCT * 100)}% do HP. Usada no auto quando ativado.</div>
              <div style={{ fontSize: 12, color: "#f4c430", fontWeight: 700 }}>● {POTION_PRICE} ouro cada</div>
              <div style={{ fontSize: 11, color: "#8a7a9c" }}>Você tem: {items.potion ?? 0}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 5, 20].map((q) => (
                <button key={q} onClick={() => onBuyPotion(q)}
                  disabled={bank.gold < POTION_PRICE * q}
                  style={{
                    padding: "8px 12px", fontWeight: 800, borderRadius: 6, border: "none",
                    background: bank.gold >= POTION_PRICE * q ? "#6bd4ff" : "#3a2a4a",
                    color: bank.gold >= POTION_PRICE * q ? "#06121e" : "#6a5a7c",
                    cursor: bank.gold >= POTION_PRICE * q ? "pointer" : "not-allowed",
                  }}
                >+{q}</button>
              ))}
            </div>
          </div>


          <h3 style={{ color: "#f5cf6b", fontSize: 15, margin: "6px 0 10px" }}>Pokébolas — pagas em ouro</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
            {SHOP_BALLS.map((b) => {
              const owned = items[b.id] ?? 0;
              const canBuy = bank.gold >= b.price;
              const color = ITEM_COLORS[b.id] ?? "#f5cf6b";
              return (
                <div key={b.id} style={{
                  background: "linear-gradient(160deg, #1a0f26 0%, #251638 100%)",
                  border: `1px solid ${color}55`, borderRadius: 12, padding: 14,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  boxShadow: `0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 ${color}22`,
                }}>
                  <img src={b.img} alt="" width={64} height={64}
                    style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 8px ${color}88)` }} />
                  <div style={{ fontWeight: 800, color: "#eadfe8", fontSize: 14 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "#b8a8c8" }}>Chance de captura x{b.captureMult}</div>
                  <div style={{ fontSize: 12, color: "#f4c430", fontWeight: 700 }}>● {b.price} ouro</div>
                  <div style={{ fontSize: 11, color: "#8a7a9c" }}>Você tem: {owned}</div>
                  <button
                    onClick={() => onBuyBall(b)}
                    disabled={!canBuy}
                    style={{
                      width: "100%", padding: "8px 10px", fontWeight: 800,
                      background: canBuy ? color : "#3a2a4a",
                      color: canBuy ? "#0b0510" : "#6a5a7c",
                      border: "none", borderRadius: 6,
                      cursor: canBuy ? "pointer" : "not-allowed",
                    }}
                  >{canBuy ? "COMPRAR" : "SEM OURO"}</button>
                </div>
              );
            })}
          </div>

          <h3 style={{ color: "#ff97e1", fontSize: 15, margin: "6px 0 10px" }}>🥚 Ovos — chocam Pokémon com raridade aleatória</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
            {shopEggs.map((e) => {
              const owned = items[e.id] ?? 0;
              const canBuy = e.currency === "gold" ? bank.gold >= e.price : bank.crystals >= e.price;
              return (
                <div key={e.id} style={{
                  background: "linear-gradient(160deg, #1a0f26 0%, #251638 100%)",
                  border: `1px solid ${e.color}77`, borderRadius: 12, padding: 14,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  boxShadow: `0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 ${e.color}22`,
                }}>
                  <div style={{
                    width: 72, height: 82, borderRadius: "45% / 55%",
                    background: `radial-gradient(circle at 30% 25%, #fff8, ${e.color} 55%, ${e.color}66 100%)`,
                    border: `2px solid ${e.color}`,
                    boxShadow: `0 0 14px ${e.color}88, inset 0 -6px 12px rgba(0,0,0,0.3)`,
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", top: 20, left: 12, right: 12, height: 3,
                      background: `${e.color}dd`, opacity: 0.6, borderRadius: 2, transform: "rotate(-8deg)",
                    }} />
                    <div style={{
                      position: "absolute", top: 40, left: 8, right: 14, height: 3,
                      background: `${e.color}dd`, opacity: 0.5, borderRadius: 2, transform: "rotate(6deg)",
                    }} />
                  </div>
                  <div style={{ fontWeight: 800, color: "#eadfe8", fontSize: 14 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: "#b8a8c8", textAlign: "center", minHeight: 30 }}>{e.desc}</div>
                  <div style={{ fontSize: 12, color: e.currency === "gold" ? "#f4c430" : "#c084fc", fontWeight: 700 }}>
                    {e.currency === "gold" ? "●" : "💎"} {e.price} {e.currency === "gold" ? "ouro" : "cristais"}
                  </div>
                  <div style={{ fontSize: 11, color: "#8a7a9c" }}>Você tem: {owned}</div>
                  <button
                    onClick={() => onBuyEgg(e)}
                    disabled={!canBuy}
                    style={{
                      width: "100%", padding: "8px 10px", fontWeight: 800,
                      background: canBuy ? e.color : "#3a2a4a",
                      color: canBuy ? "#0b0510" : "#6a5a7c",
                      border: "none", borderRadius: 6,
                      cursor: canBuy ? "pointer" : "not-allowed",
                    }}
                  >{canBuy ? "COMPRAR" : "SEM RECURSOS"}</button>
                </div>
              );
            })}
          </div>

          <h3 style={{ color: "#c084fc", fontSize: 15, margin: "6px 0 10px" }}>Livros de Habilidade — pagos em cristais 💎</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {SHOP_BOOKS.map((bk) => {
              const owned = items[bk.id] ?? 0;
              const canBuy = bank.crystals >= bk.price;
              const color = ITEM_COLORS[bk.id] ?? "#c084fc";
              return (
                <div key={bk.id} style={{
                  background: "linear-gradient(160deg, #1a0f26 0%, #251638 100%)",
                  border: `1px solid ${color}55`, borderRadius: 12, padding: 14,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  boxShadow: `0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 ${color}22`,
                }}>
                  <img src={bk.img} alt="" width={64} height={64}
                    style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 8px ${color}88)` }} />
                  <div style={{ fontWeight: 800, color: "#eadfe8", fontSize: 13 }}>{bk.name}</div>
                  <div style={{ fontSize: 11, color: "#b8a8c8", textAlign: "center" }}>{bk.desc}</div>
                  <div style={{ fontSize: 12, color: "#c084fc", fontWeight: 700 }}>💎 {bk.price}</div>
                  <div style={{ fontSize: 11, color: "#8a7a9c" }}>Você tem: {owned}</div>
                  <button
                    onClick={() => onBuyBook(bk)}
                    disabled={!canBuy}
                    style={{
                      width: "100%", padding: "8px 10px", fontWeight: 800,
                      background: canBuy ? color : "#3a2a4a",
                      color: canBuy ? "#0b0510" : "#6a5a7c",
                      border: "none", borderRadius: 6,
                      cursor: canBuy ? "pointer" : "not-allowed",
                    }}
                  >{canBuy ? "COMPRAR" : "SEM CRISTAL"}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "melhorias" && (
        <div>
          <h3 style={{ color: "#f5cf6b", fontSize: 15, marginBottom: 12 }}>Bônus ativos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <BuffCell img={bookAtkImg} label="Ataque" value={`+${Math.round((buffs?.atk ?? 0) * 100)}%`} color="#ff5252" />
            <BuffCell img={bookDefImg} label="Defesa" value={`-${Math.round((buffs?.def ?? 0) * 100)}%`} color="#4a7bff" />
            <BuffCell img={bookExpImg} label="EXP" value={`+${Math.round((buffs?.expMult ?? 0) * 100)}%`} color="#5ec26a" />
          </div>
          <div style={{ color: "#b8a8c8", fontSize: 12, lineHeight: 1.5 }}>
            Use Livros de Habilidade da sua mochila para aumentar esses bônus permanentemente.
            Compre os livros na aba <strong style={{ color: "#f5cf6b" }}>Loja</strong> pagando com cristais 💎.
          </div>
        </div>
      )}

      {tab === "inicio" && (
        <div style={{ color: "#c8b8d0", fontSize: 13, lineHeight: 1.6 }}>
          <p style={{ marginTop: 0 }}>Bem-vindo ao <strong style={{ color: "#f5cf6b" }}>Modo Idle</strong>!</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Seus Pokémon batalham automaticamente.</li>
            <li>Ache <strong>baús</strong> pelo mapa — dão ouro extra.</li>
            <li>Compre <strong>Pokébolas</strong> na Loja para capturar Pokémon.</li>
            <li>Use <strong>Livros</strong> pra ficar mais forte.</li>
            <li>Novos Pokémon aparecem conforme seu nível sobe.</li>
          </ul>

          <h3 style={{ color: "#f5cf6b", fontSize: 14, margin: "18px 0 10px" }}>Escolher Skin</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
            {SKINS.map((s) => {
              const active = s.id === skinId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSkinId(s.id)}
                  style={{
                    background: active ? "linear-gradient(160deg,#3a1f5c,#6b3fb0)" : "#1a0f26",
                    border: `2px solid ${active ? "#f5cf6b" : "rgba(107,212,255,0.35)"}`,
                    borderRadius: 10, padding: 10, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    color: "#eadfe8", fontFamily: "inherit",
                    boxShadow: active ? "0 0 18px rgba(245,207,107,0.45)" : "none",
                  }}
                >
                  <div style={{
                    width: 72, height: 72, display: "grid", placeItems: "center",
                    background: "rgba(0,0,0,0.35)", borderRadius: 8,
                    imageRendering: "pixelated",
                  }}>
                    {s.url ? (
                      <img src={s.url} alt={s.label} style={{ maxWidth: "100%", maxHeight: "100%", imageRendering: "pixelated" }} />
                    ) : (
                      <div style={{ fontSize: 32 }}>🧢</div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{s.label}</div>
                  {active && <div style={{ fontSize: 9, color: "#f5cf6b" }}>✓ EM USO</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "wallet" && (
        <WalletScreen bank={bank} onExchange={onExchange} />
      )}

      {tab === "market" && (
        <MarketScreen
          items={items}
          bank={bank}
          identity={identity}
          isVip={isVip}
          onList={onListMarket}
          onBuy={onBuyMarket}
          onCancel={onCancelMarket}
          onNpcSell={onSellItem}
          npcPrices={marketSellPrices}
        />

      )}



      {tab === "config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
          <div style={{ color: "#c8b8d0", fontSize: 13, lineHeight: 1.5 }}>
            Ajuste os sons e a música do jogo. A música toca em loop de fundo enquanto você joga.
          </div>

          <div style={{
            background: "linear-gradient(160deg, #1a0f26, #251638)",
            border: "1px solid rgba(107,212,255,0.35)", borderRadius: 12, padding: 16,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={audioSettings.music}
                onChange={(e) => setAudioSettings((s) => ({ ...s, music: e.target.checked }))}
                style={{ width: 18, height: 18 }} />
              <span style={{ color: "#eadfe8", fontWeight: 700 }}>🎵 Música de fundo</span>
            </label>
            <div>
              <div style={{ fontSize: 11, color: "#b8a8c8", marginBottom: 4 }}>Volume da música: {Math.round(audioSettings.musicVol * 100)}%</div>
              <input type="range" min={0} max={1} step={0.05} value={audioSettings.musicVol}
                onChange={(e) => setAudioSettings((s) => ({ ...s, musicVol: Number(e.target.value) }))}
                style={{ width: "100%" }} />
            </div>
          </div>

          <div style={{
            background: "linear-gradient(160deg, #1a0f26, #251638)",
            border: "1px solid rgba(245,207,107,0.35)", borderRadius: 12, padding: 16,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={audioSettings.sfx}
                onChange={(e) => setAudioSettings((s) => ({ ...s, sfx: e.target.checked }))}
                style={{ width: 18, height: 18 }} />
              <span style={{ color: "#eadfe8", fontWeight: 700 }}>🔊 Efeitos sonoros (clique, level-up, capturas)</span>
            </label>
            <div>
              <div style={{ fontSize: 11, color: "#b8a8c8", marginBottom: 4 }}>Volume dos efeitos: {Math.round(audioSettings.sfxVol * 100)}%</div>
              <input type="range" min={0} max={1} step={0.05} value={audioSettings.sfxVol}
                onChange={(e) => setAudioSettings((s) => ({ ...s, sfxVol: Number(e.target.value) }))}
                style={{ width: "100%" }} />
            </div>
          </div>

          <div style={{
            background: "linear-gradient(160deg, #0f1f2e, #16324a)",
            border: "1px solid rgba(107,212,255,0.4)", borderRadius: 12, padding: 16,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={autoHeal.enabled}
                onChange={(e) => setAutoHeal({ ...autoHeal, enabled: e.target.checked })}
                style={{ width: 18, height: 18 }} />
              <span style={{ color: "#eadfe8", fontWeight: 700 }}>🧪 Auto-Poção no modo Auto</span>
            </label>
            <div>
              <div style={{ fontSize: 11, color: "#b8a8c8", marginBottom: 4 }}>
                Usar poção quando HP &lt;= {Math.round(autoHeal.threshold * 100)}% (você tem {items.potion ?? 0} poção)
              </div>
              <input type="range" min={0.1} max={0.9} step={0.05} value={autoHeal.threshold}
                onChange={(e) => setAutoHeal({ ...autoHeal, threshold: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </div>
            <div style={{ fontSize: 11, color: "#8a7a9c" }}>
              Cada poção custa {POTION_PRICE} ouro na Loja e recupera {Math.round(POTION_HEAL_PCT * 100)}% de HP.
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#8a7a9c" }}>
            Se a música não iniciar automaticamente, clique em qualquer lugar da tela — os navegadores exigem uma interação antes de tocar áudio.
          </div>
        </div>
      )}
    </div>
  );
}

function BuffCell({ img, label, value, color }: { img: string; label: string; value: string; color: string }) {
  return (
    <div style={{
      background: "#1a0f26", border: `1px solid ${color}55`, borderRadius: 10,
      padding: 12, textAlign: "center",
    }}>
      <img src={img} alt="" width={40} height={40} style={{ imageRendering: "pixelated" }} />
      <div style={{ fontSize: 12, color: "#c8b8d0", marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

// ============ CARTEIRA (câmbio) ============
function WalletScreen({ bank, onExchange }: { bank: { gold: number; crystals: number }; onExchange: (dir: "g2c" | "c2g", amount: number) => void }) {
  const [buyAmt, setBuyAmt] = useState(1);
  const [sellAmt, setSellAmt] = useState(1);

  const buyCost = buyAmt * 1000;
  const sellGain = sellAmt * 800;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 780 }}>
      <div style={{
        gridColumn: "1 / -1",
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        border: "2px solid #f5cf6b66",
        boxShadow: "0 8px 24px rgba(0,0,0,0.55), inset 0 0 40px rgba(0,0,0,0.4)",
        backgroundImage: `url(${walletHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        minHeight: 190,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(11,5,16,0.15) 0%, rgba(11,5,16,0.55) 55%, rgba(11,5,16,0.95) 100%)",
        }} />
        <div style={{ position: "relative", padding: "16px 18px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 }}>
          <div>
            <div style={{ color: "#ffe58a", fontWeight: 900, fontSize: 20, letterSpacing: 2, textShadow: "2px 2px 0 #000, 0 0 12px #f5cf6b66" }}>✦ CASA DE CÂMBIO</div>
            <div style={{ color: "#dcc8e0", fontSize: 12, marginTop: 3, textShadow: "1px 1px 0 #000" }}>Converta ouro em cristais e vice-versa. Taxa: 1000 💰 ⇄ 1 💎 (compra) · 1 💎 → 800 💰 (venda).</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(14,8,24,0.85)", backdropFilter: "blur(4px)", border: "1px solid #f5cf6b88", borderRadius: 8, padding: "6px 12px", color: "#f5cf6b", fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>💰 {bank.gold.toLocaleString()}</div>
            <div style={{ background: "rgba(14,8,24,0.85)", backdropFilter: "blur(4px)", border: "1px solid #8fd0ff88", borderRadius: 8, padding: "6px 12px", color: "#8fd0ff", fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>💎 {bank.crystals.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div style={{ background: "#1a0f26", border: "1px solid #8fd0ff55", borderRadius: 10, padding: 14 }}>
        <div style={{ color: "#8fd0ff", fontWeight: 800, marginBottom: 6 }}>Comprar 💎 com Ouro</div>
        <div style={{ color: "#c8b8d0", fontSize: 12, marginBottom: 10 }}>1 💎 = 1000 ouro</div>
        <input type="number" min={1} value={buyAmt} onChange={(e) => setBuyAmt(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: "100%", background: "#0e0818", color: "#f3e5c5", border: "1px solid #8fd0ff55", borderRadius: 6, padding: 8, fontSize: 14 }} />
        <div style={{ fontSize: 12, color: "#c8b8d0", margin: "8px 0" }}>Custo: <b style={{ color: "#f5cf6b" }}>{buyCost.toLocaleString()} ouro</b></div>
        <button disabled={bank.gold < buyCost} onClick={() => onExchange("g2c", buyAmt)}
          style={{ width: "100%", background: bank.gold < buyCost ? "#333" : "linear-gradient(180deg,#4a9eff,#1e3a5f)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 800, cursor: bank.gold < buyCost ? "not-allowed" : "pointer" }}>
          Comprar {buyAmt} 💎
        </button>
      </div>
      <div style={{ background: "#1a0f26", border: "1px solid #f5cf6b55", borderRadius: 10, padding: 14 }}>
        <div style={{ color: "#f5cf6b", fontWeight: 800, marginBottom: 6 }}>Vender 💎 por Ouro</div>
        <div style={{ color: "#c8b8d0", fontSize: 12, marginBottom: 10 }}>1 💎 = 800 ouro (spread)</div>
        <input type="number" min={1} value={sellAmt} onChange={(e) => setSellAmt(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: "100%", background: "#0e0818", color: "#f3e5c5", border: "1px solid #f5cf6b55", borderRadius: 6, padding: 8, fontSize: 14 }} />
        <div style={{ fontSize: 12, color: "#c8b8d0", margin: "8px 0" }}>Você recebe: <b style={{ color: "#f5cf6b" }}>{sellGain.toLocaleString()} ouro</b></div>
        <button disabled={bank.crystals < sellAmt} onClick={() => onExchange("c2g", sellAmt)}
          style={{ width: "100%", background: bank.crystals < sellAmt ? "#333" : "linear-gradient(180deg,#f5cf6b,#8b6a30)", color: "#0e0818", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 800, cursor: bank.crystals < sellAmt ? "not-allowed" : "pointer" }}>
          Vender {sellAmt} 💎
        </button>
      </div>
    </div>
  );
}

// ============ MERCADO P2P (jogador vs jogador) ============
type MarketListing = {
  id: string;
  seller_id: string;
  seller_name: string;
  item_id: string;
  qty: number;
  price: number;
  created_at: string;
};
function MarketScreen({
  items, bank, identity, isVip, onList, onBuy, onCancel, onNpcSell, npcPrices,
}: {
  items: Record<string, number>;
  bank: { gold: number; crystals: number };
  identity: LocalIdentity | null;
  isVip: boolean;
  onList: (itemId: string, qty: number, price: number) => Promise<boolean>;
  onBuy: (l: { id: string; seller_id: string; item_id: string; qty: number; price: number }) => Promise<boolean>;
  onCancel: (l: { id: string; item_id: string; qty: number; seller_id: string }) => Promise<boolean>;
  onNpcSell: (id: string, qty?: number) => void;
  npcPrices: Record<string, number>;
}) {
  const LABELS: Record<string, string> = {
    pokeball: "Pokébola", greatball: "Great Ball", ultraball: "Ultra Ball",
    chest_amulet: "Amuleto do Baú",
    potion: "Poção",
  };
  const ICONS: Record<string, string> = {
    pokeball: "⚪", greatball: "🔴", ultraball: "🟡",
    chest_amulet: "🎗", potion: "🧪",
  };
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"browse" | "create" | "npc">("browse");
  const [selItem, setSelItem] = useState<string>("pokeball");
  const [selQty, setSelQty] = useState<number>(1);
  const [selPrice, setSelPrice] = useState<number>(500);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("market_listings")
      .select("id, seller_id, seller_name, item_id, qty, price, created_at, sold_at")
      .is("sold_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    setLoading(false);
    if (!error && data) setListings(data as unknown as MarketListing[]);
  };
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const mine = listings.filter((l) => l.seller_id === (identity?.id ?? ""));
  const others = listings.filter((l) => l.seller_id !== (identity?.id ?? ""));

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ background: "linear-gradient(180deg,#3d2b0f,#241503)", border: "2px solid #ff9d3d66", borderRadius: 12, padding: 16, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#ff9d3d", fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>🏷 MERCADO ENTRE TREINADORES</div>
          <div style={{ color: "#c8a878", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
            Compre e venda itens de outros jogadores. Anunciar é exclusivo <b style={{ color: "#ffd94d" }}>VIP ✦</b>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "#0e0818", border: "1px solid #f5cf6b55", borderRadius: 8, padding: "6px 12px", color: "#f5cf6b", fontWeight: 800 }}>💰 {bank.gold.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["browse", "create", "npc"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800,
            border: mode === m ? "1px solid #ff9d3d" : "1px solid #3a2a4a",
            background: mode === m ? "#3d2b0f" : "transparent",
            color: mode === m ? "#ff9d3d" : "#c8b8d0", cursor: "pointer",
          }}>
            {m === "browse" ? "Anúncios" : m === "create" ? "Anunciar (VIP)" : "Vender NPC"}
          </button>
        ))}
        <button onClick={() => void refresh()} disabled={loading} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, border: "1px solid #3a2a4a", background: "transparent", color: "#c8b8d0", cursor: loading ? "wait" : "pointer" }}>
          {loading ? "…" : "↻ Atualizar"}
        </button>
      </div>

      {mode === "browse" && (
        <>
          {mine.length > 0 && (
            <>
              <div style={{ color: "#8fd0ff", fontSize: 12, fontWeight: 800, margin: "6px 2px" }}>MEUS ANÚNCIOS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
                {mine.map((l) => (
                  <div key={l.id} style={{ background: "#101a2a", border: "1px solid #4a9eff55", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 22 }}>{ICONS[l.item_id] ?? "📦"}</div>
                      <div>
                        <div style={{ color: "#f5cf6b", fontWeight: 800, fontSize: 13 }}>{l.qty}x {LABELS[l.item_id] ?? l.item_id}</div>
                        <div style={{ color: "#8a7a9c", fontSize: 11 }}>Seu anúncio</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#c8b8d0", margin: "8px 0" }}>Preço: <b style={{ color: "#ff9d3d" }}>{l.price.toLocaleString()} ouro</b></div>
                    <button onClick={() => void onCancel(l).then((ok) => { if (ok) void refresh(); })}
                      style={{ width: "100%", background: "#3a1010", color: "#fff", border: "1px solid #ff6b6b55", borderRadius: 6, padding: "6px 0", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                      Cancelar anúncio
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ color: "#ff9d3d", fontSize: 12, fontWeight: 800, margin: "6px 2px" }}>À VENDA ({others.length})</div>
          {others.length === 0 ? (
            <div style={{ color: "#8a7a9c", fontStyle: "italic", padding: 20, textAlign: "center" }}>Nenhum anúncio ativo no momento.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {others.map((l) => {
                const canBuy = bank.gold >= l.price;
                return (
                  <div key={l.id} style={{ background: "#1a0f26", border: "1px solid #ff9d3d66", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 22 }}>{ICONS[l.item_id] ?? "📦"}</div>
                      <div>
                        <div style={{ color: "#f5cf6b", fontWeight: 800, fontSize: 13 }}>{l.qty}x {LABELS[l.item_id] ?? l.item_id}</div>
                        <div style={{ color: "#8a7a9c", fontSize: 11 }}>por <b style={{ color: "#c8b8d0" }}>{l.seller_name}</b></div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#c8b8d0", margin: "8px 0" }}>Preço: <b style={{ color: "#ff9d3d" }}>{l.price.toLocaleString()} ouro</b></div>
                    <button disabled={!canBuy} onClick={() => void onBuy(l).then((ok) => { if (ok) void refresh(); })}
                      style={{ width: "100%", background: !canBuy ? "#333" : "linear-gradient(180deg,#ff9d3d,#8b4a10)", color: "#0e0818", border: "none", borderRadius: 6, padding: "8px 0", fontWeight: 800, cursor: !canBuy ? "not-allowed" : "pointer", fontSize: 12 }}>
                      {canBuy ? "Comprar" : "Ouro insuficiente"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {mode === "create" && (
        <div style={{ background: "#1a0f26", border: `1px solid ${isVip ? "#ffd94d" : "#3a2a4a"}`, borderRadius: 10, padding: 16, maxWidth: 480 }}>
          {!isVip && (
            <div style={{ background: "#3a1010", border: "1px solid #ff6b6b55", borderRadius: 8, padding: 10, marginBottom: 12, color: "#ff9d9d", fontSize: 12 }}>
              ✦ Anunciar no mercado é exclusivo VIP. Compre um <b>Livro VIP 30d/60d</b> na Loja para liberar.
            </div>
          )}
          <div style={{ color: "#ffd94d", fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Novo anúncio</div>
          <label style={{ fontSize: 12, color: "#c8b8d0", display: "block", marginBottom: 4 }}>Item</label>
          <select value={selItem} onChange={(e) => setSelItem(e.target.value)}
            style={{ width: "100%", background: "#0e0818", color: "#f3e5c5", border: "1px solid #ffd94d55", borderRadius: 6, padding: 8, marginBottom: 10 }}>
            {Object.keys(npcPrices).map((id) => (
              <option key={id} value={id}>{LABELS[id] ?? id} (tenho {items[id] ?? 0})</option>
            ))}
          </select>
          <label style={{ fontSize: 12, color: "#c8b8d0", display: "block", marginBottom: 4 }}>Quantidade</label>
          <input type="number" min={1} max={999} value={selQty} onChange={(e) => setSelQty(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: "100%", background: "#0e0818", color: "#f3e5c5", border: "1px solid #ffd94d55", borderRadius: 6, padding: 8, marginBottom: 10 }} />
          <label style={{ fontSize: 12, color: "#c8b8d0", display: "block", marginBottom: 4 }}>Preço total (ouro)</label>
          <input type="number" min={1} value={selPrice} onChange={(e) => setSelPrice(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: "100%", background: "#0e0818", color: "#f3e5c5", border: "1px solid #ffd94d55", borderRadius: 6, padding: 8, marginBottom: 12 }} />
          <button disabled={!isVip || (items[selItem] ?? 0) < selQty}
            onClick={async () => { const ok = await onList(selItem, selQty, selPrice); if (ok) { setMode("browse"); void refresh(); } }}
            style={{ width: "100%", background: (!isVip || (items[selItem] ?? 0) < selQty) ? "#333" : "linear-gradient(180deg,#ffd94d,#8b6a10)", color: "#0e0818", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 800, cursor: (!isVip || (items[selItem] ?? 0) < selQty) ? "not-allowed" : "pointer" }}>
            {isVip ? "Publicar anúncio" : "🔒 VIP necessário"}
          </button>
        </div>
      )}

      {mode === "npc" && (
        <>
          <div style={{ color: "#c8a878", fontSize: 12, marginBottom: 10, fontStyle: "italic" }}>Venda rápida ao NPC — preço fixo, sem esperar comprador.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {Object.keys(npcPrices).map((id) => {
              const have = items[id] ?? 0;
              const price = npcPrices[id];
              const disabled = have <= 0;
              return (
                <div key={id} style={{ background: "#1a0f26", border: `1px solid ${disabled ? "#3a2a4a" : "#ff9d3d66"}`, borderRadius: 10, padding: 12, opacity: disabled ? 0.55 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 22 }}>{ICONS[id] ?? "📦"}</div>
                    <div>
                      <div style={{ color: "#f5cf6b", fontWeight: 800, fontSize: 13 }}>{LABELS[id] ?? id}</div>
                      <div style={{ color: "#8a7a9c", fontSize: 11 }}>Estoque: <b style={{ color: "#c8b8d0" }}>{have}</b></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#c8b8d0", marginBottom: 8 }}>NPC: <b style={{ color: "#ff9d3d" }}>{price} ouro / un.</b></div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button disabled={disabled} onClick={() => onNpcSell(id, 1)}
                      style={{ flex: 1, background: disabled ? "#333" : "linear-gradient(180deg,#ff9d3d,#8b4a10)", color: "#0e0818", border: "none", borderRadius: 6, padding: "6px 0", fontWeight: 800, cursor: disabled ? "not-allowed" : "pointer", fontSize: 12 }}>
                      Vender 1
                    </button>
                    <button disabled={disabled || have < 10} onClick={() => onNpcSell(id, 10)}
                      style={{ flex: 1, background: (disabled || have < 10) ? "#333" : "#8b4a10", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", fontWeight: 800, cursor: (disabled || have < 10) ? "not-allowed" : "pointer", fontSize: 12 }}>
                      Vender 10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


function PokemonDetail({ pet, currentHp, src }: { pet: PetInstance; currentHp: number; src: string | undefined }) {

  const base = SPECIES_BASE[pet.species];
  const maxHp = calcIdleMaxHp(pet);
  const hpPct = Math.max(0, (currentHp / maxHp) * 100);
  const xpNeeded = 100 + pet.level * 20;
  const xp = pet.xp ?? 0;
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);
  const now = Date.now();
  const infinite = (ENERGY_REGEN_MS[pet.rarity] ?? 0) === 0;
  const energy = petCurrentEnergy(pet, now);
  const msFull = petMsToFull(pet, now);
  const crit = Math.round(Math.min(60, 5 + pet.level * 0.3 + (((pet.ascensionStats as Record<string, number> | undefined)?.crit) ?? 0) * 0.5) * 10) / 10;

  const rarityColor: Record<string, string> = {
    common: "#a0b4c8", uncommon: "#7ef27a", rare: "#6bd4ff",
    epic: "#c084fc", legendary: "#f5cf6b", mythic: "#ff7ac0", mythic_shiny: "#fff28a",
  };
  const rColor = rarityColor[pet.rarity] ?? "#f5cf6b";

  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(160deg, #1a0f2e 0%, #0b0716 100%)",
      border: `1px solid ${rColor}55`,
      borderRadius: 10,
      padding: 10,
      boxShadow: `0 6px 18px rgba(0,0,0,0.5), inset 0 0 30px ${rColor}12`,
      display: "grid",
      gridTemplateColumns: "150px 1fr",
      gap: 10,
      alignItems: "stretch",
    }}>
      {/* LEFT: PORTRAIT + LEVEL */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{
          position: "relative",
          background: `radial-gradient(circle at 50% 40%, ${rColor}22 0%, #1a0a2e 60%, #0b0510 100%)`,
          border: `1px solid ${rColor}66`,
          borderRadius: 8,
          padding: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 120,
          boxShadow: `inset 0 0 18px ${rColor}22`,
        }}>
          {src && <img src={src} alt="" style={{ width: 96, height: 96, imageRendering: "pixelated", filter: `drop-shadow(0 3px 6px ${rColor}66)` }} />}
          <div style={{
            position: "absolute", top: 4, left: 4,
            fontSize: 8, letterSpacing: 1.5, color: "#8a7a9c", fontWeight: 700,
          }}>Nº {String(Object.keys(SPECIES_BASE).indexOf(pet.species) + 1).padStart(3, "0")}</div>
          <div style={{
            position: "absolute", bottom: 4, right: 4,
            background: "linear-gradient(180deg,#f5cf6b,#b8862a)",
            color: "#1a0f26", padding: "2px 7px", borderRadius: 10,
            fontWeight: 900, fontSize: 10, letterSpacing: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}>LV {pet.level}</div>
        </div>
        <div style={{
          padding: "4px 6px", fontSize: 9, fontWeight: 900, letterSpacing: 1.2,
          color: "#0b0510", background: rColor, borderRadius: 4, textAlign: "center",
        }}>{base.rarity.toUpperCase()}</div>
      </div>

      {/* RIGHT: NAME + BARS + STATS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <div style={{
          fontSize: 18, fontWeight: 900, color: rColor,
          textShadow: `1px 1px 0 #000, 0 0 10px ${rColor}55`,
          letterSpacing: 1.5, lineHeight: 1,
        }}>{pet.species.replace(/_/g, " ").toUpperCase()}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <StatBar label="HP" value={Math.floor(currentHp)} max={maxHp} pct={hpPct} color="#5ec26a" />
          <StatBar label="EXP" value={xp} max={xpNeeded} pct={xpPct} color="#6bd4ff" />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: "#c8b8d0", fontWeight: 700, letterSpacing: 1 }}>⚡ ENERGIA</span>
              <span style={{ color: "#8fd0ff", fontWeight: 700 }}>{infinite ? "∞ MÍTICO" : `${energy}/100${msFull > 0 ? " · " + fmtMS(msFull) : ""}`}</span>
            </div>
            <div style={{ height: 8, background: "#0e1a2e", borderRadius: 3, border: "1px solid rgba(0,0,0,0.6)" }}>
              <div style={{
                width: `${infinite ? 100 : energy}%`, height: "100%", borderRadius: 3,
                background: energy > 30 ? "linear-gradient(90deg,#3b7fd6,#6cb6ff)" : "linear-gradient(90deg,#c74a1a,#ff9a5a)",
              }} />
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          <StatCell label="ATK" value={base.atk} />
          <StatCell label="DEF" value={base.def} />
          <StatCell label="SPA" value={base.spa} />
          <StatCell label="SPD" value={base.spd} />
          <StatCell label="VEL" value={base.spe} />
          <StatCell label="HP" value={maxHp} />
          <StatCell label="CRIT" value={crit} />
        </div>

        {pet.ascensionStats && Object.keys(pet.ascensionStats).length > 0 && (
          <div style={{
            background: "linear-gradient(180deg, rgba(20,40,25,0.7), rgba(11,20,14,0.7))",
            border: "1px solid rgba(126,242,122,0.35)",
            borderRadius: 6, padding: "5px 7px",
          }}>
            <div style={{ color: "#7ef27a", fontSize: 9, fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>✨ ASCENSÃO</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {(["hp","atk","def","spa","spd","spe","crit"] as const).map((k) => {
                const v = (pet.ascensionStats as Record<string, number>)[k];
                if (!v) return null;
                const lbl: Record<string,string> = { hp:"HP", atk:"ATK", def:"DEF", spa:"SPA", spd:"SPD", spe:"VEL", crit:"CRIT" };
                return <StatCell key={k} label={`+${lbl[k]}`} value={v} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function StatBar({ label, value, max, pct, color }: { label: string; value: number; max: number; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
        <span style={{ color: "#c8b8d0", fontWeight: 700, letterSpacing: 1 }}>{label}</span>
        <span style={{ color: "#f5cf6b", fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 8, background: "#2a0808", borderRadius: 3, border: "1px solid rgba(0,0,0,0.6)" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          boxShadow: `0 0 6px ${color}66`,
          transition: "width 300ms",
        }} />
      </div>
    </div>
  );
}
function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #1a0f26, #0b0510)",
      border: "1px solid rgba(245,207,107,0.22)",
      borderRadius: 4, padding: "3px 4px", textAlign: "center",
    }}>
      <div style={{ fontSize: 8, color: "#8a7a9c", letterSpacing: 1, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#f3e5c5", textShadow: "1px 1px 0 #000" }}>{value}</div>
    </div>
  );
}


// ===== Descrições curtas por raridade (fallback) e por espécie =====
const SPECIES_LORE: Partial<Record<Species, string>> = {
  charmander: "Um lagarto de fogo curioso. A chama em sua cauda revela seu ânimo — cresce quando saudável e feliz.",
  charmeleon: "Mais feroz e territorial, seu fogo já queima florestas inteiras se não for controlado.",
  charizard: "Poderoso dragão de fogo. Sua chama derrete rochas e voa acima das nuvens com facilidade.",
  bulbasaur: "Carrega uma semente nas costas que absorve luz solar para crescer aos poucos.",
  ivysaur: "A semente floresceu em um botão pesado que anuncia sua próxima evolução.",
  venusaur: "Sua flor libera aromas relaxantes; é conhecido por sua paciência e imensa força.",
  squirtle: "Esconde-se em seu casco quando ameaçado e dispara jatos d'água precisos.",
  wartortle: "Sua cauda peluda é sinal de longevidade — símbolo de sabedoria e sorte.",
  blastoise: "Canhões d'água de alta pressão em seu casco podem furar aço grosso.",
  pikachu: "Mochila elétrica ambulante. Solta faíscas quando surpreso ou emocionado.",
  mewtwo: "Criado em laboratório com propósitos bélicos — sua mente é uma tempestade psíquica.",
  mew: "Considerado ancestral de todos os Pokémon. Aparece somente para corações puros.",
  lucario: "Sente e manipula a aura ao seu redor; capaz de prever movimentos antes que aconteçam.",
};
const RARITY_LORE: Partial<Record<Rarity, string>> = {
  common: "Um companheiro leal — comum, mas cheio de potencial nas mãos certas.",
  uncommon: "Um pouco acima da média. Boa base para longas jornadas.",
  rare: "Raro de se encontrar — atrai olhares por onde passa.",
  epic: "Épico em batalha, temido por treinadores iniciantes.",
  legendary: "Um lendário — poucos treinadores têm o privilégio de encontrá-lo.",
  mythic: "Ser mítico e atemporal. Sua presença altera o curso do combate.",
  mythic_shiny: "Mítico brilhante — uma variante quase impossível de existir.",
};
function SpeciesLore({ species, rarity }: { species: Species; rarity: Rarity }) {
  const lore = SPECIES_LORE[species] ?? RARITY_LORE[rarity] ?? "Um Pokémon único, com história ainda por contar.";
  return (
    <div style={{
      marginTop: 14,
      background: "linear-gradient(135deg, #2a1a3e 0%, #1a0f26 100%)",
      border: "1px solid rgba(245,207,107,0.35)",
      borderRadius: 10, padding: 14,
      boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>📖</span>
        <span style={{ color: "#f5cf6b", fontWeight: 900, fontSize: 12, letterSpacing: 2 }}>SOBRE {species.replace(/_/g, " ").toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 13, color: "#e8dbe5", lineHeight: 1.55, fontStyle: "italic" }}>&ldquo;{lore}&rdquo;</div>
    </div>
  );
}
function ActiveBonuses({ leaderRarity, buffs }: {
  leaderRarity: Rarity;
  buffs: { atk: number; def: number; expMult: number; expMultUntil?: number; goldMult?: number; goldMultUntil?: number };
}) {
  const now = Date.now();
  const expActive = !!(buffs.expMultUntil && now < buffs.expMultUntil);
  const goldActive = !!(buffs.goldMultUntil && now < buffs.goldMultUntil);
  const rarityDropBonus: Partial<Record<Rarity, number>> = {
    rare: 0.03, epic: 0.07, legendary: 0.10, mythic: 0.15, mythic_shiny: 0.20,
  };
  const rarityBonus = rarityDropBonus[leaderRarity] ?? 0;
  const totalXpPct = Math.round(((expActive ? buffs.expMult : 0) + rarityBonus) * 100);
  const totalGoldPct = Math.round(((goldActive ? (buffs.goldMult ?? 0) : 0) + rarityBonus) * 100);
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 24 ? `${Math.floor(h / 24)}d` : (h > 0 ? `${h}h ${m}m` : `${m}m`);
  };
  const Chip = ({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) => (
    <div style={{
      background: `linear-gradient(180deg, ${color}22, ${color}08)`,
      border: `1px solid ${color}66`, borderRadius: 8, padding: "8px 10px",
      minWidth: 110, flex: "1 1 120px",
    }}>
      <div style={{ fontSize: 10, color: "#c8b8d0", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color, textShadow: "1px 1px 0 #000" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#8a7a9c", marginTop: 2 }}>{sub}</div>}
    </div>
  );
  return (
    <div style={{
      marginTop: 14,
      background: "#1a0f26", border: "1px solid rgba(245,207,107,0.15)",
      borderRadius: 10, padding: 12,
    }}>
      <div style={{ color: "#f5cf6b", fontSize: 12, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>✨ BÔNUS ATIVOS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Chip label="EXP TOTAL" value={`+${totalXpPct}%`} color="#6bd4ff"
          sub={`${expActive ? `Livro +${Math.round(buffs.expMult * 100)}% (${fmt(buffs.expMultUntil! - now)})` : "Sem livro"} · Líder +${Math.round(rarityBonus * 100)}%`} />
        <Chip label="OURO TOTAL" value={`+${totalGoldPct}%`} color="#ffd94d"
          sub={`${goldActive ? `VIP +${Math.round((buffs.goldMult ?? 0) * 100)}% (${fmt(buffs.goldMultUntil! - now)})` : "Sem VIP"} · Líder +${Math.round(rarityBonus * 100)}%`} />
        <Chip label="DROP ITENS" value={`+${Math.round(rarityBonus * 100)}%`} color="#c084fc"
          sub={`Vem da raridade do líder (${leaderRarity})`} />
        <Chip label="ATK / DEF" value={`+${Math.round(buffs.atk * 100)}% / -${Math.round(buffs.def * 100)}%`} color="#ff7a3d"
          sub={`Livros permanentes de ATK / DEF`} />
      </div>
    </div>
  );
}


