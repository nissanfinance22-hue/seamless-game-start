import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, useMemo, type CSSProperties } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { assetUrl } from "@/lib/assetUrl";
import { FAKE_PLAYERS, type BotPlayer } from "@/game/bots";
import { AuthGate, loadIdentity, IDENTITY_KEY } from "@/components/AuthGate";
import { ProfessorOakGuide, type GuideTopic } from "@/components/ProfessorOakGuide";
import { TrainerTreeOverlay } from "@/components/TrainerTreeOverlay";
import { CaptainNavioOverlay } from "@/components/CaptainNavioOverlay";
import { VelhoDosMaresOverlay, loadCraftStore } from "@/components/VelhoDosMaresOverlay";
import { KurtCraftOverlay } from "@/components/KurtCraftOverlay";
import { KurtDialogOverlay } from "@/components/KurtDialogOverlay";
import { MercadorMateriaisOverlay, loadMaterialsStore, saveMaterialsStore, MATERIALS as MATERIAL_DEFS, type MaterialId } from "@/components/MercadorMateriaisOverlay";
import { MoranguinhoOverlay } from "@/components/MoranguinhoOverlay";
import { BotanistOverlay } from "@/components/BotanistOverlay";
import { FishermanOverlay, bumpCaterpieCount } from "@/components/FishermanOverlay";
import npcMoranguinhoAsset from "@/assets/npc-moranguinho.png.asset.json";
const npcMoranguinho = npcMoranguinhoAsset.url;
import npcGustavo from "@/assets/npc-gustavo.png";
import npcKurtAsset from "@/assets/npc-kurt.png.asset.json";
import npcBotanistAsset from "@/assets/npc-botanist.png.asset.json";
import npcFishermanAsset from "@/assets/npc-fisherman.png.asset.json";
const npcKurtSprite = npcKurtAsset.url;
const npcBotanistSprite = npcBotanistAsset.url;
const npcFishermanSprite = npcFishermanAsset.url;
import npcTreeTrainerAsset from "@/assets/npc-tree-trainer.png.asset.json";
const npcTreeTrainerSprite = npcTreeTrainerAsset.url;
import imgCraftMadeira from "@/assets/craft/madeira.png";
import imgLenha from "@/assets/materials/lenha.png";
import imgSucataIcon from "@/assets/materials/sucata.png";
import imgCraftPecas from "@/assets/craft/pecas.png";
import imgCraftCorda from "@/assets/craft/corda.png";
import imgCraftAncora from "@/assets/craft/ancora.png";
import imgCraftCombustivel from "@/assets/craft/combustivel.png";
import imgCraftCarta from "@/assets/craft/carta.png";
import treeFullAsset from "@/assets/harvest/tree-full.png.asset.json";
import treeChopAsset from "@/assets/harvest/tree-chop.png.asset.json";
import treeStumpAsset from "@/assets/harvest/tree-stump.png.asset.json";
import treeStrawberryAsset from "@/assets/harvest/tree-strawberry.png.asset.json";
import treeYellowAsset from "@/assets/harvest/tree-yellow.png.asset.json";
import treePinkAsset from "@/assets/harvest/tree-pink.png.asset.json";
import treeChopSfxAsset from "@/assets/sfx/tree-chop.mp3.asset.json";
const TREE_FULL_SRC = treeFullAsset.url;
const TREE_CHOP_SRC = treeChopAsset.url;
const TREE_STUMP_SRC = treeStumpAsset.url;
const TREE_CHOP_SFX_URL = treeChopSfxAsset.url;
function playTreeChopSfx(volume = 0.6) {
  if (typeof window === "undefined") return;
  try {
    const a = new Audio(TREE_CHOP_SFX_URL);
    a.volume = volume;
    void a.play().catch(() => {});
  } catch { /* ignore */ }
}
type TreeKind = "wood" | "strawberry" | "lemon" | "pink";
const TREE_VARIANTS: Record<TreeKind, { src: string; itemKey: string; itemName: string; icon: string; desc: string; msg: string }> = {
  wood:       { src: TREE_FULL_SRC,        itemKey: "lenha", itemName: "LENHA",  icon: "🪵", desc: "Toras de madeira boa colhidas de árvores selvagens. Base de craft.", msg: "+1 Lenha! 🪵" },
  strawberry: { src: treeStrawberryAsset.url, itemKey: "fruta_morango",  itemName: "MORANGO SILVESTRE", icon: "🍓", desc: "Morango doce colhido de uma árvore mágica.", msg: "+1 Morango! 🍓" },
  lemon:      { src: treeYellowAsset.url,  itemKey: "fruta_limao",   itemName: "LIMÃO DOURADO",    icon: "🍋", desc: "Cítrico dourado, raro e perfumado.", msg: "+1 Limão Dourado! 🍋" },
  pink:       { src: treePinkAsset.url,    itemKey: "fruta_rosa",    itemName: "BAGA ROSA",        icon: "🌸", desc: "Pequena baga rosa de árvore florida.", msg: "+1 Baga Rosa! 🌸" },
};

import { scheduleCloudSync } from "@/lib/cloudSave";
import { loadLatestValid, saveNow, manualSave } from "@/lib/localSave";
import { recordRankedScore, fetchTopRanked, fetchCurrentSeason, type RankedRow } from "@/lib/rankedApi";
void scheduleCloudSync;
import trainerSheet from "@/assets/trainer.png";
import iconPokeball from "@/assets/icon-pokeball.png";
import iconFastball from "@/assets/icon-fastball.png";
import iconUltraball from "@/assets/icon-ultraball.png";
import iconGreatball from "@/assets/icon-greatball.png";
import iconSafariball from "@/assets/icon-safariball.png";
import iconMasterball from "@/assets/ball-master.png";
import trainerRed from "@/assets/trainer-red.png";
import artBag from "@/assets/menu-art/bag.png";
import artStatus from "@/assets/menu-art/status.png";
import artAscension from "@/assets/menu-art/ascension.png";
import imgRareCandy from "@/assets/items/rare-candy.png";
import imgStarDust from "@/assets/items/star-dust.png";
import artAlbum from "@/assets/menu-art/album.png";
import artDrive from "@/assets/menu-art/drive.png";
import artPvp from "@/assets/menu-art/pvp.png";
import artGuild from "@/assets/menu-art/guild.png";
import artMarket from "@/assets/menu-art/market.png";
import artShop from "@/assets/menu-art/shop.png";
import artAutohuntAsset from "@/assets/menu-art/autohunt.png.asset.json";
const artAutohunt = artAutohuntAsset.url;
import artRanked from "@/assets/menu-art/ranked.png";
import artTree from "@/assets/menu-art/tree.png";
import artParty from "@/assets/menu-art/party.png";
import trainerYellow from "@/assets/trainer-yellow.png";
import npcDepotAgent from "@/assets/npc-depot-agent.png";
import npcStylistLucy from "@/assets/npc-stylist-lucy.png";
import npcParasolLady from "@/assets/npc-parasol-lady.png";
import npcPilot from "@/assets/npc-pilot.png";
import npcHiker from "@/assets/npc-hiker.png";
import npcColress from "@/assets/npc-colress.png";
import npcChuck from "@/assets/npc-chuck.png";
import npcCheerleaders from "@/assets/npc-cheerleaders.png";
import npcBlaine from "@/assets/npc-blaine.png";
import npcNinjaBeni from "@/assets/npc-ninja-beni.png";
import trainerLucy from "@/assets/trainer-lucy.png";

import npcGreenSprite from "@/assets/npc-trainer-green.png";
import npcSoldierSprite from "@/assets/npc-trainer-soldier.png";
import npcFighterSprite from "@/assets/npc-trainer-fighter.png";
import dragoniteMailGif from "@/assets/dragonite-mail.gif";

const BALL_ICON: Record<BallId, string> = {
  pokeball: iconPokeball,
  greatball: iconGreatball,
  fastball: iconFastball,
  ultraball: iconUltraball,
  safariball: iconSafariball,
  masterball: iconMasterball,
};

function BallImg({ id, size = 14 }: { id: BallId; size?: number }) {
  return <img src={BALL_ICON[id]} alt={id} className="pixelated" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }} />;
}

const AVATAR_PRESETS: { id: string; name: string; hue: number; sheet: string }[] = [
  { id: "classic",  name: "CLASSICO",  hue: 0,   sheet: trainerSheet },
  { id: "red",      name: "BRAWLER",   hue: 0,   sheet: trainerRed },
  { id: "yellow",   name: "RANGER",    hue: 0,   sheet: trainerYellow },
  { id: "lucy",     name: "RAINHA",    hue: 0,   sheet: trainerLucy },
  { id: "blue",     name: "AZUL",      hue: 180, sheet: trainerSheet },
  { id: "green",    name: "VERDE",     hue: 90,  sheet: trainerSheet },
  { id: "purple",   name: "ROXO",      hue: 270, sheet: trainerSheet },
  { id: "gold",     name: "DOURADO",   hue: 45,  sheet: trainerSheet },
];
import mapForestAsset from "@/assets/map-forest.png.asset.json";
const mapForest = mapForestAsset.url;
import mapCidadeAsset from "@/assets/cidade-principal.png.asset.json";
const mapVillage = mapCidadeAsset.url;
import mapRoute2Asset from "@/assets/map-route2.webp.asset.json";
const mapRoute2 = mapRoute2Asset.url;
import mapRoute3Asset from "@/assets/map-route3.png.asset.json";
const mapRoute3 = mapRoute3Asset.url;
import mapForestCaveAsset from "@/assets/map-forest-cave.png.asset.json";
const mapForestCave = mapForestCaveAsset.url;
import mapCave1Asset from "@/assets/map-cave1.png.asset.json";
const mapCave1 = mapCave1Asset.url;
import mapCave2Asset from "@/assets/map-cave2.png.asset.json";
const mapCave2 = mapCave2Asset.url;
import mapPalletRouteAsset from "@/assets/map-pallet-route.png.asset.json";
const mapPalletRoute = mapPalletRouteAsset.url;
import mapViridianAsset from "@/assets/map-viridian.png.asset.json";
const mapViridian = mapViridianAsset.url;
import mapRoute22Asset from "@/assets/map-route22.png.asset.json";
const mapRoute22 = mapRoute22Asset.url;
import mapVictoryRoadAsset from "@/assets/map-victoryroad.png.asset.json";
const mapVictoryRoad = mapVictoryRoadAsset.url;
import map23Asset from "@/assets/map-23.png.asset.json";
const map23 = map23Asset.url;
import mapFlorestaSecretaAsset from "@/assets/map-floresta-secreta.png.asset.json";
const mapFlorestaSecreta = mapFlorestaSecretaAsset.url;
import mapDesertAsset from "@/assets/map-desert.png.asset.json";
const mapDesert = mapDesertAsset.url;
import mapEliteRouteAsset from "@/assets/map-elite-route.png.asset.json";
const mapEliteRoute = mapEliteRouteAsset.url;
import mapVenenoAsset from "@/assets/map-veneno.png.asset.json";
const mapVeneno = mapVenenoAsset.url;
import signEliteAsset from "@/assets/sign-elite.png.asset.json";
const signElite = signEliteAsset.url;
import signDesertAsset from "@/assets/sign-desert.png.asset.json";
const signDesert = signDesertAsset.url;
import mapPkmartAsset from "@/assets/map-pkmart.png.asset.json";
const mapPkmart = mapPkmartAsset.url;
import mapPkcAsset from "@/assets/map-pkc.png.asset.json";
const mapPkc = mapPkcAsset.url;
import mapLaboAsset from "@/assets/map-labo.png.asset.json";
const mapLabo = mapLaboAsset.url;



import dashboardBg from "@/assets/menu-bg.png.asset.json";
import mewTransitionAsset from "@/assets/mew-transition.mp4.asset.json";
const mewTransitionVideo = mewTransitionAsset.url;
const MEW_TRANSITION_MAPS = new Set<string>([]);
import charmeleonGif from "@/assets/charmeleon.gif";
import bulbasaurGif from "@/assets/bulbasaur.gif";
import vulpixGif from "@/assets/vulpix.gif";
import jigglypuffGif from "@/assets/jigglypuff.gif";
import caterpieGif from "@/assets/caterpie.gif";
import charmanderGif from "@/assets/charmander.gif";
import squirtleGif from "@/assets/squirtle.gif";
import charizardGif from "@/assets/charizard.gif";
import ivysaurGif from "@/assets/ivysaur.gif";
import venusaurGif from "@/assets/venusaur.gif";
import butterfreeGif from "@/assets/butterfree.gif";
import bulbasaurHatGif from "@/assets/bulbasaur-hat.gif";
import pikachuGif from "@/assets/pikachu.gif";
import sandslashGif from "@/assets/sandslash.gif";
import mewtwoGif from "@/assets/mewtwo.gif";
import onixGif from "@/assets/onix.gif";
import pinsirGif from "@/assets/pinsir.gif";
import magmarGif from "@/assets/magmar.gif";
import hitmonchanGif from "@/assets/hitmonchan.gif";
import golemGif from "@/assets/golem.gif";
import aerodactylGif from "@/assets/aerodactyl.gif";
import arbokGif from "@/assets/arbok.gif";
import charizardShinyGif from "@/assets/charizard-shiny.gif";
import charizardAltGif from "@/assets/charizard-alt.gif";
import moltresGif from "@/assets/moltres.gif";
import zapdosGif from "@/assets/zapdos.gif";
import articunoGif from "@/assets/articuno.gif";
import virizionAsset from "@/assets/legends/virizion.gif.asset.json";
import raikouAsset from "@/assets/legends/raikou.gif.asset.json";
import suicuneAsset from "@/assets/legends/suicune.gif.asset.json";
import suicuneShinyAsset from "@/assets/legends/suicune-shiny.gif.asset.json";
import luxrayFAsset from "@/assets/legends/luxray-f.gif.asset.json";
import mewGif from "@/assets/mew.gif";
import dragoniteGif from "@/assets/dragonite.gif";
import metapodGif from "@/assets/metapod.gif";
import beedrillGif from "@/assets/beedrill.gif";
import pidgeyGif from "@/assets/pidgey.gif";
import pidgeotGif from "@/assets/pidgeot.gif";
import vileplumeGif from "@/assets/vileplume.gif";
import tangelaGif from "@/assets/tangela.gif";
import kabutopsGif from "@/assets/kabutops.gif";
import laprasAsset from "@/assets/lapras.gif.asset.json";
import vaporeonAsset from "@/assets/vaporeon.gif.asset.json";
import dragonairAsset from "@/assets/dragonair.gif.asset.json";
import gyaradosAsset from "@/assets/gyarados.gif.asset.json";
import jolteonAsset from "@/assets/jolteon.gif.asset.json";
import jolteonShinyAsset from "@/assets/jolteon-shiny.gif.asset.json";
import vaporeonShinyAsset from "@/assets/vaporeon-shiny.gif.asset.json";
import blazikenAsset from "@/assets/blaziken.gif.asset.json";
const blazikenGif = blazikenAsset.url;
const laprasGif = laprasAsset.url;
const vaporeonGif = vaporeonAsset.url;
const dragonairGif = dragonairAsset.url;
const gyaradosGif = gyaradosAsset.url;
const jolteonGif = jolteonAsset.url;
const jolteonShinyGif = jolteonShinyAsset.url;
const vaporeonShinyGif = vaporeonShinyAsset.url;
import flareonAsset from "@/assets/flareon.gif.asset.json";
import flareonShinyAsset from "@/assets/flareon-shiny.gif.asset.json";
import snorlaxAsset from "@/assets/snorlax.gif.asset.json";
import dragoniteShinyAsset from "@/assets/dragonite-shiny.gif.asset.json";
import mewAltAsset from "@/assets/mew-alt.gif.asset.json";
import raichuAsset from "@/assets/raichu.gif.asset.json";
const flareonGif = flareonAsset.url;
const flareonShinyGif = flareonShinyAsset.url;
const snorlaxGif = snorlaxAsset.url;
const dragoniteShinyGif = dragoniteShinyAsset.url;
const mewAltGif = mewAltAsset.url;
const raichuGif = raichuAsset.url;
import weedleAsset from "@/assets/weedle.gif.asset.json";
import weedleShinyAsset from "@/assets/weedle-shiny.gif.asset.json";
import kakunaAsset from "@/assets/kakuna.gif.asset.json";
import kakunaShinyAsset from "@/assets/kakuna-shiny.gif.asset.json";
import metapodShinyAsset from "@/assets/metapod-shiny.gif.asset.json";
import butterfreeShinyAsset from "@/assets/butterfree-shiny.gif.asset.json";
import rattataFAsset from "@/assets/rattata-f.gif.asset.json";
import raticateFAsset from "@/assets/raticate-f.gif.asset.json";
import sandshrewAsset from "@/assets/sandshrew.gif.asset.json";
import sandshrewShinyAsset from "@/assets/sandshrew-shiny.gif.asset.json";
import sandslashShinyAsset from "@/assets/sandslash-shiny.gif.asset.json";
import ekansAsset from "@/assets/ekans.gif.asset.json";
import fearowAsset from "@/assets/fearow.gif.asset.json";
import pidgeottoAsset from "@/assets/pidgeotto.gif.asset.json";
import wartortleAsset from "@/assets/wartortle.gif.asset.json";
import wartortleShinyAsset from "@/assets/wartortle-shiny.gif.asset.json";
import blastoiseAsset from "@/assets/blastoise.gif.asset.json";
import blastoiseShinyAsset from "@/assets/blastoise-shiny.gif.asset.json";
const weedleGif = weedleAsset.url;
const weedleShinyGif = weedleShinyAsset.url;
const kakunaGif = kakunaAsset.url;
const kakunaShinyGif = kakunaShinyAsset.url;
const metapodShinyGif = metapodShinyAsset.url;
const butterfreeShinyGif = butterfreeShinyAsset.url;
const rattataFGif = rattataFAsset.url;
const raticateFGif = raticateFAsset.url;
const sandshrewGif = sandshrewAsset.url;
const sandshrewShinyGif = sandshrewShinyAsset.url;
const sandslashShinyGif = sandslashShinyAsset.url;
const ekansGif = ekansAsset.url;
const fearowGif = fearowAsset.url;
const pidgeottoGif = pidgeottoAsset.url;
const wartortleGif = wartortleAsset.url;
const wartortleShinyGif = wartortleShinyAsset.url;
const blastoiseGif = blastoiseAsset.url;
const blastoiseShinyGif = blastoiseShinyAsset.url;
// Pack POKÉDEX Ruby M
import abraAsset from "@/assets/abra.gif.asset.json";
import kadabraAsset from "@/assets/kadabra.gif.asset.json";
import arcanineAsset from "@/assets/arcanine.gif.asset.json";
import growlitheAsset from "@/assets/growlithe.gif.asset.json";
import bellsproutAsset from "@/assets/bellsprout.gif.asset.json";
import gloomAsset from "@/assets/gloom.gif.asset.json";
import oddishAsset from "@/assets/oddish.gif.asset.json";
import clefableAsset from "@/assets/clefable.gif.asset.json";
import clefairyAsset from "@/assets/clefairy.gif.asset.json";
import cuboneAsset from "@/assets/cubone.gif.asset.json";
import diglettAsset from "@/assets/diglett.gif.asset.json";
import magnemiteAsset from "@/assets/magnemite.gif.asset.json";
import machampAsset from "@/assets/machamp.gif.asset.json";
import machokeAsset from "@/assets/machoke.gif.asset.json";
import machopAsset from "@/assets/machop.gif.asset.json";
import mankeyAsset from "@/assets/mankey.gif.asset.json";
import primeapeAsset from "@/assets/primeape.gif.asset.json";
import meowthAsset from "@/assets/meowth.gif.asset.json";
import persianAsset from "@/assets/persian.gif.asset.json";
import nidokingAsset from "@/assets/nidoking.gif.asset.json";
import nidoranFAsset from "@/assets/nidoran-f.gif.asset.json";
import nidorinaAsset from "@/assets/nidorina.gif.asset.json";
import ninetalesAsset from "@/assets/ninetales.gif.asset.json";
import parasAsset from "@/assets/paras.gif.asset.json";
import parasectAsset from "@/assets/parasect.gif.asset.json";
import poliwagAsset from "@/assets/poliwag.gif.asset.json";
import poliwhirlAsset from "@/assets/poliwhirl.gif.asset.json";
import poliwrathAsset from "@/assets/poliwrath.gif.asset.json";
import psyduckAsset from "@/assets/psyduck.gif.asset.json";
import venonatAsset from "@/assets/venonat.gif.asset.json";
import venomothAsset from "@/assets/venomoth.gif.asset.json";
import zubatAsset from "@/assets/zubat.gif.asset.json";
const abraGif = abraAsset.url, kadabraGif = kadabraAsset.url, arcanineGif = arcanineAsset.url,
  growlitheGif = growlitheAsset.url, bellsproutGif = bellsproutAsset.url, gloomGif = gloomAsset.url,
  oddishGif = oddishAsset.url, clefableGif = clefableAsset.url, clefairyGif = clefairyAsset.url,
  cuboneGif = cuboneAsset.url, diglettGif = diglettAsset.url, magnemiteGif = magnemiteAsset.url,
  machampGif = machampAsset.url, machokeGif = machokeAsset.url, machopGif = machopAsset.url,
  mankeyGif = mankeyAsset.url, primeapeGif = primeapeAsset.url, meowthGif = meowthAsset.url,
  persianGif = persianAsset.url, nidokingGif = nidokingAsset.url, nidoranFGif = nidoranFAsset.url,
  nidorinaGif = nidorinaAsset.url, ninetalesGif = ninetalesAsset.url, parasGif = parasAsset.url,
  parasectGif = parasectAsset.url, poliwagGif = poliwagAsset.url, poliwhirlGif = poliwhirlAsset.url,
  poliwrathGif = poliwrathAsset.url, psyduckGif = psyduckAsset.url, venonatGif = venonatAsset.url,
  venomothGif = venomothAsset.url, zubatGif = zubatAsset.url;
import introHero from "@/assets/intro-hero.jpg";
import npcOakSprite from "@/assets/npc-oak.png";
import npcGhetsisSprite from "@/assets/npc-ghetsis.gif";
import npcRedGen5Sprite from "@/assets/npc-red-gen5.gif";
import npcFloralSprite from "@/assets/npc-floral.gif";
import {
  type PetInstance, type BallId, type MarketListing, type Species, type Rarity,
  makePet, gainXp, catchChance, BALLS, SPECIES_BASE, RARITY_COLOR, RARITY_NAME,
  ShopOverlay, MarketOverlay, StatsOverlay, SHOP, calcStat, calcMaxHp, isFainted, feedStrawberry,
  GoldCoin, rollAscensionStats, RareMushroom,
  FAINT_REVIVE_MS, RARITY_XP_BONUS, RARITY_HEAL_CHANCE,
  isStarving, decayHungerForPet, feedHunger, LEMON_HUNGER_GAIN,
} from "@/game/systems";

import { useAdminLive, markPlacedKilled } from "@/components/admin/runtime";
import { ensureCollision, isWalkable, markWalkableRect, markBlockedRect } from "@/game/collision";
import { getDex, resolveActionMoves, moveToSkillId } from "@/game/movesets";
import iconDrive from "@/assets/icon-drive.png";
import iconCoinCase from "@/assets/icon-coincase.png";
import iconBag from "@/assets/icon-bag.png";
import { GuildOverlay } from "@/components/GuildOverlay";
import { PartyOverlay } from "@/components/PartyOverlay";
import { subscribePartyChannel, broadcastToParty, listInvitesFor as listPartyInvitesFor, type PartyBroadcastEvent } from "@/game/party";
import { MusicPlayer } from "@/components/MusicPlayer";
import { getMusicState, subscribeMusic, setMuted, setVolume } from "@/lib/musicControl";
import { guildImageFor, type Guild } from "@/game/guild";
import {
  fetchMyGuild, createGuildRemote, sendInviteByUsername, sendInviteToPlayer,
  fetchPendingInvites, acceptInvite, declineInvite, kickMemberRemote,
  leaveGuildRemote, dissolveGuildRemote, donateToGuildRemote,
  donateResourceRemote, evolveGuildRemote, setViceLeaderRemote,
  subscribeMyInvites,
} from "@/lib/guildApi";

import { toast } from "sonner";
import { isBoundLocked, addBound } from "@/components/admin/adminStore";
import QuestLogOverlay, { activeQuestsCount } from "@/components/QuestLogOverlay";
import { advanceQuestStep, QUESTS as QUEST_DEFS } from "@/game/quests";



import { redirect } from "@tanstack/react-router";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gameDb = supabase as any;

export const Route = createFileRoute("/")({
  // Só modo idle: redireciona a raiz para /idle
  beforeLoad: () => {
    throw redirect({ to: "/idle" });
  },
  component: () => null,
});


// ===== Constants =====
const TILE = 18;
const PLAYER_DRAW = 44;
const PET_DRAW = 36;
const WILD_DRAW = 46;
const VIEW_W = 360;
const VIEW_H = 480;
const PET_TRAIL_LENGTH = 5;
const MAX_WILDS_PER_MAP = 6;
const TEAM_MAX = 6;
const FRAGMENT_POINTS: Record<string, number> = {
  common: 1, uncommon: 3, rare: 8, epic: 25, mythic: 100,
};
const SPECIES_SCALE: Partial<Record<Species, number>> = {
  mewtwo: 1.2,
  charizard: 1.45, charizard_alt: 1.45, charizard_shiny: 1.45,
  articuno: 1.15, moltres: 1.15, zapdos: 1.15,
  mew: 1.1, dragonite: 1.22,
  caterpie: 0.55,
  pikachu: 0.7,
  bulbasaur: 0.7,
  squirtle: 0.7,
  charmander: 0.7,
  ivysaur: 0.85, venusaur: 1.0,
  charmeleon: 0.85,
  weedle: 0.55, kakuna: 0.6, metapod_shiny: 0.6,
  rattata_f: 0.6, sandshrew: 0.65, ekans: 0.7,
  pidgeotto: 0.8, fearow: 0.9,
  wartortle: 0.8, wartortle_shiny: 0.8,
  blastoise: 1.0, blastoise_shiny: 1.0,
  raticate_f: 0.75, sandshrew_shiny: 0.65,
  weedle_shiny: 0.55, kakuna_shiny: 0.6,
  butterfree_shiny: 0.9, sandslash_shiny: 0.95,
};
const SPAWN_MIN_MS = 20_000;
const SPAWN_MAX_MS = 40_000;
const PRESENCE_INTERVAL_MS = 800;
const PRESENCE_TIMEOUT_MS = 25_000;
const WEATHER_INTERVAL_MS = 5 * 60 * 1000;
const SAVE_KEY = "rubym.save.v2";

type Dir = "down" | "left" | "right" | "up";
const DIR_ROW: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };

// ===== CODEX / ÁLBUM DE FIGURINHAS =====
export type CodexCategory = "starters" | "forest" | "mountain" | "legends";
export interface CodexEntry {
  id: string;
  species: Species;
  category: CodexCategory;
}

export const CODEX_ENTRIES: CodexEntry[] = [
  // Page 1 - Starters & Friends
  { id: "c1", species: "bulbasaur", category: "starters" },
  { id: "c2", species: "charmander", category: "starters" },
  { id: "c3", species: "squirtle", category: "starters" },
  { id: "c4", species: "pikachu", category: "starters" },
  // Page 2 - Forest
  { id: "c5", species: "caterpie", category: "forest" },
  { id: "c6", species: "metapod", category: "forest" },
  { id: "c7", species: "butterfree", category: "forest" },
  { id: "c8", species: "pidgey", category: "forest" },
  // Page 3 - Forest Rare
  { id: "c9", species: "beedrill", category: "forest" },
  { id: "c10", species: "pidgeot", category: "forest" },
  { id: "c11", species: "vileplume", category: "forest" },
  { id: "c12", species: "tangela", category: "forest" },
  // Page 4 - Mountain
  { id: "c13", species: "onix", category: "mountain" },
  { id: "c14", species: "golem", category: "mountain" },
  { id: "c15", species: "pinsir", category: "forest" },
  { id: "c16", species: "sandslash", category: "mountain" },
  // Page 5 - Rare Spawns
  { id: "c17", species: "magmar", category: "mountain" },
  { id: "c18", species: "hitmonchan", category: "mountain" },
  { id: "c19", species: "aerodactyl", category: "mountain" },
  { id: "c20", species: "kabutops", category: "mountain" },
  // Page 6 - Legends
  { id: "c21", species: "articuno", category: "legends" },
  { id: "c22", species: "zapdos", category: "legends" },
  { id: "c23", species: "moltres", category: "legends" },
  { id: "c24", species: "mewtwo", category: "legends" },
  // Page 7 - Special
  { id: "c25", species: "mew", category: "legends" },
  { id: "c26", species: "dragonite", category: "legends" },
  { id: "c27", species: "charizard", category: "starters" },
  { id: "c28", species: "venusaur", category: "starters" },
];

export const CODEX_REWARDS: Record<CodexCategory, { gold: number; crystal: number; item?: string }> = {
  starters: { gold: 2000, crystal: 10, item: "rare_candy" },
  forest: { gold: 5000, crystal: 20, item: "rare_candy" },
  mountain: { gold: 8000, crystal: 30, item: "rare_candy" },
  legends: { gold: 50000, crystal: 500, item: "rare_candy" },
};

const SPECIES_GIF: Record<Species, string> = {
  charmeleon: charmeleonGif, bulbasaur: bulbasaurGif, vulpix: vulpixGif,
  jigglypuff: jigglypuffGif, caterpie: caterpieGif,
  charmander: charmanderGif, squirtle: squirtleGif, charizard: charizardGif,
  ivysaur: ivysaurGif, venusaur: venusaurGif, butterfree: butterfreeGif,
  bulbasaur_hat: bulbasaurHatGif, pikachu: pikachuGif, sandslash: sandslashGif,
  mewtwo: mewtwoGif, onix: onixGif, pinsir: pinsirGif, magmar: magmarGif,
  hitmonchan: hitmonchanGif, golem: golemGif, aerodactyl: aerodactylGif,
  arbok: arbokGif, charizard_shiny: charizardShinyGif, charizard_alt: charizardAltGif,
  moltres: moltresGif, zapdos: zapdosGif, articuno: articunoGif,
  mew: mewGif, dragonite: dragoniteGif,
  metapod: metapodGif, beedrill: beedrillGif, pidgey: pidgeyGif, pidgeot: pidgeotGif,
  vileplume: vileplumeGif, tangela: tangelaGif, kabutops: kabutopsGif,
  lapras: laprasGif, vaporeon: vaporeonGif, dragonair: dragonairGif,
  gyarados: gyaradosGif,
  jolteon: jolteonGif, jolteon_shiny: jolteonShinyGif, vaporeon_shiny: vaporeonShinyGif,
  flareon: flareonGif, flareon_shiny: flareonShinyGif, snorlax: snorlaxGif,
  dragonite_shiny: dragoniteShinyGif, mew_alt: mewAltGif, raichu: raichuGif,
  weedle: weedleGif, weedle_shiny: weedleShinyGif, kakuna: kakunaGif, kakuna_shiny: kakunaShinyGif,
  metapod_shiny: metapodShinyGif, butterfree_shiny: butterfreeShinyGif,
  rattata_f: rattataFGif, raticate_f: raticateFGif,
  sandshrew: sandshrewGif, sandshrew_shiny: sandshrewShinyGif, sandslash_shiny: sandslashShinyGif,
  ekans: ekansGif, fearow: fearowGif, pidgeotto: pidgeottoGif,
  wartortle: wartortleGif, wartortle_shiny: wartortleShinyGif,
  blastoise: blastoiseGif, blastoise_shiny: blastoiseShinyGif,
  abra: abraGif, kadabra: kadabraGif, arcanine: arcanineGif, growlithe: growlitheGif,
  bellsprout: bellsproutGif, gloom: gloomGif, oddish: oddishGif,
  clefable: clefableGif, clefairy: clefairyGif, cubone: cuboneGif, diglett: diglettGif,
  magnemite: magnemiteGif, machamp: machampGif, machoke: machokeGif, machop: machopGif,
  mankey: mankeyGif, primeape: primeapeGif, meowth: meowthGif, persian: persianGif,
  nidoking: nidokingGif, nidoran_f: nidoranFGif, nidorina: nidorinaGif, ninetales: ninetalesGif,
  paras: parasGif, parasect: parasectGif, poliwag: poliwagGif, poliwhirl: poliwhirlGif,
  poliwrath: poliwrathGif, psyduck: psyduckGif,
  venonat: venonatGif, venomoth: venomothGif, zubat: zubatGif,
  lucario: mewGif,
  virizion: assetUrl(virizionAsset.url), raikou: assetUrl(raikouAsset.url), suicune: assetUrl(suicuneAsset.url),
  suicune_shiny: assetUrl(suicuneShinyAsset.url), luxray_f: assetUrl(luxrayFAsset.url),
  blaziken: blazikenGif,
};

const SPECIES_NAME: Record<Species, string> = {
  charmeleon: "CHARMELEON", bulbasaur: "BULBASAUR", vulpix: "VULPIX",
  jigglypuff: "JIGGLYPUFF", caterpie: "CATERPIE",
  charmander: "CHARMANDER", squirtle: "SQUIRTLE", charizard: "CHARIZARD",
  ivysaur: "IVYSAUR", venusaur: "VENUSAUR", butterfree: "BUTTERFREE",
  bulbasaur_hat: "BULBA-CAP", pikachu: "PIKACHU", sandslash: "SANDSLASH",
  mewtwo: "MEWTWO", onix: "ONIX", pinsir: "PINSIR", magmar: "MAGMAR",
  hitmonchan: "HITMONCHAN", golem: "GOLEM", aerodactyl: "AERODACTYL",
  arbok: "ARBOK", charizard_shiny: "CHARIZARD ✦", charizard_alt: "CHARIZARD α",
  moltres: "MOLTRES", zapdos: "ZAPDOS", articuno: "ARTICUNO",
  mew: "MEW", dragonite: "DRAGONITE",
  metapod: "METAPOD", beedrill: "BEEDRILL", pidgey: "PIDGEY", pidgeot: "PIDGEOT",
  vileplume: "VILEPLUME", tangela: "TANGELA", kabutops: "KABUTOPS",
  lapras: "LAPRAS", vaporeon: "VAPOREON", dragonair: "DRAGONAIR",
  gyarados: "GYARADOS",
  jolteon: "JOLTEON", jolteon_shiny: "JOLTEON ✦", vaporeon_shiny: "VAPOREON ✦",
  flareon: "FLAREON", flareon_shiny: "FLAREON ✦", snorlax: "SNORLAX",
  dragonite_shiny: "DRAGONITE ✦", mew_alt: "MEW α", raichu: "RAICHU",
  weedle: "WEEDLE", weedle_shiny: "WEEDLE ✦", kakuna: "KAKUNA", kakuna_shiny: "KAKUNA ✦",
  metapod_shiny: "METAPOD ✦", butterfree_shiny: "BUTTERFREE ✦",
  rattata_f: "RATTATA", raticate_f: "RATICATE",
  sandshrew: "SANDSHREW", sandshrew_shiny: "SANDSHREW ✦", sandslash_shiny: "SANDSLASH ✦",
  ekans: "EKANS", fearow: "FEAROW", pidgeotto: "PIDGEOTTO",
  wartortle: "WARTORTLE", wartortle_shiny: "WARTORTLE ✦",
  blastoise: "BLASTOISE", blastoise_shiny: "BLASTOISE ✦",
  abra: "ABRA", kadabra: "KADABRA", arcanine: "ARCANINE", growlithe: "GROWLITHE",
  bellsprout: "BELLSPROUT", gloom: "GLOOM", oddish: "ODDISH",
  clefable: "CLEFABLE", clefairy: "CLEFAIRY", cubone: "CUBONE", diglett: "DIGLETT",
  magnemite: "MAGNEMITE", machamp: "MACHAMP", machoke: "MACHOKE", machop: "MACHOP",
  mankey: "MANKEY", primeape: "PRIMEAPE", meowth: "MEOWTH", persian: "PERSIAN",
  nidoking: "NIDOKING", nidoran_f: "NIDORAN♀", nidorina: "NIDORINA", ninetales: "NINETALES",
  paras: "PARAS", parasect: "PARASECT", poliwag: "POLIWAG", poliwhirl: "POLIWHIRL",
  poliwrath: "POLIWRATH", psyduck: "PSYDUCK",
  venonat: "VENONAT", venomoth: "VENOMOTH", zubat: "ZUBAT",
  lucario: "LUCARIO",
  virizion: "VIRIZION", raikou: "RAIKOU", suicune: "SUICUNE",
  suicune_shiny: "SUICUNE ✦", luxray_f: "LUXRAY♀", blaziken: "BLAZIKEN",
};

const SPAWN_WEIGHTS: { sp: Species; w: number }[] = [
  { sp: "caterpie", w: 55 }, { sp: "jigglypuff", w: 42 },
  { sp: "bulbasaur", w: 28 }, { sp: "vulpix", w: 28 },
  { sp: "charmander", w: 22 }, { sp: "squirtle", w: 22 },
  { sp: "pikachu", w: 24 }, { sp: "onix", w: 5 }, { sp: "hitmonchan", w: 5 },
  { sp: "sandslash", w: 4 }, { sp: "magmar", w: 4 }, { sp: "butterfree", w: 4 },
  { sp: "ivysaur", w: 4 }, { sp: "charmeleon", w: 5 },
  { sp: "bulbasaur_hat", w: 2 }, { sp: "pinsir", w: 1 }, { sp: "golem", w: 1 },
  { sp: "aerodactyl", w: 1 }, { sp: "venusaur", w: 1 }, { sp: "charizard", w: 1 },
  { sp: "mewtwo", w: 1 },
  { sp: "pidgey", w: 40 }, { sp: "metapod", w: 18 },
  { sp: "tangela", w: 6 }, { sp: "beedrill", w: 5 },
  { sp: "vileplume", w: 2 }, { sp: "pidgeot", w: 2 }, { sp: "kabutops", w: 1 },
  { sp: "dragonair", w: 3 },
  { sp: "vaporeon", w: 2 }, { sp: "lapras", w: 2 },
  { sp: "gyarados", w: 2 }, { sp: "jolteon", w: 3 },
  { sp: "jolteon_shiny", w: 1 }, { sp: "vaporeon_shiny", w: 1 },
  { sp: "flareon", w: 3 }, { sp: "flareon_shiny", w: 1 },
  { sp: "snorlax", w: 2 }, { sp: "raichu", w: 4 },
  { sp: "dragonite_shiny", w: 1 }, { sp: "mew_alt", w: 1 },
  // Novos (pack POKE GIF)
  { sp: "weedle", w: 38 }, { sp: "kakuna", w: 20 },
  { sp: "rattata_f", w: 36 }, { sp: "sandshrew", w: 18 },
  { sp: "ekans", w: 18 }, { sp: "pidgeotto", w: 14 },
  { sp: "raticate_f", w: 8 }, { sp: "fearow", w: 6 },
  { sp: "wartortle", w: 7 }, { sp: "blastoise", w: 2 },
  { sp: "weedle_shiny", w: 1 }, { sp: "kakuna_shiny", w: 1 },
  { sp: "metapod_shiny", w: 1 }, { sp: "sandshrew_shiny", w: 1 },
  { sp: "wartortle_shiny", w: 1 }, { sp: "butterfree_shiny", w: 1 },
  { sp: "sandslash_shiny", w: 1 }, { sp: "blastoise_shiny", w: 1 },
];
type StarterChoice = "charmander" | "bulbasaur" | "squirtle";

type Wild = { id: string; x: number; y: number; pet: PetInstance };

// ===== TRAINER XP CURVE =====
// XP acumulado necessário para chegar ao nível L: 80 * L * (L+1) / 2
function trainerXpForLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.floor(80 * level * (level + 1) / 2);
}
function trainerLevelFromXp(xp: number): number {
  let lv = 1;
  while (xp >= trainerXpForLevel(lv)) lv++;
  return lv;
}

// ===== NPC TRAINERS =====
type NpcTeamDef = { species: Species; level: number; rarity?: PetInstance["rarity"] };
type NpcDef = {
  id: string; mapId: MapId; x: number; y: number;
  sprite: string; name: string; quote: string;
  team: NpcTeamDef[];
  rewardGold: number; rewardXp: number;
  specialProfile?: { bio: string; location: string; likes: string };
};
const NPCS: NpcDef[] = [
  {
    id: "rt1-vera", mapId: "village", x: 560, y: 372, sprite: npcGreenSprite,
    name: "VERA", quote: "Hihi! Vamos duelar?",
    team: [
      { species: "caterpie", level: 6 },
      { species: "bulbasaur", level: 8 },
      { species: "butterfree", level: 10 },
    ],
    rewardGold: 400, rewardXp: 70,
  },
  {
    id: "rt1-sarge", mapId: "village", x: 880, y: 372, sprite: npcSoldierSprite,
    name: "SARGENTO", quote: "Recruta, em posicao!",
    team: [
      { species: "sandslash", level: 9 },
      { species: "onix", level: 11 },
      { species: "hitmonchan", level: 13 },
    ],
    rewardGold: 700, rewardXp: 130,
  },
  {
    id: "rt1-kenji", mapId: "village", x: 690, y: 560, sprite: npcFighterSprite,
    name: "KENJI", quote: "Mostre sua forca!",
    team: [
      { species: "pikachu", level: 10 },
      { species: "magmar", level: 12 },
      { species: "hitmonchan", level: 15, rarity: "rare" },
    ],
    rewardGold: 900, rewardXp: 200,
  },
  {
    id: "rt1-beni", mapId: "village", x: 1000, y: 372, sprite: npcNinjaBeni,
    name: "NINJA BENI", quote: "Voce me viu? Devo treinar mais...",
    team: [
      { species: "arbok", level: 8 },
      { species: "beedrill", level: 9 },
      { species: "pinsir", level: 12, rarity: "rare" },
    ],
    rewardGold: 800, rewardXp: 160,
  },
  {
    id: "rt2-chuck", mapId: "village", x: 1300, y: 372, sprite: npcChuck,
    name: "MESTRE CHUCK", quote: "Cem flexoes antes do cafe! Bora!",
    team: [
      { species: "hitmonchan", level: 14 },
      { species: "magmar", level: 16 },
      { species: "pinsir", level: 18, rarity: "rare" },
    ],
    rewardGold: 1200, rewardXp: 260,
  },
];
const NPC_DIALOGUES: Record<string, { greet: string; story: string[]; itemRequest?: { itemId: string; name: string; qty: number; reward: string } }> = {
  "rt1-vera": {
    greet: "Oi! Você viu os cogumelos vermelhos que crescem por aqui?",
    story: [
      "Eles são muito raros e aparecem apenas por alguns instantes.",
      "Se você encontrar algum, poderia me trazer? Eu pago bem!",
      "Eles somem rápido, então você precisa ser veloz!"
    ],
    itemRequest: {
      itemId: "rare_mushroom",
      name: "Cogumelo Raro",
      qty: 1,
      reward: "Obrigada! Aqui está uma recompensa."
    }
  },
  "rt1-sarge": {
    greet: "Recruta, em posição! Mostre-me do que você é feito antes de prosseguir.",
    story: [
      "O treinamento militar nunca termina.",
      "A disciplina é a chave para a vitória em qualquer batalha.",
      "Continue treinando e talvez um dia você chegue ao meu nível."
    ]
  },

  "har-pilot": {
    greet: "Voo cancelado por causa do clima... Que tal uma batalha pra passar o tempo?",
    story: [
      "Voar com pokémons pássaro é a melhor sensação do mundo.",
      "O céu não tem limites quando você tem um Pidgeot confiável.",
      "Espero que a tempestade passe logo, tenho entregas a fazer."
    ]
  },
  "researcher-lee": {
    greet: "A genética Pokémon é fascinante... e perigosa. Quer ver minha criação?",
    story: [
      "Trabalhei anos neste laboratório subterrâneo.",
      "A inteligência artificial e a biologia estão mais próximas do que você imagina.",
      "O Mewtwo é o ápice da engenharia genética."
    ]
  },
  "farmer-joe": {
    greet: "Olá, treinador. O sol está perfeito para o cultivo hoje, não acha?",
    story: [
      "A agricultura em Pallet Town é tranquila e recompensadora.",
      "Meus Bulbasaur ajudam a manter a terra fértil e saudável.",
      "Não há nada como o sabor de uma fruta colhida na hora."
    ]
  },
  "rt1-kenji": {
    greet: "Pare de olhar as nuvens e lute! Meu espírito está queimando por um desafio!",
    story: [
      "A força bruta não é tudo, mas ajuda muito!",
      "Eu treino meus pokémons lutadores sob cachoeiras geladas.",
      "Sinta o impacto dos punhos do Hitmonchan!"
    ]
  },
  "rt1-beni": {
    greet: "As sombras são minhas aliadas. Você consegue me atingir?",
    story: [
      "Um ninja deve ser um com o ambiente.",
      "Meus pokémons venenosos são mestres na arte da emboscada.",
      "O silêncio é a voz mais alta do campo de batalha."
    ]
  }
};
const NPC_COOLDOWN_MS = 10 * 60 * 60 * 1000; // 10 horas entre revanches

const EXTRA_NPCS: NpcDef[] = [
  {
    id: "rt1-ash-story", mapId: "village", x: 690, y: 120, sprite: npcOakSprite,
    name: "CURIOSO", quote: "Sabia que o Ash pegou um Caterpie aqui perto?",
    team: [{ species: "caterpie", level: 5 }],
    rewardGold: 100, rewardXp: 20,
  },
  {
    id: "florido-jardinheiro", mapId: "village", x: 760, y: 690, sprite: npcFloralSprite,
    name: "JARDINHEIRO", quote: "As flores de Porto Florido são as mais belas! Quer me ajudar a cuidar delas?",
    team: [{ species: "bulbasaur", level: 12 }, { species: "ivysaur", level: 18 }],
    rewardGold: 600, rewardXp: 120,
    specialProfile: {
      bio: "Um amante da natureza que cuida do Jardim de Porto Florido.",
      location: "Porto Florido",
      likes: "Fertilizante, Sol, Água",
    }
  },
  {
    id: "v-explorer", mapId: "village", x: 1120, y: 690, sprite: npcStylistLucy,
    name: "EXPLORADOR MAX", quote: "Este porto esconde segredos!",
    team: [{ species: "pidgey", level: 10 }, { species: "squirtle", level: 12 }],
    rewardGold: 500, rewardXp: 80,
  },
  {
    id: "rocket-mafia-1", mapId: "village", x: 1250, y: 690, sprite: npcNinjaBeni,
    name: "RECRUTA ROCKET", quote: "Prepare-se para o encrenca!",
    team: [{ species: "arbok", level: 15, rarity: "rare" }],
    rewardGold: 1000, rewardXp: 150,
  },
  {
    id: "collector-bia", mapId: "village", x: 620, y: 690, sprite: npcCheerleaders,
    name: "COLECIONADORA BIA", quote: "Olhe minha coleção de Jigglypuff!",
    team: [{ species: "jigglypuff", level: 18, rarity: "epic" }],
    rewardGold: 1500, rewardXp: 300,
  },
  {
    id: "captain-navio", mapId: "village", x: 690, y: 780, sprite: npcPilot,
    name: "CAPITÃO NAVIO", quote: "Os mares de RubyMon escondem segredos…",
    team: [{ species: "squirtle", level: 20 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Velho lobo do mar de Porto Florido. Está construindo uma embarcação capaz de alcançar ilhas misteriosas.",
      location: "Rota de Pallet",
      likes: "Navegação, mapas antigos, Pokémon aquáticos",
    },
  },
  {
    id: "velho-mares", mapId: "village", x: 200, y: 372, sprite: npcHiker,
    name: "VELHO DOS MARES", quote: "Os mares ensinam o que livros não dizem…",
    team: [{ species: "tangela", level: 22 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Velho ferreiro e forjador naval. Cria âncoras, cordas e peças únicas para os barcos de RubyMon.",
      location: "Forest Cave",
      likes: "Forja, madeira de lei, e um bom mate quente.",
    },
  },
  {
    id: "kurt", mapId: "village", x: 430, y: 372, sprite: npcKurtSprite,
    name: "MESTRE KURT", quote: "Traga-me apricoms e farei pokébolas únicas…",
    team: [{ species: "tangela", level: 25 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Antigo samurai e mestre forjador de pokébolas. Vive recluso, transformando apricoms em pokébolas raras.",
      location: "Viridian City",
      likes: "Apricoms maduras, chá verde e silêncio.",
    },
  },
  {
    id: "mercador-mat", mapId: "village", x: 940, y: 180, sprite: npcGustavo,
    name: "MERCADOR GUSTAVO", quote: "Lenha, ferro, óleo… 50 cristais cada!",
    team: [{ species: "snorlax", level: 24 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Velho barbudo coberto de mochilas e bolsos. Arrasta sua carroça pela Route 2 vendendo matérias-primas brutas para forjas e construções.",
      location: "Route 2",
      likes: "Cristais, negociatas justas e madeira de lei.",
    },
  },
  {
    id: "moranguinho", mapId: "village", x: 1150, y: 372, sprite: npcMoranguinho,
    name: "MORANGUINHO", quote: "Flores, morangos e um pouco de amor…",
    team: [{ species: "pidgey", level: 18 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Jardineira de Viridian. Cultiva morangos e flores que dizem alimentar a alma — e a forja. Fala muito sobre amor, beleza e os lendários que cruzam as ilhas distantes.",
      location: "Viridian City",
      likes: "Suicune, buquês perfumados e treinadores de coração gentil.",
    },
  },
  {
    id: "botanist-yggdran", mapId: "village", x: 1450, y: 372, sprite: npcBotanistSprite,
    name: "BOTÂNICO YGGDRAN", quote: "Cada árvore guarda um segredo. Deixe-me te contar os meus...",
    team: [{ species: "tangela", level: 20 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Antigo druida que vive na Rota 3 catalogando todas as árvores selvagens. Conhece cada fruto e cada toco da região.",
      location: "Rota 3",
      likes: "Mirtilos, bagas rosas e silêncio dos bosques.",
    },
  },
  {
    id: "pescador-barbosa", mapId: "village", x: 1620, y: 760, sprite: npcFishermanSprite,
    name: "PESCADOR BARBOSA", quote: "Traga 30 Caterpie e ganhe a vara lendária!",
    team: [{ species: "psyduck", level: 18 }],
    rewardGold: 0, rewardXp: 0,
    specialProfile: {
      bio: "Velho pescador de Viridian City. Diz que os Caterpie da região fazem a melhor isca natural e oferece a vara do seu antigo mestre a quem cumprir o desafio.",
      location: "Viridian City",
      likes: "Magikarp gigantes, manhãs nubladas e Caterpie frescos.",
    },
  },
  {
    id: "lab-oak", mapId: "village", x: 690, y: 300, sprite: npcOakSprite,
    name: "PROF. CARVALHO", quote: "Bem-vindo ao meu laboratório! Escolha um Pokémon inicial.",
    team: [{ species: "bulbasaur", level: 5 }],
    rewardGold: 0, rewardXp: 0,
  },
];



// ===== PROFISSÕES =====
export type Profession =
  | "medico" | "engenheiro" | "mercador" | "professor" | "cientista"
  | "fazendeiro" | "pescador" | "guarda" | "criador" | "veterano"
  | "mafioso" | "cacador" | "detetive" | "musico" | "streamer"
  | "produtor" | "jornalista" | "chef" | "aventureiro" | "vagabundo";

type ProfessionMeta = { id: Profession; label: string; vocative: string; icon: string; npcLine: (name: string) => string };
const PROFESSIONS: ProfessionMeta[] = [
  { id: "medico",      label: "Médico Pokémon",         vocative: "Doutor",        icon: "🩺", npcLine: (n) => `Bom dia, Doutor ${n}. Pode examinar meu Pokémon?` },
  { id: "engenheiro",  label: "Engenheiro",              vocative: "Engenheiro",    icon: "🛠️", npcLine: (n) => `Engenheiro ${n}, será que consegue consertar isso?` },
  { id: "mercador",    label: "Mercador",                vocative: "Mercador",      icon: "💰", npcLine: (n) => `Bons negócios, mercador ${n}?` },
  { id: "professor",   label: "Professor",               vocative: "Professor",     icon: "📚", npcLine: (n) => `Professor ${n}, posso aprender algo com você?` },
  { id: "cientista",   label: "Cientista",               vocative: "Cientista",     icon: "🧪", npcLine: (n) => `Cientista ${n}, que descoberta nova?` },
  { id: "fazendeiro",  label: "Fazendeiro",              vocative: "Fazendeiro",    icon: "🌾", npcLine: (n) => `Como vai a colheita, ${n}?` },
  { id: "pescador",    label: "Pescador",                vocative: "Pescador",      icon: "🎣", npcLine: (n) => `Pegou algo grande hoje, pescador ${n}?` },
  { id: "guarda",      label: "Guarda Florestal",        vocative: "Guarda",        icon: "🌲", npcLine: (n) => `Guarda ${n}, a floresta está segura?` },
  { id: "criador",     label: "Criador Pokémon",         vocative: "Criador",       icon: "🥚", npcLine: (n) => `Criador ${n}, seus Pokémon estão felizes?` },
  { id: "veterano",    label: "Treinador Veterano",      vocative: "Veterano",      icon: "🎖️", npcLine: (n) => `Veterano ${n}, conte-me uma batalha lendária!` },
  { id: "mafioso",     label: "Mafioso",                 vocative: "Chefe",         icon: "🕴️", npcLine: (n) => `Ouvi dizer que você faz negócios interessantes, ${n}...` },
  { id: "cacador",     label: "Caçador de Recompensas",  vocative: "Caçador",       icon: "🏹", npcLine: (n) => `Atrás de outra recompensa, ${n}?` },
  { id: "detetive",    label: "Detetive",                vocative: "Detetive",      icon: "🔎", npcLine: (n) => `Detetive ${n}, algum caso novo?` },
  { id: "musico",      label: "Músico",                  vocative: "Maestro",       icon: "🎵", npcLine: (n) => `Toca uma melodia pra gente, ${n}?` },
  { id: "streamer",    label: "Streamer",                vocative: "Streamer",      icon: "📺", npcLine: (n) => `Vai mostrar essa batalha pra seus seguidores, ${n}?` },
  { id: "produtor",    label: "Produtor de Conteúdo",    vocative: "Produtor",      icon: "🎬", npcLine: (n) => `Produtor ${n}, posso aparecer no seu próximo vídeo?` },
  { id: "jornalista",  label: "Jornalista",              vocative: "Repórter",      icon: "📰", npcLine: (n) => `Jornalista ${n}, qual a manchete de hoje?` },
  { id: "chef",        label: "Chef de Cozinha",         vocative: "Chef",          icon: "👨‍🍳", npcLine: (n) => `Chef ${n}, qual o prato do dia?` },
  { id: "aventureiro", label: "Aventureiro",             vocative: "Aventureiro",   icon: "🧭", npcLine: (n) => `Aventureiro ${n}, pra que terras agora?` },
  { id: "vagabundo",   label: "Vagabundo Profissional",  vocative: "Vagabundo",     icon: "🍂", npcLine: (n) => `Você continua evitando trabalho até no mundo Pokémon, ${n}?` },
];
const PROF_BY_ID: Record<Profession, ProfessionMeta> = PROFESSIONS.reduce(
  (acc, p) => { acc[p.id] = p; return acc; },
  {} as Record<Profession, ProfessionMeta>
);
function professionGreeting(prof: Profession | undefined, name: string): string {
  if (!prof) return `Olá, treinador ${name}.`;
  return PROF_BY_ID[prof].npcLine(name);
}

// ===== ZONAS SEGURAS (sem spawn de pokemon selvagem) =====
const NO_SPAWN_MAPS: ReadonlyArray<string> = ["pkmart", "pkc", "labo", "viridian"];
const canSpawnHere = (m: string) => !NO_SPAWN_MAPS.includes(m);

// ===== NPCs DE QUEST =====
type BallReward = "pokeball" | "greatball" | "fastball";
type QuestRewardSpec = {
  gold?: number;
  ball?: { kind: BallReward; qty: number };
  potion?: number; revive?: number; incenseXp?: number;
  freeAvatar?: boolean;
};
type QuestSnapshot = {
  capturePoints: number; trainerLevel: number;
  byTier: { rare: number; epic: number; mythic: number };
};
type QuestBase = {
  id: string;
  name: string;
  sprite: string;
  mapId: MapId;
  x: number; y: number;
  doneLine: (playerName: string) => string;
  rotating?: boolean;
  kind: "rare" | "trainerLv" | "drive" | "freeAvatar";
};
type QuestInstance = QuestBase & {
  greet: string;
  goal: string;
  goalProgress: (s: QuestSnapshot) => string;
  done: (s: QuestSnapshot) => boolean;
  reward: QuestRewardSpec;
  rewardLabel: string;
};
const QUEST_NPC_BASES: QuestBase[] = [
  {
    id: "q-ghetsis", name: "GHETSIS", sprite: npcGhetsisSprite,
    mapId: "cave1", x: 760, y: 880,
    kind: "trainerLv",
    doneLine: (n) => `Hmf... voce surpreendeu ate a mim, ${n}. Tome o seu premio.`,
  },
  {
    id: "q-red", name: "RED", sprite: npcRedGen5Sprite,
    mapId: "village", x: 700, y: 640, rotating: true,
    kind: "drive",
    doneLine: (n) => `Nivel ${n}! Voce e um treinador serio. Toma ai.`,
  },
  {
    id: "q-stylist", name: "ESTILISTA LUCY", sprite: npcStylistLucy,
    mapId: "labo", x: 400, y: 480,
    kind: "freeAvatar",
    doneLine: (n) => `Ficou otimo em voce, ${n}! Volte sempre.`,
  },
  {
    id: "q-parasol", name: "MADAME ROSA", sprite: npcParasolLady,
    mapId: "village", x: 500, y: 700, rotating: true,
    kind: "rare",
    doneLine: (n) => `Tao chique quanto eu, ${n}! Aceita um agrado?`,
  },
  {
    id: "q-colress", name: "DR. COLRESS", sprite: npcColress,
    mapId: "labo", x: 900, y: 520, rotating: true,
    kind: "trainerLv",
    doneLine: (n) => `Fascinante, ${n}! A ciencia agradece sua dedicacao.`,
  },
  {
    id: "q-cheer", name: "TORCIDA ANIMADA", sprite: npcCheerleaders,
    mapId: "village", x: 320, y: 460, rotating: true,
    kind: "drive",
    doneLine: (n) => `BRA-VO BRA-VO ${n}! Voce e nosso idolo!`,
  },
];
const QUEST_PROX = 56;
const QUEST_CYCLE_MS = 5 * 60 * 60 * 1000; // 5 horas
function currentQuestCycle() { return Math.floor(Date.now() / QUEST_CYCLE_MS); }
// PRNG deterministico baseado em string (mulberry32)
function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seededRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const BALL_LABEL: Record<BallReward, string> = { pokeball: "Poke Ball", greatball: "Great Ball", fastball: "Fast Ball" };
const RAR_LABEL = { rare: "RAROS", epic: "EPICOS", mythic: "MITICOS" } as const;
type RareTier = keyof typeof RAR_LABEL;
function quantifiesRareTier(p: PetInstance, tier: RareTier): boolean {
  if (tier === "rare") return p.rarity === "rare" || p.rarity === "epic" || p.rarity === "mythic";
  if (tier === "epic") return p.rarity === "epic" || p.rarity === "mythic";
  return p.rarity === "mythic";
}
function instantiateQuest(base: QuestBase, cycle: number): QuestInstance {
  const rng = seededRng(hashStr(`${base.id}:${cycle}`));
  const ballKinds: BallReward[] = ["pokeball", "greatball", "fastball"];
  const ballKind = ballKinds[Math.floor(rng() * ballKinds.length)];
  const ballQty = 2 + Math.floor(rng() * 5); // 2-6
  const goldAmt = 100 + Math.floor(rng() * 5) * 100; // 100-500
  const potionExtra = rng() < 0.5 ? 1 : 2;
  const reviveExtra = rng() < 0.4 ? 1 : 0;
  const incenseExtra = rng() < 0.3 ? 1 : 0;

  if (base.kind === "rare") {
    const tierRoll = rng();
    const tier: RareTier = tierRoll < 0.55 ? "rare" : tierRoll < 0.9 ? "epic" : "mythic";
    const need = tier === "mythic" ? 1 : tier === "epic" ? 1 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 3);
    const countFor = (s: QuestSnapshot) =>
      tier === "rare" ? s.byTier.rare + s.byTier.epic + s.byTier.mythic
      : tier === "epic" ? s.byTier.epic + s.byTier.mythic
      : s.byTier.mythic;
    return {
      ...base,
      greet: "",
      goal: `Capture ${need} pokemons ${RAR_LABEL[tier]}.`,
      goalProgress: (s) => `Progresso: ${Math.min(need, countFor(s))} / ${need} ${RAR_LABEL[tier].toLowerCase()}`,
      done: (s) => countFor(s) >= need,
      reward: { ball: { kind: ballKind, qty: ballQty }, potion: potionExtra, gold: goldAmt, revive: reviveExtra },
      rewardLabel: `+${ballQty} ${BALL_LABEL[ballKind]}, +${potionExtra} Pocao${reviveExtra ? ", +1 Revive" : ""}, +${goldAmt} ouro`,
    };
  }
  if (base.kind === "trainerLv") {
    const need = 3 + Math.floor(rng() * 6); // 3-8
    return {
      ...base,
      greet: "",
      goal: `Alcance Treinador Lv ${need}.`,
      goalProgress: (s) => `Treinador Lv ${s.trainerLevel} / ${need}`,
      done: (s) => s.trainerLevel >= need,
      reward: { ball: { kind: ballKind, qty: ballQty }, revive: 1, incenseXp: incenseExtra },
      rewardLabel: `+${ballQty} ${BALL_LABEL[ballKind]}, +1 Revive${incenseExtra ? ", +1 Incenso XP" : ""}`,
    };
  }
  if (base.kind === "drive") {
    const need = 50 + Math.floor(rng() * 6) * 25; // 50,75,100,125,150,175,200
    return {
      ...base,
      greet: "",
      goal: `Acumule ${need} pontos no Drive.`,
      goalProgress: (s) => `Drive: ${Math.min(need, s.capturePoints)} / ${need} pts`,
      done: (s) => s.capturePoints >= need,
      reward: { ball: { kind: ballKind, qty: ballQty }, potion: potionExtra, revive: reviveExtra },
      rewardLabel: `+${ballQty} ${BALL_LABEL[ballKind]}, +${potionExtra} Pocao${reviveExtra ? ", +1 Revive" : ""}`,
    };
  }
  // freeAvatar
  return {
    ...base,
    greet: "",
    goal: "Fale comigo e resgate a troca de avatar.",
    goalProgress: () => `Disponivel agora.`,
    done: () => true,
    reward: { freeAvatar: true },
    rewardLabel: "Troca de avatar gratuita",
  };
}
function buildGreet(base: QuestBase, q: QuestInstance, name: string): string {
  if (base.kind === "rare") return `Ola, ${name}! Estou compilando a Pokedex... ${q.goal.toLowerCase()}`;
  if (base.kind === "trainerLv") return `${name}... voce ainda nao prova nada. ${q.goal}`;
  if (base.kind === "drive") return `E ai, ${name}! Ouvi falar do seu Drive. ${q.goal}`;
  return `Oi, ${name}! Quer trocar o visual? Estou dando UMA troca de avatar GRATIS.`;
}

const MAPS = {
  village: {
    name: "CIDADE PRINCIPAL", img: mapVillage, w: 1774, h: 887, requiredLevel: 1,
    spawn: { x: 690, y: 380, dir: "down" as Dir },
    portals: [],
    spawnAreas: [{ x: 300, y: 372 }, { x: 690, y: 160 }, { x: 690, y: 700 }, { x: 1150, y: 372 }, { x: 1500, y: 372 }, { x: 940, y: 200 }],
  },
  forest: {
    name: "ROUTE 1", img: mapForest, w: 1219, h: 1290, requiredLevel: 1,
    spawn: { x: 600, y: 280, dir: "down" as Dir },
    portals: [
      { x: 560, y: 20, w: 140, h: 80, to: "village" as const, spawn: { x: 740, y: 880, dir: "down" as Dir }, label: "← PORTO FLORIDO (casinha)" },
      { x: 555, y: 1176, w: 110, h: 80, to: "route2" as const, spawn: { x: 500, y: 120, dir: "down" as Dir }, label: "→ ROUTE 2" },
    ],
    spawnAreas: [{ x: 380, y: 480 }, { x: 820, y: 560 }, { x: 300, y: 820 }, { x: 900, y: 900 }, { x: 540, y: 1080 }, { x: 680, y: 360 }],
  },
  route2: {
    name: "ROUTE 2", img: mapRoute2, w: 1024, h: 1536, requiredLevel: 5,
    spawn: { x: 500, y: 120, dir: "down" as Dir },
    portals: [
      { x: 420, y: 40, w: 160, h: 70, to: "forest" as const, spawn: { x: 610, y: 1136, dir: "down" as Dir }, label: "← ROUTE 1" },
      { x: 420, y: 1460, w: 160, h: 70, to: "route3" as const, spawn: { x: 500, y: 120, dir: "down" as Dir }, label: "→ ROUTE 3" },
    ],
    spawnAreas: [{ x: 380, y: 380 }, { x: 700, y: 480 }, { x: 280, y: 760 }, { x: 620, y: 980 }, { x: 460, y: 1240 }, { x: 240, y: 1380 }],
  },
  route3: {
    name: "ROUTE 3", img: mapRoute3, w: 1024, h: 1536, requiredLevel: 10,
    spawn: { x: 500, y: 120, dir: "down" as Dir },
    portals: [
      { x: 420, y: 40, w: 160, h: 70, to: "route2" as const, spawn: { x: 500, y: 1400, dir: "up" as Dir }, label: "← ROUTE 2" },
      { x: 420, y: 1460, w: 160, h: 70, to: "forestCave" as const, spawn: { x: 500, y: 120, dir: "down" as Dir }, label: "→ FOREST CAVE" },
    ],
    spawnAreas: [{ x: 380, y: 380 }, { x: 700, y: 480 }, { x: 280, y: 760 }, { x: 620, y: 980 }, { x: 460, y: 1240 }, { x: 240, y: 1380 }],
  },
  forestCave: {
    name: "FOREST CAVE", img: mapForestCave, w: 1024, h: 1536, requiredLevel: 15,
    spawn: { x: 500, y: 120, dir: "down" as Dir },
    portals: [
      { x: 420, y: 40, w: 160, h: 70, to: "route3" as const, spawn: { x: 500, y: 1400, dir: "up" as Dir }, label: "← ROUTE 3" },
      { x: 806, y: 714, w: 160, h: 70, to: "cave1" as const, spawn: { x: 590, y: 120, dir: "down" as Dir }, label: "→ CAVERNA 1" },
    ],
    spawnAreas: [{ x: 380, y: 380 }, { x: 700, y: 480 }, { x: 280, y: 760 }, { x: 620, y: 980 }, { x: 460, y: 1240 }, { x: 240, y: 1380 }],
  },
  cave1: {
    name: "CAVERNA 1", img: mapCave1, w: 1181, h: 1331, requiredLevel: 18,
    spawn: { x: 590, y: 120, dir: "down" as Dir },
    portals: [
      { x: 500, y: 40, w: 160, h: 70, to: "forestCave" as const, spawn: { x: 500, y: 1400, dir: "up" as Dir }, label: "← FOREST CAVE" },
    ],
    spawnAreas: [{ x: 360, y: 380 }, { x: 760, y: 460 }, { x: 280, y: 720 }, { x: 660, y: 900 }, { x: 480, y: 1100 }, { x: 880, y: 1080 }],
  },
  cave2: {
    name: "CAVERNA 2", img: mapCave2, w: 1254, h: 1254, requiredLevel: 22,
    spawn: { x: 620, y: 120, dir: "down" as Dir },
    portals: [],
    spawnAreas: [{ x: 360, y: 380 }, { x: 800, y: 440 }, { x: 280, y: 720 }, { x: 700, y: 880 }, { x: 480, y: 1080 }, { x: 920, y: 1080 }],
  },
  map23: {
    name: "CRIPTA 23", img: map23, w: 1379, h: 1141, requiredLevel: 25,
    spawn: { x: 680, y: 120, dir: "down" as Dir },
    portals: [
      { x: 600, y: 40, w: 160, h: 70, to: "cave2" as const, spawn: { x: 620, y: 1100, dir: "up" as Dir }, label: "← CAVERNA 2" },
    ],
    spawnAreas: [{ x: 380, y: 380 }, { x: 900, y: 460 }, { x: 280, y: 720 }, { x: 1080, y: 820 }, { x: 540, y: 940 }, { x: 760, y: 600 }],
  },
  palletRoute: {
    name: "ROTA DE PALLET", img: mapPalletRoute, w: 849, h: 1853, requiredLevel: 3,
    spawn: { x: 420, y: 1760, dir: "up" as Dir },
    portals: [
      { x: 384, y: 1778, w: 160, h: 60, to: "village" as const, spawn: { x: 658, y: 218, dir: "down" as Dir }, label: "↓ PORTO FLORIDO" },
      { x: 340, y: 20, w: 160, h: 60, to: "viridian" as const, spawn: { x: 660, y: 1100, dir: "up" as Dir }, label: "↑ VIRIDIAN CITY" },
    ],
    spawnAreas: [{ x: 380, y: 1500 }, { x: 460, y: 1200 }, { x: 320, y: 900 }, { x: 500, y: 600 }, { x: 380, y: 320 }, { x: 460, y: 1700 }],
  },
  viridian: {
    name: "VIRIDIAN CITY", img: mapViridian, w: 1331, h: 1182, requiredLevel: 8,
    spawn: { x: 660, y: 1100, dir: "up" as Dir },
    portals: [
      { x: 580, y: 1110, w: 160, h: 60, to: "palletRoute" as const, spawn: { x: 420, y: 80, dir: "down" as Dir }, label: "↓ ROTA DE PALLET" },
      { x: 20, y: 560, w: 60, h: 160, to: "route22" as const, spawn: { x: 1700, y: 440, dir: "left" as Dir }, label: "← ROTA 22" },
    ],
    spawnAreas: [{ x: 380, y: 380 }, { x: 820, y: 460 }, { x: 280, y: 720 }, { x: 940, y: 820 }, { x: 540, y: 940 }, { x: 700, y: 600 }],
  },
  route22: {
    name: "ROTA 22", img: mapRoute22, w: 1802, h: 872, requiredLevel: 9,
    spawn: { x: 1700, y: 440, dir: "left" as Dir },
    portals: [
      { x: 1720, y: 380, w: 60, h: 160, to: "viridian" as const, spawn: { x: 140, y: 640, dir: "right" as Dir }, label: "→ VIRIDIAN CITY" },
    ],
    spawnAreas: [{ x: 1500, y: 440 }, { x: 1200, y: 380 }, { x: 900, y: 460 }, { x: 600, y: 420 }, { x: 320, y: 500 }, { x: 800, y: 600 }],
  },
  victoryRoad: {
    name: "VICTORY ROAD", img: mapVictoryRoad, w: 1528, h: 1029, requiredLevel: 12,
    spawn: { x: 1460, y: 940, dir: "left" as Dir },
    portals: [
      { x: 1480, y: 880, w: 40, h: 140, to: "route22" as const, spawn: { x: 60, y: 440, dir: "right" as Dir }, label: "→ ROTA 22" },
    ],
    spawnAreas: [{ x: 1300, y: 880 }, { x: 1000, y: 760 }, { x: 760, y: 600 }, { x: 500, y: 460 }, { x: 260, y: 320 }, { x: 700, y: 820 }],
  },
  florestaSecreta: {
    name: "FLORESTA SECRETA", img: mapFlorestaSecreta, w: 1536, h: 1024, requiredLevel: 15,
    spawn: { x: 768, y: 512, dir: "down" as Dir },
    portals: [],
    spawnAreas: [{ x: 360, y: 320 }, { x: 820, y: 280 }, { x: 1180, y: 420 }, { x: 280, y: 720 }, { x: 760, y: 760 }, { x: 1240, y: 820 }, { x: 540, y: 540 }, { x: 980, y: 600 }],
  },
  desert: {
    name: "DESERTO ANTIGO", img: mapDesert, w: 1536, h: 1024, requiredLevel: 20,
    spawn: { x: 768, y: 512, dir: "down" as Dir },
    portals: [],
    spawnAreas: [{ x: 360, y: 320 }, { x: 820, y: 280 }, { x: 1180, y: 420 }, { x: 280, y: 720 }, { x: 760, y: 760 }, { x: 1240, y: 820 }, { x: 540, y: 540 }, { x: 980, y: 600 }],
  },
  eliteRoute: {
    name: "ROTA ELITE", img: mapEliteRoute, w: 1536, h: 1024, requiredLevel: 30,
    spawn: { x: 768, y: 512, dir: "down" as Dir },
    portals: [],
    spawnAreas: [{ x: 360, y: 320 }, { x: 820, y: 280 }, { x: 1180, y: 420 }, { x: 280, y: 720 }, { x: 760, y: 760 }, { x: 1240, y: 820 }, { x: 540, y: 540 }, { x: 980, y: 600 }],
  },
  veneno: {
    name: "PANTANO VENENO", img: mapVeneno, w: 1402, h: 1122, requiredLevel: 25,
    spawn: { x: 700, y: 560, dir: "down" as Dir },
    portals: [],
    spawnAreas: [{ x: 320, y: 340 }, { x: 760, y: 280 }, { x: 1100, y: 420 }, { x: 280, y: 720 }, { x: 720, y: 800 }, { x: 1140, y: 880 }, { x: 520, y: 540 }, { x: 940, y: 620 }],
  },
  pkmart: {
    name: "PK MART", img: mapPkmart, w: 900, h: 722, requiredLevel: 1,
    spawn: { x: 450, y: 400, dir: "down" as Dir },
    portals: [],
    spawnAreas: [],
  },
  pkc: {
    name: "PK CENTER", img: mapPkc, w: 900, h: 722, requiredLevel: 1,
    spawn: { x: 450, y: 418, dir: "down" as Dir },
    portals: [
      { x: 400, y: 632, w: 100, h: 60, to: "village" as const, spawn: { x: 858, y: 332, dir: "down" as Dir }, label: "← PORTO FLORIDO" },
    ],
    spawnAreas: [],
  },
  labo: {
    name: "LABORATORIO", img: mapLabo, w: 1403, h: 1121, requiredLevel: 1,
    spawn: { x: 700, y: 600, dir: "down" as Dir },
    portals: [
      { x: 650, y: 1020, w: 100, h: 60, to: "village" as const, spawn: { x: 1308, y: 782, dir: "down" as Dir }, label: "↓ PORTO FLORIDO" },
    ],
    spawnAreas: [],
  },
};
type MapId = keyof typeof MAPS;
const MAP_IDS: MapId[] = ["village"];

const ZOOM_LEVELS = [0.5, 0.7, 1] as const;

function pickWeightedNear(playerLevel: number): Species {
  // Filtra espécies cuja minLv esteja perto do nível do jogador (até +6 acima)
  const max = Math.max(3, playerLevel + 6);
  const pool = SPAWN_WEIGHTS.filter(({ sp }) => SPECIES_BASE[sp].minLv <= max);
  const total = pool.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const { sp, w } of pool) { if ((r -= w) < 0) return sp; }
  return "caterpie";
}

// ===== POOLS DE SPAWN POR MAPA =====
// Lista oficial por rota — espécies + peso aproximado de raridade.
type MapPool = { lv: [number, number]; pool: { sp: Species; w: number }[] };
const MAP_SPAWN_POOLS: Partial<Record<MapId, MapPool>> = {
  // ROTA 1 (Nv 2~6)
  forest: {
    lv: [2, 6],
    pool: [
      { sp: "caterpie", w: 25 },
      { sp: "weedle",   w: 25 },
      { sp: "pidgey",   w: 22 },
      { sp: "rattata_f",w: 22 },
      { sp: "oddish",   w: 18 },
      { sp: "pikachu",  w: 1 }, // raro ~1%
    ],
  },
  // ROTA 2 (Nv 4~9)
  route2: {
    lv: [4, 9],
    pool: [
      { sp: "pidgey",     w: 22 },
      { sp: "weedle",     w: 20 },
      { sp: "caterpie",   w: 20 },
      { sp: "bellsprout", w: 18 },
      { sp: "oddish",     w: 16 },
      { sp: "paras",      w: 12 },
      { sp: "clefairy",   w: 2 }, // raro ~2%
    ],
  },
  // FLORESTA (Nv 6~12) — usamos forestCave
  forestCave: {
    lv: [6, 12],
    pool: [
      { sp: "caterpie",  w: 20 },
      { sp: "metapod",   w: 16 },
      { sp: "butterfree",w: 10 },
      { sp: "weedle",    w: 20 },
      { sp: "kakuna",    w: 16 },
      { sp: "beedrill",  w: 8 },
      { sp: "paras",     w: 12 },
      { sp: "parasect",  w: 6 },
      { sp: "pikachu",   w: 3 }, // raro ~3%
    ],
  },
  // ROTA 3 (Nv 8~14)
  route3: {
    lv: [8, 14],
    pool: [
      { sp: "ekans",     w: 22 },
      { sp: "bellsprout",w: 22 },
      { sp: "mankey",    w: 22 },
      { sp: "sandshrew", w: 22 },
      { sp: "growlithe", w: 6 }, // raro
    ],
  },
  // ROTA 22 — Viridian Oeste (Nv 10~18)
  route22: {
    lv: [10, 18],
    pool: [
      { sp: "mankey",    w: 22 },
      { sp: "sandshrew", w: 20 },
      { sp: "ekans",     w: 20 },
      { sp: "nidoran_f", w: 18 },
      { sp: "nidorina",  w: 10 },
      { sp: "arcanine",  w: 1 }, // raríssimo ~0.5%
    ],
  },
  // 🪨 CAVERNA INICIAL (Nv 12~22)
  cave1: {
    lv: [12, 22],
    pool: [
      { sp: "zubat",   w: 28 },
      { sp: "onix",    w: 18 },
      { sp: "diglett", w: 22 },
      { sp: "cubone",  w: 18 },
      { sp: "machop",  w: 4 }, // raro
    ],
  },
  // 💀 CAVERNA PROFUNDA (Nv 20~35)
  cave2: {
    lv: [20, 35],
    pool: [
      { sp: "machop",     w: 22 },
      { sp: "machoke",    w: 18 },
      { sp: "onix",       w: 20 },
      { sp: "cubone",     w: 18 },
      { sp: "zubat",      w: 16 },
      { sp: "aerodactyl", w: 1 }, // raro
    ],
  },
  // ☠️ PÂNTANO VENENO (Nv 18~30)
  veneno: {
    lv: [18, 30],
    pool: [
      { sp: "ekans",     w: 20 },
      { sp: "arbok",     w: 14 },
      { sp: "oddish",    w: 18 },
      { sp: "gloom",     w: 14 },
      { sp: "venonat",   w: 18 },
      { sp: "venomoth",  w: 12 },
      { sp: "bellsprout",w: 18 },
      { sp: "nidoking",  w: 1 }, // raro
    ],
  },
  // 🏜️ DESERTO RUBI (Nv 20~35)
  desert: {
    lv: [20, 35],
    pool: [
      { sp: "sandshrew", w: 26 },
      { sp: "sandslash", w: 18 },
      { sp: "diglett",   w: 22 },
      { sp: "cubone",    w: 20 },
      { sp: "onix",      w: 4 },  // raro
      { sp: "aerodactyl",w: 1 },  // muito raro
    ],
  },
};

function pickFromMapPool(mapId: MapId): { sp: Species; lv: number } | null {
  const def = MAP_SPAWN_POOLS[mapId];
  if (!def) return null;
  const total = def.pool.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  let sp: Species = def.pool[0].sp;
  for (const { sp: s, w } of def.pool) { if ((r -= w) < 0) { sp = s; break; } }
  const [lo, hi] = def.lv;
  const lv = lo + Math.floor(Math.random() * (hi - lo + 1));
  return { sp, lv };
}

function nextSpawnDelay() { return SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS); }
function makeWildPet(playerLevel: number, mapId?: MapId): PetInstance {
  if (mapId) {
    const picked = pickFromMapPool(mapId);
    if (picked) return makePet(picked.sp, picked.lv);
  }
  const sp = pickWeightedNear(playerLevel);
  const lv = Math.max(1, playerLevel - 2 + Math.floor(Math.random() * 5));
  return makePet(sp, lv);
}

// ===== Save / Load =====
type SaveState = {
  identity: { id: string; name: string };
  starter: StarterChoice;
  profession?: Profession;
  mapId: MapId;
  pos: { x: number; y: number };
  dir: Dir;
  gold: number;
  crystal: number;
  ruby?: number;
  balls: Record<BallId, number>;
  inventory: Record<string, number>;
  teamPets: PetInstance[];
  vipUntil?: number;
  xpBoostUntil?: number;
  storedPets?: PetInstance[];
  driveCapacity?: number;
  capturePoints?: number;
  trainerXp?: number;
  npcDefeated?: Record<string, number>;
  unlockedMaps?: Record<string, boolean>;
  questsClaimed?: Record<string, number>;
  ascensions?: Record<string, number>;
  autoHuntSettings?: any;
  codexSlots?: Record<string, boolean>;
  encounter?: Wild | null;
  encounterPet?: PetInstance | null;
  energy?: number;
  energyUpdatedAt?: number;
};

// Energia: regen +10 por hora real, máx 50, custo de 3 por árvore
export const ENERGY_MAX = 50;
export const ENERGY_TREE_COST = 3;
export const ENERGY_MS_PER_POINT = 6 * 60 * 1000; // 10/hora => 1 ponto a cada 6 min
function loadSave(): SaveState | null {
  if (typeof window === "undefined") return null;
  try {
    const s = loadLatestValid<SaveState>();
    if (!s) return null;
    // Backfill new ball types from older saves
    const defaults = { pokeball: 0, greatball: 0, fastball: 0, ultraball: 0, safariball: 0, masterball: 0 };
    s.balls = { ...defaults, ...((s.balls as Partial<Record<BallId, number>>) || {}) } as Record<BallId, number>;
    // Sanitize mapId — old saves may reference removed maps.
    if (!(s.mapId in MAPS)) {
      const v = MAPS.village;
      s.mapId = "village";
      s.pos = { x: v.spawn.x, y: v.spawn.y };
      s.dir = v.spawn.dir;
    }
    return s;
  } catch { return null; }
}
function writeSave(s: SaveState) {
  try { saveNow(s); } catch { /* ignore */ }
}

type RemotePlayer = { id: string; name: string; map: string; x: number; y: number; dir: Dir; leader_species: string | null; leader_rarity: string | null; level: number; trainer_level?: number; craft_points?: number; guild_name?: string | null; updated_at: string };
type DbListing = { id: string; seller_id: string; seller_name: string; kind: "pet" | "item"; pet_data: PetInstance | null; item_id: string | null; qty: number | null; price: number; currency: "gold" | "crystal"; created_at: string };
type DbChallenge = { id: string; challenger_id: string; challenger_name: string; challenger_pet: PetInstance; opponent_id: string; opponent_name: string; opponent_pet: PetInstance | null; stake_pet: boolean; status: "pending" | "accepted" | "declined" | "finished"; winner_id: string | null; created_at: string };
type Weather = "clear" | "rain" | "snow" | "sakura";

function Index() {
  // AuthGate garante que existe identidade local em localStorage.
  const [save, setSave] = useState<SaveState | null>(() => {
    const existing = loadSave();
    if (existing) return existing;
    const identity = loadIdentity();
    if (!identity) return null;
    const newSave = buildFirstTimeSave(identity);
    writeSave(newSave);
    return newSave;
  });

  // Reclama presentes enviados pelo admin (gold/crystal/ruby/itens/balls).
  useEffect(() => {
    const identity = loadIdentity();
    if (!identity) return;
    void (async () => {
      try {
        const { claimMyGifts } = await import("@/lib/adminGifts");
        const claimed = await claimMyGifts({ userId: identity.id, username: identity.name });
        if (claimed.length) {
          // Recarrega o save do localStorage atualizado pelos gifts.
          const fresh = loadSave();
          if (fresh) setSave(fresh);
          try {
            const labels = claimed.map((g) => `${g.kind}${g.item_id ? `:${g.item_id}` : ""} ×${g.qty}`).join(", ");
            console.log("[gifts] recebidos:", labels);
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    })();
  }, []);



  if (!save) {
    // Sem identidade — não deveria acontecer porque AuthGate envolve este componente.
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-emerald-300 font-mono">
        Conectando...
      </div>
    );
  }

  // setSave existe apenas para satisfazer o eslint sobre o setter não usado;
  // o componente Game gerencia seu próprio estado a partir de `initial`.
  void setSave;
  return <Game initial={save} onReset={() => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(IDENTITY_KEY); } catch { /* ignore */ }
    window.location.reload();
  }} />;
}

// Constrói o save inicial para um treinador recém-criado, com a recompensa
// de primeiro acesso (50 pokébolas de evento, 50 poções de evento, 1 ovo raro).
function buildFirstTimeSave(identity: { id: string; name: string }): SaveState {
  const m = MAPS.village;
  return {
    identity: { id: identity.id, name: identity.name },
    // Sem starter real — o ovo raro é o starter do jogador. Mantemos um valor
    // por compatibilidade com saves antigos.
    starter: "charmander",
    profession: undefined,
    mapId: "village",
    pos: { x: m.spawn.x, y: m.spawn.y },
    dir: m.spawn.dir,
    gold: 0, crystal: 0,
    balls: { pokeball: 0, greatball: 0, fastball: 0, ultraball: 0, safariball: 0, masterball: 0 },
    inventory: {
      potion: 0,
      revive: 0,
      // Itens de evento — não vendáveis / não trocáveis.
      event_pokeball: 50,
      event_potion: 50,
      egg_rare: 1,
    },
    teamPets: [],
  };
}

function Game({ initial, onReset }: { initial: SaveState; onReset: () => void }) {
  const identity = initial.identity;
  const [mapId, setMapId] = useState<MapId>(initial.mapId);
  const [pos, setPos] = useState(initial.pos);
  const [dir, setDir] = useState<Dir>(initial.dir);
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState(false);

  const [gold, setGold] = useState(initial.gold);
  const [crystal, setCrystal] = useState(initial.crystal);
  const [ruby, setRuby] = useState<number>(initial.ruby ?? 0);
  const [balls, setBalls] = useState<Record<BallId, number>>(initial.balls);
  const [inventory, setInventory] = useState<Record<string, number>>(initial.inventory);
  const [teamPets, setTeamPets] = useState<PetInstance[]>(initial.teamPets);
  const [vipUntil, setVipUntil] = useState<number>(initial.vipUntil ?? 0);
  const [xpBoostUntil, setXpBoostUntil] = useState<number>(initial.xpBoostUntil ?? 0);
  const [storedPets, setStoredPets] = useState<PetInstance[]>(initial.storedPets ?? []);
  const [driveCapacity, setDriveCapacity] = useState<number>(initial.driveCapacity ?? 50);
  const [capturePoints, setCapturePoints] = useState<number>(initial.capturePoints ?? 0);
  const [driveOpen, setDriveOpen] = useState(false);
  const [trainerXp, setTrainerXp] = useState<number>(initial.trainerXp ?? 0);
  // Energia (regen passivo, gasto em coletas)
  const [energy, setEnergy] = useState<number>(() => {
    const e = initial.energy;
    return typeof e === "number" ? Math.max(0, Math.min(ENERGY_MAX, e)) : ENERGY_MAX;
  });
  const [energyUpdatedAt, setEnergyUpdatedAt] = useState<number>(() => initial.energyUpdatedAt ?? Date.now());
  const [npcDefeated, setNpcDefeated] = useState<Record<string, number>>(initial.npcDefeated ?? {});
  const [questsClaimed, setQuestsClaimed] = useState<Record<string, number>>(initial.questsClaimed ?? {});
  const [activeQuest, setActiveQuest] = useState<QuestInstance | null>(null);
  const [guideTopic, setGuideTopic] = useState<GuideTopic | null>(null);
  const [ascensionOpen, setAscensionOpen] = useState(false);
  const [codexOpen, setCodexOpen] = useState(false);
  const [codexSlots, setCodexSlots] = useState<Record<string, boolean>>(initial.codexSlots || {});
  const [unlockedMaps, setUnlockedMaps] = useState<Record<string, boolean>>(initial.unlockedMaps || {});
  const [ascendingPet, setAscendingPet] = useState<string | null>(null);
  const [botPositions, setBotPositions] = useState<Record<string, {x: number, y: number, dir: Dir}>>({});
  const [mushroomSpawn, setMushroomSpawn] = useState<{ x: number, y: number, mapId: MapId, createdAt: number } | null>(null);


  // Bot movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBotPositions(prev => {
        const next = { ...prev };
        FAKE_PLAYERS.forEach(bot => {
          if (!next[bot.id]) {
            next[bot.id] = { x: bot.x, y: bot.y, dir: bot.dir };
          }
          if (Math.random() < 0.15) { // 15% chance to move
            const dirs: Dir[] = ["up", "down", "left", "right"];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            const speed = 4;
            let { x, y } = next[bot.id];
            if (dir === "up") y -= speed;
            if (dir === "down") y += speed;
            if (dir === "left") x -= speed;
            if (dir === "right") x += speed;
            
            // Boundary checks (simplified)
            x = Math.max(100, Math.min(600, x));
            y = Math.max(100, Math.min(600, y));
            
            next[bot.id] = { x, y, dir };
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===== RARE MUSHROOM SPAWN — a cada 3 min + (185s), some em 60s se não pegar =====
  useEffect(() => {
    const SPAWN_INTERVAL = 185_000;
    const DESPAWN_TIME = 60_000;
    
    const trySpawnMushroom = () => {
      // Pega mapas que não sejam o laboratório ou centro pokémon
      const allowed: MapId[] = ["forest", "route2", "route3", "forestCave", "cave1", "cave2", "village", "palletRoute", "viridian", "route22", "victoryRoad", "florestaSecreta", "desert", "eliteRoute", "veneno"];
      const mid = allowed[Math.floor(Math.random() * allowed.length)];
      const mDef = MAPS[mid];
      if (!mDef || !mDef.spawnAreas || mDef.spawnAreas.length === 0) return;
      
      const pick = mDef.spawnAreas[Math.floor(Math.random() * mDef.spawnAreas.length)];
      const newSpawn = {
        x: pick.x,
        y: pick.y,
        mapId: mid,
        createdAt: Date.now()
      };
      
      setMushroomSpawn(newSpawn);
      
      setTimeout(() => {
        setMushroomSpawn(current => {
          if (current && current.createdAt === newSpawn.createdAt) {
            return null;
          }
          return current;
        });
      }, DESPAWN_TIME);
    };

    const interval = setInterval(trySpawnMushroom, SPAWN_INTERVAL);
    const firstSpawn = setTimeout(trySpawnMushroom, 10_000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(firstSpawn);
    };
  }, []);

  const handleCollectMushroom = useCallback(() => {
    if (!mushroomSpawn) return;
    
    const dx = pos.x - mushroomSpawn.x;
    const dy = pos.y - mushroomSpawn.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > 65) {
      setMessage("Chegue mais perto para pegar!");
      return;
    }
    
    setMushroomSpawn(null);
    setInventory(prev => ({
      ...prev,
      rare_mushroom: (prev.rare_mushroom || 0) + 1
    }));
    setMessage("Cogumelo Raro coletado! 🍄");
  }, [mushroomSpawn, pos.x, pos.y]);

  // ===== ÁRVORES COLETÁVEIS — bater pra coletar madeira =====
  type TreeNode = { id: string; mapId: MapId; x: number; y: number; kind?: TreeKind };
  const HARVEST_TREES: TreeNode[] = useMemo(() => [
    // Forest (Route 1)
    { id: "tf1", mapId: "village", x: 340, y: 300, kind: "strawberry" },
    { id: "tf2", mapId: "village", x: 520, y: 300 },
    { id: "tf3", mapId: "village", x: 900, y: 300, kind: "pink" },
    { id: "tf4", mapId: "village", x: 1080, y: 300, kind: "lemon" },
    { id: "tf5", mapId: "village", x: 1240, y: 300 },
    { id: "tf6", mapId: "village", x: 600, y: 800, kind: "pink" },
    // Route 2
    { id: "tr2a", mapId: "village", x: 860, y: 800, kind: "lemon" },
    { id: "tr2b", mapId: "village", x: 1120, y: 800 },
    { id: "tr2c", mapId: "route2", x: 640, y: 980, kind: "strawberry" },
    { id: "tr2d", mapId: "route2", x: 920, y: 720, kind: "strawberry" },
    // Route 3
    { id: "tr3a", mapId: "route3", x: 320, y: 540, kind: "strawberry" },
    { id: "tr3b", mapId: "route3", x: 780, y: 880, kind: "pink" },
    // Pallet route
    { id: "tpr1", mapId: "palletRoute", x: 240, y: 460, kind: "strawberry" },
    { id: "tpr2", mapId: "palletRoute", x: 980, y: 780, kind: "lemon" },
  ], []);
  const RESPAWN_MS = 30 * 60 * 1000; // 30 minutos
  const CHOP_MS = 30_000; // 30 segundos
  // Nível mínimo do treinador (do fighter) por tipo de árvore
  const TREE_LEVEL_REQ: Record<TreeKind, number> = { wood: 1, strawberry: 5, pink: 10, lemon: 15 };
  // Mapa id->timestamp em que foi cortada (null/0 = cheia)
  const [choppedAt, setChoppedAt] = useState<Record<string, number>>({});
  // Posição atual de cada árvore (sobrescreve a original após respawn aleatório)
  const [treePos, setTreePos] = useState<Record<string, { x: number; y: number }>>({});
  const [chopping, setChopping] = useState<{ id: string; startedAt: number } | null>(null);

  // ---- Caixas de sucata em cavernas (raras, respawn 30-60min) ----
  type CrateNode = { id: string; mapId: MapId; x: number; y: number };
  const CRATES: CrateNode[] = useMemo(() => [
    { id: "cr_fc1", mapId: "forestCave", x: 300, y: 400 },
    { id: "cr_fc2", mapId: "forestCave", x: 760, y: 1180 },
    { id: "cr_c1a", mapId: "cave1", x: 420, y: 520 },
    { id: "cr_c1b", mapId: "cave1", x: 920, y: 980 },
    { id: "cr_c2a", mapId: "cave2", x: 360, y: 720 },
    { id: "cr_c2b", mapId: "cave2", x: 880, y: 360 },
  ], []);
  const CRATE_RESPAWN_MS = 30 * 60 * 1000;
  // Caixa de sucata dropa apenas FERRO ou BRONZE (aleatório) + chance baixa de poção/gema
  const CRATE_LOOT: { key: string; name: string; weight: number; icon: string; mat?: MaterialId }[] = [
    { key: "mat_ferro",  name: "FERRO",   weight: 46, icon: "⛓️", mat: "ferro"  },
    { key: "mat_bronze", name: "BRONZE",  weight: 46, icon: "🟫", mat: "bronze" },
    { key: "potion",     name: "POÇÃO",   weight: 6,  icon: "🧪" },
    { key: "gema_rara",  name: "GEMA RARA", weight: 2, icon: "💎" },
  ];
  const [crateOpenedAt, setCrateOpenedAt] = useState<Record<string, number>>({});
  const [cratePos, setCratePos] = useState<Record<string, { x: number; y: number }>>({});

  // Posiciona caixas aleatoriamente quando entra num mapa (e a cada 30min muda)
  useEffect(() => {
    const here = CRATES.filter(c => c.mapId === mapId);
    if (here.length === 0) return;
    let cancelled = false;
    const place = (attempt = 0) => {
      if (cancelled) return;
      const m = MAPS[mapId];
      if (!m) return;
      const updates: Record<string, { x: number; y: number }> = {};
      let ok = true;
      for (const crate of here) {
        if (cratePos[crate.id] || crateOpenedAt[crate.id]) continue;
        let placed = false;
        for (let i = 0; i < 60; i++) {
          const rx = 80 + Math.random() * (m.w - 160);
          const ry = 80 + Math.random() * (m.h - 160);
          if (isWalkable(crate.mapId, rx, ry)) {
            updates[crate.id] = { x: rx, y: ry };
            placed = true;
            break;
          }
        }
        if (!placed) ok = false;
      }
      if (Object.keys(updates).length > 0) {
        setCratePos(prev => ({ ...prev, ...updates }));
      }
      if (!ok && attempt < 20) setTimeout(() => place(attempt + 1), 300);
    };
    place();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  const [ambushNpcs, setAmbushNpcs] = useState<Record<string, NpcDef>>({});
  const ambushNpcsRef = useRef<Record<string, NpcDef>>({});
  useEffect(() => { ambushNpcsRef.current = ambushNpcs; }, [ambushNpcs]);
  // tick para atualizar UI (respawn, progresso)
  const [, setHarvestTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setHarvestTick(t => t + 1), 250);
    return () => clearInterval(i);
  }, []);

  // handleChopTree is defined below after spawnNpcMon (needs access to it)



  const handleTurnInItem = useCallback((npcId: string) => {
    const quest = NPC_DIALOGUES[npcId]?.itemRequest;
    if (!quest) return;
    
    if ((inventory[quest.itemId] || 0) < quest.qty) {
      setMessage(`Você precisa de ${quest.qty}x ${quest.name}.`);
      return;
    }
    
    setInventory(prev => ({
      ...prev,
      [quest.itemId]: (prev[quest.itemId] || 0) - quest.qty
    }));
    
    setGold(prev => prev + 1500);
    setTrainerXp(prev => prev + 250);
    setMessage(`${quest.reward} (+1500G, +250 XP)`);
    
    setActiveNpcDialogue(null);
    setDialogueStep(0);
  }, [inventory, gold, trainerXp]);

  const [autoHuntConfigOpen, setAutoHuntConfigOpen] = useState(false);
  const [autoHuntSettings, setAutoHuntSettings] = useState(initial.autoHuntSettings || {
    priorityBall: "pokeball" as BallId,
    autoItems: true,
    minLevel: 1,
    maxLevel: 100,
    rarityPriority: ["common", "uncommon", "rare", "epic", "legendary", "mythic", "mythic_shiny"] as Rarity[],
  });
  const [switchCooldown, setSwitchCooldown] = useState(0);
  const [incenseType, setIncenseType] = useState<"common" | "rare" | "epic" | null>(null);
  const [ascensions, setAscensions] = useState<Record<string, number>>(initial.ascensions || {});
  const dismissedQuestsRef = useRef<Set<string>>(new Set());
  const [questCycle, setQuestCycle] = useState<number>(() => currentQuestCycle());
  useEffect(() => {
    const iv = setInterval(() => {
      const c = currentQuestCycle();
      setQuestCycle((prev) => (prev !== c ? c : prev));
    }, 60_000);
    return () => clearInterval(iv);
  }, []);

  // Aviso do Prof. Carvalho quando o incenso estiver acabando (≤5 min)
  const incenseWarnedRef = useRef(false);
  useEffect(() => { incenseWarnedRef.current = false; }, [incenseType, xpBoostUntil]);
  useEffect(() => {
    if (!incenseType) return;
    const iv = setInterval(() => {
      const left = xpBoostUntil - Date.now();
      if (left > 0 && left <= 5 * 60 * 1000 && !incenseWarnedRef.current) {
        incenseWarnedRef.current = true;
        setGuideTopic("incense_warning");
      }
    }, 15_000);
    return () => clearInterval(iv);
  }, [incenseType, xpBoostUntil]);
  const currentQuests = useMemo(
    () => QUEST_NPC_BASES.map((b) => instantiateQuest(b, questCycle)),
    [questCycle]
  );
  // Quais quests "rotativos" aparecem em village nesta sessao (sorteio por carregamento)
  const rotatingActive = useMemo(() => {
    const out: Record<string, boolean> = {};
    for (const q of QUEST_NPC_BASES) {
      if (!q.rotating) { out[q.id] = true; continue; }
      // 60% de chance de aparecer
      out[q.id] = Math.random() < 0.6;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeNpc, setActiveNpc] = useState<{ npcId: string; idx: number } | null>(null);
  const activeNpcRef = useRef(activeNpc);
  useEffect(() => { activeNpcRef.current = activeNpc; }, [activeNpc]);
  const [transition, setTransition] = useState<{ mapName: string; mew?: boolean } | null>(null);
  const [npcIntro, setNpcIntro] = useState<NpcDef | null>(null);
  const [activeNpcDialogue, setActiveNpcDialogue] = useState<NpcDef | null>(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [trainerLevelUpKey, setTrainerLevelUpKey] = useState<number>(0);

  const [wilds, setWilds] = useState<Record<MapId, Wild[]>>(() => {
    const out = {} as Record<MapId, Wild[]>;
    const lv = initial.teamPets[0]?.level ?? 1;
    MAP_IDS.forEach((m) => {
      if (!canSpawnHere(m)) { out[m] = []; return; }
      const a = MAPS[m].spawnAreas[0];
      out[m] = [{ id: `${m}-0`, x: a.x, y: a.y, pet: makeWildPet(lv) }];
    });
    return out;
  });

  const [market, setMarket] = useState<MarketListing[]>([]);
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [challenges, setChallenges] = useState<DbChallenge[]>([]);
  const [activeBattle, setActiveBattle] = useState<DbChallenge | null>(null);

  const [encounter, setEncounter] = useState<Wild | null>(initial.encounter ?? null);
  const [encounterPet, setEncounterPet] = useState<PetInstance | null>(initial.encounterPet ?? null);
  const [throwingBall, setThrowingBall] = useState<BallId | null>(null);
  const [slash, setSlash] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [wildHit, setWildHit] = useState<{ key: number; dmg: number } | null>(null);
  const [myHit, setMyHit] = useState<{ key: number; dmg: number } | null>(null);
  const [wildCrit, setWildCrit] = useState<number>(0);
  const [myCrit, setMyCrit] = useState<number>(0);
  const [wildEmote, setWildEmote] = useState<{ key: number; emoji: string } | null>(null);
  const [meEmote, setMeEmote] = useState<{ key: number; emoji: string } | null>(null);
  const [captureBurst, setCaptureBurst] = useState<number>(0);
  const battleTurn = useRef<"me" | "enemy">("me");
  const [playerTurn, setPlayerTurn] = useState(true);
  const [guardActive, setGuardActive] = useState(false);
  const [autoAttack, setAutoAttack] = useState(false);
  const [globalAlerts, setGlobalAlerts] = useState<{ key: number; text: string }[]>([]);
  const [message, setMessageRaw] = useState(`Bem-vindo ${identity.name}! Use o D-Pad para explorar.`);
  const [messageColor, setMessageColor] = useState<string | undefined>(undefined);
  const setMessage = (t: string) => { setMessageColor(undefined); setMessageRaw(t); };
  const [zoomIdx, setZoomIdx] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [questLogOpen, setQuestLogOpen] = useState(false);
  const [questTick, setQuestTick] = useState(0); // força re-render após avançar quest
  const [bagOpen, setBagOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<RemotePlayer | null>(null);
  const [guildOpen, setGuildOpen] = useState(false);
  const [rankedOpen, setRankedOpen] = useState(false);
  const [trainerTreeOpen, setTrainerTreeOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
  const [hasParty, setHasParty] = useState(false);
  const [partyMemberIds, setPartyMemberIds] = useState<Set<string>>(new Set());
  const [partyInviteCount, setPartyInviteCount] = useState(0);
  const partyBusRef = useRef<{ channel: import("@supabase/supabase-js").RealtimeChannel; partyId: string; memberIds: string[] } | null>(null);
  // Track whether an overlay was opened from the main menu, so closing it returns to the menu.
  const returnToMenuRef = useRef(false);
  const openFromMenu = useCallback((open: () => void) => {
    returnToMenuRef.current = true;
    setMenuOpen(false);
    open();
  }, []);
  const closeBackToMenu = useCallback((close: () => void) => () => {
    close();
    if (returnToMenuRef.current) { returnToMenuRef.current = false; setMenuOpen(true); }
  }, []);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [pendingInvites, setPendingInvites] = useState<import("@/lib/guildApi").GuildInvite[]>([]);
  const anyDialogueOpen = !!activeNpcDialogue;
  const [statsPet, setStatsPet] = useState<PetInstance | null>(null);
  const [weather, setWeather] = useState<Weather>("clear");
  const [manualWeather, setManualWeather] = useState<Weather | null>(null);
  const { phase: autoPhase } = useDayPhase();
  const [manualPhase, setManualPhase] = useState<DayPhase | null>(null);
  const dayPhase: DayPhase = manualPhase ?? autoPhase;
  const effectiveWeather: Weather = manualWeather ?? weather;
  const [envPickerOpen, setEnvPickerOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [healingAt, setHealingAt] = useState<number | null>(null);
  const [nurseAskOpen, setNurseAskOpen] = useState(false);
  const nurseAskedRef = useRef(false);
  const [profession, setProfession] = useState<Profession | undefined>(initial.profession);
  const [professionPickerOpen, setProfessionPickerOpen] = useState<boolean>(
    () => !initial.profession && initial.mapId !== "labo",
  );
  useEffect(() => {
    if (!profession && mapId === "village" && !professionPickerOpen) setProfessionPickerOpen(true);
  }, [mapId, profession, professionPickerOpen]);
  const [labIntroOpen, setLabIntroOpen] = useState<boolean>(false);
  const [oakStarterOpen, setOakStarterOpen] = useState<boolean>(false);
  const [oakDoneOpen, setOakDoneOpen] = useState<boolean>(false);
  const [healingNow, setHealingNow] = useState<number>(() => Date.now());
  const [autoVip, setAutoVip] = useState(false);
  const [rareAlert, setRareAlert] = useState<{ name: string; map: string; key: number } | null>(null);
  const [avatarIdx, setAvatarIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try { const v = window.localStorage.getItem("rubym.avatar"); const n = v ? parseInt(v, 10) : 0; return Number.isFinite(n) ? Math.max(0, n % AVATAR_PRESETS.length) : 0; } catch { return 0; }
  });
  useEffect(() => { try { window.localStorage.setItem("rubym.avatar", String(avatarIdx)); } catch { /* ignore */ } }, [avatarIdx]);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const avatarHue = AVATAR_PRESETS[avatarIdx].hue;
  const avatarSheet = AVATAR_PRESETS[avatarIdx].sheet;
  // ===== Box recompensa a cada 10 min =====
  const [pendingBox] = useState(false);
  // ===== PK / Modo perigo (Crystal Cave) =====
  const [pkActive, setPkActive] = useState(false);
  const [dangerUntil, setDangerUntil] = useState(0);
  const dangerActive = dangerUntil > Date.now();
  // ===== Orientação (Vertical / Horizontal / Tela grande) =====
  type ScreenMode = "portrait" | "landscape" | "fullscreen";
  const [orientation, setOrientation] = useState<ScreenMode>(() => {
    if (typeof window === "undefined") return "portrait";
    try {
      const saved = window.localStorage.getItem("rubym.orient") as ScreenMode | null;
      if (saved === "portrait" || saved === "landscape" || saved === "fullscreen") return saved;
    } catch { /* ignore */ }
    if (window.innerWidth > window.innerHeight && window.innerWidth >= 720) return "landscape";
    return "portrait";
  });
  useEffect(() => { try { window.localStorage.setItem("rubym.orient", orientation); } catch { /* ignore */ } }, [orientation]);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 480,
    h: typeof window !== "undefined" ? window.innerHeight : 860,
  }));
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("orientationchange", onResize); };
  }, []);
  // Dynamic portrait base: keep width fixed, derive height from viewport aspect
  // so the GameBoy shell always fills the entire screen (no wasted space).
  const portraitH = (() => {
    if (typeof window === "undefined") return 860;
    const ratio = viewport.h / Math.max(1, viewport.w);
    return Math.round(Math.min(1400, Math.max(720, 480 * ratio)));
  })();
  const landscapeW = (() => {
    if (typeof window === "undefined") return 920;
    const ratio = viewport.w / Math.max(1, viewport.h);
    return Math.round(Math.min(1400, Math.max(760, 500 * ratio)));
  })();
  const BASE_SIZE =
    orientation === "portrait" ? { w: 480, h: portraitH } :
    orientation === "landscape" ? { w: landscapeW, h: 500 } :
    { w: Math.max(360, viewport.w), h: Math.max(560, viewport.h) };
  const shellScale = orientation === "fullscreen"
    ? 1
    : Math.max(0.3, Math.min(viewport.w / BASE_SIZE.w, viewport.h / BASE_SIZE.h, 3));


  const trailRef = useRef<{ x: number; y: number; dir: Dir }[]>([]);
  const [petPos, setPetPos] = useState({ x: initial.pos.x, y: initial.pos.y + TILE * 2, dir: "up" as Dir });

  const keys = useRef<Record<string, boolean>>({});
  const lastMove = useRef(0);
  const portalCooldown = useRef(0);
  const mapIdRef = useRef(mapId);
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { mapIdRef.current = mapId; }, [mapId]);

  // ----- Active pet = first non-fainted -----
  const activeIdx = teamPets.findIndex((p) => !isFainted(p) && !isStarving(p));
  const leader = teamPets[0];
  const fighter = activeIdx >= 0 ? teamPets[activeIdx] : undefined;
  const hasFighter = !!fighter;
  const zoom = ZOOM_LEVELS[zoomIdx];

  // ===== Admin live state (invisible / noclip / speed / custom spawns) =====
  const { config: adminCfg, placed: placedSpawns } = useAdminLive();
  const adminRef = useRef(adminCfg);
  useEffect(() => { adminRef.current = adminCfg; }, [adminCfg]);
  const invisible = adminCfg.admin.invisible;
  const adminSpeed = Math.max(0.5, adminCfg.admin.speed || 1);

  const [specialNpcProfile, setSpecialNpcProfile] = useState<NpcDef | null>(null);
  const [captainNavioOpen, setCaptainNavioOpen] = useState(false);
  const [velhoMaresOpen, setVelhoMaresOpen] = useState(false);
  const [kurtOpen, setKurtOpen] = useState(false);
  const [kurtDialogOpen, setKurtDialogOpen] = useState(false);
  const [mercadorMatOpen, setMercadorMatOpen] = useState(false);
  const [moranguinhoOpen, setMoranguinhoOpen] = useState(false);
  const [botanistOpen, setBotanistOpen] = useState(false);
  const [fishermanOpen, setFishermanOpen] = useState(false);
  const anyOverlay = menuOpen || bagOpen || shopOpen || marketOpen || playersOpen || guildOpen || rankedOpen || !!statsPet || !!challengeTarget || !!activeBattle || pendingBox || !!healingAt || nurseAskOpen || labIntroOpen || oakStarterOpen || oakDoneOpen || professionPickerOpen || !!specialNpcProfile || captainNavioOpen || velhoMaresOpen || kurtOpen || kurtDialogOpen || mercadorMatOpen || moranguinhoOpen || botanistOpen || fishermanOpen || codexOpen || driveOpen || anyDialogueOpen || questLogOpen;

  const isFocusMode = codexOpen || driveOpen;
  const blocked = !!encounter || anyOverlay;
  const curMap = MAPS[mapId];

  const totalBalls = balls.pokeball + balls.greatball + balls.fastball + balls.ultraball + balls.safariball + balls.masterball;
  const trainerLevel = trainerLevelFromXp(trainerXp);
  const trainerXpBase = trainerXpForLevel(trainerLevel - 1);
  const trainerXpNext = trainerXpForLevel(trainerLevel);
  const trainerXpInLevel = trainerXp - trainerXpBase;
  const trainerXpSpan = Math.max(1, trainerXpNext - trainerXpBase);
  const trainerXpPct = Math.max(0, Math.min(100, (trainerXpInLevel / trainerXpSpan) * 100));
  const leaderIsShiny = leader && leader.rarity === "mythic";

  // Sobe nivel se passou do limite (caso o XP tenha pulado varios niveis)
  const lastTrainerLevelRef = useRef<number>(trainerLevel);
  useEffect(() => {
    if (trainerLevel > lastTrainerLevelRef.current) {
      setTrainerLevelUpKey(Date.now());
      setMessageColor("#fde047");
      setMessageRaw(`★ TREINADOR subiu para Lv ${trainerLevel}!`);
    }
    lastTrainerLevelRef.current = trainerLevel;
  }, [trainerLevel]);

  const gainTrainerXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setTrainerXp((x) => x + amount);
  }, []);

  // ----- Resgate da BOX BETA (pré-registro): entregue 1x ao entrar no jogo. -----
  useEffect(() => {
    try {
      if (localStorage.getItem("rubym.pendingBetaBox") !== "1") return;
      localStorage.removeItem("rubym.pendingBetaBox");
      setInventory((i) => ({ ...i, beta_box: (i.beta_box || 0) + 1 }));
      addBound("beta_box", 1);
      setMessage("Box do Pré-Registro recebida! Abra no inventário.");
    } catch { /* ignore */ }
  }, []);

  // ----- Auto-save -----
  useEffect(() => {
    const s: SaveState = {
      identity, starter: initial.starter, profession, mapId, pos, dir,
      gold, crystal, ruby, balls, inventory, teamPets,
      vipUntil, xpBoostUntil, storedPets, driveCapacity, capturePoints,
      trainerXp, npcDefeated, questsClaimed,
      ascensions, autoHuntSettings, codexSlots,
      encounter, encounterPet,
      energy, energyUpdatedAt,
    };
    writeSave(s);
  }, [identity, initial.starter, profession, mapId, pos, dir, gold, crystal, ruby, balls, inventory, teamPets, vipUntil, xpBoostUntil, storedPets, driveCapacity, capturePoints, trainerXp, npcDefeated, questsClaimed, ascensions, autoHuntSettings, codexSlots, encounter, encounterPet, energy, energyUpdatedAt]);

  // ----- Energia: regen +10/h (1 ponto a cada 6 min). Calcula no load e a cada 60s.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setEnergy((cur) => {
        if (cur >= ENERGY_MAX) {
          setEnergyUpdatedAt(now);
          return cur;
        }
        const elapsed = now - energyUpdatedAt;
        const gained = Math.floor(elapsed / ENERGY_MS_PER_POINT);
        if (gained <= 0) return cur;
        const next = Math.min(ENERGY_MAX, cur + gained);
        setEnergyUpdatedAt(energyUpdatedAt + gained * ENERGY_MS_PER_POINT);
        return next;
      });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [energyUpdatedAt]);

  // ----- Fome: decai 5% a cada 20 min real para cada pet (team + storage).
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setTeamPets((pets) => {
        let changed = false;
        const next = pets.map((p) => {
          const np = decayHungerForPet(p, now);
          if (np !== p) changed = true;
          return np;
        });
        return changed ? next : pets;
      });
      setStoredPets((pets) => {
        let changed = false;
        const next = pets.map((p) => {
          const np = decayHungerForPet(p, now);
          if (np !== p) changed = true;
          return np;
        });
        return changed ? next : pets;
      });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // ----- Admin live events: teleport + clínica (heal team) -----
  useEffect(() => {
    const onTp = (e: Event) => {
      const d = (e as CustomEvent).detail as { mapId?: MapId; x?: number; y?: number } | undefined;
      if (!d) return;
      if (d.mapId && MAPS[d.mapId]) setMapId(d.mapId);
      if (typeof d.x === "number" && typeof d.y === "number") setPos({ x: d.x, y: d.y });
      setMessage("✦ Teleporte aplicado");
    };
    const onHeal = () => {
      setTeamPets((pets) => pets.map((p) => ({
        ...p, hp: p.maxHp, faintedAt: null, fome: Math.max(p.fome, 80),
      })));
      setMessage("💖 Time totalmente curado (Clínica)");
    };
    window.addEventListener("rubym:teleport", onTp);
    window.addEventListener("rubym:heal", onHeal);
    return () => {
      window.removeEventListener("rubym:teleport", onTp);
      window.removeEventListener("rubym:heal", onHeal);
    };
  }, []);

  // ----- Revive fainted pets after 3 min -----
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setTeamPets((pets) => {
        let changed = false;
        const out = pets.map((p) => {
          if (p.faintedAt && now - p.faintedAt >= FAINT_REVIVE_MS) {
            changed = true;
            return { ...p, faintedAt: null, hp: p.maxHp };
          }
          return p;
        });
        return changed ? out : pets;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // ----- Time todo desmaiou: teletransporta para o Poke Center e cura em 60s -----
  useEffect(() => {
    if (healingAt) return;
    if (encounter || activeBattle) return;
    if (teamPets.length === 0) return;
    if (!teamPets.every((p) => isFainted(p))) return;
    const pc = MAPS.pkc;
    setMapId("pkc");
    setPos({ x: pc.spawn.x, y: pc.spawn.y });
    setDir(pc.spawn.dir);
    trailRef.current = [];
    setPetPos({ x: pc.spawn.x, y: pc.spawn.y + TILE * 2, dir: pc.spawn.dir });
    setHealingAt(Date.now());
    setMessageColor("#7ee787");
    setMessageRaw("Todos os Pokémon desmaiaram! A enfermeira está cuidando do seu time…");
  }, [teamPets, encounter, activeBattle, healingAt]);

  useEffect(() => {
    if (!healingAt) return;
    const HEAL_MS = 60_000;
    const tick = setInterval(() => {
      const now = Date.now();
      setHealingNow(now);
      if (now - healingAt >= HEAL_MS) {
        setTeamPets((pets) => pets.map((p) => ({ ...p, hp: p.maxHp, faintedAt: null, fome: Math.max(p.fome, 80) })));
        setHealingAt(null);
        setMessageColor("#7ee787");
        setMessageRaw("💖 Sua equipe foi totalmente recuperada!");
      }
    }, 250);
    return () => clearInterval(tick);
  }, [healingAt]);

  // ----- Nurse Joy: ao entrar no PK CENTER, pergunta se quer curar (se ninguem desmaiou) -----
  useEffect(() => {
    if (mapId !== "pkc") { nurseAskedRef.current = false; return; }
    if (healingAt || nurseAskOpen) return;
    if (nurseAskedRef.current) return;
    if (teamPets.length === 0) return;
    const allFainted = teamPets.every((p) => isFainted(p));
    if (allFainted) return; // o efeito automatico ja cuida disso
    const needsHeal = teamPets.some((p) => p.hp < p.maxHp || isFainted(p));
    if (!needsHeal) return;
    nurseAskedRef.current = true;
    setNurseAskOpen(true);
  }, [mapId, teamPets, healingAt, nurseAskOpen]);

  // ----- Weather: muda a cada 5 min -----
  useEffect(() => {
    if (manualWeather) return;
    const opts: Weather[] = ["clear", "rain", "snow"];
    let i = 0;
    setWeather("clear");
    const t = setInterval(() => {
      i = (i + 1) % opts.length;
      setWeather(opts[i]);
      setMessage(opts[i] === "rain" ? "Começou a chover…" : opts[i] === "snow" ? "Está nevando!" : "O tempo se acalmou.");
    }, WEATHER_INTERVAL_MS);
    return () => clearInterval(t);
  }, [manualWeather]);

  // (removido) Box passiva a cada 10 min — não há mais recompensa de gold por tempo.


  const tryStep = useCallback((d: Dir) => {
    setDir(d);
    setPos((p) => {
      const curMapId = mapIdRef.current;
      const m = MAPS[curMapId];
      let nx = p.x, ny = p.y;
      if (d === "left") nx -= TILE;
      if (d === "right") nx += TILE;
      if (d === "up") ny -= TILE;
      if (d === "down") ny += TILE;
      nx = Math.max(20, Math.min(m.w - 20, nx));
      ny = Math.max(20, Math.min(m.h - 20, ny));
      // Colisão por mapa (verde nos mockups = bloqueado). Admin "noclip"
      // ou velocidade > 2 ignora colisão pra debug. Portais sempre permitem.
      const noclip = !!adminRef.current.admin.invisible;
      const onPortal = m.portals.some(
        (pr) => nx >= pr.x && nx <= pr.x + pr.w && ny >= pr.y && ny <= pr.y + pr.h,
      );
      if (!noclip && !onPortal && !isWalkable(curMapId, nx, ny)) {
        // Bloqueado: mantém posição mas atualiza direção/animação.
        return p;
      }
      const t = trailRef.current;
      t.push({ x: p.x, y: p.y, dir: d });
      if (t.length > PET_TRAIL_LENGTH + 2) t.shift();
      if (t.length >= PET_TRAIL_LENGTH) {
        const tail = t[t.length - PET_TRAIL_LENGTH];
        setPetPos({ x: tail.x, y: tail.y, dir: tail.dir });
      }
      return { x: nx, y: ny };
    });
    setStep((s) => (s + 1) % 4);
    setMoving(true);
  }, []);

  // Pré-carrega as grids de colisão e abre os portais/spawns nelas.
  useEffect(() => {
    for (const mid of MAP_IDS) {
      const m = MAPS[mid];
      ensureCollision(mid, m.img, m.w, m.h);
    }
    // Garante que portais, ponto de spawn e áreas de spawn de wilds sejam caminháveis.
    const opener = setInterval(() => {
      for (const mid of MAP_IDS) {
        const m = MAPS[mid];
        const caveLike = mid === "forestCave" || mid === "cave1" || mid === "cave2";
        if (caveLike) markWalkableRect(mid, m.spawn.x - TILE * 2, m.spawn.y - TILE * 2, TILE * 4, TILE * 4);
        else markWalkableRect(mid, m.spawn.x - TILE * 5, m.spawn.y - TILE * 5, TILE * 10, TILE * 10);
        if (caveLike) {
          for (const p of m.portals) markWalkableRect(mid, p.x, p.y, p.w, p.h);
          // Escada da forestCave (entre platô superior e inferior) — sempre caminhável
          if (mid === "forestCave") markWalkableRect(mid, 470, 630, 70, 100);
          continue;
        }
        // Também garante um corredor de spawn até cada portal pra nunca travar ao teleportar
        for (const p of m.portals) {
          const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
          const steps = 12;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const cx = m.spawn.x + (pcx - m.spawn.x) * t;
            const cy = m.spawn.y + (pcy - m.spawn.y) * t;
            markWalkableRect(mid, cx - TILE, cy - TILE, TILE * 2, TILE * 2);
          }
        }
        for (const p of m.portals) markWalkableRect(mid, p.x - TILE, p.y - TILE, p.w + TILE * 2, p.h + TILE * 2);
        for (const sa of m.spawnAreas) markWalkableRect(mid, sa.x - TILE, sa.y - TILE, TILE * 3, TILE * 3);
      }
      // Árvores de coleta bloqueiam (tronco), mas deixamos a cabeça/área ao redor caminhável.
      for (const tree of HARVEST_TREES) {
        const tp = treePos[tree.id] || { x: tree.x, y: tree.y };
        markBlockedRect(tree.mapId, tp.x - 14, tp.y - 18, 28, 28);
      }
    }, 500);
    const stop = setTimeout(() => clearInterval(opener), 8000);
    return () => { clearInterval(opener); clearTimeout(stop); };
  }, []);

  // Wild walking
  useEffect(() => {
    const walk = setInterval(() => {
      setWilds((prev) => {
        const next = { ...prev };
        MAP_IDS.forEach((mid) => {
          const m = MAPS[mid];
          next[mid] = next[mid].map((w) => ({
            ...w,
            x: Math.max(40, Math.min(m.w - 40, w.x + (Math.random() - 0.5) * 24)),
            y: Math.max(40, Math.min(m.h - 40, w.y + (Math.random() - 0.5) * 24)),
          }));
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(walk);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (k === "escape" || k === "m") {
        e.preventDefault();
        if (activeNpcDialogue) { setActiveNpcDialogue(null); setDialogueStep(0); return; }
        if (mapPickerOpen) { setMapPickerOpen(false); return; }
        if (envPickerOpen) { setEnvPickerOpen(false); return; }
        // Close top-most overlay; returns to menu if it was opened from it.
        if (statsPet) { closeBackToMenu(() => setStatsPet(null))(); return; }
        if (codexOpen) { closeBackToMenu(() => setCodexOpen(false))(); return; }
        if (driveOpen) { closeBackToMenu(() => setDriveOpen(false))(); return; }
        if (guildOpen) { closeBackToMenu(() => setGuildOpen(false))(); return; }
        if (rankedOpen) { closeBackToMenu(() => setRankedOpen(false))(); return; }
        if (trainerTreeOpen) { closeBackToMenu(() => setTrainerTreeOpen(false))(); return; }
        if (partyOpen) { closeBackToMenu(() => setPartyOpen(false))(); return; }
        if (ascensionOpen) { closeBackToMenu(() => setAscensionOpen(false))(); return; }
        if (autoHuntConfigOpen) { closeBackToMenu(() => setAutoHuntConfigOpen(false))(); return; }
        if (marketOpen) { closeBackToMenu(() => setMarketOpen(false))(); return; }
        if (shopOpen) { closeBackToMenu(() => setShopOpen(false))(); return; }
        if (playersOpen) { closeBackToMenu(() => setPlayersOpen(false))(); return; }
        if (bagOpen) { closeBackToMenu(() => setBagOpen(false))(); return; }
        // Nothing open → toggle menu.
        if (k === "escape" && menuOpen) { setMenuOpen(false); return; }
        setMenuOpen((v) => !v);
      }
      if (k === "b") {
        e.preventDefault();
        // B fecha overlays abertos primeiro; senao abre/fecha bag
        if (mapPickerOpen) { setMapPickerOpen(false); return; }
        if (envPickerOpen) { setEnvPickerOpen(false); return; }
        if (menuOpen) { setMenuOpen(false); return; }
        if (shopOpen) { setShopOpen(false); return; }
        setBagOpen((v) => !v);
      }
      if (k === "z") { e.preventDefault(); setZoomIdx((i) => (i + 1) % ZOOM_LEVELS.length); }
      if (k === "c") { e.preventDefault(); setAutoVip((v) => !v); }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [mapPickerOpen, envPickerOpen, menuOpen, shopOpen, statsPet, codexOpen, driveOpen, guildOpen, rankedOpen, trainerTreeOpen, partyOpen, ascensionOpen, autoHuntConfigOpen, marketOpen, playersOpen, bagOpen, activeNpcDialogue, closeBackToMenu]);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      const stepMs = 110 / Math.max(0.5, adminRef.current.admin.speed || 1);
      if (!blocked && t - lastMove.current > stepMs) {

        const k = keys.current;
        if (k["arrowup"] || k["w"]) { tryStep("up"); lastMove.current = t; }
        else if (k["arrowdown"] || k["s"]) { tryStep("down"); lastMove.current = t; }
        else if (k["arrowleft"] || k["a"]) { tryStep("left"); lastMove.current = t; }
        else if (k["arrowright"] || k["d"]) { tryStep("right"); lastMove.current = t; }
        else setMoving(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [blocked, tryStep]);

  // ----- Auto-VIP: walks toward nearest wild automatically -----
  useEffect(() => {
    if (!autoVip) return;
    const t = setInterval(() => {
      if (blocked || !hasFighter) return;
      const list = wilds[mapIdRef.current];
      if (!list || list.length === 0) return;
      let best = list[0];
      let bd = Infinity;
      for (const w of list) {
        const dx = w.x - pos.x, dy = w.y - pos.y;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = w; }
      }
      const dx = best.x - pos.x, dy = best.y - pos.y;
      if (Math.abs(dx) > Math.abs(dy)) tryStep(dx > 0 ? "right" : "left");
      else tryStep(dy > 0 ? "down" : "up");
    }, 140);
    return () => clearInterval(t);
  }, [autoVip, blocked, hasFighter, wilds, pos.x, pos.y, tryStep]);

  // Auto-throw best ball when encounter and autoVip
  useEffect(() => {
    if (!autoVip || !encounter || !encounterPet || throwingBall) return;
    const hpRatio = encounterPet.hp / encounterPet.maxHp;
    if (hpRatio > 0.4) return;
    
    // Check if level is in priority range
    if (encounterPet.level < autoHuntSettings.minLevel || encounterPet.level > autoHuntSettings.maxLevel) return;
    
    // Use configured priority ball
    const ball = autoHuntSettings.priorityBall as BallId;
    if ((balls[ball] || 0) <= 0) return;
    
    const id = setTimeout(() => throwBall(ball), 800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVip, encounter, encounterPet?.hp, throwingBall, balls, autoHuntSettings]);

  // Cooldown timer for switching
  useEffect(() => {
    if (switchCooldown > 0) {
      const t = setInterval(() => setSwitchCooldown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [switchCooldown]);

  // Incense Professor Oak notification
  useEffect(() => {
    if (xpBoostUntil > 0) {
      const timer = setInterval(() => {
        if (Date.now() >= xpBoostUntil) {
          setGuideTopic("incense");
          setXpBoostUntil(0);
          setIncenseType(null);
        }
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [xpBoostUntil]);

  // Função de teleporte com transição do Dragonite Mail
  const doTeleport = useCallback((target: MapId, spawn?: { x: number; y: number }, faceDir?: Dir) => {
    const m = MAPS[target];
    const sx = spawn?.x ?? m.spawn.x;
    const sy = spawn?.y ?? m.spawn.y;
    const fd = faceDir ?? m.spawn.dir;
    const isMew = MEW_TRANSITION_MAPS.has(target);
    setTransition({ mapName: m.name, mew: isMew });
    const dur = isMew ? 2200 : 1300;
    setTimeout(() => {
      setMapId(target);
      setPos({ x: sx, y: sy });
      setDir(fd);
      trailRef.current = [];
      setPetPos({ x: sx, y: sy + TILE * 2, dir: fd });
      setMessage(`Entrou em ${m.name}`);
      setTransition(null);
    }, dur);
  }, []);

  // Cria o próximo wild do duelo de NPC e engata encounter
  const spawnNpcMon = useCallback((npc: NpcDef, idx: number) => {
    const def = npc.team[idx];
    const pet = makePet(def.species, def.level, def.rarity ?? undefined);
    const wild: Wild = { id: `npc:${npc.id}:${idx}`, x: pos.x, y: pos.y - 20, pet };
    setEncounter(wild);
    setEncounterPet({ ...pet });
    setActiveNpc({ npcId: npc.id, idx });
    activeNpcRef.current = { npcId: npc.id, idx };
    setMessage(`${npc.name} envia ${SPECIES_NAME[def.species]} (Lv${def.level})!`);
  }, [pos.x, pos.y]);

  const handleChopTree = useCallback((tree: TreeNode) => {
    if (tree.mapId !== mapId) return;
    const cAt = choppedAt[tree.id] || 0;
    if (cAt && Date.now() - cAt < RESPAWN_MS) {
      setMessage("Esta árvore ainda está se recuperando...");
      return;
    }
    if (chopping) return;
    const kind = tree.kind || "wood";
    const req = TREE_LEVEL_REQ[kind] ?? 1;
    const playerLv = fighter?.level ?? 0;
    if (playerLv < req) {
      setMessage(`Precisa Lv ${req} para colher esta árvore! (você está Lv ${playerLv})`);
      return;
    }
    const cur = treePos[tree.id] || { x: tree.x, y: tree.y };
    const dx = pos.x - cur.x;
    const dy = pos.y - cur.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 70) {
      setMessage("Chegue mais perto da árvore para cortar!");
      return;
    }
    if (energy < ENERGY_TREE_COST) {
      toast.error(`Sem energia! (${energy}/${ENERGY_MAX}) — recarrega +10 por hora.`);
      setMessage(`Sem energia para cortar! (${energy}/${ENERGY_MAX})`);
      return;
    }
    const startedAt = Date.now();
    setChopping({ id: tree.id, startedAt });
    playTreeChopSfx(0.55);
    setTimeout(() => {
      setChopping(curC => (curC && curC.id === tree.id && curC.startedAt === startedAt) ? null : curC);
      setChoppedAt(prev => ({ ...prev, [tree.id]: Date.now() }));
      playTreeChopSfx(0.7);
      // consome energia
      setEnergy((e) => Math.max(0, e - ENERGY_TREE_COST));
      const v = TREE_VARIANTS[kind];
      setInventory(prev => ({ ...prev, [v.itemKey]: (prev[v.itemKey] || 0) + 1 }));
      // Morango e Limão são itens de evento — marcam como bound (não vendáveis / não trocáveis).
      if (v.itemKey === "fruta_morango" || v.itemKey === "fruta_limao") addBound(v.itemKey, 1);
      setMessage(v.msg);

      // Agenda respawn em posição aleatória do mesmo mapa
      setTimeout(() => {
        const m = MAPS[tree.mapId];
        if (m) {
          let nx = tree.x, ny = tree.y;
          for (let i = 0; i < 40; i++) {
            const rx = 80 + Math.random() * (m.w - 160);
            const ry = 80 + Math.random() * (m.h - 160);
            if (isWalkable(tree.mapId, rx, ry)) { nx = rx; ny = ry; break; }
          }
          setTreePos(prev => ({ ...prev, [tree.id]: { x: nx, y: ny } }));
        }
        setChoppedAt(prev => {
          const n = { ...prev };
          delete n[tree.id];
          return n;
        });
      }, RESPAWN_MS);

      // 40% chance: Team Rocket ambush!
      const f = fighter;
      if (f && !encounter && Math.random() < 0.40) {
        const baseLv = f.level;
        const lv = () => {
          const offset = [-3, 0, 3][Math.floor(Math.random() * 3)];
          return Math.max(1, baseLv + offset);
        };
        const sp1 = pickWeightedNear(baseLv);
        const sp2 = pickWeightedNear(baseLv);
        const ambushId = `ambush:${Date.now()}`;
        const ambush: NpcDef = {
          id: ambushId, mapId, x: pos.x, y: pos.y,
          sprite: npcTreeTrainerSprite,
          name: "EQUIPE ROCKET",
          quote: "Preparem-se para encrenca! Essa arvore e nossa!",
          team: [
            { species: sp1, level: lv() },
            { species: sp2, level: lv() },
          ],
          rewardGold: 200 + baseLv * 10,
          rewardXp: 40 + baseLv * 3,
        };
        setAmbushNpcs(prev => ({ ...prev, [ambushId]: ambush }));
        ambushNpcsRef.current = { ...ambushNpcsRef.current, [ambushId]: ambush };
        setNpcIntro(ambush);
        setMessageColor("#ff5577");
        setMessageRaw(`! EMBOSCADA! ${ambush.name} aparece atras da arvore!`);
        setTimeout(() => {
          setNpcIntro(null);
          spawnNpcMon(ambush, 0);
        }, 1600);
      }
    }, CHOP_MS);
  }, [chopping, choppedAt, treePos, mapId, pos.x, pos.y, fighter, encounter, spawnNpcMon]);

  const handleOpenCrate = useCallback((crate: { id: string; mapId: MapId; x: number; y: number }) => {
    if (crate.mapId !== mapId) return;
    const oAt = crateOpenedAt[crate.id] || 0;
    const cur = cratePos[crate.id] || { x: crate.x, y: crate.y };
    const dx = pos.x - cur.x;
    const dy = pos.y - cur.y;
    if (Math.sqrt(dx*dx + dy*dy) > 60) {
      setMessage("Chegue mais perto da caixa!");
      return;
    }
    if (oAt) {
      setMessage("Esta caixa já foi saqueada. Volte mais tarde...");
      return;
    }
    // sorteio ponderado
    const totalW = CRATE_LOOT.reduce((s, l) => s + l.weight, 0);
    let r = Math.random() * totalW;
    let pick = CRATE_LOOT[0];
    for (const l of CRATE_LOOT) { r -= l.weight; if (r <= 0) { pick = l; break; } }
    if (pick.mat) {
      const ms = loadMaterialsStore();
      ms[pick.mat] = (ms[pick.mat] ?? 0) + 1;
      saveMaterialsStore(ms);
    } else {
      setInventory(prev => ({ ...prev, [pick.key]: (prev[pick.key] || 0) + 1 }));
    }
    setMessageColor("#fde047");
    setMessage(`Caixa de sucata: +1 ${pick.name}! ${pick.icon}`);
    const respawnMs = CRATE_RESPAWN_MS;
    setCrateOpenedAt(prev => ({ ...prev, [crate.id]: Date.now() }));
    setTimeout(() => {
      const m = MAPS[crate.mapId];
      if (m) {
        let nx = crate.x, ny = crate.y;
        for (let i = 0; i < 40; i++) {
          const rx = 80 + Math.random() * (m.w - 160);
          const ry = 80 + Math.random() * (m.h - 160);
          if (isWalkable(crate.mapId, rx, ry)) { nx = rx; ny = ry; break; }
        }
        setCratePos(prev => ({ ...prev, [crate.id]: { x: nx, y: ny } }));
      }
      setCrateOpenedAt(prev => { const n = { ...prev }; delete n[crate.id]; return n; });
    }, respawnMs);
  }, [crateOpenedAt, cratePos, mapId, pos.x, pos.y]);




  // Portal & wild proximity
  useEffect(() => {
    if (encounter) return;
    if (transition) return;
    // Auto-teleport ao pisar no portal
    if (Date.now() > portalCooldown.current) {
      const m = MAPS[mapId];
      for (const pr of m.portals) {
        if (pos.x >= pr.x && pos.x <= pr.x + pr.w && pos.y >= pr.y && pos.y <= pr.y + pr.h) {
          portalCooldown.current = Date.now() + 1500;
          doTeleport(pr.to, pr.spawn, pr.spawn.dir);
          return;
        }
      }
    }
    if (!hasFighter) return;
    if (adminRef.current.admin.invisible) return; // admin invisível: não desperta wilds

    // Proximidade de NPCs treinadores
    if (!activeNpcRef.current) {
      const allNpcs = [...NPCS, ...EXTRA_NPCS];
      const npcsHere = allNpcs.filter((n) => n.mapId === mapId);
      for (const n of npcsHere) {
        const last = npcDefeated[n.id] ?? 0;
        if (Date.now() - last < NPC_COOLDOWN_MS) continue;
        const dx = n.x - pos.x, dy = n.y - pos.y;
        if (dx * dx + dy * dy < 48 * 48) {
          setNpcIntro(n);
          setMessageColor("#fde047");
          {
            const pg = professionGreeting(profession, identity.name);
            setMessageRaw(`${n.name}: "${pg} ${n.quote}"`);
          }
          setTimeout(() => {
            setNpcIntro(null);
            spawnNpcMon(n, 0);
          }, 1400);
          return;
        }
      }
    }

    // Proximidade de NPCs de QUEST
    // Remove do "dismissed" se jogador ja saiu da area
    for (const qid of dismissedQuestsRef.current) {
      const q = currentQuests.find((c) => c.id === qid);
      if (!q || q.mapId !== mapId) { dismissedQuestsRef.current.delete(qid); continue; }
      const dx = q.x - pos.x, dy = q.y - pos.y;
      if (dx * dx + dy * dy >= QUEST_PROX * QUEST_PROX) {
        dismissedQuestsRef.current.delete(qid);
      }
    }
    if (!activeQuest) {
      const qHere = currentQuests.filter((q) => q.mapId === mapId && rotatingActive[q.id] && !dismissedQuestsRef.current.has(q.id));
      for (const q of qHere) {
        const dx = q.x - pos.x, dy = q.y - pos.y;
        if (dx * dx + dy * dy < QUEST_PROX * QUEST_PROX) {
          // Lucy: apos resgatar o brinde gratis, abre o seletor de skins (150g)
          if (q.id === "q-stylist" && questsClaimed["q-stylist"] != null) {
            dismissedQuestsRef.current.add(q.id);
            setAvatarPickerOpen(true);
            return;
          }
          setActiveQuest(q);
          return;
        }
      }
    }

    for (const w of wilds[mapId]) {
      const dx = w.x - pos.x, dy = w.y - pos.y;
      if (dx * dx + dy * dy < 34 * 34) {
        setEncounter(w);
        setEncounterPet({ ...w.pet });
        setMessage(`${SPECIES_NAME[w.pet.species]} Lv${w.pet.level} [${RARITY_NAME[w.pet.rarity]}] apareceu!`);
        return;
      }
    }
  }, [pos, mapId, wilds, encounter, hasFighter, invisible, transition, npcDefeated, spawnNpcMon, activeQuest, rotatingActive, doTeleport]);

  // (doTeleport e spawnNpcMon são definidos antes deste effect — abaixo movidos)


  // ===== ADMIN: custom-placed spawn points. Each PlacedSpawn produces a
  //   wild with id `placed:<spawnId>`. When killed/caught (existing code
  //   filters by id), we mark killedAt → respawns automatically with a
  //   random species after `respawnMs`.
  useEffect(() => {
    const sync = () => {
      const lv = leader?.level ?? 1;
      const now = Date.now();
      setWilds((prev) => {
        const next = { ...prev };
        for (const mid of MAP_IDS) next[mid] = next[mid].filter((w) => !w.id.startsWith("placed:") || placedSpawns.some((p) => `placed:${p.id}` === w.id));
        for (const p of placedSpawns) {
          const wildId = `placed:${p.id}`;
          const mid = p.mapId as MapId;
          if (!MAPS[mid]) continue;
          const alreadyThere = next[mid].some((w) => w.id === wildId);
          if (alreadyThere) continue;
          const dead = p.killedAt != null && now - p.killedAt < p.respawnMs;
          if (dead) continue;
          const sp = (p.species as Species);
          const pet = SPECIES_BASE[sp] ? makePet(sp, Math.max(1, p.level || lv)) : makeWildPet(lv);
          next[mid] = [...next[mid], { id: wildId, x: p.x, y: p.y, pet }];
        }
        return next;
      });
    };
    sync();
    const iv = setInterval(sync, 2000);
    return () => clearInterval(iv);
  }, [placedSpawns, leader?.level]);

  useEffect(() => {
    const bornAt = new Map<string, number>();
    const schedule = () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      spawnTimer.current = setTimeout(() => {
        const lv = leader?.level ?? 1;
        setWilds((prev) => {
          const next: Record<MapId, Wild[]> = { ...prev };
          const epicSpawns: { sp: Species; map: string }[] = [];
          MAP_IDS.forEach((mid) => {
            if (!canSpawnHere(mid)) return;
            if (next[mid].length >= MAX_WILDS_PER_MAP) return;
            const areas = MAPS[mid].spawnAreas;
            const pick = areas[Math.floor(Math.random() * areas.length)];
            const w: Wild = { id: `${mid}-${Date.now()}-${Math.random()}`, x: pick.x, y: pick.y, pet: makeWildPet(lv, mid) };
            bornAt.set(w.id, Date.now());
            next[mid] = [...next[mid], w];
            if (w.pet.rarity === "epic") epicSpawns.push({ sp: w.pet.species, map: MAPS[mid].name });
          });
          // Aviso global de 30s para cada épico que apareceu neste tick.
          if (epicSpawns.length > 0) {
            const first = epicSpawns[0];
            const alertKey = Date.now() + Math.random();
            setRareAlert({ name: `ÉPICO! ${SPECIES_NAME[first.sp]}`, map: first.map, key: alertKey });
            setTimeout(() => setRareAlert((cur) => (cur && cur.key === alertKey ? null : cur)), 30_000);
          }
          return next;
        });
        schedule();
      }, nextSpawnDelay());
    };
    schedule();
    return () => { if (spawnTimer.current) clearTimeout(spawnTimer.current); };
  }, [leader?.level]);

  // ===== LENDÁRIOS — só aparecem em mapas marcados como `secret`.
  // Hoje nenhum mapa tem essa flag (Ilhas Misteriosas estão bloqueadas), então
  // o spawn fica efetivamente desligado. Mantém-se apenas um aviso global a
  // cada 15 minutos lembrando os jogadores que algo está aparecendo lá.
  useEffect(() => {
    const LEGEND: Species[] = ["mewtwo", "moltres", "zapdos", "articuno", "charizard_shiny", "charizard_alt", "mew", "dragonite"];
    const trySpawnRare = () => {
      const secretMaps = MAP_IDS.filter((mid) => (MAPS[mid] as { secret?: boolean }).secret === true);
      if (secretMaps.length === 0) return;
      if (Math.random() > 0.7) return;
      const sp = LEGEND[Math.floor(Math.random() * LEGEND.length)];
      const mid = secretMaps[Math.floor(Math.random() * secretMaps.length)];
      const areas = MAPS[mid].spawnAreas;
      const pick = areas[Math.floor(Math.random() * areas.length)];
      const lv = Math.max(35, (leader?.level ?? 1) + 10);
      const wildId = `rare-${mid}-${Date.now()}`;
      const pet = makePet(sp, lv, "mythic");
      const wild: Wild = { id: wildId, x: pick.x, y: pick.y, pet };
      setWilds((prev) => ({ ...prev, [mid]: [...prev[mid], wild] }));
      const alertKey = Date.now();
      setRareAlert({ name: SPECIES_NAME[sp], map: MAPS[mid].name, key: alertKey });
      setTimeout(() => setRareAlert((cur) => (cur && cur.key === alertKey ? null : cur)), 30_000);
      setTimeout(() => setWilds((prev) => ({ ...prev, [mid]: prev[mid].filter((w) => w.id !== wildId) })), 120_000);
    };
    const iv = setInterval(trySpawnRare, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [leader?.level]);

  // Aviso global a cada 15 min: "Um lendário surgiu nas Ilhas Misteriosas!"
  useEffect(() => {
    const fire = () => {
      const key = Date.now() + Math.random();
      setGlobalAlerts((arr) => [...arr.slice(-2), { key, text: "✦ Um Pokémon Lendário surgiu nas Ilhas Misteriosas!" }]);
    };
    const iv = setInterval(fire, 15 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // ===== MULTIPLAYER PRESENCE =====
  useEffect(() => {
    const upsert = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await gameDb.from("players").upsert({
        id: identity.id, name: identity.name, map: mapIdRef.current,
        x: Math.round(pos.x), y: Math.round(pos.y), dir,
        leader_species: leader?.species ?? null,
        leader_rarity: leader?.rarity ?? null,
        level: leader?.level ?? 1,
        trainer_level: trainerLevel,
        craft_points: capturePoints,
        guild_name: guild?.name ?? null,
        updated_at: new Date().toISOString(),
      });
    };
    upsert();
    const t = setInterval(upsert, PRESENCE_INTERVAL_MS);
    return () => { clearInterval(t); };
  }, [identity, pos.x, pos.y, dir, mapId, leader?.species, leader?.rarity, leader?.level, trainerLevel, capturePoints, guild?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== TOP RANKED — envia score (debounced) =====
  useEffect(() => {
    const t = setTimeout(() => {
      void recordRankedScore(trainerLevel, capturePoints, guild?.name ?? null);
    }, 4000);
    return () => clearTimeout(t);
  }, [trainerLevel, capturePoints, guild?.name]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const since = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
      const { data } = await gameDb.from("players").select("*").gte("updated_at", since);
      if (active && data) setRemotePlayers((data as unknown as RemotePlayer[]).filter((p) => p.id !== identity.id));
    };
    load();
    const ch = supabase.channel("rt-players").on("postgres_changes", { event: "*", schema: "public", table: "players" }, load).subscribe();
    const refresh = setInterval(load, 4000);
    const cleanup = setInterval(async () => {
      const cutoff = new Date(Date.now() - PRESENCE_TIMEOUT_MS).toISOString();
      await gameDb.from("players").delete().lt("updated_at", cutoff);
    }, 30_000);
    const onUnload = () => { void gameDb.from("players").delete().eq("id", identity.id); };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      active = false; clearInterval(refresh); clearInterval(cleanup);
      window.removeEventListener("beforeunload", onUnload);
      void supabase.removeChannel(ch);
      void gameDb.from("players").delete().eq("id", identity.id);
    };
  }, [identity.id]);

  // ===== GUILD (Supabase) =====
  const refreshGuild = useCallback(async () => {
    const g = await fetchMyGuild(identity.id);
    setGuild(g);
  }, [identity.id]);
  const refreshInvites = useCallback(async () => {
    const list = await fetchPendingInvites(identity.id, identity.name);
    setPendingInvites(list);
  }, [identity.id, identity.name]);
  useEffect(() => {
    void refreshGuild();
    void refreshInvites();
    const unsub = subscribeMyInvites(identity.id, () => { void refreshInvites(); void refreshGuild(); });
    const t = setInterval(() => { void refreshInvites(); }, 15_000);
    return () => { unsub(); clearInterval(t); };
  }, [identity.id, refreshGuild, refreshInvites]);

  // ===== PARTY invite badge (polling + realtime) =====
  useEffect(() => {
    let last = 0;
    const refresh = async () => {
      const list = await listPartyInvitesFor(identity.id);
      setPartyInviteCount((prev) => {
        if (list.length > prev && Date.now() - last > 2000) {
          last = Date.now();
          const newest = list[0];
          if (newest) toast.message(`📨 Convite de party: ${newest.party_name}`, { description: `de ${newest.from_name}` });
        }
        return list.length;
      });
    };
    void refresh();
    const ch = supabase.channel(`party-invites-badge-${identity.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "party_invites", filter: `target_id=eq.${identity.id}` }, () => { void refresh(); })
      .subscribe();
    const t = setInterval(refresh, 20_000);
    return () => { void supabase.removeChannel(ch); clearInterval(t); };
  }, [identity.id]);



  // ===== SHARED MARKET =====
  useEffect(() => {
    const load = async () => {
      const { data } = await gameDb.from("market_listings").select("*").order("created_at", { ascending: false });
      if (data) {
        setMarket((data as unknown as DbListing[]).map((d) => ({
          id: d.id, sellerId: d.seller_name, kind: d.kind,
          petData: d.pet_data ?? undefined, itemId: d.item_id ?? undefined,
          qty: d.qty ?? undefined, price: d.price, currency: d.currency,
        })));
      }
    };
    load();
    const ch = supabase.channel("rt-market").on("postgres_changes", { event: "*", schema: "public", table: "market_listings" }, load).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, []);

  // ===== CHALLENGES =====
  useEffect(() => {
    const load = async () => {
      const { data } = await gameDb.from("challenges").select("*")
        .or(`challenger_id.eq.${identity.id},opponent_id.eq.${identity.id}`)
        .order("created_at", { ascending: false }).limit(20);
      if (data) setChallenges(data as unknown as DbChallenge[]);
    };
    load();
    const ch = supabase.channel("rt-challenges").on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, load).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [identity.id]);

  // Accept incoming or start active battle
  useEffect(() => {
    const accepted = challenges.find((c) => c.status === "accepted" && (c.challenger_id === identity.id || c.opponent_id === identity.id));
    if (accepted && !activeBattle) setActiveBattle(accepted);
  }, [challenges, activeBattle, identity.id]);

  // ===== GLOBAL EVENTS (capture announces) =====
  useEffect(() => {
    const ch = supabase.channel("global-events")
      .on("broadcast", { event: "capture" }, (msg: { payload?: { text?: string } }) => {
        const payload = msg.payload as { text?: string } | undefined;
        if (!payload?.text) return;
        setGlobalAlerts((arr) => [...arr.slice(-2), { key: Date.now() + Math.random(), text: payload.text! }]);
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, []);
  // Auto-prune alerts after their animation completes (~6s)
  useEffect(() => {
    if (globalAlerts.length === 0) return;
    const t = setTimeout(() => setGlobalAlerts((arr) => arr.slice(1)), 6200);
    return () => clearTimeout(t);
  }, [globalAlerts]);

  // Clear transient battle FX so the same key can re-fire
  useEffect(() => { if (!wildEmote) return; const t = setTimeout(() => setWildEmote(null), 1100); return () => clearTimeout(t); }, [wildEmote]);
  useEffect(() => { if (!meEmote) return; const t = setTimeout(() => setMeEmote(null), 1100); return () => clearTimeout(t); }, [meEmote]);
  useEffect(() => { if (!wildCrit) return; const t = setTimeout(() => setWildCrit(0), 1300); return () => clearTimeout(t); }, [wildCrit]);
  useEffect(() => { if (!myCrit) return; const t = setTimeout(() => setMyCrit(0), 1300); return () => clearTimeout(t); }, [myCrit]);
  useEffect(() => { if (!captureBurst) return; const t = setTimeout(() => setCaptureBurst(0), 1000); return () => clearTimeout(t); }, [captureBurst]);

  // Combat: turn-based. Player picks a skill (manual). Enemy attacks automatically after.
  useEffect(() => {
    if (!encounter || !encounterPet || !fighter) return;
    // New encounter: player goes first
    setPlayerTurn(true);
    setGuardActive(false);
    battleTurn.current = "me";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter?.id]);

  // Enemy auto-turn: runs whenever it becomes the enemy's turn
  useEffect(() => {
    if (!encounter || !encounterPet || !fighter) return;
    if (playerTurn) return;
    const t = setTimeout(() => {
      if (switchCooldown > 0) { setPlayerTurn(true); return; }
      setTeamPets((pets) => {
        if (!pets.length || !encounterPet) return pets;
        const idx = pets.findIndex((p) => !isFainted(p));
        if (idx < 0) return pets;
        const me = pets[idx];
        if (Math.random() < 0.10) {
          setMeEmote({ key: Date.now() + 8, emoji: "💨" });
          setMessage(`${SPECIES_NAME[me.species]} esquivou!`);
          return pets;
        }
        const atk = calcStat(encounterPet, "atk");
        const def = calcStat(me, "def");
        const isCrit = Math.random() < 1 / 14;
        const critMul = isCrit ? 1.6 : 1;
        const isDefend = Math.random() < 0.12;
        const defendMul = isDefend ? 0.4 : 1;
        const guardMul = guardActive ? 0.45 : 1;
        const dmg = Math.max(1, Math.floor(((2 * encounterPet.level / 5 + 2) * 50 * (atk / Math.max(1, def))) / 50 * (0.6 + Math.random() * 0.3) * critMul * defendMul * guardMul));
        const nhp = Math.max(0, me.hp - dmg);
        setMyHit({ key: Date.now() + 1, dmg });
        setWildEmote({ key: Date.now() + 3, emoji: isDefend ? "🛡" : "😠" });
        if (isCrit) setMyCrit(Date.now());
        if (isDefend) setMeEmote({ key: Date.now() + 6, emoji: "🛡" });
        if (guardActive) setMeEmote({ key: Date.now() + 11, emoji: "🛡" });
        const np: PetInstance = { ...me, hp: nhp, faintedAt: nhp <= 0 ? Date.now() : me.faintedAt };
        const copy = pets.slice(); copy[idx] = np;
        if (nhp <= 0) {
          const hasNext = copy.some((p) => !isFainted(p));
          setTimeout(() => {
            if (hasNext) {
              setMessage(`${SPECIES_NAME[me.species]} desmaiou! Proximo Pokemon entrou!`);
            } else {
              setMessage(`Time todo desmaiou! Revive em 3 min.`);
              if (activeNpcRef.current) {
                const allNpcs = [...NPCS, ...EXTRA_NPCS, ...Object.values(ambushNpcsRef.current)];
                const lostTo = allNpcs.find((n) => n.id === activeNpcRef.current!.npcId);
                if (lostTo) setNpcDefeated((d) => ({ ...d, [lostTo.id]: Date.now() }));
                setActiveNpc(null); activeNpcRef.current = null;
              }
              setEncounter(null); setEncounterPet(null);
            }
          }, 500);
        }
        return copy;
      });
      setGuardActive(false);
      setPlayerTurn(true);
      battleTurn.current = "me";
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerTurn, encounter?.id]);

  // Player chose a skill: apply it and end player's turn
  const doPlayerSkill = useCallback((skillId: "tackle" | "heavy" | "special" | "guard", moveName?: string) => {
    if (!encounter || !encounterPet || !fighter) return;
    if (!playerTurn) return;
    if (throwingBall) return;

    if (skillId === "guard") {
      setTeamPets((pets) => {
        if (!pets.length) return pets;
        const idx = pets.findIndex((p) => !isFainted(p));
        if (idx < 0) return pets;
        const me = pets[idx];
        const healed = Math.floor(me.maxHp * 0.15);
        const nhp = Math.min(me.maxHp, me.hp + healed);
        const copy = pets.slice();
        copy[idx] = { ...me, hp: nhp };
        setMeEmote({ key: Date.now(), emoji: "🛡" });
        setMessage(`${SPECIES_NAME[me.species]} defendeu e curou +${healed}!`);
        return copy;
      });
      setGuardActive(true);
      setPlayerTurn(false);
      battleTurn.current = "enemy";
      return;
    }

    setEncounterPet((cur) => {
      if (!cur) return cur;
      // Heavy: 15% miss
      if (skillId === "heavy" && Math.random() < 0.15) {
        setMeEmote({ key: Date.now() + 9, emoji: "💨" });
        setMessage(`${moveName ?? "Golpe Pesado"} errou!`);
        return cur;
      }
      // Wild dodge chance
      if (Math.random() < 0.08) {
        setWildEmote({ key: Date.now() + 9, emoji: "💨" });
        setMessage(`${SPECIES_NAME[cur.species]} esquivou!`);
        return cur;
      }
      const useSpecial = skillId === "special";
      const atk = calcStat(fighter, useSpecial ? "spa" : "atk");
      const def = calcStat(cur, useSpecial ? "spd" : "def");
      const baseCrit = skillId === "heavy" ? 0.25 : 1 / 10;
      const isCrit = Math.random() < baseCrit;
      const critMul = isCrit ? 2.0 : 1;
      const skillMul = skillId === "heavy" ? 1.5 : skillId === "special" ? 1.25 : 1.0;
      const isDefend = Math.random() < 0.10;
      const defendMul = isDefend ? 0.4 : 1;
      const dmg = Math.max(1, Math.floor(((2 * fighter.level / 5 + 2) * 50 * (atk / Math.max(1, def))) / 50 * (0.85 + Math.random() * 0.3) * critMul * skillMul * defendMul));
      let nhp = Math.max(0, cur.hp - dmg);
      const healCh = RARITY_HEAL_CHANCE[cur.rarity] || 0;
      let healed = 0;
      if (nhp > 0 && healCh > 0 && Math.random() < healCh) {
        healed = Math.floor(cur.maxHp * 0.10);
        nhp = Math.min(cur.maxHp, nhp + healed);
      }
      setSlash((s) => s + 1);
      setWildHit({ key: Date.now(), dmg });
      if (isCrit) { setWildCrit(Date.now()); setMeEmote({ key: Date.now() + 2, emoji: "💥" }); }
      if (useSpecial) setMeEmote({ key: Date.now() + 10, emoji: "✨" });
      if (isDefend) setWildEmote({ key: Date.now() + 7, emoji: "🛡" });
      const skillName = moveName ?? (skillId === "heavy" ? "Golpe Pesado" : skillId === "special" ? "Raio Especial" : "Investida");
      setMessage(isDefend
        ? `${SPECIES_NAME[cur.species]} defendeu! Sofreu ${dmg}.`
        : healed > 0
        ? `${skillName}! ${dmg} dano · ${SPECIES_NAME[cur.species]} curou +${healed}!`
        : `${skillName}! ${dmg} dano${isCrit ? " CRITICO!" : ""}`);
      if (nhp <= 0) setTimeout(() => victory(cur), 700);
      return { ...cur, hp: nhp };
    });
    setPlayerTurn(false);
    battleTurn.current = "enemy";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter, encounterPet, fighter, playerTurn, throwingBall, guardActive]);

  // Auto-attack: when enabled, picks Investida automatically on player's turn
  useEffect(() => {
    if (!autoAttack) return;
    if (!encounter || !encounterPet || !fighter) return;
    if (!playerTurn) return;
    if (throwingBall) return;
    const t = setTimeout(() => doPlayerSkill("tackle"), 700);
    return () => clearTimeout(t);
  }, [autoAttack, playerTurn, encounter, encounterPet, fighter, throwingBall, doPlayerSkill]);

  // Drop de Chicote Verde do Bulbasaur (45% ao derrotar ou capturar)
  const tryBulbasaurDrop = (sp: Species) => {
    if (sp !== "bulbasaur" && sp !== "bulbasaur_hat") return false;
    if (Math.random() >= 0.45) return false;
    const ms = loadMaterialsStore();
    ms.chicote = (ms.chicote ?? 0) + 1;
    saveMaterialsStore(ms);
    return true;
  };

  const victory = (enemy: PetInstance) => {
    const sp = SPECIES_BASE[enemy.species];
    const goldGain = Math.floor((sp.goldRange[0] + Math.random() * (sp.goldRange[1] - sp.goldRange[0])) * (1 + enemy.level * 0.1));
    const crystalGain = Math.random() < sp.crystalChance ? 1 + Math.floor(Math.random() * 2) : 0;
    // +20% XP por raridade alta
    const xpBonus = RARITY_XP_BONUS[enemy.rarity] || 1;
    const xpGain = Math.floor((20 + enemy.level * 8) * xpBonus);
    setGold((g) => g + goldGain);
    if (crystalGain) setCrystal((c) => c + crystalGain);
    // Drops em épicos/míticos: poção, revive, ou pokébolas
    let dropMsg = "";
    if (enemy.rarity === "epic" || enemy.rarity === "mythic") {
      const roll = Math.random();
      if (roll < 0.45) {
        setInventory((i) => ({ ...i, potion: (i.potion || 0) + 1 }));
        dropMsg = " +🧪Pocao";
      } else if (roll < 0.70) {
        setInventory((i) => ({ ...i, revive: (i.revive || 0) + 1 }));
        dropMsg = " +💖Revive";
      } else if (roll < 0.90) {
        setBalls((b) => ({ ...b, pokeball: b.pokeball + 2 }));
        dropMsg = " +2🔴";
      } else if (enemy.rarity === "mythic") {
        setBalls((b) => ({ ...b, ultraball: b.ultraball + 1 }));
        dropMsg = " +⚫UltraBall";
      }
    }
    if (tryBulbasaurDrop(enemy.species)) dropMsg += " +🌿Chicote";
    // === Party XP share: divide igual + bônus 10% por membro extra no mesmo mapa ===
    const bus = partyBusRef.current;
    const partyMatesHere = bus ? bus.memberIds.filter((id) => {
      const rp = remotePlayers.find((rr) => rr.id === id);
      return rp && rp.map === mapIdRef.current;
    }) : [];
    const partySize = partyMatesHere.length + (bus ? 1 : 0);
    const baseXp = Date.now() < xpBoostUntil ? Math.floor(xpGain * 1.05) : xpGain;
    const sharedXp = partySize > 1 ? Math.floor((baseXp / partySize) * (1 + 0.1 * (partySize - 1))) : baseXp;
    setTeamPets((pets) => {
      const idx = pets.findIndex((p) => !isFainted(p));
      if (idx < 0) return pets;
      const copy = pets.slice(); copy[idx] = gainXp(copy[idx], sharedXp); return copy;
    });
    if (bus && partyMatesHere.length > 0) {
      void broadcastToParty(bus.channel, { type: "xp_share", fromId: identity.id, fromName: identity.name, mapId: mapIdRef.current, xpEach: sharedXp });
    }
    const xpMsg = partySize > 1 ? `+${sharedXp}xp (party ÷${partySize} +${(partySize-1)*10}%)` : `+${xpGain}xp`;
    setMessage(`Vitoria! +${goldGain}g ${crystalGain ? `+${crystalGain}💎 ` : ""}${xpMsg}${dropMsg}`);
    if (encounter?.id?.startsWith("placed:")) markPlacedKilled(encounter.id.slice(7));
    setWilds((prev) => ({ ...prev, [mapIdRef.current]: prev[mapIdRef.current].filter((w) => w.id !== encounter?.id) }));

    // Trainer XP por derrotar selvagem
    const wildTrainerXp = 4 + Math.floor(enemy.level * 1.2) + (enemy.rarity === "mythic" ? 60 : enemy.rarity === "epic" ? 25 : enemy.rarity === "rare" ? 10 : 0);
    gainTrainerXp(wildTrainerXp);

    // NPC duel: avança para o próximo pokémon ou encerra
    const npcInfo = activeNpcRef.current;
    if (encounter?.id?.startsWith("npc:") && npcInfo) {
      const allNpcs = [...NPCS, ...EXTRA_NPCS, ...Object.values(ambushNpcsRef.current)];
      const npc = allNpcs.find((n) => n.id === npcInfo.npcId);
      if (npc) {
        const nextIdx = npcInfo.idx + 1;
        if (nextIdx < npc.team.length) {
          setTimeout(() => spawnNpcMon(npc, nextIdx), 1200);
        } else {
          // Vitória total contra o treinador
          const isAmbush = npc.id.startsWith("ambush:");
          const bonusGold = npc.rewardGold;
          const bonusXp = npc.rewardXp;
          setGold((g) => g + bonusGold);
          gainTrainerXp(bonusXp);
          setNpcDefeated((d) => ({ ...d, [npc.id]: Date.now() }));
          setActiveNpc(null);
          activeNpcRef.current = null;
          setMessageColor("#fde047");
          if (isAmbush) {
            setBalls((b) => ({ ...b, pokeball: b.pokeball + 2 }));
            setMessageRaw(`★ ${npc.name} fugiu! +${bonusGold}g · +${bonusXp} XP · +2 🔴 Pokebola`);
            // limpa ambush
            setAmbushNpcs((prev) => { const cp = { ...prev }; delete cp[npc.id]; return cp; });
            const cur = { ...ambushNpcsRef.current }; delete cur[npc.id]; ambushNpcsRef.current = cur;
          } else {
            setMessageRaw(`★ ${npc.name} derrotado! +${bonusGold}g · +${bonusXp} XP de Treinador`);
          }
          setTimeout(() => { setEncounter(null); setEncounterPet(null); }, 800);
        }
        return;
      }
    }

    setTimeout(() => { setEncounter(null); setEncounterPet(null); }, 800);
  };

  const throwBall = (ballId: BallId) => {
    if (!encounter || !encounterPet || throwingBall) return;
    // Não pode capturar pokémon de NPC treinador
    if (encounter.id.startsWith("npc:")) {
      setMessage("Nao da! E do treinador!");
      return;
    }
    const eventBallAvailable = ballId === "pokeball" && (inventory.event_pokeball || 0) > 0;
    if ((balls[ballId] || 0) <= 0 && !eventBallAvailable) { setMessage(`Sem ${BALLS[ballId].name}!`); return; }
    // Pokeball/greatball/fastball não capturam pokémons míticos
    if (encounterPet.rarity === "mythic" && (ballId === "pokeball" || ballId === "greatball" || ballId === "fastball")) {
      setMessage("Mitico! Use ULTRA BALL ou superior!");
      return;
    }
    setThrowingBall(ballId);
    if (eventBallAvailable && (balls[ballId] || 0) <= 0) {
      setInventory((i) => ({ ...i, event_pokeball: Math.max(0, (i.event_pokeball || 0) - 1) }));
      setMessage(`Jogou Pokebola de Evento!`);
    } else {
      setBalls((b) => ({ ...b, [ballId]: b[ballId] - 1 }));
      setMessage(`Jogou ${BALLS[ballId].name}!`);
    }
    setShaking(true);
    setTimeout(() => setShaking(false), 700);
    setTimeout(() => {
      const ch = catchChance(ballId, encounterPet);
      if (Math.random() < ch) {
        const caught: PetInstance = { ...encounterPet, uid: crypto.randomUUID(), lealdade: 40, faintedAt: null };
        setCaptureBurst(Date.now());
        setMeEmote({ key: Date.now() + 4, emoji: "😄" });
        if (caught.species === "caterpie") bumpCaterpieCount();
        if (teamPets.length >= TEAM_MAX) {
          setStoredPets((s) => [...s, caught]);
          setMessage(`Gotcha! ${SPECIES_NAME[caught.species]} enviado ao DRIVE (time cheio).`);
        } else {
          setTeamPets((t) => [...t, caught]);
          setMessage(`Gotcha! ${SPECIES_NAME[caught.species]} capturado!`);
        }
        if (tryBulbasaurDrop(caught.species)) {
          setTimeout(() => setMessage(`+1 🌿 Chicote Verde do Bulbasaur!`), 1200);
        }
        // XP de Treinador por captura
        const capXp = 6 + Math.floor(caught.level * 1.5) + (caught.rarity === "mythic" ? 100 : caught.rarity === "epic" ? 40 : caught.rarity === "rare" ? 18 : caught.rarity === "uncommon" ? 6 : 2);
        gainTrainerXp(capXp);
        // Broadcast global se for raro+
        const r = caught.rarity;
        if (r === "rare" || r === "epic" || r === "mythic") {
          const star = r === "mythic" ? "✦✦✦" : r === "epic" ? "✦✦" : "✦";
          const txt = `${star} ${identity.name} capturou um ${SPECIES_NAME[caught.species]} [${RARITY_NAME[r]}]!`;
          try {
            void supabase.channel("global-events").send({
              type: "broadcast", event: "capture", payload: { text: txt },
            });
          } catch { /* ignore */ }
          // mostrar localmente também
          setGlobalAlerts((arr) => [...arr.slice(-2), { key: Date.now(), text: txt }]);
        }
        setWilds((prev) => ({ ...prev, [mapId]: prev[mapId].filter((w) => w.id !== encounter.id) }));
        if (encounter.id.startsWith("placed:")) markPlacedKilled(encounter.id.slice(7));
        setWilds((prev) => ({ ...prev, [mapId]: prev[mapId].filter((w) => w.id !== encounter.id) }));
        setTimeout(() => { setEncounter(null); setEncounterPet(null); setThrowingBall(null); }, 800);
      } else {
        setMessage("Voce falhou! Aguarde 2s para jogar de novo...");
        // Cooldown de 2s para evitar spam de cliques
        setTimeout(() => setThrowingBall(null), 2000);
      }
    }, 900);
  };

  const flee = () => {
    if (encounter) {
      // Se for duelo de NPC: fuga = derrota → cooldown
      if (encounter.id.startsWith("npc:") && activeNpcRef.current) {
        const allNpcs = [...NPCS, ...EXTRA_NPCS, ...Object.values(ambushNpcsRef.current)];
        const npc = allNpcs.find((n) => n.id === activeNpcRef.current!.npcId);
        if (npc) {
          setNpcDefeated((d) => ({ ...d, [npc.id]: Date.now() }));
          setActiveNpc(null); activeNpcRef.current = null;
          setMessage(`Voce fugiu de ${npc.name}!`);
        }
      } else {
        setMessage("Voce fugiu! 💨");
      }
      setEncounter(null); setEncounterPet(null);
      setThrowingBall(null);
      return;
    }
    if (challengeTarget) return setChallengeTarget(null);
    if (statsPet) return setStatsPet(null);
    if (playersOpen) return setPlayersOpen(false);
    if (shopOpen) return setShopOpen(false);
    if (marketOpen) return setMarketOpen(false);
    if (bagOpen) return setBagOpen(false);
    if (menuOpen) return setMenuOpen(false);
  };

  const usePotion = () => {
    const hasEvent = (inventory.event_potion || 0) > 0;
    const hasNormal = (inventory.potion || 0) > 0;
    if (!hasEvent && !hasNormal) { setMessage("Sem Pocoes."); return; }
    if (!fighter) return;
    setInventory((i) => {
      if ((i.event_potion || 0) > 0) return { ...i, event_potion: i.event_potion - 1 };
      return { ...i, potion: (i.potion || 0) - 1 };
    });
    setTeamPets((pets) => {
      const idx = pets.findIndex((p) => !isFainted(p));
      if (idx < 0) return pets;
      const me = pets[idx];
      const heal = Math.floor(me.maxHp * 0.2);
      const copy = pets.slice();
      copy[idx] = { ...me, hp: Math.min(me.maxHp, me.hp + heal) };
      return copy;
    });
    setMessage(hasEvent ? `Pocao de Evento curou +20%!` : `Pocao curou +20%!`);
  };

  const useRevive = (uid: string) => {
    if ((inventory.revive || 0) <= 0) { setMessage("Sem Revive."); return; }
    setInventory((i) => ({ ...i, revive: i.revive - 1 }));
    setTeamPets((pets) => pets.map((p) => p.uid === uid ? { ...p, faintedAt: null, hp: Math.floor(p.maxHp / 2) } : p));
    setMessage("Pet revivido!");
  };

  // Usar item fora de batalha (potion no líder; outros: buff genérico)
  const useItemOnLeader = (itemId: string) => {
    const qty = itemId === "potion" ? (inventory.potion || 0) : itemId === "revive" ? (inventory.revive || 0) : (inventory[itemId] || 0);
    if (qty <= 0) { setMessage("Sem itens."); return; }
    if (itemId === "potion") { usePotion(); return; }
    if (itemId === "revive") {
      const fainted = teamPets.find((p) => p.faintedAt);
      if (!fainted) { setMessage("Ninguem desmaiado."); return; }
      useRevive(fainted.uid); return;
    }
    if (itemId === "incenseXp") {
      setInventory((i) => ({ ...i, incenseXp: (i.incenseXp || 0) - 1 }));
      setXpBoostUntil(Date.now() + 10 * 60 * 1000);
      setIncenseType("common");
      setMessage("Incenso ativado! +5% XP por 10 min");
      return;
    }
    if (itemId === "incenseRare") {
      setInventory((i) => ({ ...i, incenseRare: (i.incenseRare || 0) - 1 }));
      setXpBoostUntil(Date.now() + 15 * 60 * 1000);
      setIncenseType("rare");
      setMessage("Incenso Raro ativado! +15% XP por 15 min");
      return;
    }
    if (itemId === "incenseEpic") {
      setInventory((i) => ({ ...i, incenseEpic: (i.incenseEpic || 0) - 1 }));
      setXpBoostUntil(Date.now() + 20 * 60 * 1000);
      setIncenseType("epic");
      setMessage("Incenso Épico ativado! +30% XP por 20 min");
      return;
    }
    if (itemId === "vipPass") {
      setInventory((i) => ({ ...i, vipPass: (i.vipPass || 0) - 1 }));
      setVipUntil(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setMessage("Aventure Rules ativado! AUTO liberado por 30 dias");
      return;
    }
    if (itemId === "skinAura") {
      setInventory((i) => ({ ...i, [itemId]: (i[itemId] || 0) - 1 }));
      setMessage(`${itemId.toUpperCase()} ativado!`);
      return;
    }
    if (itemId === "egg") {
      setInventory((i) => ({ ...i, egg: (i.egg || 0) - 1 }));
      const list: Species[] = ["caterpie", "pikachu", "vulpix", "jigglypuff", "bulbasaur", "squirtle", "charmander"];
      const sp = list[Math.floor(Math.random() * list.length)];
      const newPet = makePet(sp, 1);
      setTeamPets((t) => [...t, newPet]);
      setMessage(`Ovo chocou: ${SPECIES_NAME[sp]}!`);
      return;
    }
    if (itemId === "egg_rare") {
      if ((inventory.egg_rare || 0) <= 0) { setMessage("Sem Ovo Raro."); return; }
      setInventory((i) => ({ ...i, egg_rare: (i.egg_rare || 0) - 1 }));
      const starters: Species[] = ["charmander", "squirtle", "bulbasaur"];
      const sp = starters[Math.floor(Math.random() * starters.length)];
      const newPet = makePet(sp, 1, "uncommon");
      newPet.lealdade = 80;
      newPet.locked = true; // pet de evento — não vende, não troca, não anuncia
      setTeamPets((t) => [...t, newPet]);
      setMessage(`Ovo Raro chocou: ${SPECIES_NAME[sp]}! (vinculado a sua conta)`);
      return;
    }
    if (itemId === "beta_box") {
      if ((inventory.beta_box || 0) <= 0) { setMessage("Sem Box de Pré-Registro."); return; }
      setInventory((i) => ({
        ...i,
        beta_box: (i.beta_box || 0) - 1,
        beta_egg: (i.beta_egg || 0) + 1,
        incenseXp: (i.incenseXp || 0) + 2,
      }));
      setBalls((b) => ({ ...b, pokeball: b.pokeball + 10 }));
      addBound("beta_egg", 1);
      addBound("incenseXp", 2);
      addBound("pokeball", 10);
      setMessage("Box aberta: 1 Ovo Comum, 2 Incensos e 10 Poké Bolas!");
      return;
    }
    if (itemId === "beta_egg") {
      if ((inventory.beta_egg || 0) <= 0) { setMessage("Sem Ovo de Pré-Registro."); return; }
      setInventory((i) => ({ ...i, beta_egg: (i.beta_egg || 0) - 1 }));
      if (Math.random() < 0.5) {
        const list: Species[] = ["caterpie", "pikachu", "vulpix", "jigglypuff", "bulbasaur", "squirtle", "charmander"];
        const sp = list[Math.floor(Math.random() * list.length)];
        const newPet = makePet(sp, 1);
        newPet.locked = true; // não vende, não troca
        setTeamPets((t) => [...t, newPet]);
        setMessage(`Ovo chocou: ${SPECIES_NAME[sp]}! (vinculado à sua conta)`);
      } else {
        setCapturePoints((p) => p + 1);
        setMessage("O ovo se desfez em poeira... +1 Star Dust.");
      }
      return;
    }
    if (itemId === "event_box") {
      if ((inventory.event_box || 0) <= 0) { setMessage("Sem Caixa de Evento."); return; }
      // Sorteia 1 dos 5 prêmios
      const roll = Math.random();
      let prizeMsg = "";
      const drops: Record<string, number> = {};
      if (roll < 0.30) { const q = 1 + Math.floor(Math.random() * 5); drops.fruta_morango = q; prizeMsg = `+${q} Morango(s) 🍓`; }
      else if (roll < 0.60) { const q = 1 + Math.floor(Math.random() * 5); drops.fruta_limao = q; prizeMsg = `+${q} Limão(ões) 🍋`; }
      else if (roll < 0.85) { const q = 1 + Math.floor(Math.random() * 3); setBalls((b) => ({ ...b, pokeball: b.pokeball + q })); addBound("pokeball", q); prizeMsg = `+${q} Pokébola(s) 🔴`; }
      else if (roll < 0.97) { const q = 1 + Math.floor(Math.random() * 2); setCapturePoints((p) => p + q); prizeMsg = `+${q} Star Dust ✦`; }
      else { drops.incenseXp = 1; prizeMsg = `+1 Incenso de XP 🍯`; }
      setInventory((i) => {
        const next: Record<string, number> = { ...i, event_box: (i.event_box || 0) - 1 };
        for (const [k, v] of Object.entries(drops)) next[k] = (next[k] || 0) + v;
        return next;
      });
      for (const [k, v] of Object.entries(drops)) addBound(k, v);
      setMessage(`🎁 Caixa de Evento: ${prizeMsg}!`);
      return;
    }
    setMessage("Item nao usavel agora.");
  };

  // Entrega de quest: verifica need, consome, dá reward + give (tudo bound).
  const handleQuestDeliver = ({ questId, step }: { questId: string; step: { npc: string; need?: { item: string; qty: number } } }) => {
    if (step.need) {
      const { item, qty } = step.need;
      if (item.startsWith("pet:")) {
        const sp = item.slice(4);
        const allSpecies = [...teamPets, ...(storedPets || [])].map((p) => p.species);
        if (!allSpecies.includes(sp as Species)) { setMessage(`Você precisa de um ${sp} na sua coleção.`); return { ok: false }; }
        // Não consome o pet, apenas verifica.
      } else {
        if ((inventory[item] || 0) < qty) { setMessage(`Itens insuficientes (${qty}× ${item}).`); return { ok: false }; }
        setInventory((inv) => ({ ...inv, [item]: (inv[item] || 0) - qty }));
      }
    }
    const result = advanceQuestStep(questId);
    // Aplica give (NPC entrega ao jogador)
    if (result.give) {
      setInventory((inv) => {
        const next = { ...inv };
        for (const [k, v] of Object.entries(result.give!)) next[k] = (next[k] || 0) + v;
        return next;
      });
      for (const [k, v] of Object.entries(result.give)) addBound(k, v);
    }
    // Aplica reward
    if (result.reward) {
      if (result.reward.gold) setGold((g) => g + result.reward!.gold!);
      if (result.reward.items) {
        setInventory((inv) => {
          const next = { ...inv };
          for (const [k, v] of Object.entries(result.reward!.items!)) next[k] = (next[k] || 0) + v;
          return next;
        });
        for (const [k, v] of Object.entries(result.reward.items)) addBound(k, v);
      }
      if (result.reward.message) toast.success(result.reward.message);
    }
    if (result.finished) toast.success(`✓ Quest concluída!`);
    setQuestTick((t) => t + 1);
    return { ok: true };
  };
  void QUEST_DEFS; // mantido para tree-shaking explícito; QuestLogOverlay usa internamente.


  const buy = (it: typeof SHOP[number], qty: number = 1) => {
    const q = Math.max(1, Math.floor(qty));
    const total = it.price * q;
    if (it.currency === "gold" && gold < total) { setMessage("Gold insuficiente"); return; }
    if (it.currency === "crystal" && crystal < total) { setMessage("Crystal insuficiente"); return; }
    if (it.currency === "ruby" && ruby < total) { setMessage("Ruby insuficiente"); return; }
    if (it.currency === "gold") setGold((g) => g - total);
    else if (it.currency === "ruby") setRuby((r) => r - total);
    else setCrystal((c) => c - total);
    if (it.id === "pokeball" || it.id === "greatball" || it.id === "fastball" || it.id === "ultraball" || it.id === "safariball" || it.id === "masterball") {
      setBalls((b) => ({ ...b, [it.id]: b[it.id as BallId] + q }));
    } else {
      setInventory((i) => ({ ...i, [it.id]: (i[it.id] || 0) + q }));
    }
    setMessageRaw(`💖 Comprou ${q}× ${it.name}!`);
    setMessageColor("#ff4f9a");
  };

  const buyMarket = async (l: MarketListing) => {
    if (l.currency === "gold" && gold < l.price) return setMessage("Gold insuficiente");
    if (l.currency === "crystal" && crystal < l.price) return setMessage("Crystal insuficiente");
    const { error, count } = await gameDb.from("market_listings").delete({ count: "exact" }).eq("id", l.id);
    if (error || !count) { setMessage("Anuncio ja vendido!"); return; }
    if (l.currency === "gold") setGold((g) => g - l.price); else setCrystal((c) => c - l.price);
    if (l.kind === "pet" && l.petData) setTeamPets((t) => [...t, { ...l.petData!, uid: crypto.randomUUID() }]);
    if (l.kind === "item" && l.itemId) setInventory((i) => ({ ...i, [l.itemId!]: (i[l.itemId!] || 0) + (l.qty || 1) }));
    setMessage("Compra concluida!");
  };

  const postMarket = async (l: MarketListing, sourceUid?: string, srcItem?: { id: string; qty: number }) => {
    if (srcItem) {
      const current = inventory[srcItem.id] || 0;
      if (isBoundLocked(srcItem.id, current, srcItem.qty)) {
        setMessage("Item de evento — não pode ser vendido!");
        return;
      }
    }
    const { error } = await gameDb.from("market_listings").insert({
      seller_id: identity.id, seller_name: identity.name,
      kind: l.kind, pet_data: (l.petData ?? null) as unknown as never, item_id: l.itemId ?? null,
      qty: l.qty ?? 1, price: l.price, currency: l.currency,
    });
    if (error) { setMessage("Erro ao anunciar"); return; }
    if (sourceUid) setTeamPets((t) => t.filter((p) => p.uid !== sourceUid));
    if (srcItem) setInventory((i) => ({ ...i, [srcItem.id]: Math.max(0, (i[srcItem.id] || 0) - srcItem.qty) }));
    setMessage("Anuncio postado!");
  };

  const setAsLeader = (uid: string) => {
    const target = teamPets.find((p) => p.uid === uid);
    if (target && isStarving(target)) {
      toast.error("Pokémon com fome! Alimente com 🍓 ou 🍋 antes de equipar como líder.");
      return;
    }
    setTeamPets((t) => {
      const idx = t.findIndex((p) => p.uid === uid);
      if (idx <= 0) return t;
      const p = t[idx];
      return [p, ...t.slice(0, idx), ...t.slice(idx + 1)];
    });
    // Ao trocar líder: gera 1-2 wilds lv1-5 no mapa atual (chance dos pequenos aparecerem)
    setWilds((prev) => {
      const mid = mapIdRef.current;
      if (!canSpawnHere(mid)) return prev;
      const m = MAPS[mid];
      const out = { ...prev };
      const add = 1 + Math.floor(Math.random() * 2);
      const lowPool: Species[] = ["caterpie", "jigglypuff", "bulbasaur", "charmander", "squirtle", "vulpix", "pikachu"];
      const arr = [...out[mid]];
      for (let i = 0; i < add && arr.length < MAX_WILDS_PER_MAP; i++) {
        const sp = lowPool[Math.floor(Math.random() * lowPool.length)];
        const lv = 1 + Math.floor(Math.random() * 5);
        const a = m.spawnAreas[Math.floor(Math.random() * m.spawnAreas.length)];
        arr.push({ id: `${mid}-low-${Date.now()}-${i}`, x: a.x, y: a.y, pet: makePet(sp, lv) });
      }
      out[mid] = arr;
      return out;
    });
    setStatsPet(null); setBagOpen(false);
    setMessage("Novo lider definido! Pequenos pokemons surgiram...");
  };


  // ===== CHALLENGE PvP =====
  const sendChallenge = async (opponent: RemotePlayer, stake: boolean) => {
    if (!fighter) { setMessage("Sem pet apto para batalhar"); return; }
    const { error } = await gameDb.from("challenges").insert({
      challenger_id: identity.id, challenger_name: identity.name,
      challenger_pet: fighter as unknown as never,
      opponent_id: opponent.id, opponent_name: opponent.name,
      stake_pet: stake, status: "pending",
    });
    if (error) { setMessage("Erro ao desafiar"); return; }
    setMessage(`Desafio enviado a ${opponent.name}!`);
    setChallengeTarget(null);
  };

  const respondChallenge = async (c: DbChallenge, accept: boolean) => {
    if (!accept) {
      await gameDb.from("challenges").update({ status: "declined" }).eq("id", c.id);
      setMessage("Desafio recusado.");
      return;
    }
    if (!fighter) { setMessage("Sem pet apto."); return; }
    await gameDb.from("challenges").update({ status: "accepted", opponent_pet: fighter as unknown as never }).eq("id", c.id);
    setMessage("Desafio aceito! Batalhando…");
  };

  const finishBattle = async (winnerId: string) => {
    if (!activeBattle) return;
    const c = activeBattle;
    await gameDb.from("challenges").update({ status: "finished", winner_id: winnerId }).eq("id", c.id);
    const iWon = winnerId === identity.id;
    if (iWon) {
      setMessage("Voce venceu o desafio! +200g");
      setGold((g) => g + 200);
      if (c.stake_pet && !iWonBefore(c.id)) {
        const stolen = c.challenger_id === identity.id ? c.opponent_pet : c.challenger_pet;
        if (stolen) setTeamPets((t) => [...t, { ...stolen, uid: crypto.randomUUID(), hp: stolen.maxHp, faintedAt: null }]);
      }
    } else {
      setMessage("Voce perdeu o desafio…");
      if (c.stake_pet) {
        // remove o pet apostado do time perdedor
        const lostPet = c.challenger_id === identity.id ? c.challenger_pet : c.opponent_pet;
        if (lostPet) setTeamPets((t) => t.filter((p) => p.species !== lostPet.species || p.level !== lostPet.level));
      }
    }
    setActiveBattle(null);
  };
  // Evita duplo-processamento simples
  const handledRef = useRef<Set<string>>(new Set());
  const iWonBefore = (id: string) => {
    if (handledRef.current.has(id)) return true;
    handledRef.current.add(id); return false;
  };

  // View dimensions: landscape/fullscreen rotate the screen to a wide aspect (like GameBoy SP / tablet on its side)
  const isWideView = orientation === "landscape" || orientation === "fullscreen";
  const viewW = isWideView ? 480 : VIEW_W;
  const viewH = isWideView ? 320 : VIEW_H;
  const viewExtraH = isWideView ? 80 : 140;
  const viewAspect = `${viewW} / ${viewH + viewExtraH}`;
  // Camera
  const visibleW = viewW / zoom;
  const visibleH = viewH / zoom;
  const camX = Math.max(0, Math.min(curMap.w - visibleW, pos.x - visibleW / 2));
  const camY = Math.max(0, Math.min(curMap.h - visibleH, pos.y - visibleH / 2));

  const dpadPress = (d: Dir) => { keys.current[`arrow${d}`] = true; };
  const dpadRelease = (d: Dir) => { keys.current[`arrow${d}`] = false; };
  const leaderGif = SPECIES_GIF[(leader?.species ?? initial.starter as Species)];
  const playersHere = remotePlayers.filter((p) => p.map === mapId);
  const pendingIncoming = challenges.filter((c) => c.status === "pending" && c.opponent_id === identity.id);

  const isLandscape = orientation === "landscape";
  const isFullscreen = orientation === "fullscreen";
  const nextMode: Record<ScreenMode, ScreenMode> = { portrait: "landscape", landscape: "fullscreen", fullscreen: "portrait" };
  const modeLabel: Record<ScreenMode, string> = { portrait: "📱 Vertical", landscape: "🎮 Horizontal", fullscreen: "🖥️ Tela grande" };

  const lvlUpActive = trainerLevelUpKey && (Date.now() - trainerLevelUpKey < 1500);
  const statusBarEl = (
    <div className={`trainer-hud${lvlUpActive ? " lvlup" : ""}`} key={`hud-${trainerLevelUpKey}`}>
      <div className="trainer-avatar">
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: `url(${avatarSheet})`,
          backgroundSize: "400% 400%",
          backgroundPosition: "0% 0%",
          imageRendering: "pixelated",
          filter: avatarHue ? `hue-rotate(${avatarHue}deg) saturate(1.15)` : undefined,
          transform: "scale(1.15)",
          transformOrigin: "center 40%",
        }} />
        <span className={`trainer-level-badge${lvlUpActive ? " lvlup" : ""}`}>
          {trainerLevel}
        </span>
      </div>
      <div className="trainer-info">
        <div className="trainer-name-row name-font">
          {guild && guildImageFor(guild.element) && (
            <img
              src={guildImageFor(guild.element)!}
              alt={guild.element}
              className="pixelated"
              title={`Guilda: ${guild.name}`}
              style={{ width: 16, height: 16, marginRight: 4, verticalAlign: "middle" }}
            />
          )}
          <span className="nm">{identity.name.toUpperCase()}</span>
          <span className="pl">👥 {playersHere.length + 1}</span>
          <span
            className={`hud-chip${energy < ENERGY_TREE_COST ? " low" : ""}`}
            title={`Energia ${energy}/${ENERGY_MAX} · +10 por hora · custa ${ENERGY_TREE_COST} por árvore`}
          >⚡ {energy}/{ENERGY_MAX}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${trainerXpPct}%` }} />
          <span className="xp-bar-text name-font">
            XP {trainerXpInLevel.toLocaleString()} / {trainerXpSpan.toLocaleString()}
          </span>
        </div>
      </div>
      {lvlUpActive && <span className="lvlup-burst">LEVEL UP!</span>}
    </div>
  );


  const dpadEl = <DPad onPress={dpadPress} onRelease={dpadRelease} />;
  const abcEl = (
    <div className={isLandscape ? "flex flex-col items-center gap-3" : "flex flex-col items-end gap-2"}>
      <div className={isLandscape ? "flex flex-col items-center gap-3" : "flex items-center gap-3"}>
        <ActionButton label="A" onClick={() => encounter && throwBall("pokeball")} variant="primary" />
        <ActionButton label="B" onClick={flee} />
        <ActionButton label="C" sub="AUTO" onClick={() => {
          if (Date.now() >= vipUntil) { setMessage("AUTO requer Aventure Rules (passe VIP)"); return; }
          setAutoVip((v) => !v);
        }} variant={autoVip ? "vip" : "default"} />
      </div>
      {!isLandscape && <div className="text-[7px]" style={{ color: "#444" }}>A: bola · B: voltar · C: auto-vip</div>}
    </div>
  );
  const selectPill = <PillButton label="SELECT" onClick={() => setBagOpen((v) => !v)} sub="BAG" />;
  const startPill = <PillButton label="START" onClick={() => setMenuOpen((v) => !v)} sub="MENU" />;
  const lPill = <PillButton label="L" onClick={() => setZoomIdx((i) => (i + 1) % ZOOM_LEVELS.length)} sub={`ZOOM ${zoom}x`} />;

  const leaderCardEl = leader && (
    <button onClick={() => setStatsPet(leader)} className="mt-2 flex items-center gap-3 rounded-md p-2 text-[8px] w-full"
      style={{ background: "var(--gb-darkest)", color: "var(--gb-lightest)", border: "none" }}>
      <img src={leaderGif} alt={leader.species} className="pixelated" width={36} height={36} />
      <div className="flex-1 text-left">
        <div>{SPECIES_NAME[leader.species]} · Lv.{leader.level} <span style={{ color: RARITY_COLOR[leader.rarity] }}>[{RARITY_NAME[leader.rarity]}]</span> {leader.faintedAt ? "💤" : ""}</div>
        <HpBar hp={(leader.hp / leader.maxHp) * 100} />
      </div>
      <div>×{teamPets.length}</div>
    </button>
  );

  const screenCardEl = (
    <div className="rounded-xl p-1.5" style={{ background: "#2b2b2b", boxShadow: "inset 0 4px 12px rgba(0,0,0,0.5)" }}>
      <div className="relative overflow-hidden rounded-md flex flex-col"
        style={{ width: "100%", aspectRatio: viewAspect, background: "var(--gb-screen)", boxShadow: "inset 0 0 0 2px var(--gb-darkest)" }}>

        <div className="flex items-center justify-between px-2 py-1 text-[8px] flex-shrink-0"
          style={{ background: "var(--gb-darkest)", color: "var(--gb-lightest)", height: 28 }}>
          <div className="flex items-center gap-1">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(180deg, #e63946 50%, #f5f5f5 50%)" }} />
            <span>×{String(totalBalls).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-1">
            {!encounter && (
              <button onClick={() => { setMapPickerOpen(true); setEnvPickerOpen(false); }} title="Mapas"
                style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: 10, padding: 0 }}>🗺</button>
            )}
            <span>{curMap.name}</span>
            {!encounter && (
              <button onClick={() => { setEnvPickerOpen((v) => !v); setMapPickerOpen(false); }} title="Ambiente"
                style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: 10, padding: 0 }}>
                {PHASE_ICON[dayPhase]}{effectiveWeather === "rain" ? "☔" : effectiveWeather === "snow" ? "❄" : effectiveWeather === "sakura" ? "🌸" : ""}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2"><span>💰{gold}</span><span>💎{crystal}</span></div>
        </div>

        <div className="relative overflow-hidden"
          style={{ width: "100%", aspectRatio: `${viewW} / ${viewH}`, background: "var(--gb-light)", filter: "saturate(0.85) contrast(1.05)" }}>
          {rareAlert && (
            <div style={{
              position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
              zIndex: 50, pointerEvents: "none",
              background: "rgba(0,0,0,0.78)", border: "1px solid #e7c769",
              color: "#e7c769", fontSize: 8, padding: "3px 8px", borderRadius: 4,
              textShadow: "0 0 4px rgba(231,199,105,0.7)", whiteSpace: "nowrap",
            }}>
              ✦ {rareAlert.name} apareceu em {rareAlert.map}!
            </div>
          )}
          {globalAlerts.length > 0 && (
            <div style={{
              position: "absolute", top: 22, left: 6, right: 6, zIndex: 60,
              pointerEvents: "none", display: "flex", flexDirection: "column", gap: 3,
              alignItems: "stretch",
            }}>
              {globalAlerts.map((g) => (
                <div key={g.key} className="global-pink"
                  style={{ fontSize: 8, padding: "3px 7px", borderRadius: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {g.text}
                </div>
              ))}
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, transformOrigin: "top left" }}>
            <div style={{
              position: "absolute",
              left: `${(-camX / visibleW) * 100}%`,
              top: `${(-camY / visibleH) * 100}%`,
              width: `${(curMap.w / visibleW) * 100}%`,
              height: `${(curMap.h / visibleH) * 100}%`,
              transition: moving ? "left 0.1s linear, top 0.1s linear" : undefined,
            }}>
              {ascendingPet && <AscensionAnimation pet={teamPets.find(p => p.uid === ascendingPet)!} />}
              <img src={curMap.img} alt="" className="pixelated block" style={{ width: "100%", height: "100%" }} draggable={false} />
               {mushroomSpawn && mushroomSpawn.mapId === mapId && (
                <div 
                  onClick={(e) => { e.stopPropagation(); handleCollectMushroom(); }}
                  style={{
                    position: "absolute",
                    left: ((mushroomSpawn.x - 9) / curMap.w) * 100 + "%",
                    top: ((mushroomSpawn.y - 18) / curMap.h) * 100 + "%",
                    cursor: "pointer",
                    zIndex: 10,
                    filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))",
                    transform: "scale(1.2)"
                  }}
                >
                  <RareMushroom size={24} />
                  <div className="name-font" style={{ 
                    position: "absolute", 
                    left: "50%", 
                    bottom: -8, 
                    transform: "translateX(-50%)", 
                    background: "rgba(100,0,0,0.85)", 
                    color: "#fff", 
                    fontSize: 7, 
                    padding: "0 4px", 
                    borderRadius: 2, 
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(255,255,255,0.3)"
                  }}>
                    RARO
                  </div>
                </div>
              )}

              {/* ===== Árvores coletáveis ===== */}
              {!encounter && HARVEST_TREES.filter(t => t.mapId === mapId).map(tree => {
                const cAt = choppedAt[tree.id] || 0;
                const isChopped = !!cAt && (Date.now() - cAt) < RESPAWN_MS;
                const isBeingChopped = chopping?.id === tree.id;
                const kind = tree.kind || "wood";
                const variantSrc = TREE_VARIANTS[kind].src;
                const src = isBeingChopped ? TREE_CHOP_SRC : isChopped ? TREE_STUMP_SRC : variantSrc;
                const sizePct = (isChopped && !isBeingChopped ? 56 : 96) / curMap.w * 100;
                const heightPx = isChopped && !isBeingChopped ? 56 : 96;
                const progress = isBeingChopped ? Math.min(1, (Date.now() - chopping!.startedAt) / CHOP_MS) : 0;
                const remainMs = isChopped && !isBeingChopped ? Math.max(0, RESPAWN_MS - (Date.now() - cAt)) : 0;
                const respawnMin = Math.floor(remainMs / 60000);
                const respawnSec = Math.floor((remainMs % 60000) / 1000);
                const respawnLabel = respawnMin > 0 ? `${respawnMin}m${respawnSec.toString().padStart(2,"0")}s` : `${respawnSec}s`;
                const req = TREE_LEVEL_REQ[kind] ?? 1;
                const playerLv = fighter?.level ?? 0;
                const locked = playerLv < req;
                const tp = treePos[tree.id] || { x: tree.x, y: tree.y };
                return (
                  <div
                    key={tree.id}
                    onClick={(e) => { e.stopPropagation(); handleChopTree(tree); }}
                    style={{
                      position: "absolute",
                      left: ((tp.x - heightPx / 2) / curMap.w) * 100 + "%",
                      top: ((tp.y - heightPx) / curMap.h) * 100 + "%",
                      width: sizePct + "%",
                      cursor: isChopped && !isBeingChopped ? "not-allowed" : "pointer",
                      zIndex: 15,
                      pointerEvents: "auto",
                      filter: locked && !isChopped && !isBeingChopped ? "grayscale(0.6) brightness(0.75)" : undefined,
                    }}
                    title={isChopped && !isBeingChopped ? `Respawn em ${respawnLabel}` : locked ? `Requer Lv ${req}` : "Cortar árvore"}
                  >
                    <img
                      src={src}
                      alt="Árvore"
                      className="pixelated"
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        filter: isBeingChopped ? "brightness(1.1)" : undefined,
                        transform: isBeingChopped ? `translateX(${Math.sin(Date.now() / 60) * 2}px) rotate(${Math.sin(Date.now() / 80) * 1.5}deg)` : undefined,
                        transformOrigin: "bottom center",
                      }}
                    />
                    {isBeingChopped && (
                      <>
                        <div style={{
                          position: "absolute", left: "50%", top: -14, transform: "translateX(-50%)",
                          width: "80%", height: 6, background: "rgba(0,0,0,0.7)",
                          border: "1px solid #fff", borderRadius: 2, overflow: "hidden",
                        }}>
                          <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#fde047)" }} />
                        </div>
                        <div style={{
                          position: "absolute", left: "10%", top: "40%", fontSize: 18,
                          animation: "fadeIn 0.3s",
                        }}>🪓</div>
                      </>
                    )}
                    {isChopped && !isBeingChopped && (
                      <div className="name-font" style={{
                        position: "absolute", left: "50%", top: -12, transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.78)", color: "#fff", fontSize: 7,
                        padding: "1px 4px", borderRadius: 2, whiteSpace: "nowrap",
                      }}>
                        {respawnLabel}
                      </div>
                    )}
                  </div>
                );
              })}

              {!encounter && CRATES.filter(c => c.mapId === mapId).map(crate => {
                const oAt = crateOpenedAt[crate.id] || 0;
                const cp = cratePos[crate.id];
                if (oAt) return null; // some até respawnar
                if (!cp) return null; // aguarda posicionamento aleatório
                const size = 36;
                return (
                  <div
                    key={crate.id}
                    onClick={(e) => { e.stopPropagation(); handleOpenCrate(crate); }}
                    style={{
                      position: "absolute",
                      left: ((cp.x - size/2) / curMap.w) * 100 + "%",
                      top: ((cp.y - size) / curMap.h) * 100 + "%",
                      width: (size / curMap.w) * 100 + "%",
                      cursor: "pointer",
                      zIndex: 14,
                      pointerEvents: "auto",
                      textAlign: "center",
                      filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.6))",
                      animation: "fadeIn 0.4s",
                    }}
                    title="Caixa de sucata — clique para abrir"
                  >
                    <img src={imgSucataIcon} alt="Sucata" style={{ width: "100%", height: "auto", imageRendering: "pixelated", display: "block" }} draggable={false} />
                    <div className="name-font" style={{
                      fontSize: 6, color: "#fde047", background: "rgba(0,0,0,0.7)",
                      padding: "1px 3px", borderRadius: 2, display: "inline-block", marginTop: 1,
                    }}>SUCATA</div>
                  </div>
                );
              })}

              {/* portais visuais removidos — viagem apenas via Mapa/Radar */}




              {wilds[mapId].map((w) => {
                const shiny = w.pet.rarity === "mythic";
                const extraStar = w.pet.rarity === "epic" ? "pink" : w.pet.rarity === "rare" ? "cyan" : null;
                return (
                <div key={w.id} style={{
                  position: "absolute",
                  left: ((w.x - WILD_DRAW / 2) / curMap.w) * 100 + "%",
                  top: ((w.y - WILD_DRAW) / curMap.h) * 100 + "%",
                  width: (WILD_DRAW / curMap.w) * 100 + "%",
                  transition: "left 1.2s linear, top 1.2s linear",
                }}>
                  <div className={shiny ? "rarity-aura" : ""} style={shiny ? { background: RARITY_COLOR[w.pet.rarity] } : { position: "absolute", inset: -4, borderRadius: "50%", background: RARITY_COLOR[w.pet.rarity], filter: "blur(8px)", opacity: 0.45 }} />
                  {shiny && (
                    <>
                      <span className="sparkle-star" style={{ left: "5%", top: "-5%" }} />
                      <span className="sparkle-star s2" style={{ right: "0%", top: "30%" }} />
                      <span className="sparkle-star s3" style={{ left: "40%", bottom: "-8%" }} />
                      <span className="sparkle-star s4" style={{ left: "-5%", bottom: "20%" }} />
                    </>
                  )}
                  {!shiny && extraStar && (
                    <>
                      <span className={`sparkle-star s2 ${extraStar}`} style={{ left: "8%", top: "-4%" }} />
                      <span className={`sparkle-star s4 ${extraStar}`} style={{ right: "4%", bottom: "12%" }} />
                    </>
                  )}
                  <div className="name-font" style={{ position: "absolute", left: "50%", top: -10, transform: "translateX(-50%)", background: "rgba(0,0,0,0.78)", color: "#fff", fontSize: 8, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap" }}>
                    Lv{w.pet.level} <span style={{ color: RARITY_COLOR[w.pet.rarity] }}>★</span>
                  </div>
                  <img src={SPECIES_GIF[w.pet.species]} alt={w.pet.species} className="pixelated" style={{ position: "relative", width: "100%", aspectRatio: "1/1", transform: `scale(${SPECIES_SCALE[w.pet.species] ?? 1})`, transformOrigin: "center bottom" }} draggable={false} />
                </div>
              );})}

              {[...playersHere, ...FAKE_PLAYERS.filter(b => b.map === mapId)].map((p) => {
                const gif = p.leader_species ? SPECIES_GIF[p.leader_species as Species] : null;
                const avatar = AVATAR_PRESETS[(p as any).avatarIdx || 0];
                const isBot = (p as any).isBot;
                const bPos = isBot ? botPositions[p.id] : null;
                const finalX = bPos ? bPos.x : p.x;
                const finalY = bPos ? bPos.y : p.y;
                const finalDir = (bPos ? bPos.dir : p.dir) as Dir;

                return (
                  <div key={p.id} style={{
                    position: "absolute",
                    left: ((finalX - PLAYER_DRAW / 2) / curMap.w) * 100 + "%",
                    top: ((finalY - PLAYER_DRAW) / curMap.h) * 100 + "%",
                    width: (PLAYER_DRAW / curMap.w) * 100 + "%", aspectRatio: "1/1",
                    transition: "left 0.6s linear, top 0.6s linear",
                    zIndex: 20,
                    cursor: isBot ? "default" : "pointer"
                  }} onClick={() => !isBot && setChallengeTarget(p as any)}>
                    {/* Pokémon Follower */}
                    {gif && (
                      <div style={{
                        position: "absolute",
                        left: finalDir === "right" ? "-80%" : "80%",
                        top: "10%",
                        width: "80%",
                        zIndex: 19,
                        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))"
                      }}>
                        <img src={gif} alt="" className="pixelated" style={{ width: "100%", transform: finalDir === "left" ? "scaleX(-1)" : undefined }} />
                      </div>
                    )}
                    <div style={{
                      width: "100%", height: "100%",
                      backgroundImage: `url(${avatar.sheet})`,
                      backgroundSize: "400% 400%",
                      backgroundPosition: `0% ${DIR_ROW[finalDir] * 33.333}%`,
                      imageRendering: "pixelated",
                      filter: avatar.hue ? `hue-rotate(${avatar.hue}deg) saturate(1.2)` : undefined,
                    }} />
                    {(p as RemotePlayer).guild_name && (
                      <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 5.5, color: "#86efac", textShadow: "0 0 3px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)", fontWeight: 700, letterSpacing: 0.3 }}>
                        «{(p as RemotePlayer).guild_name}»
                      </div>
                    )}
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 6, background: "rgba(0,0,0,0.5)", color: "#fff", padding: "1px 3px", borderRadius: 3 }}>
                      {partyMemberIds.has(p.id) && <span style={{ color: "#ef4444", marginRight: 2 }}>★</span>}
                      {p.name}
                    </div>
                  </div>
                );
              })}

              {[...NPCS, ...EXTRA_NPCS].filter((n) => n.mapId === mapId).map((n) => {
                const last = npcDefeated[n.id] ?? 0;
                const onCd = Date.now() - last < NPC_COOLDOWN_MS;
                const isSpecial = !!n.specialProfile;

                return (
                  <div key={n.id} style={{
                    position: "absolute",
                    left: ((n.x - (n.id === "moranguinho" ? 72 : PLAYER_DRAW) / 2) / curMap.w) * 100 + "%",
                    top: ((n.y - (n.id === "moranguinho" ? 72 : PLAYER_DRAW)) / curMap.h) * 100 + "%",
                    width: ((n.id === "moranguinho" ? 72 : PLAYER_DRAW) / curMap.w) * 100 + "%", aspectRatio: "1/1",
                    cursor: isSpecial ? "pointer" : "default",
                  }} onClick={() => {
                    if (n.id === "captain-navio") setCaptainNavioOpen(true);
                    else if (n.id === "velho-mares") setVelhoMaresOpen(true);
                    else if (n.id === "kurt") setKurtDialogOpen(true);
                    else if (n.id === "mercador-mat") setMercadorMatOpen(true);
                    else if (n.id === "moranguinho") setMoranguinhoOpen(true);
                    else if (n.id === "botanist-yggdran") setBotanistOpen(true);
                    else if (n.id === "pescador-barbosa") setFishermanOpen(true);
                    else if (n.id === "lab-oak") {
                      if (teamPets.some((p) => p.locked)) setOakDoneOpen(true);
                      else setOakStarterOpen(true);
                    }
                    else if (isSpecial) setSpecialNpcProfile(n);
                    else setActiveNpcDialogue(n);
                  }}>

                    <div className="name-font" style={{
                      position: "absolute", left: "50%", top: -10, transform: "translateX(-50%)",
                      background: isSpecial ? "rgba(168,85,247,0.92)" : onCd ? "rgba(60,60,60,0.85)" : "rgba(200,40,40,0.92)",
                      color: "#fff", fontSize: 7, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap",
                    }}>
                      {isSpecial ? `★ ${n.name}` : onCd ? `${n.name} ⌛` : `! ${n.name}`}
                    </div>
                    <img src={n.sprite} alt={n.name} className="pixelated"
                      style={{ width: "100%", height: "100%", opacity: onCd ? 0.55 : 1, filter: onCd ? "grayscale(0.6)" : undefined }}
                      draggable={false} />
                  </div>
                );
              })}

              {mapId === "forest" && !encounter && !activeBattle && (() => {
                const sx = 970, sy = 1208;
                const reqLevel = 30;
                const costGold = 5000;
                return (
                  <div key="sign-elite" style={{
                    position: "absolute",
                    left: ((sx - PLAYER_DRAW / 2) / curMap.w) * 100 + "%",
                    top: ((sy - PLAYER_DRAW) / curMap.h) * 100 + "%",
                    width: (PLAYER_DRAW / curMap.w) * 100 + "%", aspectRatio: "1/1",
                    cursor: "pointer", zIndex: 5,
                  }} onClick={() => {
                    if (trainerLevel < reqLevel) { setMessage(`Precisa Lv ${reqLevel} (voce Lv ${trainerLevel})`); return; }
                    if (gold < costGold) { setMessage(`Precisa ${costGold} gold`); return; }
                    if (!confirm(`Viajar para ROTA ELITE?\nCusto: ${costGold} gold (Lv ${reqLevel}+)`)) return;
                    setGold(g => g - costGold);
                    const dest = MAPS.eliteRoute;
                    setMapId("eliteRoute");
                    setPos({ x: dest.spawn.x, y: dest.spawn.y });
                    setDir(dest.spawn.dir);
                    portalCooldown.current = Date.now() + 1500;
                    setMessage("🪧 Viajou para ROTA ELITE!");
                  }}>
                    <div className="name-font" style={{
                      position: "absolute", left: "50%", top: -12, transform: "translateX(-50%)",
                      background: "rgba(120,70,30,0.95)", color: "#fff", fontSize: 7, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap",
                      border: "1px solid #f0c060",
                    }}>🪧 ROTA ELITE</div>
                    <img src={signElite} alt="Placa Rota Elite" className="pixelated" draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }} />

                  </div>
                );
              })()}

              {mapId === "route22" && !encounter && !activeBattle && (() => {
                const sx = 242, sy = 728;
                const reqLevel = 15;
                const costGold = 400;
                return (
                  <div key="sign-desert" style={{
                    position: "absolute",
                    left: ((sx - PLAYER_DRAW / 2) / curMap.w) * 100 + "%",
                    top: ((sy - PLAYER_DRAW) / curMap.h) * 100 + "%",
                    width: (PLAYER_DRAW / curMap.w) * 100 + "%", aspectRatio: "1/1",
                    cursor: "pointer", zIndex: 5,
                  }} onClick={() => {
                    if (trainerLevel < reqLevel) { setMessage(`Precisa Lv ${reqLevel} (voce Lv ${trainerLevel})`); return; }
                    if (gold < costGold) { setMessage(`Precisa ${costGold} gold`); return; }
                    if (!confirm(`Viajar para DESERTO ANTIGO?\nCusto: ${costGold} gold (Lv ${reqLevel}+)`)) return;
                    setGold(g => g - costGold);
                    const dest = MAPS.desert;
                    setMapId("desert");
                    setPos({ x: dest.spawn.x, y: dest.spawn.y });
                    setDir(dest.spawn.dir);
                    portalCooldown.current = Date.now() + 1500;
                    setMessage("🪧 Viajou para DESERTO ANTIGO!");
                  }}>
                    <div className="name-font" style={{
                      position: "absolute", left: "50%", top: -12, transform: "translateX(-50%)",
                      background: "rgba(140,90,40,0.95)", color: "#fff", fontSize: 7, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap",
                      border: "1px solid #f0c060",
                    }}>🪧 DESERTO ANTIGO</div>
                    <img src={signDesert} alt="Placa Deserto Antigo" className="pixelated" draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }} />
                  </div>
                );
              })()}



              {mapId === "village" && (() => {
                const bx = 240, by = 620;
                return (
                  <div key="boat-npc" style={{
                    position: "absolute",
                    left: ((bx - PLAYER_DRAW / 2) / curMap.w) * 100 + "%",
                    top: ((by - PLAYER_DRAW) / curMap.h) * 100 + "%",
                    width: (PLAYER_DRAW / curMap.w) * 100 + "%", aspectRatio: "1/1",
                    pointerEvents: "none",
                  }}>
                    <div className="name-font" style={{
                      position: "absolute", left: "50%", top: -10, transform: "translateX(-50%)",
                      background: "rgba(30,120,180,0.95)", color: "#fff", fontSize: 7, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap",
                    }}>⛵ BARQUEIRO</div>
                    <img src={npcDepotAgent} alt="Barqueiro" className="pixelated"
                      style={{ width: "100%", height: "100%" }}
                      draggable={false} />
                  </div>
                );
              })()}

              {false && (
                <div />
              )}



              {currentQuests.filter((q) => q.mapId === mapId && rotatingActive[q.id]).map((q) => {
                const claimed = questsClaimed[q.id] === questCycle;
                return (
                <div key={q.id} style={{
                  position: "absolute",
                  left: ((q.x - PLAYER_DRAW / 2) / curMap.w) * 100 + "%",
                  top: ((q.y - PLAYER_DRAW) / curMap.h) * 100 + "%",
                  width: (PLAYER_DRAW / curMap.w) * 100 + "%", aspectRatio: "1/1",
                  cursor: "pointer",
                }} onClick={() => setActiveQuest(q)}>
                  <div className="name-font" style={{
                    position: "absolute", left: "50%", top: -10, transform: "translateX(-50%)",
                    background: claimed ? "rgba(40,80,40,0.9)" : "rgba(60,90,180,0.92)",
                    color: "#fff", fontSize: 7, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap",
                  }}>
                    {claimed ? `✓ ${q.name}` : `? ${q.name}`}
                  </div>
                  <img src={q.sprite} alt={q.name} className="pixelated"
                    style={{ width: "100%", height: "100%", filter: claimed ? "grayscale(0.4) opacity(0.85)" : "drop-shadow(0 0 4px rgba(100,150,255,0.6))" }}
                    draggable={false} />
                </div>
                );
              })}

              {hasFighter && (
                <div style={{
                  position: "absolute",
                  left: ((petPos.x - PET_DRAW / 2) / curMap.w) * 100 + "%",
                  top: ((petPos.y - PET_DRAW) / curMap.h) * 100 + "%",
                  width: (PET_DRAW / curMap.w) * 100 + "%",
                  height: (PET_DRAW / curMap.h) * 100 + "%",
                  transition: "left 0.18s ease-out, top 0.18s ease-out",
                }}>
                  {leaderIsShiny && (
                    <>
                      <div className="rarity-aura" style={{ background: RARITY_COLOR[leader!.rarity] }} />
                      <span className="sparkle-star" style={{ left: "0%", top: "-8%" }} />
                      <span className="sparkle-star s2" style={{ right: "0%", top: "20%" }} />
                      <span className="sparkle-star s3" style={{ left: "35%", bottom: "-5%" }} />
                      <span className="sparkle-star s4" style={{ right: "30%", top: "-2%" }} />
                    </>
                  )}
                  <img src={leaderGif} alt="pet" className="pixelated"
                    style={{ position: "relative", width: "100%", height: "100%", transform: petPos.dir === "right" ? "scaleX(-1)" : "none" }} draggable={false} />
                </div>
              )}

              <div style={{
                position: "absolute",
                left: ((pos.x - PLAYER_DRAW / 2) / curMap.w) * 100 + "%",
                top: ((pos.y - PLAYER_DRAW) / curMap.h) * 100 + "%",
                width: (PLAYER_DRAW / curMap.w) * 100 + "%", aspectRatio: "1/1",
                imageRendering: "pixelated", transition: "left 0.1s linear, top 0.1s linear",
                opacity: invisible ? 0.35 : 1,
              }}>
                {hasParty && (
                  <span style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: 7, color: "#ef4444", textShadow: "0 0 3px rgba(0,0,0,0.9)", zIndex: 2 }}>★</span>
                )}
                <div style={{
                  width: "100%", height: "100%",
                  backgroundImage: `url(${avatarSheet})`, backgroundSize: "400% 400%",
                  backgroundPosition: `${(moving ? step : 0) * 33.333}% ${DIR_ROW[dir] * 33.333}%`,
                  filter: avatarHue ? `hue-rotate(${avatarHue}deg) saturate(1.1)` : undefined,
                }} />
              </div>
            </div>
          </div>


          <DayNightOverlay phase={dayPhase} />
          {effectiveWeather !== "clear" && <WeatherOverlay kind={effectiveWeather} />}
          {(curMap as { dark?: boolean }).dark && !anyOverlay && !encounter && !mapPickerOpen && !envPickerOpen && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40,
              background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 22%, rgba(0,0,0,0.9) 45%, #000 65%)",
              mixBlendMode: "multiply",
            }} />
          )}
          {!anyOverlay && !encounter && !mapPickerOpen && !envPickerOpen && (
            <Radar
              mapId={mapId}
              pos={pos}
              curMap={curMap}
               onTeleport={() => setMapPickerOpen(true)}
               npcs={[...NPCS].filter((n) => n.mapId === mapId).map((n) => ({ x: n.x, y: n.y }))}
               quests={currentQuests.filter((q) => q.mapId === mapId && rotatingActive[q.id]).map((q) => ({ x: q.x, y: q.y }))}
               specialNpcs={EXTRA_NPCS.filter((n) => n.mapId === mapId).map((n) => ({ x: n.x, y: n.y }))}
            />
          )}
          {!anyOverlay && !encounter && !mapPickerOpen && !envPickerOpen && (
            <button
              onClick={() => setBagOpen(true)}
              title="Abrir Bolsa"
              style={{
                position: "absolute", top: 112, right: 6, zIndex: 70,
                width: 50, height: 50, padding: 0, cursor: "pointer",
                background: "transparent", border: "none", outline: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <span className="bag-spark bag-spark-1">✦</span>
                <span className="bag-spark bag-spark-2">✦</span>
                <span className="bag-spark bag-spark-3">✦</span>
                <span className="bag-spark bag-spark-4">✦</span>
              </span>
              <img
                src={iconBag}
                alt="Bolsa"
                className="pixelated"
                draggable={false}
                style={{
                  width: 36, height: 36, position: "relative", zIndex: 1,
                  filter: "drop-shadow(0 0 3px rgba(255,230,170,0.7)) drop-shadow(0 0 6px rgba(255,200,120,0.35)) drop-shadow(0 2px 3px rgba(0,0,0,0.6))",
                  animation: "bagGlow 2.2s ease-in-out infinite",
                }}
              />
            </button>
          )}
          {!anyOverlay && !encounter && !mapPickerOpen && !envPickerOpen && (() => {
            const questCount = activeQuestsCount();
            const incenseActive = !!incenseType && xpBoostUntil > Date.now();
            const incLeft = incenseActive ? Math.max(0, xpBoostUntil - Date.now()) : 0;
            const incMin = Math.floor(incLeft / 60000);
            const incSec = Math.floor((incLeft % 60000) / 1000).toString().padStart(2, "0");
            const incEmoji = incenseType === "epic" ? "🟣" : incenseType === "rare" ? "🔵" : "🟡";
            const btnBase: React.CSSProperties = {
              position: "relative",
              width: 26, height: 22, padding: 0, cursor: "pointer",
              background: "linear-gradient(180deg,#ffffff,#e9eef5)",
              border: "1.5px solid #475569", borderRadius: 4,
              boxShadow: "0 2px 3px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#1e293b", fontSize: 12, lineHeight: 1, fontWeight: 900,
            };
            return (
              <div style={{
                position: "absolute", top: 8, right: 6, zIndex: 71,
                display: "flex", gap: 4, alignItems: "center",
              }}>
                {questCount > 0 && (
                  <button
                    onClick={() => setQuestLogOpen(true)}
                    title="Quests ativas"
                    style={{ ...btnBase, animation: "questPulse 1.6s ease-in-out infinite" }}
                  >
                    <span style={{ fontSize: 13 }}>✉</span>
                    <span style={{
                      position: "absolute", top: -5, right: -5,
                      background: "#dc2626", color: "#fff",
                      fontSize: 8, fontWeight: 900,
                      minWidth: 13, height: 13, padding: "0 3px",
                      borderRadius: 7, lineHeight: "13px",
                      border: "1px solid #fff",
                    }}>{questCount}</span>
                  </button>
                )}
                <button
                  onClick={() => setMenuOpen(true)}
                  title="Abrir Menu"
                  style={btnBase}
                >
                  <span style={{ fontSize: 12, letterSpacing: 0 }}>☰</span>
                </button>
                {incenseActive && (
                  <div
                    title={`Incenso ${incenseType} ativo`}
                    style={{
                      ...btnBase,
                      width: "auto", padding: "0 6px", gap: 3,
                      cursor: "default",
                      background: "linear-gradient(180deg,#fff7ed,#fed7aa)",
                      borderColor: "#9a3412",
                    }}
                  >
                    <span style={{ fontSize: 10 }}>{incEmoji}</span>
                    <span style={{ fontSize: 9, color: "#7c2d12" }}>{incMin}:{incSec}</span>
                  </div>
                )}
              </div>
            );
          })()}
          {envPickerOpen && (
            <EnvPicker
              phase={manualPhase} weather={manualWeather}
              onPhase={(p) => setManualPhase(p)}
              onWeather={(w) => setManualWeather(w)}
              onClose={() => setEnvPickerOpen(false)}
            />
          )}
          {mapPickerOpen && (
            <MapPicker 
              currentMap={mapId} 
              onPick={(target) => {
                if (target === mapId) { setMapPickerOpen(false); return; }
                doTeleport(target);
                setMapPickerOpen(false);
              }} 
              onClose={() => setMapPickerOpen(false)} 
            />
          )}

          {mapId === "village" && !anyOverlay && !encounter && !mapPickerOpen && !envPickerOpen && (() => {
            const bx = 240, by = 620;
            const dx = bx - pos.x, dy = by - pos.y;
            const near = dx * dx + dy * dy < 80 * 80;
            if (!near) return null;
            return (
              <button
                onClick={() => doTeleport("forest")}
                className="name-font"
                style={{
                  position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)",
                  zIndex: 55, padding: "8px 14px", borderRadius: 10,
                  background: "linear-gradient(180deg,#3aa0ff,#1e6bbf)",
                  color: "#fff", border: "2px solid #ffffff",
                  boxShadow: "0 4px 14px rgba(30,107,191,0.55), 0 0 0 2px #0b3b66 inset",
                  fontSize: 10, letterSpacing: 0.5, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  animation: "pulse-soft 1.6s ease-in-out infinite",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>⛵</span>
                <span>VIAJAR — ROTA 1</span>
              </button>
            );
          })()}

          {healingAt && (() => {
            const HEAL_MS = 60_000;
            const elapsed = Math.min(HEAL_MS, healingNow - healingAt);
            const pct = Math.max(0, Math.min(100, (elapsed / HEAL_MS) * 100));
            const remaining = Math.max(0, Math.ceil((HEAL_MS - elapsed) / 1000));
            return (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 60, background: "rgba(8,12,24,0.78)" }}>
                <div style={{ width: "80%", maxWidth: 280, background: "var(--gb-darkest)", border: "2px solid #ff7aa6", borderRadius: 8, padding: 12, color: "var(--gb-lightest)", boxShadow: "0 0 18px rgba(255,122,166,0.5)" }}>
                  <div className="text-center" style={{ fontSize: 10, marginBottom: 6 }}>✚ POKÉ CENTER ✚</div>
                  <div className="text-center" style={{ fontSize: 7, lineHeight: 1.4, marginBottom: 8 }}>
                    A enfermeira Joy está restaurando o seu time. Por favor aguarde…
                  </div>
                  <div style={{ position: "relative", width: "100%", height: 10, background: "#1a1a1a", border: "1px solid #ff7aa6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#ff7aa6,#ffd6e6)", transition: "width 250ms linear" }} />
                  </div>
                  <div className="text-center" style={{ fontSize: 7, marginTop: 6, color: "#ffd6e6" }}>
                    {remaining}s restante{remaining === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            );
          })()}

          {nurseAskOpen && (
            <div className="absolute inset-0 flex items-center justify-center gb-font" style={{ zIndex: 60, background: "rgba(8,12,24,0.78)" }}>
              <div style={{ width: "82%", maxWidth: 280, background: "var(--gb-darkest)", border: "2px solid #ff7aa6", borderRadius: 8, padding: 12, color: "var(--gb-lightest)", boxShadow: "0 0 18px rgba(255,122,166,0.5)" }}>
                <div className="text-center" style={{ fontSize: 10, marginBottom: 6 }}>✚ ENFERMEIRA JOY ✚</div>
                <div className="text-center" style={{ fontSize: 7, lineHeight: 1.5, marginBottom: 10 }}>
                  Bem-vindo ao Poké Center! Gostaria que eu recuperasse o HP do seu time?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setNurseAskOpen(false); setHealingAt(Date.now()); setMessageColor("#7ee787"); setMessageRaw("A enfermeira Joy esta cuidando do seu time…"); }}
                    className="gb-font flex-1"
                    style={{ background: "#3aa655", color: "#fff", border: "none", padding: "5px 6px", fontSize: 8, borderRadius: 4 }}
                  >SIM</button>
                  <button
                    onClick={() => { setNurseAskOpen(false); setMessageColor("#ffd6e6"); setMessageRaw("Joy: Tudo bem! Volte quando precisar."); }}
                    className="gb-font flex-1"
                    style={{ background: "#a3243b", color: "#fff", border: "none", padding: "5px 6px", fontSize: 8, borderRadius: 4 }}
                  >NÃO</button>
                </div>
              </div>
            </div>
          )}

          {oakStarterOpen && (() => {
            const choices: { sp: StarterChoice; name: string; gif: string; color: string }[] = [
              { sp: "bulbasaur", name: "BULBASAUR", gif: bulbasaurGif, color: "#3aa655" },
              { sp: "charmander", name: "CHARMANDER", gif: charmanderGif, color: "#e07a3a" },
              { sp: "squirtle", name: "SQUIRTLE", gif: squirtleGif, color: "#3a8ad6" },
            ];
            const pick = (sp: StarterChoice) => {
              const newPet = makePet(sp, 5, "uncommon");
              newPet.lealdade = 100;
              newPet.locked = true;
              setTeamPets((t) => [...t, newPet]);
              setOakStarterOpen(false);
              setMessageColor("#7ee787");
              setMessageRaw(`Prof. Carvalho lhe entregou ${SPECIES_NAME[sp]}! (vinculado à sua conta)`);
            };
            return (
              <div className="absolute inset-0 z-[120] flex items-center justify-center gb-font" style={{ background: "rgba(0,0,0,0.82)", padding: 8 }}>
                <div style={{ width: "100%", maxWidth: 360, background: "linear-gradient(180deg, #0b1530 0%, #1a1450 100%)", border: "2px solid #fde047", borderRadius: 10, padding: 12, color: "#fff" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <img src={npcOakSprite} alt="Prof. Carvalho" className="pixelated" width={48} height={48} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#fde047" }}>PROF. CARVALHO</div>
                      <div style={{ fontSize: 8, color: "#cbd5e1", marginTop: 4, lineHeight: 1.45 }}>
                        "Olá, {identity.name}! Sua jornada começa aqui. Escolha um destes três Pokémon — ele será seu para sempre!"
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {choices.map((c) => (
                      <button key={c.sp} onClick={() => pick(c.sp)} className="gb-font" style={{ background: "rgba(255,255,255,0.06)", border: `2px solid ${c.color}`, borderRadius: 8, padding: 6, color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 32, height: 32, background: c.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={c.gif} alt={c.name} className="pixelated" style={{ width: 28, height: 28 }} />
                        </div>
                        <div style={{ fontSize: 7 }}>{c.name}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 6, opacity: 0.6, textAlign: "center", marginTop: 8 }}>NÃO PODE SER VENDIDO NEM TROCADO</div>
                </div>
              </div>
            );
          })()}

          {oakDoneOpen && (
            <div className="absolute inset-0 z-[120] flex items-center justify-center gb-font" style={{ background: "rgba(0,0,0,0.82)", padding: 8 }}>
              <div style={{ width: "100%", maxWidth: 320, background: "linear-gradient(180deg, #0b1530 0%, #1a1450 100%)", border: "2px solid #fde047", borderRadius: 10, padding: 12, color: "#fff" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <img src={npcOakSprite} alt="Prof. Carvalho" className="pixelated" width={48} height={48} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#fde047" }}>PROF. CARVALHO</div>
                    <div style={{ fontSize: 8, color: "#cbd5e1", marginTop: 4, lineHeight: 1.5 }}>
                      "Ah, {identity.name}! Já lhe entreguei seu Pokémon inicial. Cuide bem dele e boa sorte na sua jornada por Porto Florido!"
                    </div>
                  </div>
                </div>
                <button onClick={() => setOakDoneOpen(false)} className="gb-font w-full mt-3" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b)", color: "#1f1300", border: "2px solid #fde047", borderRadius: 6, padding: "6px 0", fontSize: 9, letterSpacing: 2, cursor: "pointer", fontWeight: "bold" }}>OK ▶</button>
              </div>
            </div>
          )}



          {pendingIncoming.length > 0 && !activeBattle && !encounter && (
            <div className="absolute top-2 left-2 right-2 p-2 text-[8px]"
              style={{ background: "rgba(0,0,0,0.85)", color: "#ffe066", border: "2px solid #ffe066", borderRadius: 4 }}>
              <div className="mb-1">⚔ {pendingIncoming[0].challenger_name} te desafiou! {pendingIncoming[0].stake_pet ? "(Aposta de pet!)" : ""}</div>
              <div className="flex gap-1">
                <button onClick={() => respondChallenge(pendingIncoming[0], true)} className="gb-font flex-1" style={{ background: "#3aa655", color: "#fff", border: "none", padding: "3px 4px", fontSize: 7 }}>ACEITAR</button>
                <button onClick={() => respondChallenge(pendingIncoming[0], false)} className="gb-font flex-1" style={{ background: "#a3243b", color: "#fff", border: "none", padding: "3px 4px", fontSize: 7 }}>RECUSAR</button>
              </div>
            </div>
          )}

          {labIntroOpen && mapId === "village" && (() => {
            const profMeta = profession ? PROF_BY_ID[profession] : undefined;
            const profLabel = profMeta?.label ?? "aventureiro";
            return (
              <div className="absolute inset-0 z-[120] flex items-end justify-center gb-font" style={{ background: "rgba(0,0,0,0.78)", padding: 8 }}>
                <div style={{
                  width: "100%", maxWidth: 360,
                  background: "linear-gradient(180deg, #0b1530 0%, #1a1450 100%)",
                  border: "2px solid #fde047", borderRadius: 10, padding: 12,
                  color: "#fff",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <img src={npcOakSprite} alt="Prof. Carvalho" className="pixelated" width={56} height={56}
                      style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#fde047" }}>PROF. CARVALHO</div>
                      <div style={{ fontSize: 8, color: "#cbd5e1", marginTop: 4, lineHeight: 1.45 }}>
                        "Bem-vindo a Porto Florido, {identity.name}! Sei que escolheu a profissão de <b style={{ color: "#fde047" }}>{profLabel}</b>. {profMeta?.icon ?? "✨"} Que sua jornada seja lendária. Siga para a <b style={{ color: "#86efac" }}>Rota 1</b> quando estiver pronto!"
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setLabIntroOpen(false); }}
                    className="gb-font w-full mt-3"
                    style={{
                      background: "linear-gradient(180deg,#fbbf24,#f59e0b)", color: "#1f1300",
                      border: "2px solid #fde047", borderRadius: 6, padding: "8px 0",
                      fontSize: 10, letterSpacing: 2, cursor: "pointer", fontWeight: "bold",
                    }}>
                    COMEÇAR ▶
                  </button>
                </div>
              </div>
            );
          })()}

          {professionPickerOpen && mapId === "village" && (
            <div className="absolute inset-0 z-[125] flex items-end justify-center gb-font" style={{ background: "rgba(0,0,0,0.55)", padding: 8 }}>
              <div style={{
                width: "100%", maxWidth: 380,
                background: "linear-gradient(180deg, #0b1530 0%, #1a1450 100%)",
                border: "2px solid #fde047", borderRadius: 10, padding: 12,
                color: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <img src={npcOakSprite} alt="Prof. Carvalho" className="pixelated" width={48} height={48}
                    style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#fde047" }}>PROF. CARVALHO</div>
                    <div style={{ fontSize: 8, color: "#cbd5e1", marginTop: 4, lineHeight: 1.4 }}>
                      "Antes de começar sua jornada, {identity.name}... diga-me, qual é a sua profissão?"
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1" style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                  {PROFESSIONS.map((p) => (
                    <button key={p.id} onClick={() => { setProfession(p.id); setProfessionPickerOpen(false); setLabIntroOpen(true); }}
                      className="gb-font"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(160,200,255,0.3)",
                        borderRadius: 8, cursor: "pointer", color: "#e7f0ff",
                        padding: "6px 4px", fontSize: 8, lineHeight: 1.2,
                        display: "flex", alignItems: "center", gap: 4, textAlign: "left",
                      }}>
                      <span style={{ fontSize: 14 }}>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 7, opacity: 0.55, letterSpacing: 1, marginTop: 6, textAlign: "center" }}>
                  SUA PROFISSÃO DEFINE COMO OS NPCs O TRATAM
                </div>
              </div>
            </div>
          )}

          {encounter && encounterPet && (
            <EncounterOverlay
             wildPet={encounterPet} leader={fighter} balls={balls} potions={(inventory.potion || 0) + (inventory.event_potion || 0)}
             eventPokeballs={inventory.event_pokeball || 0}
              throwingBall={throwingBall} shaking={shaking} slashKey={slash}
              wildHit={wildHit} myHit={myHit}
              wildCritKey={wildCrit} myCritKey={myCrit}
              wildEmote={wildEmote} meEmote={meEmote} captureBurstKey={captureBurst}
              onThrow={throwBall} onFlee={flee} onPotion={usePotion}
              teamPets={teamPets}
              switchCooldown={switchCooldown}
              playerTurn={playerTurn}
              onSkill={doPlayerSkill}
              autoAttack={autoAttack}
              onToggleAuto={() => setAutoAttack(v => !v)}
              onSwitchPet={(uid) => {
                if (throwingBall || switchCooldown > 0) return;
                setTeamPets((pets) => {
                  const idx = pets.findIndex((p) => p.uid === uid);
                  if (idx < 0) return pets;
                  if (isFainted(pets[idx])) return pets;
                  const copy = [...pets];
                  const [picked] = copy.splice(idx, 1);
                  copy.unshift(picked);
                  return copy;
                });
                setSwitchCooldown(3);
                // Trocar consome o turno: proximo tick é do inimigo
                battleTurn.current = "enemy";
                setPlayerTurn(false);
                const switchedTo = teamPets.find(p => p.uid === uid);
                setMessage(`Vai, ${SPECIES_NAME[switchedTo?.species ?? teamPets[0].species]}! (Troca em 3s)`);
              }}
            />
          )}

          {guideTopic && (
            <ProfessorOakGuide
              topic={guideTopic}
              onClose={() => setGuideTopic(null)}
            />
          )}

          {autoHuntConfigOpen && (
            <AutoHuntConfigOverlay
              settings={autoHuntSettings}
              onClose={closeBackToMenu(() => setAutoHuntConfigOpen(false))}
              onSave={(s) => {
                setAutoHuntSettings(s);
                closeBackToMenu(() => setAutoHuntConfigOpen(false))();
                setMessage("Auto Hunt configurado!");
              }}
              balls={balls}
            />
          )}

          {codexOpen && (
            <CodexOverlay
              slots={codexSlots}
              team={teamPets}
              gold={gold}
              crystal={crystal}
              onClose={closeBackToMenu(() => setCodexOpen(false))}
              onRegister={(entryId: string, petUid: string) => {
                setCodexSlots(prev => ({ ...prev, [entryId]: true }));
                setTeamPets(pets => pets.filter(p => p.uid !== petUid));
                setMessage("Pokémon registrado no álbum! 📔");
              }}
              onClaim={(cat: CodexCategory) => {
                const rewards = CODEX_REWARDS[cat];
                setGold(g => g + rewards.gold);
                setCrystal(c => c + rewards.crystal);
                if (rewards.item) {
                  setInventory(prev => ({ ...prev, [rewards.item!]: (prev[rewards.item!] || 0) + 1 }));
                }
                if (cat === "legends") {
                  setUnlockedMaps(prev => ({ ...prev, forbidden_valley: true }));
                  setMessage(`Parabéns! Coleção LENDÁRIA completa. MAPA VALE PROIBIDO DESBLOQUEADO! 🗺️`);
                } else {
                   setMessage(`Recompensas da coleção ${cat.toUpperCase()} resgatadas! 🎁`);
                }
                setCodexSlots(prev => ({ ...prev, [`claimed_${cat}`]: true }));
              }}
            />
          )}

          {ascensionOpen && (
            <AscensionOverlay
              team={teamPets}
              ascensions={ascensions}
              inventory={inventory}
              gold={gold}
              crystal={crystal}
              capturePoints={capturePoints}
              onClose={closeBackToMenu(() => setAscensionOpen(false))}
              onAscend={(uid, costs, isReroll) => {
                if (!isReroll) {
                  setAscensions(prev => ({ ...prev, [uid]: (prev[uid] || 0) + 1 }));
                }
                setGold(g => g - (costs.gold || 0));
                if (costs.crystal) setCrystal(c => c - costs.crystal);
                if (costs.stardust) setCapturePoints(p => p - costs.stardust);
                setInventory(i => ({ ...i, rare_candy: (i.rare_candy || 0) - (costs.candy || 0) }));
                
                // Roll new stats
                const newStats = rollAscensionStats(isReroll ? (ascensions[uid] || 1) : (ascensions[uid] || 0) + 1);
                
                setTeamPets(pets => pets.map(p => {
                  if (p.uid === uid) {
                    const updated = { 
                      ...p, 
                      ascensionStats: isReroll ? newStats : {
                        ...(p.ascensionStats || {}),
                        ...Object.entries(newStats).reduce((acc, [k, v]) => ({ ...acc, [k]: (acc[k as keyof typeof acc] || 0) + v }), {})
                      }
                    };
                    const newMax = calcMaxHp(updated);
                    return { ...updated, maxHp: newMax, hp: newMax };
                  }
                  return p;
                }));
                
                if (!isReroll) {
                  setAscendingPet(uid);
                  setTimeout(() => setAscendingPet(null), 3000);
                  setMessage("ASCENSÃO CONCLUÍDA! O poder despertou!");
                } else {
                  setMessage("ATRIBUTOS RESETADOS COM SUCESSO!");
                }
              }}
            />
          )}

          {incenseType && xpBoostUntil > Date.now() && (
            <IncenseBadge
              type={incenseType}
              untilMs={xpBoostUntil}
              mapName={curMap.name}
            />
          )}

          {npcIntro && (() => {
            const isAmbush = npcIntro.id.startsWith("ambush:");
            const accent = isAmbush ? "#ff3b6b" : "#fde047";
            const accentSoft = isAmbush ? "rgba(255,59,107,0.55)" : "rgba(253,224,71,0.6)";
            return (
              <>
                {isAmbush && (
                  <div className="absolute inset-0 z-[88] pointer-events-none" style={{
                    background: "radial-gradient(circle at 50% 60%, rgba(255,59,107,0.35), transparent 60%)",
                    animation: "fade-in 0.25s ease-out",
                  }} />
                )}
                <div
                  className="absolute inset-x-2 bottom-16 z-[90] gb-font"
                  style={{
                    background: isAmbush
                      ? "linear-gradient(135deg, rgba(40,0,10,0.96), rgba(80,0,20,0.96))"
                      : "rgba(0,0,0,0.92)",
                    border: `3px solid ${accent}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: accent,
                    fontSize: 9,
                    textShadow: `0 0 6px ${accentSoft}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: `0 0 24px ${accentSoft}, inset 0 0 12px rgba(0,0,0,0.6)`,
                    animation: isAmbush
                      ? "scale-in 0.3s ease-out, pulse 1.2s ease-in-out infinite"
                      : "fade-in 0.25s ease-out",
                  }}
                >
                  <img
                    src={npcIntro.sprite}
                    alt={npcIntro.name}
                    className="pixelated"
                    width={isAmbush ? 64 : 40}
                    height={isAmbush ? 64 : 40}
                    style={{
                      filter: isAmbush ? `drop-shadow(0 0 8px ${accent})` : undefined,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: isAmbush ? 12 : 10, letterSpacing: isAmbush ? 1 : 0 }}>
                      {isAmbush ? "⚠ EMBOSCADA! " : "! "}{npcIntro.name}
                    </div>
                    <div style={{ fontSize: 8, color: "#fff", marginTop: 3 }}>
                      "{isAmbush ? npcIntro.quote : `${professionGreeting(profession, identity.name)} ${npcIntro.quote}`}"
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {activeQuest && (
            <QuestDialog
              quest={activeQuest}
              playerName={identity.name}
              snapshot={{
                capturePoints,
                trainerLevel,
                byTier: [...teamPets, ...storedPets].reduce(
                  (acc, p) => {
                    if (p.rarity === "rare") acc.rare += 1;
                    else if (p.rarity === "epic") acc.epic += 1;
                    else if (p.rarity === "mythic") acc.mythic += 1;
                    return acc;
                  },
                  { rare: 0, epic: 0, mythic: 0 }
                ),
              }}
              alreadyClaimed={questsClaimed[activeQuest.id] === questCycle}
              onClose={() => {
                if (activeQuest) dismissedQuestsRef.current.add(activeQuest.id);
                setActiveQuest(null);
              }}
              onClaim={() => {
                const q = activeQuest;
                if (!q || questsClaimed[q.id] === questCycle) {
                  if (q) dismissedQuestsRef.current.add(q.id);
                  setActiveQuest(null);
                  return;
                }
                const r = q.reward;
                if (r.gold) setGold((g) => g + (r.gold || 0));
                if (r.ball) setBalls((b) => ({ ...b, [r.ball!.kind]: (b[r.ball!.kind] || 0) + r.ball!.qty }));
                if (r.potion) setInventory((i) => ({ ...i, potion: (i.potion || 0) + (r.potion || 0) }));
                if (r.revive) setInventory((i) => ({ ...i, revive: (i.revive || 0) + (r.revive || 0) }));
                if (r.incenseXp) setInventory((i) => ({ ...i, incenseXp: (i.incenseXp || 0) + (r.incenseXp || 0) }));
                if (r.freeAvatar) setAvatarIdx((i) => (i + 1) % AVATAR_PRESETS.length);
                setQuestsClaimed((prev) => ({ ...prev, [q.id]: questCycle }));
                setMessageColor("#86efac");
                setMessageRaw(`${q.name}: "${q.doneLine(identity.name)}"`);
                dismissedQuestsRef.current.add(q.id);
                setActiveQuest(null);
              }}
            />
          )}

          {captainNavioOpen && (
            <CaptainNavioOverlay
              playerName={identity.name}
              onClose={() => setCaptainNavioOpen(false)}
            />
          )}

          {velhoMaresOpen && (
            <VelhoDosMaresOverlay
              gold={gold}
              spendGold={(n) => { if (gold < n) return false; setGold((g) => g - n); return true; }}
              onClose={() => setVelhoMaresOpen(false)}
            />
          )}

          {kurtDialogOpen && (
            <KurtDialogOverlay
              onClose={() => setKurtDialogOpen(false)}
              onOpenForge={() => setKurtOpen(true)}
            />
          )}

          {kurtOpen && (
            <KurtCraftOverlay
              gold={gold}
              spendGold={(n) => { if (gold < n) return false; setGold((g) => g - n); return true; }}
              addBall={(id, qty) => setBalls((b) => ({ ...b, [id]: (b[id] || 0) + qty }))}
              onClose={() => setKurtOpen(false)}
            />
          )}

          {mercadorMatOpen && (
            <MercadorMateriaisOverlay
              crystal={crystal}
              spendCrystal={(n) => { if (crystal < n) return false; setCrystal((c) => c - n); return true; }}
              onClose={() => setMercadorMatOpen(false)}
            />
          )}

          {moranguinhoOpen && (
            <MoranguinhoOverlay
              crystal={crystal}
              spendCrystal={(n) => { if (crystal < n) return false; setCrystal((c) => c - n); return true; }}
              onBuyRareCandy={(n) => setInventory(i => ({ ...i, rare_candy: (i.rare_candy || 0) + n }))}
              onBuyStarDust={(n) => setCapturePoints(p => p + n)}
              onClose={() => setMoranguinhoOpen(false)}
            />
          )}

          {botanistOpen && (
            <BotanistOverlay onClose={() => setBotanistOpen(false)} />
          )}

          {fishermanOpen && (
            <FishermanOverlay
              gold={gold}
              spendGold={(n) => { if (gold < n) return false; setGold((g) => g - n); return true; }}
              onClose={() => setFishermanOpen(false)}
            />
          )}




          {specialNpcProfile && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-gradient-to-b from-[#e0f2fe] to-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform animate-in zoom-in-95 duration-300">
                {/* Header / Cover */}
                <div className="h-24 bg-sky-200 relative">
                  <button 
                    onClick={() => setSpecialNpcProfile(null)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-sky-600 transition-colors z-10"
                  >
                    ✕
                  </button>
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-lg border-2 border-sky-100">
                      <div className="w-full h-full bg-sky-50 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={specialNpcProfile.sprite} alt={specialNpcProfile.name} className="pixelated scale-[2]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 px-6 pb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-sky-900 leading-none mb-1">{specialNpcProfile.name}</h2>
                      <p className="text-sky-500 text-sm font-medium">{specialNpcProfile.specialProfile?.location || "Treinador Especial"}</p>
                    </div>
                    <div className="bg-sky-100 px-3 py-1 rounded-full text-sky-600 text-xs font-bold uppercase tracking-wider">
                      NPC Especial
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl p-4 border border-sky-50 mb-6">
                    <p className="text-sky-800 italic text-sm leading-relaxed">
                      "{specialNpcProfile.quote}"
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                        📄
                      </div>
                      <div>
                        <p className="text-[10px] text-sky-400 font-bold uppercase">Sobre</p>
                        <p className="text-sky-700 text-sm">{specialNpcProfile.specialProfile?.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                        ✨
                      </div>
                      <div>
                        <p className="text-[10px] text-sky-400 font-bold uppercase">Gosta de</p>
                        <p className="text-sky-700 text-sm">{specialNpcProfile.specialProfile?.likes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quests Section */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-sky-400 font-bold uppercase px-1">Missões Disponíveis</p>
                    {currentQuests.filter(q => q.mapId === specialNpcProfile.mapId && rotatingActive[q.id]).map(q => {
                      const claimed = questsClaimed[q.id] === questCycle;
                      return (
                        <div 
                          key={q.id}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group
                            ${claimed 
                              ? "bg-emerald-50 border-emerald-100 opacity-75" 
                              : "bg-sky-50 border-sky-100 hover:border-sky-300 hover:bg-sky-100 shadow-sm hover:shadow-md"}`}
                          onClick={() => {
                            if (!claimed) {
                              setActiveQuest(q);
                              setSpecialNpcProfile(null);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner
                              ${claimed ? "bg-emerald-100" : "bg-white"}`}>
                              {claimed ? "✅" : "❓"}
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${claimed ? "text-emerald-700" : "text-sky-800"}`}>
                                {q.name}
                              </p>
                              <p className={`text-[10px] ${claimed ? "text-emerald-500" : "text-sky-500"}`}>
                                {claimed ? "Concluída!" : "Clique para aceitar"}
                              </p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1
                            ${claimed ? "bg-emerald-200 text-emerald-700" : "bg-sky-200 text-sky-700"}`}>
                            →
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-sky-50 flex justify-center border-t border-sky-100">
                  <button 
                    onClick={() => setSpecialNpcProfile(null)}
                    className="px-8 py-2 bg-white rounded-full text-sky-600 font-bold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-sky-100"
                  >
                    Fechar Perfil
                  </button>
                </div>
              </div>
            </div>
          )}

          {transition && (
            <div className="absolute inset-0 z-[120] flex items-center justify-center overflow-hidden"
              style={{ background: transition.mew
                ? "radial-gradient(circle at 50% 50%, rgba(255,182,219,0.25), rgba(20,8,40,0.98))"
                : "radial-gradient(circle at 50% 50%, rgba(20,12,40,0.85), rgba(0,0,0,0.98))" }}>
              {transition.mew ? (
                <>
                  <video src={mewTransitionVideo} autoPlay muted playsInline loop
                    style={{ width: "min(320px, 80%)", height: "auto", filter: "drop-shadow(0 0 24px rgba(255,150,220,0.9))" }} />
                  <div className="name-font" style={{
                    position: "absolute", bottom: "14%", left: 0, right: 0, textAlign: "center",
                    color: "#ffd1ec", fontSize: 13, letterSpacing: 3, textShadow: "0 0 12px #ff66c4, 0 0 4px #fff",
                  }}>
                    ✨ Mew te guia até {transition.mapName}…
                  </div>
                </>
              ) : (
                <>
                  <img src={dragoniteMailGif} alt="Dragonite Mail"
                    style={{ width: 180, height: "auto", animation: "dragoniteFly 1.3s ease-in-out", filter: "drop-shadow(0 4px 12px rgba(253,224,71,0.6))" }} />
                  <div className="name-font" style={{
                    position: "absolute", bottom: "18%", left: 0, right: 0, textAlign: "center",
                    color: "#fde047", fontSize: 12, letterSpacing: 2, textShadow: "0 0 8px #f59e0b",
                  }}>
                    ✈ Viajando para {transition.mapName}…
                  </div>
                </>
              )}
            </div>
          )}

          {activeBattle && fighter && (
            <PvpBattleOverlay battle={activeBattle} meId={identity.id} fighter={fighter} onFinish={finishBattle} />
          )}

          {challengeTarget && (
            <ChallengeOverlay target={challengeTarget} fighter={fighter} team={teamPets}
              guild={guild}
              onInvite={async (p) => {
                if (!guild) return;
                const res = await sendInviteToPlayer({
                  guild, fromUserId: identity.id, fromUsername: identity.name,
                  toUserId: p.id, toUsername: p.name,
                });
                if (res.ok) {
                  setMessageColor("#86efac");
                  setMessageRaw(`Convite enviado para ${p.name}.`);
                } else {
                  setMessage(res.error || "Não pode convidar.");
                }
                setChallengeTarget(null);
              }}
              onClose={() => setChallengeTarget(null)} onSend={sendChallenge} />
          )}


          {playersOpen && !encounter && (
            <PlayersOverlay players={playersHere} onClose={() => setPlayersOpen(false)} onChallenge={(p) => { setPlayersOpen(false); setChallengeTarget(p); }} />
          )}

          {menuOpen && !encounter && (
            <MenuOverlay onClose={() => { returnToMenuRef.current = false; setMenuOpen(false); }}
              onBag={() => openFromMenu(() => setBagOpen(true))}
              onShop={() => openFromMenu(() => setShopOpen(true))}
              onMarket={() => openFromMenu(() => setMarketOpen(true))}
              onPlayers={() => openFromMenu(() => setPlayersOpen(true))}
              onStatus={() => openFromMenu(() => { if (leader) setStatsPet(leader); })}
              onDrive={() => openFromMenu(() => setDriveOpen(true))}
              onGuild={() => openFromMenu(() => setGuildOpen(true))}
              onRanked={() => openFromMenu(() => setRankedOpen(true))}
              onTrainerTree={() => openFromMenu(() => setTrainerTreeOpen(true))}
              onParty={() => openFromMenu(() => setPartyOpen(true))}
              onAscension={() => openFromMenu(() => setAscensionOpen(true))}
              onAutoHunt={() => openFromMenu(() => setAutoHuntConfigOpen(true))}
              onCodex={() => openFromMenu(() => setCodexOpen(true))}
              onQuests={() => openFromMenu(() => setQuestLogOpen(true))}
              questCount={activeQuestsCount()}
              hasParty={hasParty}
              partyInviteCount={partyInviteCount}
              onSave={() => {
                const cur = loadLatestValid<SaveState>();
                if (cur) manualSave(cur);
              }}
              hasGuild={!!guild}
              onReset={onReset}
              avatarIdx={avatarIdx} onAvatar={() => setMessage("Fale com a Estilista Lucy no Laboratorio para trocar de skin.")}
              mapName={curMap.name} caught={teamPets.length} trainerName={identity.name} trainerLevel={trainerLevel} gold={gold} crystal={crystal} capturePoints={capturePoints} />
          )}

          {questLogOpen && (
            <QuestLogOverlay
              key={`ql-${questTick}`}
              ctx={{
                inventory,
                teamSpecies: [...teamPets, ...(storedPets || [])].map((p) => String(p.species)),
              }}
              onDeliver={({ questId, step }) => handleQuestDeliver({ questId, step })}
              onClose={() => setQuestLogOpen(false)}
            />
          )}


          {avatarPickerOpen && (
            <div onClick={() => setAvatarPickerOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9500, display: "grid", placeItems: "center", padding: 16 }}>
              <div onClick={(e) => e.stopPropagation()}
                style={{ background: "linear-gradient(180deg,#0f172a,#020617)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: 20, maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: "#fbbf24", fontWeight: 700 }}>TREINADOR</div>
                    <h3 style={{ color: "#fef3c7", fontSize: 18, fontWeight: 700, margin: "4px 0 0" }}>Escolher Avatar</h3>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Custo: 150g por troca</div>
                  </div>
                  <button onClick={() => setAvatarPickerOpen(false)} style={{ border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", color: "#cbd5e1", background: "transparent", cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
                  {AVATAR_PRESETS.map((a, i) => {
                    const selected = i === avatarIdx;
                    return (
                      <button key={a.id} onClick={() => {
                        if (selected) { setAvatarPickerOpen(false); return; }
                        if (gold < 150) { setMessage("Faltam Gold (custa 150)"); return; }
                        setGold((g) => g - 150);
                        setAvatarIdx(i);
                        setMessage(`Avatar: ${a.name} (-150g)`);
                        setAvatarPickerOpen(false);
                      }}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 10,
                          border: selected ? "2px solid #fbbf24" : "1px solid #334155",
                          background: selected ? "rgba(251,191,36,0.1)" : "rgba(15,23,42,0.6)",
                          borderRadius: 10, cursor: "pointer",
                        }}>
                        <div style={{
                          width: 56, height: 64,
                          backgroundImage: `url(${a.sheet})`, backgroundSize: "400% 400%",
                          backgroundPosition: "0% 0%", imageRendering: "pixelated",
                          filter: a.hue ? `hue-rotate(${a.hue}deg) saturate(1.15)` : undefined,
                        }} />
                        <div style={{ fontSize: 11, color: selected ? "#fbbf24" : "#cbd5e1", fontWeight: 600 }}>{a.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {guildOpen && !encounter && (
            <GuildOverlay
              guild={guild}
              meId={identity.id}
              meName={identity.name}
              meLevel={trainerLevel}
              meLeaderSpecies={leader?.species ?? initial.starter}
              gold={gold}
              setGold={setGold}
              crystal={crystal}
              ruby={ruby}
              capturePoints={capturePoints}
              setCapturePoints={setCapturePoints}
              speciesGif={SPECIES_GIF as unknown as Record<string, string>}
              onClose={closeBackToMenu(() => setGuildOpen(false))}

              onMessage={(m) => { setMessageColor("#f0abfc"); setMessageRaw(m); }}
              pendingInvites={pendingInvites}
              onCreate={async ({ name, element }) => {
                if (gold < 5000) { setMessage("Ouro insuficiente"); return; }
                const res = await createGuildRemote({
                  name, element,
                  founderId: identity.id, founderName: identity.name,
                  founderLevel: trainerLevel, leaderSpecies: leader?.species ?? initial.starter,
                });
                if (res.ok && res.guild) {
                  setGold((g) => g - 5000);
                  setGuild(res.guild);
                  setMessageColor("#86efac");
                  setMessageRaw(`Guilda "${res.guild.name}" fundada!`);
                } else {
                  setMessage(res.error || "Erro ao fundar guilda.");
                }
              }}
              onDonate={async (xp) => {
                if (!guild) return;
                if (capturePoints < xp) { setMessage("Fragmentos insuficientes"); return; }
                const res = await donateToGuildRemote(guild.id, xp);
                if (res.ok) {
                  setCapturePoints((c) => c - xp);
                  setMessageColor("#86efac");
                  setMessageRaw(`+${xp} XP doados.`);
                  await refreshGuild();
                } else {
                  setMessage(res.error || "Erro ao doar.");
                }
              }}
              onDonateResource={async (kind, qty) => {
                if (!guild) return;
                if (qty <= 0) return;
                const have = kind === "gold" ? gold : kind === "crystal" ? crystal : ruby;
                if (have < qty) { setMessage(`Você não tem ${qty} ${kind}.`); return; }
                const res = await donateResourceRemote(guild.id, kind, qty);
                if (res.ok) {
                  if (kind === "gold") setGold((v) => v - qty);
                  else if (kind === "crystal") setCrystal((v) => v - qty);
                  else setRuby((v) => v - qty);
                  setMessageColor("#fcd34d");
                  setMessageRaw(`Você doou ${qty} ${kind} ao tesouro.`);
                  await refreshGuild();
                } else setMessage(res.error || "Erro ao doar.");
              }}
              onEvolve={async () => {
                if (!guild) return;
                const res = await evolveGuildRemote(guild.id);
                if (res.ok) {
                  setMessageColor("#fcd34d");
                  setMessageRaw(`★ Guilda evoluiu para Nv ${res.newLevel}! ★`);
                  await refreshGuild();
                } else setMessage(res.error || "Erro ao evoluir.");
              }}
              onPromoteVice={async (mid, mname) => {
                if (!guild) return;
                const res = await setViceLeaderRemote(guild.id, mid);
                if (res.ok) {
                  setMessageColor("#86efac");
                  setMessageRaw(`${mname} promovido(a) a vice-líder.`);
                  await refreshGuild();
                } else setMessage(res.error || "Erro.");
              }}
              onDemoteVice={async () => {
                if (!guild) return;
                const res = await setViceLeaderRemote(guild.id, null);
                if (res.ok) {
                  setMessageRaw("Vice rebaixado.");
                  await refreshGuild();
                } else setMessage(res.error || "Erro.");
              }}

              onKick={async (mid, mname) => {
                if (!guild) return;
                const res = await kickMemberRemote(guild.id, mid);
                if (res.ok) { setMessageRaw(`${mname} foi removido.`); await refreshGuild(); }
                else setMessage(res.error || "Erro ao remover.");
              }}
              onDissolve={async () => {
                if (!guild) return;
                await dissolveGuildRemote(guild.id);
                setGuild(null);
                setMessageRaw("Guilda dissolvida.");
              }}
              onLeave={async () => {
                await leaveGuildRemote(identity.id);
                setGuild(null);
                setMessageRaw("Você saiu da guilda.");
              }}
              onAcceptInvite={async (inv) => {
                const res = await acceptInvite({
                  invite: inv, userId: identity.id, username: identity.name,
                  level: trainerLevel, leaderSpecies: leader?.species ?? initial.starter,
                });
                if (res.ok) {
                  setMessageColor("#86efac");
                  setMessageRaw(`Você entrou em ${inv.guild_name}!`);
                  await Promise.all([refreshGuild(), refreshInvites()]);
                } else {
                  setMessage(res.error || "Erro.");
                  await refreshInvites();
                }
              }}
              onDeclineInvite={async (inv) => {
                await declineInvite(inv.id);
                await refreshInvites();
              }}
              onInviteByUsername={async (username) => {
                if (!guild) return;
                const res = await sendInviteByUsername({
                  guild, fromUserId: identity.id, fromUsername: identity.name, toUsername: username,
                });
                if (res.ok) { setMessageColor("#86efac"); setMessageRaw(`Convite enviado a ${username}.`); }
                else setMessage(res.error || "Erro ao convidar.");
              }}
            />
          )}

          {rankedOpen && !encounter && (
            <RankedOverlay
              players={remotePlayers}
              me={{ id: identity.id, name: identity.name, trainer_level: trainerLevel, craft_points: capturePoints, leader_species: leader?.species ?? null }}
              speciesGif={SPECIES_GIF as unknown as Record<string, string>}
              onClose={closeBackToMenu(() => setRankedOpen(false))}
            />
          )}

          {trainerTreeOpen && !encounter && (
            <TrainerTreeOverlay
              onClose={closeBackToMenu(() => setTrainerTreeOpen(false))}
              stats={{ trainerLevel, caught: teamPets.length, gold, crystal, capturePoints }}
              onReward={(g, c, cp) => {
                if (g) setGold((v) => v + g);
                if (c) setCrystal((v) => v + c);
                if (cp) setCapturePoints((v) => v + cp);
                setMessage(`Recompensa recebida! +${g}g +${c}💎 +${cp}cp`);
              }}
            />
          )}

          {partyOpen && !encounter && (
            <PartyOverlay
              me={{ id: identity.id, name: identity.name, level: trainerLevel, mapId }}
              nearbyPlayers={remotePlayers.filter((p) => p.map === mapId).map((p) => ({ id: p.id, name: p.name }))}
              wildsOnMap={(wilds[mapId] ?? []).map((w) => ({ id: w.id, name: SPECIES_NAME[w.pet.species] ?? w.pet.species, level: w.pet.level, hpPct: Math.round((w.pet.hp / Math.max(1, w.pet.maxHp)) * 100), rarity: w.pet.rarity }))}
              remotePlayersOnMap={remotePlayers.filter((p) => p.map === mapId).map((p) => ({ id: p.id, name: p.name, level: p.trainer_level ?? p.level ?? 1 }))}
              onChallenge={(playerId: string) => {
                const target = remotePlayers.find((p) => p.id === playerId);
                if (!target) { setMessage("Jogador fora de alcance."); return; }
                setChallengeTarget(target);
                setPartyOpen(false);
              }}
              onClose={closeBackToMenu(() => setPartyOpen(false))}
              onPartyChange={(p) => {
                setHasParty(!!p);
                const newIds = p ? p.members.map((m) => m.player_id).filter((id) => id !== identity.id) : [];
                setPartyMemberIds(new Set(newIds));
                // (re)subscribe broadcast bus
                const cur = partyBusRef.current;
                if (!p) {
                  if (cur) { void supabase.removeChannel(cur.channel); partyBusRef.current = null; }
                  return;
                }
                if (cur && cur.partyId === p.party.id) {
                  cur.memberIds = newIds;
                  return;
                }
                if (cur) void supabase.removeChannel(cur.channel);
                const ch = subscribePartyChannel(p.party.id, (ev: PartyBroadcastEvent) => {
                  if (ev.type === "xp_share") {
                    if (ev.mapId !== mapIdRef.current) return;
                    if (ev.fromId === identity.id) return;
                    setTeamPets((pets) => {
                      const idx = pets.findIndex((pp) => !isFainted(pp));
                      if (idx < 0) return pets;
                      const copy = pets.slice(); copy[idx] = gainXp(copy[idx], ev.xpEach); return copy;
                    });
                    setMessageRaw(`★ Party: +${ev.xpEach} XP (kill de ${ev.fromName})`);
                  }
                });
                partyBusRef.current = { channel: ch, partyId: p.party.id, memberIds: newIds };
              }}
            />
          )}




          {driveOpen && !encounter && (
            <DriveOverlay
              team={teamPets} 
              stored={storedPets} 
              capturePoints={capturePoints}
              capacity={driveCapacity}
              crystal={crystal}
              onClose={closeBackToMenu(() => setDriveOpen(false))}
              onExpand={() => {
                if (crystal < 30) { setMessage("Faltam Cristais (custa 30)"); return; }
                setCrystal(c => c - 30);
                setDriveCapacity(cap => cap + 50);
                setMessage("Drive expandido! +50 slots");
              }}
              onFragmentTeam={(uid) => {
                const p = teamPets.find((x) => x.uid === uid); if (!p) return;
                if (teamPets.length <= 1) { setMessage("Mantenha ao menos 1 no time."); return; }
                const pts = FRAGMENT_POINTS[p.rarity] || 1;
                setTeamPets((t) => t.filter((x) => x.uid !== uid));
                setCapturePoints((c) => c + pts);
                setMessage(`${SPECIES_NAME[p.species]} fragmentado: +${pts} pts`);
              }}
              onFragmentStored={(uid) => {
                const p = storedPets.find((x) => x.uid === uid); if (!p) return;
                const pts = FRAGMENT_POINTS[p.rarity] || 1;
                setStoredPets((s) => s.filter((x) => x.uid !== uid));
                setCapturePoints((c) => c + pts);
                setMessage(`${SPECIES_NAME[p.species]} fragmentado: +${pts} pts`);
              }}
              onWithdraw={(uid) => {
                if (teamPets.length >= TEAM_MAX) { setMessage("Time cheio (max 6)."); return; }
                const p = storedPets.find((x) => x.uid === uid); if (!p) return;
                setStoredPets((s) => s.filter((x) => x.uid !== uid));
                setTeamPets((t) => [...t, p]);
                setMessage(`${SPECIES_NAME[p.species]} para o time!`);
              }}
              onDeposit={(uid) => {
                if (teamPets.length <= 1) { setMessage("Mantenha ao menos 1 no time."); return; }
                if (storedPets.length >= driveCapacity) { setMessage("Drive cheio! Expanda-o."); return; }
                const p = teamPets.find((x) => x.uid === uid); if (!p) return;
                setTeamPets((t) => t.filter((x) => x.uid !== uid));
                setStoredPets((s) => [...s, p]);
                setMessage(`${SPECIES_NAME[p.species]} depositado no DRIVE.`);
              }}
            />
          )}

          {bagOpen && !encounter && (
            <BagOverlay balls={balls} inventory={inventory} team={teamPets} gold={gold}
              onClose={() => setBagOpen(false)} onPickPet={(p) => setStatsPet(p)}
              onSetLeader={setAsLeader} onRevive={useRevive} onUseItem={useItemOnLeader} />
          )}

          {shopOpen && !encounter && (
            <ShopOverlay gold={gold} crystal={crystal} ruby={ruby} onClose={() => setShopOpen(false)} onBuy={buy} />
          )}

          {marketOpen && !encounter && (
            <MarketOverlay gold={gold} crystal={crystal} market={market}
              onClose={() => setMarketOpen(false)} onBuy={buyMarket}
              team={teamPets} inventory={inventory} onPost={postMarket} />
          )}

          {statsPet && (
            <StatsOverlay
              pet={statsPet}
              onClose={() => setStatsPet(null)}
              gif={SPECIES_GIF[statsPet.species]}
              morangoCount={inventory.fruta_morango || 0}
              onUseStrawberry={() => {
                if ((inventory.fruta_morango || 0) <= 0) return;
                const { pet: np, leveled, bonusStat } = feedStrawberry(statsPet);
                setInventory((inv) => ({ ...inv, fruta_morango: Math.max(0, (inv.fruta_morango || 0) - 1) }));
                setStatsPet(np);
                setTeamPets((pets) => pets.some((p) => p.uid === np.uid) ? pets.map((p) => p.uid === np.uid ? np : p) : pets);
                setStoredPets((pets) => pets.some((p) => p.uid === np.uid) ? pets.map((p) => p.uid === np.uid ? np : p) : pets);
                if (leveled) {
                  toast.success(`✦ Lealdade máxima! +2% em todos · +3% em ${bonusStat?.toUpperCase()}`);
                  setMessage?.(`${SPECIES_NAME[np.species as Species]} conquistou um novo bônus de lealdade!`);
                } else {
                  toast(`🍓 +10 lealdade (${np.lealdade}/100)`);
                }
              }}
              limaoCount={inventory.fruta_limao || 0}
              onUseLemon={() => {
                if ((inventory.fruta_limao || 0) <= 0) return;
                const np = feedHunger(statsPet, LEMON_HUNGER_GAIN);
                setInventory((inv) => ({ ...inv, fruta_limao: Math.max(0, (inv.fruta_limao || 0) - 1) }));
                setStatsPet(np);
                setTeamPets((pets) => pets.some((p) => p.uid === np.uid) ? pets.map((p) => p.uid === np.uid ? np : p) : pets);
                setStoredPets((pets) => pets.some((p) => p.uid === np.uid) ? pets.map((p) => p.uid === np.uid ? np : p) : pets);
                toast(`🍋 +${LEMON_HUNGER_GAIN} fome (${np.fome}/100)`);
              }}
              onUpdate={(np) => {
                setStatsPet(np);
                setTeamPets((pets) => pets.some((p) => p.uid === np.uid) ? pets.map((p) => p.uid === np.uid ? np : p) : pets);
                setStoredPets((pets) => pets.some((p) => p.uid === np.uid) ? pets.map((p) => p.uid === np.uid ? np : p) : pets);
              }}
            />
          )}

          {/* (removido) Box passiva de gold/pokebolas */}

          {dangerActive && (
            <div className="absolute top-9 left-1 px-2 py-1 text-[7px]" style={{ background: "rgba(180,30,30,0.9)", color: "#fff", borderRadius: 4 }}>
              ⚠ MODO PERIGO {Math.ceil((dangerUntil - Date.now()) / 60000)}m
            </div>
          )}
        </div>

        {!isFocusMode && !anyDialogueOpen && (
          <div className="absolute bottom-0 left-0 right-0 px-2 py-2 text-[9px] leading-tight flex items-center gap-2"
            style={{
              background: "var(--gb-screen)",
              color: messageColor ?? "var(--gb-darkest)",
              borderTop: "3px double var(--gb-darkest)",
              minHeight: 56,
              textShadow: messageColor ? "0 0 6px rgba(255,90,160,0.45)" : undefined,
              fontWeight: messageColor ? 700 : undefined,
            }}>
            <span className="text-[12px] opacity-70">▶</span>
            <span className="flex-1">{message}</span>
          </div>
        )}

        {/* NPC Dialogue System */}
        <AnimatePresence>
          {activeNpcDialogue && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 z-[150] flex flex-col"
              style={{ height: isFocusMode ? "100%" : "auto" }}
            >
              <div 
                className="relative bg-[#f8f8f8] border-t-4 border-[#333] p-4 flex gap-4 min-h-[160px]"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
                  boxShadow: "0 -4px 20px rgba(0,0,0,0.2)"
                }}
              >
                {/* Close Button */}
                <button 
                  onClick={() => { setActiveNpcDialogue(null); setDialogueStep(0); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#333] text-white flex items-center justify-center text-xl font-bold hover:bg-rose-500 transition-colors z-20"
                >
                  ✕
                </button>

                {/* Left: Big NPC Portrait */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-white rounded-2xl border-4 border-[#333] overflow-hidden shadow-inner group">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-sky-100 opacity-50" />
                  <img 
                    src={activeNpcDialogue.sprite} 
                    alt={activeNpcDialogue.name} 
                    className="pixelated w-full h-full object-contain scale-[1.5] drop-shadow-lg"
                  />
                  {/* Decorative illustrated frame effect */}
                  <div className="absolute inset-0 border-[8px] border-white/30 pointer-events-none" />
                </div>

                {/* Right: Dialogue Content */}
                <div className="flex-1 flex flex-col pt-1">
                  <div className="name-font text-[#3b82f6] text-xs font-bold uppercase tracking-wider mb-2">
                    {activeNpcDialogue.name}
                  </div>
                  
                  <div className="flex-1 text-[#333] text-[11px] leading-relaxed gb-font overflow-y-auto pr-6 custom-scrollbar">
                    <motion.p
                      key={`${activeNpcDialogue.id}-${dialogueStep}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {dialogueStep === 0 
                        ? (NPC_DIALOGUES[activeNpcDialogue.id]?.greet || activeNpcDialogue.quote)
                        : (NPC_DIALOGUES[activeNpcDialogue.id]?.story[dialogueStep - 1] || "...")}
                    </motion.p>
                  </div>

                  {/* Options */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {dialogueStep === 0 && (
                      <>
                        <button 
                          onClick={() => {
                            const npc = activeNpcDialogue;
                            setActiveNpcDialogue(null);
                            setDialogueStep(0);
                            spawnNpcMon(npc, 0);
                          }}
                          className="bg-[#3b82f6] text-white text-[9px] px-4 py-2 rounded-lg font-bold hover:bg-[#2563eb] transition-all transform hover:scale-105 active:scale-95 shadow-md uppercase tracking-tight"
                        >
                          ▶ Batalhar
                        </button>
                        {NPC_DIALOGUES[activeNpcDialogue.id]?.story && (
                          <button 
                            onClick={() => setDialogueStep(1)}
                            className="bg-emerald-500 text-white text-[9px] px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-all transform hover:scale-105 active:scale-95 shadow-md uppercase tracking-tight"
                          >
                            ▶ Modo História
                          </button>
                        )}
                        {NPC_DIALOGUES[activeNpcDialogue.id]?.itemRequest && (inventory[NPC_DIALOGUES[activeNpcDialogue.id]!.itemRequest!.itemId] || 0) >= NPC_DIALOGUES[activeNpcDialogue.id]!.itemRequest!.qty && (
                          <button 
                            onClick={() => handleTurnInItem(activeNpcDialogue.id)}
                            className="bg-purple-600 text-white text-[9px] px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-md uppercase tracking-tight"
                          >
                            🎁 Entregar {NPC_DIALOGUES[activeNpcDialogue.id]!.itemRequest!.name}
                          </button>
                        )}
                      </>

                    )}
                    
                    {dialogueStep > 0 && dialogueStep < (NPC_DIALOGUES[activeNpcDialogue.id]?.story?.length || 0) && (
                      <button 
                        onClick={() => setDialogueStep(s => s + 1)}
                        className="bg-emerald-500 text-white text-[9px] px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-all transform hover:scale-105 active:scale-95 shadow-md uppercase tracking-tight"
                      >
                        ▶ Continuar
                      </button>
                    )}

                    <button 
                      onClick={() => { setActiveNpcDialogue(null); setDialogueStep(0); }}
                      className="bg-[#666] text-white text-[9px] px-4 py-2 rounded-lg font-bold hover:bg-[#444] transition-all transform hover:scale-105 active:scale-95 shadow-md uppercase tracking-tight"
                    >
                      ▶ Sair
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div
      className="gb-font fixed inset-0 flex items-center justify-center overflow-hidden select-none"
      style={{ background: "#1a1a1a", userSelect: "none", WebkitUserSelect: "none" }}
      onMouseDown={(e) => { if (e.detail > 1) e.preventDefault(); }}
    >
      <h1 className="sr-only">Ruby M Online</h1>
      <MusicPlayer mapId={mapId} inBattle={!!encounter || !!activeBattle} isTrainerBattle={!!activeBattle} />

      <button
        onClick={() => setOrientation((o) => nextMode[o])}
        className="gb-font fixed top-2 right-2 z-50 px-2 py-1 text-[10px]"
        style={{ background: "rgba(0,0,0,0.7)", color: "#e7c769", border: "1px solid #e7c769", borderRadius: 6 }}
        title="Alternar modo de tela"
      >
        {modeLabel[orientation]}
      </button>

      <div style={{
        width: BASE_SIZE.w,
        height: BASE_SIZE.h,
        transform: `scale(${shellScale})`,
        transformOrigin: "center center",
        flexShrink: 0,
      }}>
        {isFullscreen ? (
          <div className="relative h-full w-full p-2 flex flex-col"
            style={{ background: "linear-gradient(180deg,#1a1a1a,#0a0a0a)" }}>
            {!anyOverlay && !isFocusMode && <div className="mb-2">{statusBarEl}</div>}
            <div className="flex-1 min-h-0 flex items-stretch justify-center gap-2">
              {viewport.w >= 720 && !isFocusMode && (
                <div className="flex flex-col items-center justify-center gap-3 px-1">
                  {dpadEl}
                  {selectPill}
                </div>
              )}
              <div className="flex-1 min-h-0 flex items-center justify-center" style={{ containerType: "size" }}>
                <div
                  style={{
                    width: `min(100cqw, calc(100cqh * ${viewW} / ${viewH + viewExtraH}))`,
                    aspectRatio: viewAspect,
                  }}
                >
                  {screenCardEl}
                </div>
              </div>
              {viewport.w >= 720 && !isFocusMode && (
                <div className="flex flex-col items-center justify-center gap-3 px-1">
                  {abcEl}
                  {startPill}
                  {lPill}
                </div>
              )}
            </div>
            {viewport.w < 720 && !isFocusMode && (
              <>
                <div className="mt-2 flex items-center justify-between px-2">
                  {dpadEl}
                  {abcEl}
                </div>
                <div className="mt-2 flex items-center justify-center gap-3">
                  {selectPill}
                  {startPill}
                  {lPill}
                </div>
              </>
            )}
            {!isFocusMode && <div className="mt-1">{leaderCardEl}</div>}
          </div>
        ) : isLandscape ? (
          <div className="relative h-full w-full rounded-[28px] p-4 flex items-center gap-4 shadow-2xl"
            style={{ background: "#c9c4b6", boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 -4px 0 rgba(0,0,0,0.15)" }}>
            {/* Coluna esquerda: DPad + SELECT */}
            {!isFocusMode && (
              <div className="flex flex-col items-center justify-center gap-4 h-full">
                {dpadEl}
                {selectPill}
              </div>
            )}
            {/* Coluna central: status + tela + pills + leader */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              {!anyOverlay && !isFocusMode && <div className="mb-1 flex-shrink-0">{statusBarEl}</div>}
              <div className="flex-1 min-h-0 w-full flex items-center justify-center" style={{ containerType: "size" }}>
                <div
                  style={{
                    width: `min(100cqw, calc(100cqh * ${viewW} / ${viewH + viewExtraH}))`,
                    aspectRatio: viewAspect,
                  }}
                >
                  {screenCardEl}
                </div>
              </div>
              {!isFocusMode && (
                <div className="mt-2 flex items-center justify-center gap-3 flex-shrink-0">
                  {startPill}
                  {lPill}
                </div>
              )}
              {!isFocusMode && <div className="flex-shrink-0">{leaderCardEl}</div>}
            </div>
            {/* Coluna direita: A/B/C */}
            {!isFocusMode && (
              <div className="flex flex-col items-center justify-center gap-4 h-full">
                {abcEl}
                <div className="text-[7px]" style={{ color: "#444" }}>A · B · C</div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-full w-full rounded-[28px] rounded-br-[80px] p-2 shadow-2xl flex flex-col"
            style={{ background: "#c9c4b6", boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 -4px 0 rgba(0,0,0,0.15)" }}>
            {!anyOverlay && !isFocusMode && <div className="mb-1 flex-shrink-0">{statusBarEl}</div>}
            {/* Tela do jogo: ocupa o espaço vertical disponível mantendo proporção */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center" style={{ containerType: "size" }}>
              <div style={{
                width: `min(100cqw, calc(100cqh * ${viewW} / ${viewH + viewExtraH}))`,
                aspectRatio: viewAspect,
              }}>
                {screenCardEl}
              </div>
            </div>
            {!isFocusMode && (
              <>
                <div className="mt-1 flex items-center justify-between px-2 flex-shrink-0">
                  {dpadEl}
                  {abcEl}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2 flex-shrink-0">
                  {selectPill}
                  {startPill}
                  {lPill}
                </div>
                <div className="flex-shrink-0 mt-1">{leaderCardEl}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== QUEST DIALOG ==============
function IncenseBadge({ type, untilMs, mapName }: { type: "common" | "rare" | "epic"; untilMs: number; mapName: string }) {
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(iv);
  }, []);
  const leftMs = Math.max(0, untilMs - Date.now());
  const min = Math.floor(leftMs / 60000);
  const sec = Math.floor((leftMs % 60000) / 1000);
  const lowTime = leftMs <= 5 * 60 * 1000;
  const color = type === "epic" ? "#a78bfa" : type === "rare" ? "#60a5fa" : "#fde047";
  return (
    <div className="absolute top-16 right-2 z-[60] flex flex-col items-end gap-1">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`Incenso ${type} — ${min}m ${sec}s`}
        className={lowTime ? "animate-pulse" : ""}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(0,0,0,0.72)", border: `2px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
          boxShadow: lowTime ? `0 0 10px ${color}` : "none",
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>🍯</span>
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="gb-font"
          style={{
            background: "rgba(0,0,0,0.85)", border: `1px solid ${color}`,
            borderRadius: 6, padding: "5px 8px", color: "#fff",
            fontSize: 8, minWidth: 110, textAlign: "right", cursor: "pointer",
          }}
        >
          <div style={{ color, fontWeight: "bold", fontSize: 9 }}>
            INCENSO {type.toUpperCase()}
          </div>
          <div style={{ marginTop: 2 }}>📍 {mapName}</div>
          <div>⏱ {min}m {sec.toString().padStart(2, "0")}s</div>
        </div>
      )}
    </div>
  );
}

function QuestDialog({ quest, playerName, snapshot, alreadyClaimed, onClose, onClaim }: {
  quest: QuestInstance;
  playerName: string;
  snapshot: QuestSnapshot;
  alreadyClaimed: boolean;
  onClose: () => void;
  onClaim: () => void;
}) {
  const done = quest.done(snapshot);
  const greet = buildGreet(quest, quest, playerName);
  return (
    <div className="absolute inset-0 z-[110] flex items-end justify-center gb-font"
      style={{ background: "rgba(0,0,0,0.55)", padding: 8 }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 360,
          background: "linear-gradient(180deg, #0b1530 0%, #1a1450 100%)",
          border: "2px solid #fde047", borderRadius: 10, padding: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.55)", color: "#fff",
        }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <img src={quest.sprite} alt={quest.name} className="pixelated"
            width={64} height={64} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#fde047", letterSpacing: 1 }}>{quest.name}</div>
            <div style={{ fontSize: 8, color: "#cbd5e1", marginTop: 4, lineHeight: 1.4 }}>
              {alreadyClaimed ? quest.doneLine(playerName) : greet}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 6, background: "rgba(255,255,255,0.06)", borderRadius: 6 }}>
          <div style={{ fontSize: 8, color: "#93c5fd" }}>OBJETIVO</div>
          <div style={{ fontSize: 8, color: "#fff", marginTop: 2 }}>{quest.goal}</div>
          <div style={{ fontSize: 7, color: done ? "#86efac" : "#fbbf24", marginTop: 4 }}>
            {alreadyClaimed ? "✓ Recompensa retirada" : quest.goalProgress(snapshot)}
          </div>
        </div>
        <div style={{ marginTop: 6, padding: 6, background: "rgba(253,224,71,0.08)", borderRadius: 6 }}>
          <div style={{ fontSize: 8, color: "#fde047" }}>RECOMPENSA</div>
          <div style={{ fontSize: 8, color: "#fff", marginTop: 2 }}>{quest.rewardLabel}</div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, fontSize: 9, padding: "6px 8px", border: "1px solid #475569",
              background: "#1e293b", color: "#cbd5e1", borderRadius: 6 }}>FECHAR</button>
          <button onClick={onClaim} disabled={alreadyClaimed || !done}
            style={{
              flex: 2, fontSize: 9, padding: "6px 8px", borderRadius: 6,
              border: "1px solid #fde047",
              background: (alreadyClaimed || !done) ? "#3f3f46" : "linear-gradient(180deg,#fbbf24,#f59e0b)",
              color: (alreadyClaimed || !done) ? "#a1a1aa" : "#1f1300",
              cursor: (alreadyClaimed || !done) ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}>
            {alreadyClaimed ? "JA RECEBIDO" : done ? "RECEBER" : "EM ANDAMENTO"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== INTRO SCREEN ==============
function IntroScreen({ step, pendingName, setPendingName, pendingPass, setPendingPass, onPassword, onName, onProfession, onStarter }: {
  step: "password" | "name" | "profession" | "starter"; pendingName: string;
  setPendingName: (s: string) => void;
  pendingPass: string; setPendingPass: (s: string) => void;
  onPassword: () => void;
  onName: (s: string) => void;
  onProfession: (p: Profession) => void;
  onStarter: (s: StarterChoice) => void;
}) {
  const starters: { id: StarterChoice; name: string; gif: string; desc: string }[] = [
    { id: "charmander", name: "CHARMANDER", gif: charmanderGif, desc: "Tipo Fogo. Ofensivo e veloz." },
    { id: "bulbasaur", name: "BULBASAUR", gif: bulbasaurGif, desc: "Tipo Planta. Equilibrado e resistente." },
    { id: "squirtle", name: "SQUIRTLE", gif: squirtleGif, desc: "Tipo Agua. Defensivo e tatico." },
  ];
  const passValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{6,16}$/.test(pendingPass);
  return (
    <div className="gb-font fixed inset-0 w-full flex items-center justify-center p-4 select-none overflow-auto"
      style={{
        background: `linear-gradient(180deg, rgba(4,8,28,0.78) 0%, rgba(4,8,28,0.92) 100%), url(${introHero}) center / cover no-repeat`,
        userSelect: "none",
      }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(180,220,255,0.18) 0%, transparent 55%)",
      }} />
      <div className="relative w-full max-w-[420px] p-6 text-center"
        style={{
          background: "linear-gradient(180deg, rgba(10,18,40,0.92), rgba(6,10,28,0.95))",
          border: "1px solid rgba(160,200,255,0.35)",
          borderRadius: 14,
          boxShadow: "0 0 80px rgba(120,180,255,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          color: "#e7f0ff",
          backdropFilter: "blur(6px)",
        }}>
        <div style={{ fontSize: 11, letterSpacing: 8, color: "#9ec5ff", marginBottom: 4 }}>RUBY · M</div>
        <div style={{ fontFamily: "serif", fontSize: 26, letterSpacing: 4, color: "#fff", textShadow: "0 0 14px rgba(150,200,255,0.7)" }}>
          Trainer's Ascent
        </div>
        <div style={{ fontSize: 9, opacity: 0.65, marginTop: 6, marginBottom: 18, letterSpacing: 2 }}>
          ━━  ADVENTURE ONLINE  ━━
        </div>

        {step === "password" ? (
          <div>
            <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 12, lineHeight: 1.5 }}>
              Cofre do Treinador<br />
              <span style={{ opacity: 0.6, fontSize: 9 }}>Crie uma senha — letras e números (6–16).</span>
            </div>
            <input
              autoFocus type="password" inputMode="text" value={pendingPass}
              onChange={(e) => setPendingPass(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 16))}
              onKeyDown={(e) => { if (e.key === "Enter" && passValid) onPassword(); }}
              placeholder="••••••••"
              className="gb-font w-full text-center mb-3"
              style={{
                background: "rgba(0,0,0,0.45)", color: "#fff",
                border: "1px solid rgba(160,200,255,0.4)", borderRadius: 8,
                padding: "10px 12px", fontSize: 14, letterSpacing: 6, outline: "none",
              }}
            />
            <div style={{ fontSize: 8, opacity: 0.55, marginBottom: 14 }}>
              {pendingPass.length === 0 ? "minimo 6 caracteres" :
                passValid ? "✓ senha valida" : "precisa de letra E numero"}
            </div>
            <button
              disabled={!passValid}
              onClick={onPassword}
              className="gb-font w-full"
              style={{
                background: passValid ? "linear-gradient(180deg,#3b82f6,#1d4ed8)" : "rgba(255,255,255,0.08)",
                color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
                padding: "10px 0", fontSize: 11, letterSpacing: 4,
                cursor: passValid ? "pointer" : "not-allowed",
                boxShadow: passValid ? "0 6px 20px rgba(59,130,246,0.45)" : "none",
              }}>
              ENTRAR ▸
            </button>
          </div>
        ) : step === "name" ? (
          <div>
            <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 12 }}>
              Bem-vindo, treinador.<br />
              <span style={{ opacity: 0.6, fontSize: 9 }}>Como devemos te chamar?</span>
            </div>
            <input
              autoFocus value={pendingName}
              onChange={(e) => setPendingName(e.target.value.slice(0, 12))}
              onKeyDown={(e) => { if (e.key === "Enter" && pendingName.trim().length >= 3) onName(pendingName.trim()); }}
              placeholder="seu nome (3-12)"
              className="gb-font w-full text-center mb-4"
              style={{
                background: "rgba(0,0,0,0.45)", color: "#fff",
                border: "1px solid rgba(160,200,255,0.4)", borderRadius: 8,
                padding: "10px 12px", fontSize: 12, letterSpacing: 3, outline: "none",
              }}
            />
            <button
              disabled={pendingName.trim().length < 3}
              onClick={() => onName(pendingName.trim())}
              className="gb-font w-full"
              style={{
                background: pendingName.trim().length >= 3 ? "linear-gradient(180deg,#3b82f6,#1d4ed8)" : "rgba(255,255,255,0.08)",
                color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
                padding: "10px 0", fontSize: 11, letterSpacing: 4,
                cursor: pendingName.trim().length >= 3 ? "pointer" : "not-allowed",
                boxShadow: pendingName.trim().length >= 3 ? "0 6px 20px rgba(59,130,246,0.45)" : "none",
              }}>
              CONTINUAR ▶
            </button>
          </div>
        ) : step === "profession" ? (
          <div>
            <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 8, lineHeight: 1.5 }}>
              Prof. Carvalho diz:<br />
              <span style={{ opacity: 0.7, fontSize: 9 }}>"Antes de começar sua jornada, {pendingName}, diga-me... qual é a sua profissão?"</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mb-3" style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
              {PROFESSIONS.map((p) => (
                <button key={p.id} onClick={() => onProfession(p.id)} className="gb-font"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(160,200,255,0.3)",
                    borderRadius: 8, cursor: "pointer", color: "#e7f0ff",
                    padding: "6px 4px", fontSize: 8, lineHeight: 1.2,
                    display: "flex", alignItems: "center", gap: 4, textAlign: "left",
                  }}>
                  <span style={{ fontSize: 14 }}>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 8, opacity: 0.55, letterSpacing: 1 }}>SUA PROFISSÃO DEFINE COMO OS NPCs O TRATAM</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 14 }}>Escolha seu parceiro inicial</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {starters.map((s) => (
                <button key={s.id} onClick={() => onStarter(s.id)} className="gb-font flex flex-col items-center p-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(160,200,255,0.3)",
                    borderRadius: 10, cursor: "pointer", color: "#e7f0ff",
                  }}>
                  <img src={s.gif} alt={s.name} className="pixelated" width={64} height={64} />
                  <div style={{ fontSize: 9, marginTop: 4, letterSpacing: 1 }}>{s.name}</div>
                  <div style={{ fontSize: 7, marginTop: 3, opacity: 0.65, lineHeight: 1.3 }}>{s.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 8, opacity: 0.55, letterSpacing: 2 }}>VOCE COMECA EM NV. 1</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== WEATHER ==============
function WeatherOverlay({ kind }: { kind: Weather }) {
  if (kind === "sakura") {
    const petals = Array.from({ length: 40 });
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map((_, i) => {
          const dur = 4 + Math.random() * 5;
          const delay = Math.random() * 5;
          const size = 6 + Math.random() * 6;
          const drift = 30 + Math.random() * 80;
          return (
            <span key={i} style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              width: size, height: size,
              background: `radial-gradient(circle at 30% 30%, #ffd3e0 0%, #ff8fb4 60%, #d96a96 100%)`,
              borderRadius: "50% 0 50% 50%",
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0.85,
              animation: `sakuraFall ${dur}s linear ${delay}s infinite`,
              ["--drift" as never]: `${drift}px`,
            } as React.CSSProperties} />
          );
        })}
        <style>{`@keyframes sakuraFall {
          0% { transform: translate(0, -10px) rotate(0deg); }
          50% { transform: translate(var(--drift), 300px) rotate(180deg); }
          100% { transform: translate(0, 620px) rotate(360deg); }
        }`}</style>
      </div>
    );
  }
  const drops = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ background: kind === "rain" ? "rgba(20,40,80,0.15)" : "rgba(220,230,255,0.15)" }}>
      {drops.map((_, i) => (
        <span key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${-Math.random() * 100}%`,
          width: kind === "rain" ? 1 : 4,
          height: kind === "rain" ? 12 : 4,
          background: kind === "rain" ? "rgba(150,200,255,0.7)" : "#fff",
          borderRadius: kind === "snow" ? "50%" : 0,
          animation: `wdrop ${1 + Math.random() * 1.5}s linear ${Math.random() * 2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes wdrop { from { transform: translateY(-10px); } to { transform: translateY(600px); } }`}</style>
    </div>
  );
}

// ============== DAY / NIGHT ==============
// Ciclo completo a cada 24 minutos reais (1 min = 1 hora no jogo).
type DayPhase = "dawn" | "day" | "dusk" | "night";
function getDayPhase(now = Date.now()): { phase: DayPhase; hour: number; t: number } {
  const cycleMs = 24 * 60 * 1000; // 24 min
  const t = (now % cycleMs) / cycleMs; // 0..1
  const hour = (t * 24) % 24;
  let phase: DayPhase;
  if (hour >= 5 && hour < 7) phase = "dawn";
  else if (hour >= 7 && hour < 18) phase = "day";
  else if (hour >= 18 && hour < 20) phase = "dusk";
  else phase = "night";
  return { phase, hour, t };
}
function useDayPhase() {
  const [info, setInfo] = useState(() => getDayPhase());
  useEffect(() => {
    const id = setInterval(() => setInfo(getDayPhase()), 5000);
    return () => clearInterval(id);
  }, []);
  return info;
}
const PHASE_ICON: Record<DayPhase, string> = { dawn: "🌅", day: "☀", dusk: "🌇", night: "🌙" };
function DayNightOverlay({ phase }: { phase: DayPhase }) {
  // Cor + opacidade do tint sobre a cena.
  const cfg: Record<DayPhase, { color: string; alpha: number; vignette: string }> = {
    dawn:  { color: "#ffb178", alpha: 0.18, vignette: "radial-gradient(ellipse at 50% 30%, rgba(255,200,150,0.15), rgba(120,60,40,0.25))" },
    day:   { color: "#ffffff", alpha: 0.0,  vignette: "transparent" },
    dusk:  { color: "#ff7a3a", alpha: 0.28, vignette: "radial-gradient(ellipse at 50% 70%, rgba(255,120,60,0.22), rgba(60,20,40,0.40))" },
    night: { color: "#0a1a3a", alpha: 0.55, vignette: "radial-gradient(ellipse at 50% 50%, rgba(20,30,80,0.25), rgba(0,0,0,0.65))" },
  };
  const c = cfg[phase];
  if (phase === "day") return null;
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      mixBlendMode: phase === "night" ? "multiply" : "soft-light",
      background: c.color, opacity: c.alpha, transition: "opacity 1.5s linear, background 1.5s linear",
    }}>
      <div className="absolute inset-0" style={{ background: c.vignette, mixBlendMode: "normal", opacity: 1 }} />
      {phase === "night" && (
        <div className="absolute inset-0" style={{
          background: "radial-gradient(2px 2px at 20% 20%, #fff, transparent), radial-gradient(1px 1px at 70% 30%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 85% 80%, #fff, transparent), radial-gradient(1px 1px at 10% 75%, #fff, transparent)",
          mixBlendMode: "screen", opacity: 0.6,
        }} />
      )}
    </div>
  );
}

// ============== ENVIRONMENT PICKER ==============
function EnvPicker({ phase, weather, onPhase, onWeather, onClose }: {
  phase: DayPhase | null; weather: Weather | null;
  onPhase: (p: DayPhase | null) => void;
  onWeather: (w: Weather | null) => void;
  onClose: () => void;
}) {
  const phases: { id: DayPhase | null; label: string; icon: string }[] = [
    { id: null, label: "AUTO", icon: "⏱" },
    { id: "dawn", label: "AMANHECER", icon: "🌅" },
    { id: "day", label: "DIA", icon: "☀" },
    { id: "dusk", label: "TARDE", icon: "🌇" },
    { id: "night", label: "NOITE", icon: "🌙" },
  ];
  const weathers: { id: Weather | null; label: string; icon: string }[] = [
    { id: null, label: "AUTO", icon: "⏱" },
    { id: "clear", label: "LIMPO", icon: "☀" },
    { id: "rain", label: "CHUVA", icon: "☔" },
    { id: "snow", label: "NEVE", icon: "❄" },
    { id: "sakura", label: "SAKURA", icon: "🌸" },
  ];
  const cellStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "#ffd86b" : "rgba(255,255,255,0.08)",
    color: active ? "#000" : "#fff",
    border: active ? "1px solid #ffd86b" : "1px solid rgba(255,255,255,0.2)",
    borderRadius: 4, padding: "4px 5px", fontSize: 7, cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  });
  return (
    <div className="absolute top-8 left-2 z-[80] gb-font" style={{
      background: "rgba(8,16,28,0.92)", color: "#fff",
      border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6,
      padding: 6, width: 200, backdropFilter: "blur(4px)",
    }}>
      <div className="flex items-center justify-between mb-1" style={{ fontSize: 8 }}>
        <span>🕒 PERÍODO</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 9, cursor: "pointer" }}>×</button>
      </div>
      <div className="grid grid-cols-5 gap-1 mb-2">
        {phases.map((p) => (
          <button key={String(p.id)} onClick={() => onPhase(p.id)} style={cellStyle(phase === p.id)}>
            <span style={{ fontSize: 11 }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 8, marginBottom: 4 }}>🌦 CLIMA</div>
      <div className="grid grid-cols-5 gap-1">
        {weathers.map((w) => (
          <button key={String(w.id)} onClick={() => onWeather(w.id)} style={cellStyle(weather === w.id)}>
            <span style={{ fontSize: 11 }}>{w.icon}</span>
            <span>{w.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============== MAP PICKER ==============
function MapPicker({ currentMap, onPick, onClose }: {
  currentMap: MapId; onPick: (m: MapId) => void; onClose: () => void;
}) {
  const slice = MAP_IDS;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3" style={{ background: "rgba(4,6,18,0.82)", backdropFilter: "blur(8px)" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "linear-gradient(160deg, #1a1230 0%, #0c0820 60%, #1a0e2e 100%)",
        border: "1px solid rgba(168,120,255,0.45)",
        borderRadius: 16,
        padding: 14,
        width: "100%", maxWidth: 720, maxHeight: "90dvh",
        color: "#fff",
        display: "flex", flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(168,120,255,0.25)",
      }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>🗺️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, background: "linear-gradient(90deg,#c4a3ff,#ffd1ec)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RADAR DE MAPAS</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>Todos os mapas liberados • Viagem gratuita</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,80,120,0.85)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, cursor: "pointer" }}>✕</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5" style={{ overflowY: "auto", flex: 1, paddingRight: 2, paddingBottom: 8 }}>
          {slice.map((id) => {
            const m = MAPS[id] as { name: string; img: string; requiredLevel?: number; unlockPrice?: number };
            const active = id === currentMap;
            const isUnlocked = true; // Todos os mapas liberados sem nível
            return (
              <button key={id}
                onClick={() => {
                  if (active) return;
                  onPick(id);
                }}
                disabled={active}
                title={m.name}
                style={{
                  background: active ? "linear-gradient(180deg, rgba(168,120,255,0.35), rgba(168,120,255,0.1))" : "rgba(255,255,255,0.04)",
                  border: active ? "1px solid rgba(255,209,236,0.8)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: 6,
                  cursor: active ? "default" : "pointer",
                  display: "flex", flexDirection: "column", gap: 4, position: "relative",
                  transition: "transform .15s ease, border-color .15s ease",
                  boxShadow: active ? "0 0 18px rgba(168,120,255,0.5)" : undefined,
                }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 6, overflow: "hidden" }}>
                  <img src={m.img} alt={m.name} className="pixelated"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
                  {active && (
                    <div style={{ position: "absolute", top: 4, right: 4, background: "#ffd1ec", color: "#1a0e2e", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4 }}>VOCÊ</div>
                  )}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.3, textAlign: "center", lineHeight: 1.2 }}>
                  {m.name}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-center" style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {MAP_IDS.length} mapas • role para ver todos ↕
        </div>
      </div>
    </div>
  );
}

// ============== RADAR ==============
function Radar({ mapId, pos, curMap, onTeleport, npcs, quests, specialNpcs }: {
  mapId: MapId; pos: { x: number; y: number };
  curMap: typeof MAPS[MapId]; onTeleport: () => void;
  npcs: { x: number; y: number }[];
  quests: { x: number; y: number }[];
  specialNpcs?: { x: number; y: number }[];
}) {
  const W = 78, H = 58;
  const px = (pos.x / curMap.w) * W;
  const py = (pos.y / curMap.h) * H;
  return (
    <button onClick={onTeleport} title="Abrir mapas"
      className="gb-font"
      style={{
        position: "absolute", top: 36, right: 6, zIndex: 70,
        width: W, height: H + 22, padding: 0,
        background: "rgba(8,16,28,0.55)", border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 4, cursor: "pointer", backdropFilter: "blur(2px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}>
      <div style={{ position: "relative", width: W, height: H, overflow: "hidden", borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
        <img src={curMap.img} alt="" className="pixelated"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.65 }} draggable={false} />
        {/* NPCs de batalha */}
        {npcs.map((n, i) => (
          <div key={`n${i}`} style={{
            position: "absolute",
            left: (n.x / curMap.w) * W - 2,
            top: (n.y / curMap.h) * H - 2,
            width: 4, height: 4, borderRadius: "50%",
            background: "#fbbf24", boxShadow: "0 0 3px #fbbf24",
          }} />
        ))}
        {/* NPCs de quest */}
        {quests.map((q, i) => (
          <div key={`q${i}`} style={{
            position: "absolute",
            left: (q.x / curMap.w) * W - 2,
            top: (q.y / curMap.h) * H - 2,
            width: 4, height: 4, borderRadius: "50%",
            background: "#22c55e", boxShadow: "0 0 3px #22c55e",
          }} />
        ))}
        {/* NPCs especiais (ex: Jardinheiro) */}
        {specialNpcs?.map((sn, i) => (
          <div key={`sn${i}`} style={{
            position: "absolute",
            left: (sn.x / curMap.w) * W - 2,
            top: (sn.y / curMap.h) * H - 2,
            width: 5, height: 5, borderRadius: "50%",
            background: "#a855f7", boxShadow: "0 0 4px #a855f7",
            zIndex: 10,
            border: "1px solid #fff",
          }} />
        ))}
        {/* Portais de teleporte */}
        {(curMap as { portals?: { x: number; y: number; w: number; h: number }[] }).portals?.map((p, i) => (
          <div key={`p${i}`} title="Portal" style={{
            position: "absolute",
            left: ((p.x + p.w / 2) / curMap.w) * W - 2.5,
            top: ((p.y + p.h / 2) / curMap.h) * H - 2.5,
            width: 5, height: 5, borderRadius: "50%",
            background: "#3b82f6", boxShadow: "0 0 5px #60a5fa",
            border: "1px solid #fff", zIndex: 9,
          }} />
        ))}
        {/* player */}
        <div style={{
          position: "absolute", left: px - 3, top: py - 3,
          width: 6, height: 6, borderRadius: "50%",
          background: "#ff4757", border: "1px solid #fff",
          boxShadow: "0 0 6px rgba(255,71,87,0.9)",
          animation: "radarPulse 1.2s ease-out infinite",
        }} />
        <style>{`@keyframes radarPulse { 0%{box-shadow:0 0 0 0 rgba(255,71,87,0.6);} 100%{box-shadow:0 0 0 6px rgba(255,71,87,0);} }`}</style>
      </div>
      <div style={{ fontSize: 6, color: "#fff", textAlign: "center", lineHeight: "12px", letterSpacing: 0.5 }}>
        {mapId.toUpperCase()}
      </div>
      <div style={{ fontSize: 6, color: "#9ff", textAlign: "center", lineHeight: "10px", letterSpacing: 0.3 }}>
        x:{Math.round(pos.x)} y:{Math.round(pos.y)}
      </div>
    </button>
  );
}


// ============== PvP / Challenge ==============
function ChallengeOverlay({ target, fighter, team, guild, onClose, onSend, onInvite }: {
  target: RemotePlayer; fighter: PetInstance | undefined; team: PetInstance[];
  guild: Guild | null;
  onClose: () => void; onSend: (p: RemotePlayer, stake: boolean) => void;
  onInvite: (p: RemotePlayer) => void;
}) {
  const [stake, setStake] = useState(false);
  const alreadyMember = guild?.members.some((m) => m.id === target.id);
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,20,8,0.96)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
      <div className="w-[88%] p-3 text-[8px] gb-font" style={{ background: "var(--gb-screen)", border: "3px solid var(--gb-darkest)", borderRadius: 8, color: "var(--gb-darkest)", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
        <div className="text-center mb-2">— {target.name} —</div>
        <div className="mb-2">Voce vs {target.name} (Lv{target.level ?? 1})</div>
        {fighter ? (
          <div className="mb-2">Seu lutador: {fighter.species.toUpperCase()} Lv{fighter.level}</div>
        ) : (
          <div className="mb-2" style={{ color: "#a3243b" }}>Sem pet apto para batalhar.</div>
        )}
        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={stake} onChange={(e) => setStake(e.target.checked)} disabled={team.length <= 1} />
          <span>Apostar pet (vencedor leva o pet do perdedor)</span>
        </label>
        {guild && (
          <button onClick={() => onInvite(target)} disabled={alreadyMember} className="gb-font w-full mb-2 py-2"
            style={{ background: alreadyMember ? "#9ca3af" : "linear-gradient(180deg,#d946ef,#a21caf)", color: "#fff", border: "2px solid var(--gb-darkest)", fontSize: 8, opacity: alreadyMember ? 0.5 : 1 }}>
            🛡️ {alreadyMember ? "JÁ É MEMBRO DA GUILDA" : `CONVIDAR PARA ${guild.name.toUpperCase()}`}
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="gb-font flex-1 py-2" style={{ background: "var(--gb-lightest)", border: "2px solid var(--gb-darkest)", fontSize: 8 }}>FECHAR</button>
          <button onClick={() => onSend(target, stake)} disabled={!fighter} className="gb-font flex-1 py-2" style={{ background: "var(--gb-darkest)", color: "var(--gb-lightest)", border: "none", fontSize: 8, opacity: fighter ? 1 : 0.4 }}>DESAFIAR</button>
        </div>
      </div>
    </div>
  );
}

function PlayersOverlay({ players, onClose, onChallenge }: {
  players: RemotePlayer[]; onClose: () => void; onChallenge: (p: RemotePlayer) => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,20,8,0.96)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
      <div className="w-[90%] max-h-[88%] flex flex-col gb-font text-[8px]" style={{ background: "var(--gb-screen)", border: "3px solid var(--gb-darkest)", borderRadius: 8, color: "var(--gb-darkest)", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between border-b-2 px-2 py-1" style={{ borderColor: "var(--gb-darkest)" }}>
          <span>— JOGADORES AQUI —</span>
          <button onClick={onClose} className="gb-font" style={{ background: "var(--gb-darkest)", color: "var(--gb-lightest)", border: "none", padding: "2px 6px", fontSize: 8 }}>X</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {players.length === 0 && <div className="text-center py-4" style={{ opacity: 0.6 }}>Ninguem por perto…</div>}
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-2 border p-1 mb-1" style={{ borderColor: "var(--gb-darkest)" }}>
              <div className="flex-1">
                <div>{p.name} Lv{p.level ?? 1}</div>
                <div style={{ fontSize: 7, opacity: 0.65 }}>{p.leader_species ? p.leader_species.toUpperCase() : "Sem lider"}</div>
              </div>
              <button onClick={() => onChallenge(p)} className="gb-font" style={{ background: "var(--gb-darkest)", color: "var(--gb-lightest)", border: "none", padding: "3px 6px", fontSize: 7 }}>DESAFIAR</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PvpBattleOverlay({ battle, meId, fighter, onFinish }: {
  battle: DbChallenge; meId: string; fighter: PetInstance;
  onFinish: (winnerId: string) => void;
}) {
  const myPet = battle.challenger_id === meId ? battle.challenger_pet : (battle.opponent_pet ?? fighter);
  const enemyPet = battle.challenger_id === meId ? (battle.opponent_pet ?? fighter) : battle.challenger_pet;
  const enemyName = battle.challenger_id === meId ? battle.opponent_name : battle.challenger_name;
  const [myHp, setMyHp] = useState(myPet.maxHp);
  const [enHp, setEnHp] = useState(enemyPet.maxHp);
  const [log, setLog] = useState("Batalha iniciada!");
  const finishedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (finishedRef.current) return;
      // Eu ataco
      const myAtk = calcStat(myPet, "atk");
      const enDef = calcStat(enemyPet, "def");
      const dmgE = Math.max(1, Math.floor(((2 * myPet.level / 5 + 2) * 50 * (myAtk / Math.max(1, enDef))) / 50 * (0.8 + Math.random() * 0.4)));
      setEnHp((v) => {
        const nv = Math.max(0, v - dmgE);
        if (nv <= 0 && !finishedRef.current) { finishedRef.current = true; setLog("Voce venceu!"); setTimeout(() => onFinish(meId), 700); }
        return nv;
      });
      setLog(`Voce causou ${dmgE}`);

      setTimeout(() => {
        if (finishedRef.current) return;
        const eAtk = calcStat(enemyPet, "atk");
        const myDef = calcStat(myPet, "def");
        const dmgM = Math.max(1, Math.floor(((2 * enemyPet.level / 5 + 2) * 50 * (eAtk / Math.max(1, myDef))) / 50 * (0.8 + Math.random() * 0.4)));
        setMyHp((v) => {
          const nv = Math.max(0, v - dmgM);
          if (nv <= 0 && !finishedRef.current) {
            finishedRef.current = true;
            const enemyId = battle.challenger_id === meId ? battle.opponent_id : battle.challenger_id;
            setLog("Voce perdeu!"); setTimeout(() => onFinish(enemyId), 700);
          }
          return nv;
        });
        setLog((l) => l + ` · ${enemyName} causou ${dmgM}`);
      }, 600);
    }, 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col p-2 gb-font text-[8px]" style={{ background: "linear-gradient(180deg, #2a0a0a 0%, #140505 100%)", color: "#fff", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
      <div className="text-center mb-1">⚔ PvP {battle.stake_pet ? "(APOSTA DE PET)" : ""}</div>
      <div className="flex justify-between mb-2">
        <div>
          <div>{enemyPet.species.toUpperCase()} Lv{enemyPet.level}</div>
          <div>{enemyName}</div>
          <HpBar hp={(enHp / enemyPet.maxHp) * 100} />
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <img src={SPECIES_GIF[enemyPet.species]} alt="" className="pixelated" width={80} height={80} style={{ position: "absolute", top: 0, right: 10 }} />
        <img src={SPECIES_GIF[myPet.species]} alt="" className="pixelated" width={80} height={80} style={{ position: "absolute", bottom: 0, left: 10, transform: "scaleX(-1)" }} />
      </div>
      <div className="flex justify-end mb-2">
        <div style={{ textAlign: "right" }}>
          <div>{myPet.species.toUpperCase()} Lv{myPet.level} (voce)</div>
          <HpBar hp={(myHp / myPet.maxHp) * 100} />
        </div>
      </div>
      <div className="border p-1" style={{ borderColor: "#fff" }}>{log}</div>
    </div>
  );
}

function HpBar({ hp }: { hp: number }) {
  const fill = hp > 50
    ? "linear-gradient(90deg, #34d399, #22c55e)"
    : hp > 20
      ? "linear-gradient(90deg, #fde047, #f59e0b)"
      : "linear-gradient(90deg, #f87171, #dc2626)";
  return (
    <div style={{ marginTop: 2, height: 7, width: 140, background: "rgba(0,0,0,0.65)",
      borderRadius: 6, border: "1px solid rgba(224,248,208,0.6)", overflow: "hidden",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.55)" }}>
      <div className={hp <= 20 ? "hp-low" : ""}
        style={{ height: "100%", width: `${Math.max(0, hp)}%`, background: fill,
          borderRadius: 6, transition: "width 0.45s ease",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)" }} />
    </div>
  );
}

function EncounterOverlay({
  wildPet, leader, balls, potions, eventPokeballs = 0, throwingBall, shaking, slashKey, wildHit, myHit,
  wildCritKey, myCritKey, wildEmote, meEmote, captureBurstKey,
  onThrow, onFlee, onPotion, teamPets, onSwitchPet, switchCooldown,
  playerTurn, onSkill, autoAttack, onToggleAuto,
}: {
  wildPet: PetInstance; leader: PetInstance | undefined;
  balls: Record<BallId, number>; potions: number; eventPokeballs?: number;
  throwingBall: BallId | null; shaking: boolean; slashKey: number;
  wildHit: { key: number; dmg: number } | null;
  myHit: { key: number; dmg: number } | null;
  wildCritKey: number; myCritKey: number;
  wildEmote: { key: number; emoji: string } | null;
  meEmote: { key: number; emoji: string } | null;
  captureBurstKey: number;
  onThrow: (b: BallId) => void; onFlee: () => void; onPotion: () => void;
  teamPets: PetInstance[]; onSwitchPet: (uid: string) => void;
  switchCooldown: number;
  playerTurn: boolean;
  onSkill: (s: "tackle" | "heavy" | "special" | "guard", moveName?: string) => void;
  autoAttack: boolean;
  onToggleAuto: () => void;
}) {
  const leaderGif = leader ? SPECIES_GIF[leader.species] : "";
  const isMobile = useIsMobile();
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const wildSpa = calcStat(wildPet, "spa");
  const wildSpd = calcStat(wildPet, "spd");
  const meSpa = leader ? calcStat(leader, "spa") : 0;
  const meSpd = leader ? calcStat(leader, "spd") : 0;

  const ballOrder: BallId[] = ["pokeball", "greatball", "ultraball", "safariball", "fastball", "masterball"];
  const ballCount = (b: BallId) => (b === "pokeball" ? balls.pokeball + eventPokeballs : balls[b]);

  const useRarityBg = useMemo(() => Math.random() < 0.6, []);
  const rarityColor = RARITY_COLOR[wildPet.rarity];
  const bgStyle = useRarityBg ? {
    backgroundColor: "#000",
    backgroundImage: `linear-gradient(180deg, ${rarityColor}55 0%, #000 100%)`,
    borderColor: `${rarityColor}66`
  } : {};

  return (
    <div className={`battle-bg absolute inset-0 flex flex-col items-stretch gb-font overflow-hidden ${useRarityBg ? 'battle-stars' : ''}`} 
      style={{ color: "var(--gb-lightest)", ...bgStyle }}>

      <div className="battle-head-row">
        <div className="battle-hud-card battle-hud-enemy">
          <div className="battle-hud-row">
            <span className="battle-hud-name">{SPECIES_NAME[wildPet.species]}</span>
            <span className="battle-hud-lvl">Lv {wildPet.level}</span>
          </div>
          <div className="battle-hud-rarity" style={{ color: RARITY_COLOR[wildPet.rarity] }}>★ {RARITY_NAME[wildPet.rarity]}</div>
          <div className="battle-hud-hp-line">
            <span className="battle-hud-hp-label">HP</span>
            <HpBar hp={(wildPet.hp / wildPet.maxHp) * 100} />
          </div>
          <div className="battle-hud-stats">
            <span>Sp.ATK {wildSpa}</span><span>Sp.DEF {wildSpd}</span>
          </div>
        </div>
      </div>

      <div className="battle-arena">
        <div className={shaking ? "shake battle-wild-wrap" : "battle-wild-wrap"}>
          <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: RARITY_COLOR[wildPet.rarity], filter: "blur(20px)", opacity: 0.55 }} />
          <img key={`wild-${wildHit?.key ?? 0}`} src={SPECIES_GIF[wildPet.species]} alt="wild"
            className={wildHit ? "pixelated hit-flash battle-wild-sprite" : "pixelated battle-wild-sprite"} width={118} height={118}
            style={{ position: "relative", transform: `scale(${SPECIES_SCALE[wildPet.species] ?? 1})`, transformOrigin: "center bottom" }} />
          {wildEmote && (
            <div key={`we-${wildEmote.key}`} className="battle-emote">{wildEmote.emoji}</div>
          )}
          <div key={slashKey} className="slash-hit absolute"
            style={{ left: "50%", top: "50%", width: 80, height: 80, background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent 60%)", pointerEvents: "none" }} />
          {wildHit && (
            <div key={`wdmg-${wildHit.key}`} className="dmg-float name-font"
              style={{ position: "absolute", left: "50%", top: -4, color: "#fff200",
                textShadow: "0 0 6px #ff3a00, 0 0 12px #ff3a00, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                fontSize: 34, fontWeight: 900, letterSpacing: 1 }}>
              -{wildHit.dmg}
            </div>
          )}
          {wildCritKey > 0 && (
            <div key={`wc-${wildCritKey}`} className="crit-label">CRITICO!</div>
          )}
          {captureBurstKey > 0 && (
            <div key={`cb-${captureBurstKey}`} className="capture-burst" />
          )}
        </div>
        {leader && (
          <div className="battle-player-sprite-wrap">
            <img key={`me-${myHit?.key ?? 0}`} src={leaderGif} alt={leader.species}
              className={myHit ? "pixelated hit-flash battle-player-sprite" : "pixelated battle-player-sprite"}
              style={{ display: "block", transform: `scaleX(-1) scale(${SPECIES_SCALE[leader.species] ?? 1})`, transformOrigin: "center bottom", filter: `drop-shadow(0 0 8px ${RARITY_COLOR[leader.rarity]}aa)` }} />
            {meEmote && (
              <div key={`mee-${meEmote.key}`} className="battle-emote" style={{ top: -22, fontSize: 18 }}>{meEmote.emoji}</div>
            )}
            {myHit && (
              <div key={`mdmg-${myHit.key}`} className="dmg-float name-font"
                style={{ position: "absolute", left: "50%", top: -8, color: "#fff",
                  textShadow: "0 0 6px #ff003c, 0 0 12px #ff003c, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                  fontSize: 28, fontWeight: 900, letterSpacing: 1 }}>
                -{myHit.dmg}
              </div>
            )}
            {myCritKey > 0 && (
              <div key={`mc-${myCritKey}`} className="crit-label" style={{ fontSize: 11, top: -16 }}>CRITICO!</div>
            )}
          </div>
        )}
        {throwingBall && (
          <div className="pokeball-throw absolute"
            style={{ left: "50%", top: "50%", width: 28, height: 28, marginLeft: -14, marginTop: -14 }}>
            <img src={BALL_ICON[throwingBall]} alt={throwingBall} width={28} height={28}
              className="pixelated" style={{ display: "block", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }} />
          </div>
        )}
        {leader && (
          <div className="battle-hud-card battle-hud-player">
            <div className="battle-hud-row">
              <span className="battle-hud-name">{SPECIES_NAME[leader.species]}</span>
              <span className="battle-hud-lvl">Lv {leader.level}</span>
            </div>
            <div className="battle-hud-hp-line">
              <span className="battle-hud-hp-label">HP</span>
              <HpBar hp={(leader.hp / leader.maxHp) * 100} />
            </div>
            <div className="battle-hud-stats">
              <span>Sp.ATK {meSpa}</span><span>Sp.DEF {meSpd}</span>
            </div>
          </div>
        )}
      </div>



      <div className="battle-command-panel" style={{ borderColor: playerTurn ? "#fde047" : "#475569" }}>
        <div className="battle-command-header">
          <span>⚔ AÇÕES</span>
          <span className="battle-turn-pill" style={{ color: playerTurn ? "#fde047" : "#94a3b8", borderColor: playerTurn ? "rgba(253,224,71,0.45)" : "rgba(148,163,184,0.25)" }}>
            {playerTurn ? (autoAttack ? "AUTO" : "TURNO") : "RIVAL"}
          </span>
          <button
            onClick={onToggleAuto}
            className={`battle-auto-chip gb-font ${autoAttack ? "is-on" : ""}`}
          >
            AUTO {autoAttack ? "ON" : "OFF"}
          </button>
        </div>

        <div className="battle-skills-grid">
          {(() => {
            if (!leader) return null;
            const dex = getDex(leader.species);
            const idxs = resolveActionMoves(leader.actionMoves, leader.level);
            const slots = idxs.slice(0, 4);
            // preenche slots vazios para manter 4 colunas
            const padded: (number | null)[] = [...slots];
            while (padded.length < 4) padded.push(null);
            return padded.map((i, k) => {
              if (i === null) {
                return (
                  <button key={`empty-${k}`} disabled className="ball-btn battle-skill-btn gb-font" style={{ opacity: 0.25 }}>
                    <span className="battle-skill-icon">·</span>
                    <span className="battle-skill-name">—</span>
                  </button>
                );
              }
              const mv = dex.moves[i];
              const sid = moveToSkillId(mv);
              return (
                <button
                  key={`mv-${i}`}
                  onClick={() => onSkill(sid, mv.name)}
                  disabled={!playerTurn || !!throwingBall || !leader}
                  className="ball-btn battle-skill-btn gb-font"
                  style={{
                    opacity: playerTurn ? 1 : 0.5,
                    animation: playerTurn ? "skill-pulse 1.4s ease-in-out infinite" : "none",
                  }}
                  title={`${mv.name} · ${mv.power} · ${mv.desc}`}
                >
                  <span className="battle-skill-icon">{mv.icon}</span>
                  <span className="battle-skill-name">{mv.name.toUpperCase()}</span>
                </button>
              );
            });
          })()}
        </div>
        <div className="battle-items-row">
          <BallActionBar
            ballOrder={ballOrder}
            ballCount={ballCount}
            onThrow={onThrow}
            onPotion={onPotion}
            onFlee={onFlee}
            potions={potions}
            eventPokeballs={eventPokeballs}
            leader={leader}
            throwingBall={throwingBall}
          />
        </div>
        {teamPets.length > 0 && (
          <div className="battle-team-row">
            <div className="battle-team-label"><BallImg id="pokeball" size={10} /> TIME</div>
            {switchCooldown > 0 && (
              <div className="battle-switch-cooldown">
                TROCA EM {switchCooldown}s
              </div>
            )}
            {isMobile ? (
              <button
                onClick={() => setTeamPickerOpen(true)}
                disabled={!!throwingBall || switchCooldown > 0}
                className="ball-btn gb-font battle-team-mobile-btn"
              >
                <BallImg id="pokeball" size={20} />
                <span>TROCAR POKÉMON ({teamPets.length})</span>
              </button>
            ) : (
              <div className="battle-team-grid">
                {teamPets.map((p) => {
                  const isActive = leader?.uid === p.uid;
                  const fainted = isFainted(p);
                  const rcol = RARITY_COLOR[p.rarity];
                  return (
                    <button
                      key={p.uid}
                      onClick={() => onSwitchPet(p.uid)}
                      disabled={isActive || fainted || !!throwingBall}
                      title={`${SPECIES_NAME[p.species]} Lv.${p.level}`}
                      className={`battle-team-btn gb-font ${isActive ? "is-active" : ""}`}
                      style={{
                        borderColor: isActive ? "#fde047" : rcol,
                        opacity: fainted ? 0.45 : 1,
                        boxShadow: isActive
                          ? `0 0 10px ${rcol}cc, inset 0 0 0 1px rgba(253,224,71,0.5)`
                          : `0 0 6px ${rcol}55`,
                      }}
                    >
                      {isActive && <span className="battle-team-star">★</span>}
                      <img
                        src={SPECIES_GIF[p.species]}
                        alt={p.species}
                        className="pixelated battle-team-sprite"
                        style={{ filter: fainted ? "grayscale(1)" : `drop-shadow(0 0 3px ${rcol})` }}
                      />
                      <span className="battle-team-lv">{p.level}</span>
                      <span className="battle-team-hp"><span style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%`, background: p.hp / p.maxHp > 0.5 ? "linear-gradient(90deg,#4ade80,#16a34a)" : p.hp / p.maxHp > 0.2 ? "linear-gradient(90deg,#fde047,#f59e0b)" : "linear-gradient(90deg,#ef4444,#991b1b)" }} /></span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {isMobile && teamPickerOpen && (
        <div className="battle-team-picker-backdrop" onClick={() => setTeamPickerOpen(false)}>
          <div className="battle-team-picker" onClick={(e) => e.stopPropagation()}>
            <div className="battle-team-picker-head">
              <span><BallImg id="pokeball" size={12} /> TROCAR POKÉMON</span>
              <button className="battle-team-picker-close" onClick={() => setTeamPickerOpen(false)}>✕</button>
            </div>
            <div className="battle-team-picker-grid">
              {teamPets.map((p) => {
                const isActive = leader?.uid === p.uid;
                const fainted = isFainted(p);
                const rcol = RARITY_COLOR[p.rarity];
                const disabled = isActive || fainted || !!throwingBall || switchCooldown > 0;
                return (
                  <button
                    key={p.uid}
                    onClick={() => { if (!disabled) { onSwitchPet(p.uid); setTeamPickerOpen(false); } }}
                    disabled={disabled}
                    className={`battle-team-picker-card gb-font ${isActive ? "is-active" : ""}`}
                    style={{ borderColor: isActive ? "#fde047" : rcol, opacity: fainted ? 0.5 : 1 }}
                  >
                    <img
                      src={SPECIES_GIF[p.species]}
                      alt={p.species}
                      className="pixelated"
                      style={{ width: 56, height: 56, objectFit: "contain", filter: fainted ? "grayscale(1)" : `drop-shadow(0 0 3px ${rcol})` }}
                    />
                    <div className="battle-team-picker-info">
                      <div className="battle-team-picker-name">{SPECIES_NAME[p.species]}</div>
                      <div className="battle-team-picker-meta">Lv {p.level} · {RARITY_NAME[p.rarity]}</div>
                      <div className="battle-team-picker-hp">
                        <span style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%`, background: p.hp / p.maxHp > 0.5 ? "linear-gradient(90deg,#4ade80,#16a34a)" : p.hp / p.maxHp > 0.2 ? "linear-gradient(90deg,#fde047,#f59e0b)" : "linear-gradient(90deg,#ef4444,#991b1b)" }} />
                      </div>
                      <div className="battle-team-picker-hp-num">{p.hp}/{p.maxHp} HP {isActive ? "· EM CAMPO" : fainted ? "· DESMAIADO" : ""}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function BallActionBar({
  ballOrder, ballCount, onThrow, onPotion, onFlee, potions, eventPokeballs, leader, throwingBall,
}: {
  ballOrder: BallId[];
  ballCount: (b: BallId) => number;
  onThrow: (b: BallId) => void;
  onPotion: () => void;
  onFlee: () => void;
  potions: number;
  eventPokeballs: number;
  leader: PetInstance | undefined;
  throwingBall: BallId | null;
}) {
  // Bola pre-selecionada: a primeira disponivel na ordem
  const firstAvailable = useMemo(
    () => ballOrder.find((b) => ballCount(b) > 0) ?? "pokeball",
    [ballOrder, ballCount],
  );
  const [selected, setSelected] = useState<BallId>(firstAvailable);
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (ballCount(selected) <= 0) setSelected(firstAvailable);
  }, [firstAvailable, selected, ballCount]);

  const selectedCount = ballCount(selected);
  const isEventPB = selected === "pokeball" && eventPokeballs > 0;

  return (
    <div style={{ position: "relative" }}>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-1">
        {/* Botao bola principal: clique = joga, clique no ▾ = abre seletor */}
        <div style={{ position: "relative", display: "flex", gap: 2 }}>
          <button
            onClick={() => onThrow(selected)}
            disabled={!!throwingBall || selectedCount <= 0}
            className="ball-btn gb-font"
            style={{ flex: 1, padding: "2px 4px", minHeight: 0, flexDirection: "row", gap: 4, justifyContent: "center" }}
            title={`Jogar ${selected}`}
          >
            <BallImg id={selected} size={18} />
            <span style={{ fontSize: 9, color: "#fff8d6", textShadow: "0 1px 0 #000", lineHeight: 1 }}>
              ×{selectedCount}{isEventPB ? "🎁" : ""}
            </span>
          </button>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="ball-btn gb-font"
            style={{ padding: "0 4px", minHeight: 0, fontSize: 10 }}
            title="Escolher bola"
          >▾</button>
          {pickerOpen && (
            <div
              style={{
                position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0,
                background: "#0f172a", border: "2px solid #fde047", borderRadius: 4,
                padding: 4, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                gap: 4, zIndex: 30, boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              }}
            >
              {ballOrder.map((b) => {
                const count = ballCount(b);
                const dis = count <= 0;
                return (
                  <button
                    key={b}
                    onClick={() => { setSelected(b); setPickerOpen(false); }}
                    disabled={dis}
                    className="ball-btn gb-font"
                    style={{
                      padding: "3px 0", minHeight: 0, gap: 2,
                      opacity: dis ? 0.35 : 1,
                      border: b === selected ? "2px solid #fde047" : undefined,
                    }}
                  >
                    <BallImg id={b} size={16} />
                    <span style={{ fontSize: 8, color: "#fff8d6", textShadow: "0 1px 0 #000", lineHeight: 1 }}>×{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button onClick={onPotion} disabled={!!throwingBall || potions <= 0 || !leader} className="ball-btn potion gb-font" style={{ padding: "2px 0", minHeight: 0, flexDirection: "row", gap: 3, justifyContent: "center" }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>🧪</span>
          <span style={{ fontSize: 9, lineHeight: 1 }}>×{potions}</span>
        </button>
        <button onClick={onFlee} disabled={!!throwingBall} className="ball-btn flee gb-font" style={{ padding: "2px 0", minHeight: 0, fontSize: 9 }}>
          FUGIR
        </button>
      </div>
    </div>
  );
}


function AutoHuntConfigOverlay({ settings, onClose, onSave, balls }: { settings: any, onClose: () => void, onSave: (s: any) => void, balls: Record<BallId, number> }) {
  const [s, setS] = useState(settings);
  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#f8f8f8] border-4 border-[#333] rounded-lg p-4 shadow-2xl gb-font">
        <h3 className="text-sm font-bold mb-4 text-center">CONFIGURAR AUTO HUNT</h3>
        
        <div className="space-y-4 text-[10px]">
          <div>
            <label className="block mb-1">POKÉBOLA PRIORITÁRIA:</label>
            <select 
              value={s.priorityBall} 
              onChange={e => setS({...s, priorityBall: e.target.value})}
              className="w-full p-2 border-2 border-[#333] rounded bg-white text-black"
            >
              <option value="pokeball">Poké Ball ({balls.pokeball})</option>
              <option value="greatball">Great Ball ({balls.greatball})</option>
              <option value="ultraball">Ultra Ball ({balls.ultraball})</option>
              <option value="masterball">Master Ball ({balls.masterball})</option>
            </select>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
               <label className="block mb-1">LV MÍN:</label>
               <input type="number" value={s.minLevel} onChange={e => setS({...s, minLevel: +e.target.value})} className="w-full p-2 border-2 border-[#333] rounded bg-white text-black" />
             </div>
             <div className="flex-1">
               <label className="block mb-1">LV MÁX:</label>
               <input type="number" value={s.maxLevel} onChange={e => setS({...s, maxLevel: +e.target.value})} className="w-full p-2 border-2 border-[#333] rounded bg-white text-black" />
             </div>
          </div>

          <div className="flex items-center gap-2 text-black">
            <input type="checkbox" checked={s.autoItems} onChange={e => setS({...s, autoItems: e.target.checked})} id="autoItems" />
            <label htmlFor="autoItems">USO AUTOMÁTICO DE POÇÕES/REVIVES</label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-400 text-white py-2 rounded font-bold">CANCELAR</button>
          <button onClick={() => onSave(s)} className="flex-1 bg-green-600 text-white py-2 rounded font-bold">SALVAR</button>
        </div>
      </div>
    </div>
  );
}

function AscensionOverlay({ team, ascensions, inventory, gold, crystal, capturePoints, onClose, onAscend }: { team: PetInstance[], ascensions: Record<string, number>, inventory: Record<string, number>, gold: number, crystal: number, capturePoints: number, onClose: () => void, onAscend: (uid: string, costs: any, isReroll?: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(team[0]?.uid || null);
  const [opened, setOpened] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);

  const p = team.find(pt => pt.uid === selected);
  const level = selected ? (ascensions[selected] || 0) : 0;
  const isAscReady = !!(p && p.level >= 100);

  const costs = { candy: 20, stardust: 100 };
  const rerollCosts = { candy: 5, stardust: 25 };

  const canAfford = isAscReady && capturePoints >= costs.stardust && (inventory.rare_candy || 0) >= costs.candy;
  const canAffordReroll = !!(p && level > 0 && (inventory.rare_candy || 0) >= rerollCosts.candy && capturePoints >= rerollCosts.stardust);
  void gold; void crystal;

  const A = {
    ember: "#f59e0b", emberDark: "#d97706", emberDarker: "#7c2d12", emberDeep: "#451a03",
    cream: "#f7e4b8", creamLight: "#fef3c7", creamShade: "#e0c98a",
    ink: "#2a1604", gold: "#facc15", green: "#65c14a", red: "#b8362a",
  };
  const panel: CSSProperties = {
    background: `linear-gradient(180deg, ${A.creamLight} 0%, ${A.cream} 100%)`,
    border: `2px solid ${A.emberDarker}`,
    boxShadow: `inset 0 0 0 1px ${A.creamShade}, 0 2px 0 rgba(0,0,0,0.18)`,
    borderRadius: 10, color: A.ink,
  };
  const sectionTitle = (txt: string) => (
    <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
      color: A.emberDarker, padding: "4px 0", borderBottom: `1px dashed ${A.emberDark}55`,
      marginBottom: 6 }}>{txt}</div>
  );
  const need = (label: string, have: number, n: number, icon: React.ReactNode) => {
    const ok = have >= n;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", alignItems: "center", gap: 4, color: A.ink }}>
        <span style={{ fontSize: 13, display: "grid", placeItems: "center" }}>{icon}</span>
        <span style={{ fontSize: 8.5, fontWeight: 800 }}>{label}</span>
        <span style={{ minWidth: 50, textAlign: "center", padding: "2px 5px", fontSize: 8, fontWeight: 900,
          color: ok ? "#3d6b27" : A.emberDeep,
          background: ok ? "#dcfce7" : "#fde6c8",
          border: `1px solid ${ok ? A.green : A.emberDark}`, borderRadius: 4 }}>{have}/{n}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{ background: "rgba(40,15,5,0.55)", transition: "opacity 220ms", opacity: opened ? 1 : 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gb-font flex flex-col" style={{
        width: "min(720px, calc(100vw - 16px))", height: "min(430px, calc(100vh - 18px))", maxHeight: "94vh",
        background: `linear-gradient(180deg, ${A.ember} 0%, ${A.emberDark} 100%)`,
        border: `3px solid ${A.emberDarker}`, borderRadius: 14,
        boxShadow: `inset 0 0 0 2px ${A.cream}55, 0 18px 50px rgba(0,0,0,0.65)`,
        padding: 6, gap: 6, color: "#fff", overflow: "hidden",
        transform: opened ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        transition: "transform 240ms cubic-bezier(.2,.9,.3,1.2)",
        fontSize: 9.5, fontFamily: '"Pixelify Sans", ui-monospace, monospace',
      }}>
        <div style={{ ...panel, display: "flex", alignItems: "center", gap: 10, padding: "7px 10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, fontSize: 26,
            background: `linear-gradient(180deg, ${A.gold}, ${A.ember})`,
            border: `2px solid ${A.emberDarker}`, display: "grid", placeItems: "center", flexShrink: 0 }}>👑</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: A.emberDarker, letterSpacing: 1, lineHeight: 1 }}>
              SISTEMA DE ASCENSÃO
            </div>
            <div style={{ fontSize: 9, color: A.ink, marginTop: 3, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Transcenda seus Pokémon · Atributos passivos permanentes
            </div>
          </div>
          <button onClick={onClose} style={{ background: A.emberDarker, color: A.cream,
            border: `2px solid ${A.ink}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontWeight: 900,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)" }}>X</button>
        </div>

        <div className="asc-body" style={{ display: "grid", gridTemplateColumns: "112px minmax(0,1fr) 168px", gap: 6, flex: 1, minHeight: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, overflow: "auto" }}>
            {team.map(pt => {
              const active = selected === pt.uid;
              const lv = ascensions[pt.uid] || 0;
              return (
                <button key={pt.uid} onClick={() => setSelected(pt.uid)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 6px",
                  background: active ? `linear-gradient(180deg, ${A.creamLight}, ${A.cream})` : `linear-gradient(180deg, ${A.ember}, ${A.emberDark})`,
                  color: active ? A.ink : "#fff8e7",
                  border: `2px solid ${A.emberDarker}`, borderRadius: 8, cursor: "pointer",
                  fontSize: 9, fontWeight: 900, letterSpacing: 0.3, textAlign: "left",
                  boxShadow: active ? `inset 0 0 0 1px ${A.gold}` : `inset 0 -2px 0 ${A.emberDarker}`,
                  textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
                  minHeight: 36,
                }}>
                  <img src={SPECIES_GIF[pt.species]} className="pixelated" style={{ width: 24, height: 24, objectFit: "contain", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {SPECIES_NAME[pt.species]}
                    <div style={{ fontSize: 7.5, opacity: 0.85, fontWeight: 700 }}>Nv {pt.level}{lv > 0 ? ` · +${lv}` : ""}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ ...panel, padding: 10, overflow: "auto", minWidth: 0 }}>
            {p ? (
              <>
                {sectionTitle("POKÉMON SELECIONADO")}
                <div style={{ display: "grid", placeItems: "center",
                  background: `linear-gradient(180deg, ${A.creamLight}, ${A.cream})`,
                  border: `2px solid ${A.emberDark}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                  <img src={SPECIES_GIF[p.species]} className="pixelated" style={{ width: 84, height: 84, objectFit: "contain", imageRendering: "pixelated" }} />
                  <div style={{ fontSize: 12, fontWeight: 900, color: A.emberDarker, marginTop: 6, letterSpacing: 1 }}>{SPECIES_NAME[p.species]}</div>
                  <div style={{ fontSize: 9, color: A.ink, marginTop: 2 }}>
                    Nível {p.level} · {level > 0 ? <span style={{ color: A.emberDarker, fontWeight: 900 }}>{"★".repeat(Math.min(level, 10))}{level > 10 ? ` x${level}` : ""}</span> : <span style={{ opacity: 0.6 }}>sem estrelas</span>}
                  </div>
                </div>

                {!isAscReady && (
                  <div style={{ background: "#fde6c8", border: `2px solid ${A.red}`, color: A.red,
                    borderRadius: 8, padding: 6, textAlign: "center", fontSize: 9, fontWeight: 900, marginBottom: 8 }}>
                    ⚠ REQUER NÍVEL 100 PARA ASCENDER (+1 ESTRELA)
                  </div>
                )}

                {p.ascensionStats && Object.keys(p.ascensionStats).length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${A.creamShade}`, borderRadius: 8, padding: 7 }}>
                    <div style={{ fontSize: 9, color: A.emberDarker, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>ATRIBUTOS PASSIVOS</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                      {Object.entries(p.ascensionStats).map(([k, v]) => (
                        <div key={k} style={{ background: "#fff8e7", border: `1px solid ${A.creamShade}`, borderRadius: 4, padding: "3px 4px", fontSize: 8, color: A.ink, textAlign: "center" }}>
                          <div style={{ fontWeight: 900, color: A.emberDarker, textTransform: "uppercase" }}>{k}</div>
                          <div style={{ color: "#3d6b27", fontWeight: 900 }}>+{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 8, fontSize: 9.5, lineHeight: 1.5, color: A.ink }}>
                  A <b style={{ color: A.emberDarker }}>Ascensão</b> concede atributos passivos aleatórios permanentes e expande o limite de poder do seu Pokémon.
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 20, color: A.ink }}>Selecione um Pokémon</div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "auto" }}>
            <div style={{ ...panel, padding: 7 }}>
              {sectionTitle(`CUSTO +${level + 1}`)}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {need("Star Dust", capturePoints, costs.stardust, <img src={imgStarDust} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />)}
                {need("Rare Candy", inventory.rare_candy || 0, costs.candy, <img src={imgRareCandy} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />)}
              </div>
              <button disabled={!canAfford} onClick={() => selected && onAscend(selected, costs)} style={{
                marginTop: 7, width: "100%", padding: "8px 5px",
                background: canAfford ? `linear-gradient(180deg, ${A.gold}, ${A.ember})` : `linear-gradient(180deg, ${A.creamShade}, #b39a64)`,
                color: A.ink, fontWeight: 900, letterSpacing: 0.6, fontSize: 9.5,
                border: `2px solid ${A.emberDarker}`, borderRadius: 6,
                boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                cursor: canAfford ? "pointer" : "not-allowed",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}>ASCENDER</button>
            </div>

            <div style={{ ...panel, padding: 7 }}>
              {sectionTitle("RE-ROLL")}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {need("Rare Candy", inventory.rare_candy || 0, rerollCosts.candy, <img src={imgRareCandy} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />)}
                {need("Star Dust", capturePoints, rerollCosts.stardust, <img src={imgStarDust} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />)}
              </div>
              <button disabled={!canAffordReroll} onClick={() => selected && onAscend(selected, rerollCosts, true)} style={{
                marginTop: 7, width: "100%", padding: "7px 5px",
                background: canAffordReroll ? `linear-gradient(180deg, #fde68a, ${A.ember})` : `linear-gradient(180deg, ${A.creamShade}, #b39a64)`,
                color: A.ink, fontWeight: 900, letterSpacing: 0.6, fontSize: 9,
                border: `2px solid ${A.emberDarker}`, borderRadius: 6,
                boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                cursor: canAffordReroll ? "pointer" : "not-allowed",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}>RE-ROLL PASSIVAS</button>
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{
          ...panel, margin: "0 auto", padding: "6px 22px",
          background: `linear-gradient(180deg, ${A.creamLight}, ${A.cream})`,
          color: A.emberDarker, fontWeight: 800, letterSpacing: 2, fontSize: 10,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        }}>◀ FECHAR</button>
      </div>

      <style>{`@media (max-width: 860px) { .asc-body { grid-template-columns: 1fr !important; overflow-y: auto; } }`}</style>
    </div>
  );
}

function ActionMenuBtn({ label, onClick, disabled, primary, icon }: { label: string; onClick: () => void; disabled?: boolean; primary?: boolean; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="gb-font px-2 py-2 text-[8px]"
      style={{
        background: primary ? "var(--gb-darkest)" : "var(--gb-lightest)",
        color: primary ? "var(--gb-lightest)" : "var(--gb-darkest)",
        border: "2px solid var(--gb-darkest)", borderRadius: 4, opacity: disabled ? 0.4 : 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}>{icon}{label}</button>
  );
}

function MenuOverlay({
  onClose, onBag, onShop, onMarket, onPlayers, onStatus, onDrive, onGuild, onRanked, onTrainerTree, onParty, onReset, onSave, onAvatar, onAscension, onAutoHunt, onCodex, onQuests, questCount, partyInviteCount = 0,
  hasGuild, hasParty, trainerName, trainerLevel, gold, crystal, capturePoints, mapName, caught, avatarIdx
}: {
  onClose: () => void; onBag: () => void; onShop: () => void; onMarket: () => void;
  onPlayers: () => void; onStatus: () => void; onDrive: () => void; onGuild: () => void; onRanked: () => void; onTrainerTree: () => void; onParty: () => void; onReset: () => void; onSave: () => void; onAvatar: () => void;
  onAscension: () => void; onAutoHunt: () => void; onCodex: () => void; onQuests: () => void; questCount: number; partyInviteCount?: number;
  hasGuild: boolean; hasParty: boolean; trainerName: string; trainerLevel: number; gold: number; crystal: number; capturePoints: number; mapName: string; caught: number;
  avatarIdx: number;
}) {
  const avatar = AVATAR_PRESETS[avatarIdx];
  const [musicState, setMusicState] = useState(() => getMusicState());
  const [mounted, setMounted] = useState(false);
  useEffect(() => subscribeMusic(setMusicState), []);
  useEffect(() => setMounted(true), []);
  const expPct = Math.min(100, ((trainerLevel * 7) % 50) * 2);

  const PixelSymbol = ({ kind }: { kind: "bars" | "crystal" | "book" | "swords" | "shield" | "cart" | "target" | "trophy" | "party" | "tree" }) => {
    if (kind === "bars") return <span className="menu-pixel-bars"><i /><i /><i /></span>;
    if (kind === "crystal") return <span className="menu-pixel-crystal">✦</span>;
    if (kind === "book") return <span className="menu-pixel-book">✧</span>;
    if (kind === "swords") return <span className="menu-pixel-swords">⚔</span>;
    if (kind === "shield") return <span className="menu-pixel-shield" />;
    if (kind === "cart") return <span className="menu-pixel-cart">🛒</span>;
    if (kind === "target") return <span className="menu-pixel-target" />;
    if (kind === "trophy") return <span className="menu-pixel-trophy">🏆</span>;
    if (kind === "tree") return <span className="menu-pixel-tree">🌳</span>;
    return <span className="menu-pixel-party">♟</span>;
  };

  const Tile = ({
    label, sub, onClick, art, tint: _tint, accent, badge, full,
  }: {
    label: string; sub: string; onClick: () => void; art: string;
    tint: string; accent: string; badge?: React.ReactNode; full?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`menu-tile group relative overflow-hidden text-left ${full ? "col-span-3" : ""}`}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06)), radial-gradient(120% 90% at 110% 50%, ${accent}55 0%, transparent 60%)`,
        backdropFilter: "blur(10px)",
        border: `1.5px solid ${accent}66`,
        borderRadius: 14,
        minHeight: full ? 72 : 92,
        padding: full ? "8px 14px" : "8px 10px",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.35), 0 6px 18px -10px rgba(2,6,23,.55), 0 0 22px -14px ${accent}`,
      }}
    >
      <span className="menu-tile-shine" />
      {/* large watermark art behind text */}
      <img
        src={art}
        alt=""
        aria-hidden="true"
        loading="lazy"
        style={{
          position: "absolute", right: -12, bottom: -10,
          width: full ? 72 : 82, height: full ? 72 : 82,
          objectFit: "contain",
          opacity: 0.32, pointerEvents: "none",
          filter: `drop-shadow(0 0 10px ${accent}bb)`,
        }}
      />
      <div
        className="menu-icon-box"
        style={{
          width: full ? 50 : 60, height: full ? 50 : 60, borderRadius: 12,
          display: "grid", placeItems: "center",
          flexShrink: 0,
          background: `linear-gradient(160deg, ${accent}, ${accent}cc 60%, ${accent}88)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.45), 0 4px 10px -4px ${accent}aa, 0 0 0 1px rgba(0,0,0,.18)`,
          overflow: "hidden",
        }}
      >
        <img
          src={art}
          alt={label}
          loading="lazy"
          width={64}
          height={64}
          style={{ width: "120%", height: "120%", objectFit: "contain", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.45))", animation: "iconBob 2.6s ease-in-out infinite" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <div className="name-font menu-clean-text menu-title" style={{ fontSize: 13, color: "#ffffff", letterSpacing: 0.6, fontWeight: 900, lineHeight: 1.05, textShadow: "0 1px 2px rgba(0,0,0,.55)" }}>
          {label}
        </div>
        <div className="menu-copy" style={{ fontSize: 10, color: "rgba(255,255,255,.88)", lineHeight: 1.22, marginTop: 4, textShadow: "0 1px 1px rgba(0,0,0,.55)" }}>{sub}</div>
      </div>
      <span className="menu-arrow" style={{ color: "#fff", opacity: 0.85, position: "relative", zIndex: 1 }}>›</span>
      {badge && (
        <span style={{
          position: "absolute", top: 6, right: 6,
          background: "linear-gradient(180deg,#ef4444,#b91c1c)", color: "#fff",
          fontSize: 10, fontWeight: 900,
          borderRadius: 999, minWidth: 18, height: 18,
          padding: "0 5px",
          display: "grid", placeItems: "center",
          border: "1.5px solid rgba(255,255,255,.85)",
          boxShadow: "0 2px 8px rgba(239,68,68,0.6)",
          animation: "menuBadgePulse 1.6s ease-in-out infinite",
          zIndex: 2,
        }}>{badge}</span>
      )}
    </button>
  );

  const menu = (
    <div className="fixed inset-0 flex items-start justify-center overflow-y-auto" style={{ zIndex: 9999, background: "#0a1929", minHeight: "100dvh", isolation: "isolate", padding: "16px 0" }}>
      {/* CUSTOM DASHBOARD BACKDROP */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${dashboardBg.url})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 0.95 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,20,38,0.15) 0%, rgba(8,20,38,0.25) 60%, rgba(8,20,38,0.55) 100%)" }} />
        {/* radial glows */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "55%", height: "55%", background: "radial-gradient(circle, rgba(250,204,21,0.22) 0%, transparent 65%)", filter: "blur(40px)", animation: "menuBgGlow 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 65%)", filter: "blur(50px)", animation: "menuBgGlow 10s ease-in-out 1.5s infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "15%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 65%)", filter: "blur(40px)", animation: "menuBgGlow 12s ease-in-out 3s infinite" }} />
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} style={{
            position: "absolute", top: `${(i * 53) % 95}%`, left: `${(i * 37) % 97}%`,
            width: 4 + (i % 4), height: 4 + (i % 4), borderRadius: "50%",
            background: i % 3 === 0 ? "#fde047" : i % 3 === 1 ? "#a7f3d0" : "#bae6fd",
            boxShadow: "0 0 14px currentColor, 0 0 28px currentColor", color: i % 3 === 0 ? "#fde047" : i % 3 === 1 ? "#a7f3d0" : "#bae6fd",
            opacity: .85,
            animation: `worldFloat ${6 + (i % 5)}s ease-in-out ${i * 0.3}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes worldFloat { 0%,100% { transform: translateY(0) translateX(0); opacity:.4 } 50% { transform: translateY(-18px) translateX(8px); opacity:.95 } }
        @keyframes menuBgGlow { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes iconBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @keyframes purpleSmoke { 0% { transform: translateY(0) scale(0.8); opacity: 0; } 25% { opacity: 0.9; } 50% { transform: translateY(-40px) scale(1.2); opacity: 0.7; } 100% { transform: translateY(-90px) scale(1.6); opacity: 0; } }
        @keyframes auraPulse { 0%,100% { box-shadow: 0 0 0 0 currentColor, inset 0 1px 0 rgba(255,255,255,.45) } 50% { box-shadow: 0 0 18px 2px currentColor, inset 0 1px 0 rgba(255,255,255,.45) } }
        .menu-clean-text { text-shadow: none !important; }
        .menu-copy { font-family: "Pixelify Sans", ui-monospace, monospace; letter-spacing: .15px; }
        @keyframes menuTileShine {
          0% { transform: translateX(-120%) skewX(-20deg); }
          60%,100% { transform: translateX(220%) skewX(-20deg); }
        }
        .menu-tile { transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
        .menu-tile:active { transform: scale(0.985); }
        .menu-tile:hover { transform: translateY(-1px); border-color: currentColor; }
        .menu-tile-shine {
          position: absolute; top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
          transform: translateX(-120%) skewX(-20deg);
          pointer-events: none;
        }
        .menu-tile:hover .menu-tile-shine { animation: menuTileShine 1.1s ease forwards; }
        @keyframes menuBadgePulse { 0%,100% { transform: scale(1); box-shadow: 0 2px 8px rgba(239,68,68,0.6); } 50% { transform: scale(1.12); box-shadow: 0 2px 14px rgba(239,68,68,0.9); } }
        @keyframes menuEventGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.35), 0 8px 24px -8px rgba(168,85,247,0.55); }
          50% { box-shadow: 0 0 0 6px rgba(168,85,247,0), 0 10px 28px -6px rgba(168,85,247,0.75); }
        }
        .menu-event { animation: menuEventGlow 2.4s ease-in-out infinite; }
        @keyframes menuSparkle { 0%,100% { opacity: .25; transform: scale(.9);} 50% { opacity: 1; transform: scale(1.15);} }
        .menu-sparkle { animation: menuSparkle 1.8s ease-in-out infinite; }
        @keyframes menuOrbFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.025); } }
        .menu-orb { animation: menuOrbFloat 2.4s ease-in-out infinite; }
        .menu-arrow { font-family: ui-monospace, monospace; font-size: 30px; line-height: 1; font-weight: 900; opacity: .9; }
        .menu-pixel-bars { width: 42px; height: 38px; display: flex; align-items: end; justify-content: center; gap: 4px; }
        .menu-pixel-bars i { display: block; width: 10px; border: 2px solid #3268db; background: linear-gradient(#67e8f9,#4f46e5); box-shadow: inset 2px 2px 0 rgba(255,255,255,.42); }
        .menu-pixel-bars i:nth-child(1) { height: 20px; } .menu-pixel-bars i:nth-child(2) { height: 33px; } .menu-pixel-bars i:nth-child(3) { height: 25px; }
        .menu-pixel-crystal { font-size: 38px; color: #f6c427; text-shadow: 0 0 8px rgba(251,191,36,.55); line-height: 1; }
        .menu-pixel-book { width: 36px; height: 42px; border-radius: 3px; display:grid; place-items:center; color:#dff8ff; background: linear-gradient(135deg,#93c5fd,#2563eb); border: 3px solid #713f12; box-shadow: inset 4px 0 0 rgba(255,255,255,.38); font-size: 18px; }
        .menu-pixel-swords, .menu-pixel-cart, .menu-pixel-trophy, .menu-pixel-party { font-size: 34px; line-height: 1; }
        .menu-pixel-shield { width: 34px; height: 38px; display:block; background: linear-gradient(135deg,#eef2ff,#818cf8); border: 3px solid #334155; clip-path: polygon(50% 2%, 92% 18%, 82% 72%, 50% 98%, 18% 72%, 8% 18%); }
        .menu-pixel-target { width: 40px; height: 40px; display:block; border-radius:50%; background: radial-gradient(circle,#ef4444 0 16%,#fff 17% 32%,#ef4444 33% 48%,#e5e7eb 49% 64%,#475569 65% 100%); border: 3px solid #64748b; position:relative; }
        .menu-pixel-tree { font-size: 36px; line-height: 1; filter: drop-shadow(0 2px 0 rgba(0,0,0,.25)); }
        .menu-medal { width: 92px; height: 92px; border-radius: 24px; display:grid; place-items:center; position:relative; flex-shrink:0; background: radial-gradient(circle at 50% 43%, #fffbeb 0 17%, #dc2626 18% 34%, #7f1d1d 35% 42%, transparent 43%), linear-gradient(135deg,#facc15,#b45309); clip-path: polygon(50% 0,61% 15%,80% 8%,84% 29%,100% 39%,85% 53%,89% 74%,67% 73%,50% 92%,33% 73%,11% 74%,15% 53%,0 39%,16% 29%,20% 8%,39% 15%); filter: drop-shadow(0 4px 3px rgba(88,48,10,.35)); }
        .menu-medal:before { content:""; width: 34px; height: 34px; border-radius:50%; background: radial-gradient(circle,#f8fafc 0 24%,#111827 25% 30%,#fff 31% 47%,#111827 48% 53%,#dc2626 54% 100%); border:3px solid #451a03; box-shadow: 0 0 0 5px #facc15; }
        .menu-mini-pill { background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 5px rgba(15,23,42,.08); }
        .menu-shell { width: min(94vw, 930px); color: #111827; }
        @media (max-width: 640px) {
          .menu-shell { width: min(95vw, 420px); }
          .menu-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 7px !important; }
          .menu-tile { min-height: 78px !important; padding: 6px 6px !important; gap: 4px !important; }
          .menu-title { font-size: 10px !important; }
          .menu-copy { font-size: 8px !important; line-height: 1.12 !important; }
          .menu-icon-box { width: 32px !important; height: 40px !important; font-size: 23px !important; }
          .menu-arrow { font-size: 20px !important; }
          .menu-header { grid-template-columns: 56px minmax(0,1fr) 58px 74px !important; gap: 7px !important; padding: 10px !important; }
          .menu-header-title { font-size: 18px !important; }
          .menu-medal { width: 58px !important; height: 58px !important; border-radius: 16px !important; }
          .menu-wallet { padding-left: 8px !important; font-size: 11px !important; gap: 5px !important; }
          .menu-avatar { width: 54px !important; height: 62px !important; }
          .menu-info { grid-template-columns: 1fr 92px 42px 42px !important; font-size: 9px !important; }
          .menu-info > span { padding-left: 8px !important; padding-right: 8px !important; min-width: 0 !important; }
          .menu-event-card { grid-template-columns: 76px minmax(0,1fr) !important; min-height: 96px !important; padding: 10px !important; gap: 8px !important; }
          .menu-event-art { width: 72px !important; height: 64px !important; }
          .menu-event-title { font-size: 15px !important; }
          .menu-event-copy { font-size: 9px !important; line-height: 1.35 !important; margin-top: 6px !important; }
          .menu-event-cta { display: none !important; }
          .menu-event-badge { font-size: 9px !important; padding: 3px 8px !important; }
        }
      `}</style>

      <div className="menu-shell my-2 gb-font"
        style={{
          display: "flex", flexDirection: "column", gap: 10,
          background: "linear-gradient(180deg, rgba(15,40,72,.78) 0%, rgba(8,42,61,.78) 60%, rgba(6,18,31,.82) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          border: "2px solid rgba(250,204,21,.55)",
          borderRadius: 28,
          padding: 14,
          boxShadow: "0 25px 60px -12px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(56,189,248,.25), 0 0 40px -10px rgba(250,204,21,.35)",
          position: "relative", overflow: "hidden", zIndex: 1,
        }}>


        {/* HEADER CARD */}
        <div className="menu-header" style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          borderRadius: 18,
          padding: "12px 14px",
          boxShadow: "0 8px 24px -10px rgba(2,6,23,.4), inset 0 1px 0 rgba(255,255,255,.45)",
          display: "grid", gridTemplateColumns: "74px minmax(0,1fr) auto 116px", alignItems: "center", gap: 14,
          position: "relative", overflow: "hidden",
        }}>
          <button className="menu-avatar" onClick={onAvatar} title="Trocar avatar" style={{
            width: 68, height: 74, padding: 0, borderRadius: 14,
            border: "3px solid #fbbf24",
            background: "rgba(15,23,42,.35)",
            cursor: "pointer", overflow: "hidden", flexShrink: 0,
            boxShadow: "0 0 18px rgba(251,191,36,.45), inset 0 0 0 1px rgba(255,255,255,.2)",
          }}>
            <div style={{
              width: "100%", height: "100%",
              backgroundImage: `url(${avatar.sheet})`, backgroundSize: "400% 400%",
              backgroundPosition: "0% 0%",
              imageRendering: "pixelated",
              filter: avatar.hue ? `hue-rotate(${avatar.hue}deg) saturate(1.15)` : undefined,
            }} />
          </button>

          <div style={{ minWidth: 0, position: "relative" }}>
            <div className="name-font menu-clean-text menu-header-title" style={{ fontSize: 22, letterSpacing: 0.5, color: "#ffffff", fontWeight: 900, lineHeight: 1, textShadow: "0 2px 4px rgba(2,6,23,.45)" }}>
              ★ {trainerName.toUpperCase()}
            </div>
            <div className="menu-copy" style={{ fontSize: 12, color: "rgba(255,255,255,.92)", marginTop: 8, textShadow: "0 1px 2px rgba(2,6,23,.4)" }}>
              TREINADOR LV. {trainerLevel}
            </div>
            <button onClick={onAvatar} style={{
              fontSize: 12, color: "rgba(255,255,255,.88)", marginTop: 4,
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              textShadow: "0 1px 2px rgba(2,6,23,.4)",
            }}>
              🧊 {avatar.name} · trocar (500g)
            </button>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 160, maxWidth: "52vw", height: 12, borderRadius: 999,
                background: "rgba(15,23,42,.4)", overflow: "hidden",
                border: "1px solid rgba(255,255,255,.2)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
              }}>
                <div style={{
                  width: `${expPct}%`, height: "100%",
                  background: "linear-gradient(90deg,#fde047,#f59e0b,#fbbf24)",
                  boxShadow: "0 0 10px rgba(251,191,36,0.75)",
                  transition: "width .4s ease",
                }} />
              </div>
              <span className="menu-copy" style={{ fontSize: 10, color: "#fff", fontWeight: 700, textShadow: "0 1px 2px rgba(2,6,23,.4)" }}>{Math.round(expPct/2)} / 50 EXP</span>
            </div>
          </div>

          <div className="menu-medal" aria-hidden="true" />

          <div className="menu-wallet" style={{
            borderLeft: "2px solid rgba(255,255,255,.25)",
            paddingLeft: 18,
            display: "flex", flexDirection: "column", gap: 9, fontSize: 15,
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#fde047", fontWeight: 800, textShadow: "0 1px 2px rgba(2,6,23,.45)" }}>
              💰 <span>{gold}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#7dd3fc", fontWeight: 800, textShadow: "0 1px 2px rgba(2,6,23,.45)" }}>
              💎 <span>{crystal}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#fecaca", fontWeight: 800, textShadow: "0 1px 2px rgba(2,6,23,.45)" }}>
              <img src={iconCoinCase} alt="" width={18} height={18} className="pixelated" />
              <span>{capturePoints}</span>
            </div>
          </div>
        </div>

        {/* INFO STRIP */}
        <div className="menu-info" style={{
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(10px)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          borderRadius: 14,
          minHeight: 38,
          display: "grid", gridTemplateColumns: "1fr 1fr 96px 96px", alignItems: "center",
          fontSize: 12, color: "#fff", fontWeight: 700,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 4px 12px -6px rgba(2,6,23,.35)", overflow: "hidden",
          textShadow: "0 1px 2px rgba(2,6,23,.4)",
        }}>
          <span className="menu-copy" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 18px" }}>📍 {mapName}</span>
          <span className="menu-copy" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderLeft: "1px solid rgba(255,255,255,.18)", height: "100%" }}>👥 EQUIPE: {caught}</span>
          <span className="menu-mini-pill menu-copy" style={{ justifySelf: "center", minWidth: 84, height: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#0f172a", textShadow: "none" }}>✉️ 3</span>
          <span className="menu-mini-pill menu-copy" style={{ justifySelf: "center", minWidth: 84, height: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#0f172a", textShadow: "none" }}>🎁 2</span>
        </div>

        {/* EVENTO ATIVO */}
        <button onClick={onAscension} className="menu-event menu-event-card text-left" style={{
          background: "linear-gradient(135deg,#1e1b4b 0%, #4c1d95 45%, #2e1065 100%)",
          border: "2px solid rgba(192,132,252,0.55)",
          borderRadius: 18, padding: "16px 22px",
          minHeight: 118,
          display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 210px", alignItems: "center", gap: 18, position: "relative", overflow: "hidden",
          boxShadow: "0 12px 28px -10px rgba(76,29,149,.6), inset 0 1px 0 rgba(255,255,255,.15)",
        }}>
          <span style={{ position: "absolute", inset: 0, opacity: .55, background: "radial-gradient(circle at 22% 50%, rgba(192,132,252,.45) 0%, transparent 45%), radial-gradient(circle at 80% 30%, rgba(168,85,247,.35) 0%, transparent 50%)" }} />
          <span style={{ position: "absolute", top: 12, left: 60, fontSize: 10, color: "rgba(196,181,253,.7)" }} className="menu-sparkle">✦</span>
          <span style={{ position: "absolute", bottom: 18, left: 180, fontSize: 8, color: "rgba(196,181,253,.6)", animationDelay: "0.4s" }} className="menu-sparkle">✦</span>
          <span style={{ position: "absolute", top: 30, right: 230, fontSize: 12, color: "rgba(255,255,255,.5)", animationDelay: "0.9s" }} className="menu-sparkle">✦</span>
          <div className="menu-event-art" style={{
            width: 190, height: 96, borderRadius: 14,
            background: "radial-gradient(circle at 50% 55%, #c084fc 0 18%, #7c3aed 19% 38%, #4c1d95 39% 52%, transparent 53%)",
            display: "grid", placeItems: "center",
            fontSize: 56, color: "#fff", fontWeight: 900,
            flexShrink: 0, position: "relative",
            boxShadow: "0 0 40px -10px rgba(192,132,252,.7)",
          }}>
            <span className="menu-orb" style={{ transform: "translateY(-6px)", textShadow: "0 0 14px rgba(255,255,255,.9), 0 0 28px rgba(192,132,252,.7)" }}>👻</span>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(180deg,#ef4444,#b91c1c)", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, boxShadow: "0 2px 8px rgba(239,68,68,.45)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "#fff", boxShadow: "0 0 6px #fff" }} /> EVENTO ATIVO
            </div>
            <div className="name-font menu-clean-text menu-event-title" style={{ fontSize: 22, color: "#fff", fontWeight: 900, letterSpacing: 0.5, textShadow: "0 2px 4px rgba(0,0,0,.5), 0 0 18px rgba(192,132,252,.4)" }}>SOMBRA DO GENGAR</div>
            <div className="menu-copy menu-event-copy" style={{ fontSize: 12, color: "rgba(221,214,254,.92)", marginTop: 8, lineHeight: 1.55 }}>
              Capture recompensas exclusivas antes do amanhecer!
            </div>
          </div>
          <span className="name-font menu-clean-text menu-event-cta" style={{
            justifySelf: "end", position: "relative", zIndex: 1,
            background: "linear-gradient(180deg,#ffffff,#e9d5ff)", color: "#4c1d95",
            border: "2px solid #fff", borderRadius: 12,
            padding: "14px 22px", fontSize: 15, fontWeight: 900, letterSpacing: 1,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.95), 0 6px 18px rgba(192,132,252,.55)",
          }}>VER AGORA ›</span>
          <span className="menu-event-badge" style={{
            position: "absolute", top: 10, right: 12,
            background: "rgba(15,23,42,.6)", color: "#c4b5fd",
            border: "1px solid rgba(196,181,253,.4)",
            fontSize: 10, fontWeight: 900, letterSpacing: 1.5,
            padding: "4px 10px", borderRadius: 999,
            backdropFilter: "blur(6px)",
          }}>ATIVO</span>
        </button>

        {/* GRID TILES */}
        <div className="menu-grid grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <Tile label="BAG" sub="Squirtle & sua mochila" tint="#eff6ff" accent="#38bdf8" art={artBag} onClick={onBag} />
          <Tile label="STATUS" sub="Pikachu observa atributos" tint="#f5f3ff" accent="#facc15" art={artStatus} onClick={onStatus} />
          <Tile label="ASCENSÃO" sub="Charizard desperta o poder" tint="#fffbeb" accent="#f97316" art={artAscension} onClick={onAscension} badge="!" />
          <Tile label="ÁLBUM" sub="Pokédex brilhante" tint="#f0f9ff" accent="#dc2626" art={artAlbum} onClick={onCodex} />
          <Tile label="QUESTS" sub="Modo história — NPCs" tint="#f5f3ff" accent="#a855f7" art={artAlbum} onClick={onQuests} badge={questCount > 0 ? String(questCount) : undefined} />
          <Tile label="DRIVE" sub="Armazenamento futurista" tint="#ecfeff" accent="#22d3ee" art={artDrive} onClick={onDrive} />
          <Tile label="PvP" sub="Arena dos treinadores" tint="#fff1f2" accent="#ef4444" art={artPvp} onClick={onPlayers} />
          <Tile label="GUILDA" sub={hasGuild ? "Brasão lendário" : "Funde a sua guilda"} tint="#f5f3ff" accent="#8b5cf6" art={artGuild} onClick={onGuild} badge={hasGuild ? "12" : undefined} />
          <Tile label="MARKET" sub="Meowth e suas moedas" tint="#fff7ed" accent="#fbbf24" art={artMarket} onClick={onMarket} />
          <Tile label="LOJA" sub="PokéMart estilizado" tint="#f0fdf4" accent="#22c55e" art={artShop} onClick={onShop} />
          <Tile label="AUTO HUNT" sub="Snorlax caça enquanto descansa" tint="#f8fafc" accent="#64748b" art={artAutohunt} onClick={onAutoHunt} full />
          <Tile label="RANKED" sub="Dragonite no topo" tint="#fefce8" accent="#eab308" art={artRanked} onClick={onRanked} />
          <Tile label="ÁRVORE" sub="Bulbasaur & talentos" tint="#ecfdf5" accent="#16a34a" art={artTree} onClick={onTrainerTree} badge="!" />
          <Tile label="PARTY" sub={hasParty ? "Equipe reunida" : "Até 5 treinadores"} tint="#f0fdf4" accent="#10b981" art={artParty} onClick={onParty} badge={partyInviteCount > 0 ? String(partyInviteCount) : undefined} full />
        </div>


        {/* MUSIC */}
        <div style={{
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
          padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 9,
        }}>
          <button
            onClick={() => setMuted(!musicState.muted)}
            style={{
              background: musicState.muted ? "#94a3b8" : "linear-gradient(180deg,#22c55e,#15803d)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "5px 10px", fontSize: 9, fontWeight: 700, cursor: "pointer",
            }}
          >
            {musicState.muted ? "🔇 OFF" : "🎵 ON"}
          </button>
          <input
            type="range" min={0} max={1} step={0.01} value={musicState.volume}
            onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (musicState.muted && v > 0) setMuted(false); }}
            style={{ flex: 1 }}
            aria-label="Volume da música"
          />
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 pb-2">
          <button onClick={onSave} className="flex-1"
            style={{ background: "linear-gradient(180deg,#fde047,#f59e0b)", color: "#0f1f0d",
              border: "none", borderRadius: 10, padding: "10px", fontSize: 11, fontWeight: 800, letterSpacing: 1,
              boxShadow: "0 4px 12px -4px rgba(245,158,11,0.6)", cursor: "pointer" }}>
            💾 SALVAR
          </button>
          <button onClick={() => { if (confirm("Apagar save e reiniciar?")) onReset(); }}
            style={{ background: "#fff", color: "#475569",
              border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
            RESET
          </button>
          <button onClick={async () => {
            if (!confirm("Sair da conta? Seu progresso salvo será mantido.")) return;
            const { signOutRubyM } = await import("@/components/AuthGate");
            await signOutRubyM();
          }}
            style={{ background: "linear-gradient(180deg,#fecaca,#ef4444)", color: "#fff",
              border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 10, fontWeight: 800, letterSpacing: 1, cursor: "pointer" }}>
            SAIR
          </button>
          <button onClick={onClose} className="flex-1"
            style={{ background: "linear-gradient(180deg,#0f1f0d,#1f3a1f)", color: "#fde047",
              border: "none", borderRadius: 10, padding: "10px", fontSize: 11, fontWeight: 800, letterSpacing: 1,
              boxShadow: "0 4px 12px -4px rgba(0,0,0,0.4)", cursor: "pointer" }}>
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );

  return mounted && typeof document !== "undefined" ? createPortal(menu, document.body) : menu;
}

function DriveOverlay({ 
  team, stored, capturePoints, capacity, crystal, onClose, onExpand, onFragmentTeam, onFragmentStored, onWithdraw, onDeposit 
}: {
  team: PetInstance[]; stored: PetInstance[]; capturePoints: number; capacity: number; crystal: number;
  onClose: () => void;
  onExpand: () => void;
  onFragmentTeam: (uid: string) => void;
  onFragmentStored: (uid: string) => void;
  onWithdraw: (uid: string) => void;
  onDeposit: (uid: string) => void;
}) {
  const [confirmFragment, setConfirmFragment] = useState<{ uid: string; species: Species; rarity: Rarity; location: "team" | "drive" } | null>(null);

  const PetCard = ({ p, location }: { p: PetInstance; location: "team" | "drive" }) => (
    <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-300 border shadow-sm" style={{
      background: "rgba(255,255,255,0.7)", 
      borderColor: location === "team" ? "rgba(59,130,246,0.2)" : "rgba(148,163,184,0.2)",
      minHeight: "95px"
    }}>
      <div className="relative group scale-90">
        <div className="absolute inset-0 bg-blue-100/30 rounded-full blur-sm group-hover:bg-blue-200/40 transition-colors" />
        <img src={SPECIES_GIF[p.species]} alt="" width={36} height={36} className="pixelated relative z-10 drop-shadow-sm" />
      </div>
      
      <div className="text-center leading-tight -mt-1">
        <div className="text-[8px] font-black text-blue-900 truncate w-full px-0.5 uppercase">{SPECIES_NAME[p.species]}</div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-[7px] font-bold text-blue-500">L.{p.level}</span>
          <span style={{ fontSize: 6, color: RARITY_COLOR[p.rarity], fontWeight: 800 }}>{RARITY_NAME[p.rarity].substring(0,1)}</span>
        </div>
      </div>

      <div className="flex flex-col w-full gap-0.5 mt-0.5">
        {location === "drive" ? (
          <button 
            onPointerDown={() => onWithdraw(p.uid)} 
            className="hover:scale-105 active:scale-95 transition-all bg-gradient-to-b from-blue-400 to-blue-500 text-white font-black rounded-lg py-1 text-[7px] uppercase shadow-sm touch-manipulation"
          >
            TIME
          </button>
        ) : (
          <button 
            onPointerDown={() => onDeposit(p.uid)} 
            className="hover:scale-105 active:scale-95 transition-all bg-gradient-to-b from-sky-300 to-sky-400 text-white font-black rounded-lg py-1 text-[7px] uppercase shadow-sm touch-manipulation"
          >
            DRIVE
          </button>
        )}
        <button 
          onPointerDown={() => setConfirmFragment({ uid: p.uid, species: p.species, rarity: p.rarity, location })} 
          className="hover:scale-105 active:scale-95 transition-all bg-gradient-to-b from-rose-400 to-rose-500 text-white font-black rounded-lg py-1 text-[7px] uppercase shadow-sm touch-manipulation"
        >
          FRAG
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-hidden"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full h-full max-h-full sm:max-w-md bg-white border-[6px] border-blue-200 sm:rounded-[40px] flex flex-col shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
           style={{ margin: "auto" }}>
        
        {/* Cute Blue Baby Header */}
        <div className="bg-gradient-to-r from-sky-400 via-blue-400 to-sky-400 p-4 sm:p-6 flex justify-between items-center shadow-md flex-shrink-0 relative">
          <div className="flex items-center gap-4">
            <div className="bg-white/30 p-2.5 rounded-[20px] backdrop-blur-sm border border-white/40">
               <img src={iconDrive} alt="" width={24} height={24} className="pixelated drop-shadow-sm" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-black tracking-tight text-white drop-shadow-md">DOUSE DRIVE</div>

              <div className="text-[9px] text-blue-50 font-bold uppercase tracking-widest opacity-95">Gerenciamento de Pokémon</div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-lg transition-all active:scale-90"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
        </div>

        {/* Info & Stats Bar */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
               <img src={iconCoinCase} alt="" width={14} height={14} className="pixelated" />
               <span className="text-[10px] font-black text-blue-500">{capturePoints} PTS</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
               <span className="text-xs">💎</span>
               <span className="text-[10px] font-black text-blue-500">{crystal}</span>
            </div>
          </div>
          
          <button 
            onClick={onExpand}
            className="group flex items-center gap-1.5 bg-blue-400 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white transition-all transform active:scale-95"
          >
            <span className="text-[10px] font-bold">+ SLOTS</span>
            <div className="flex items-center gap-0.5 bg-white/20 px-1.5 rounded-full">
               <span className="text-[8px]">💎</span>
               <span className="text-[9px] font-black">30</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 bg-blue-50/20">
          <div className="space-y-8 pb-12">
            {/* Team Section */}
            <section>
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-400 rounded-full" />
                  <h3 className="text-[11px] font-black text-blue-900 tracking-wider">EQUIPE ATIVA ({team.length}/{TEAM_MAX})</h3>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {team.map((p) => <PetCard key={p.uid} p={p} location="team" />)}
              </div>
            </section>

            {/* Storage Section */}
            <section>
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-sky-300 rounded-full" />
                  <h3 className="text-[11px] font-black text-blue-900 tracking-wider">DRIVE STORAGE ({stored.length}/{capacity})</h3>
                </div>
                {stored.length >= capacity && (
                  <span className="text-[8px] font-black text-rose-500 animate-pulse bg-rose-50 px-2 py-0.5 rounded-full">FULL!</span>
                )}
              </div>
              
              {stored.length === 0 ? (
                <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[32px] p-10 flex flex-col items-center justify-center text-center opacity-60">
                   <div className="text-3xl mb-2">☁️</div>
                   <div className="text-[9px] font-bold text-gray-400">SEU DRIVE ESTÁ VAZIO</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {stored.map((p) => <PetCard key={p.uid} p={p} location="drive" />)}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Legend strip */}
        <div className="bg-blue-50/80 p-3 flex items-center justify-center gap-4 border-t border-blue-100">
          <div className="flex items-center gap-1 opacity-60">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[8px] font-bold text-blue-900 uppercase">TIME</span>
          </div>
          <div className="flex items-center gap-1 opacity-60">
            <div className="w-2 h-2 rounded-full bg-sky-300" />
            <span className="text-[8px] font-bold text-blue-900 uppercase">STORAGE</span>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmFragment && (
          <div className="absolute inset-0 z-[120] flex items-center justify-center bg-blue-900/40 backdrop-blur-sm p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-[300px] bg-white border-[6px] border-blue-200 rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-100/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-b from-blue-50 to-white rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-100 shadow-xl relative">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                  <img src={SPECIES_GIF[confirmFragment.species]} alt="" width={56} height={56} className="pixelated drop-shadow-md animate-bounce relative z-10" />
                </div>
                
                <h4 className="text-[16px] font-black text-blue-900 mb-2 leading-tight uppercase tracking-tight">
                  FRAGMENTAR <span className="text-blue-500">{SPECIES_NAME[confirmFragment.species]}</span>?
                </h4>
                <p className="text-[11px] font-bold text-slate-400 mb-8 px-4 leading-relaxed">
                  Isso irá transformar seu Pokémon em <span className="text-rose-500 font-black">{FRAGMENT_POINTS[confirmFragment.rarity] || 1} PONTOS</span> de captura.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => {
                      if (confirmFragment.location === "team") onFragmentTeam(confirmFragment.uid);
                      else onFragmentStored(confirmFragment.uid);
                      setConfirmFragment(null);
                    }}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-black py-4 rounded-2xl text-[12px] transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    <span className="relative z-10 uppercase tracking-widest">CONFIRMAR</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  </button>
                  <button 
                    onClick={() => setConfirmFragment(null)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-3 rounded-2xl text-[11px] transition-all active:scale-95 uppercase tracking-widest"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            </div>
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%) skewX(-15deg); }
                100% { transform: translateX(200%) skewX(-15deg); }
              }
            `}</style>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }
        
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -100%;
          width: 60%;
          height: 200%;
          background: rgba(255, 255, 255, 0.4);
          transform: rotate(30deg);
          transition: all 0s;
          animation: shine-anim 2.5s infinite;
        }
        @keyframes shine-anim {
          0% { left: -100%; }
          30% { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>
    </div>
  );
}

function BagOverlay({ balls, inventory, team, gold, onClose, onPickPet, onSetLeader, onRevive, onUseItem }: {
  balls: Record<BallId, number>; inventory: Record<string, number>;
  team: PetInstance[]; gold: number; onClose: () => void; onPickPet: (p: PetInstance) => void;
  onSetLeader: (uid: string) => void; onRevive: (uid: string) => void;
  onUseItem: (id: string) => void;
}) {
  type Cat = "all" | "balls" | "craft" | "heal" | "keys" | "other";
  const [cat, setCat] = useState<Cat>("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  type BagItem = {
    key: string;
    cat: Exclude<Cat, "all">;
    name: string;
    desc: string;
    qty: number;
    icon: React.ReactNode;
    useId?: string;
  };

  const items = useMemo<BagItem[]>(() => {
    const list: BagItem[] = [];
    const ballMeta: { id: BallId; name: string; desc: string }[] = [
      { id: "pokeball",   name: "POKÉ BALL",    desc: "Dispositivo padrão para capturar Pokémon." },
      { id: "greatball",  name: "GREAT BALL",   desc: "Mais eficaz que a Poké Ball comum." },
      { id: "ultraball",  name: "ULTRA BALL",   desc: "Alta taxa de captura para espécies raras." },
      { id: "fastball",   name: "FAST BALL",    desc: "Ideal para Pokémon velozes." },
      { id: "safariball", name: "SAFARI BALL",  desc: "Usada em áreas de Safari." },
      { id: "masterball", name: "MASTER BALL",  desc: "Captura qualquer Pokémon sem falhar." },
    ];
    for (const b of ballMeta) {
      list.push({ key: `ball-${b.id}`, cat: "balls", name: b.name, desc: b.desc, qty: balls[b.id] || 0,
        icon: <BallImg id={b.id} size={28} /> });
    }
    if ((inventory.event_pokeball || 0) > 0) {
      list.push({ key: "event_pokeball", cat: "balls", name: "POKÉ BOLA DE EVENTO", desc: "Uma Poké Bola especial recebida em eventos.",
        qty: inventory.event_pokeball || 0, icon: <BallImg id="pokeball" size={28} /> });
    }
    list.push({ key: "potion", cat: "heal", name: "POÇÃO", desc: "Restaura 20% do HP de um Pokémon.",
      qty: inventory.potion || 0, icon: <span style={{ fontSize: 22 }}>🧪</span>, useId: "potion" });
    if ((inventory.event_potion || 0) > 0) {
      list.push({ key: "event_potion", cat: "heal", name: "POÇÃO DE EVENTO", desc: "Restaura 20% do HP de um Pokémon.",
        qty: inventory.event_potion || 0, icon: <span style={{ fontSize: 22 }}>🧪</span>, useId: "potion" });
    }
    list.push({ key: "revive", cat: "heal", name: "REVIVE", desc: "Revive um Pokémon desmaiado com 50% do HP.",
      qty: inventory.revive || 0, icon: <span style={{ fontSize: 22 }}>💖</span>, useId: "revive" });
    if ((inventory.egg_rare || 0) > 0) {
      list.push({ key: "egg_rare", cat: "other", name: "OVO RARO", desc: "Pode chocar um Pokémon raro.",
        qty: inventory.egg_rare || 0, icon: <span style={{ fontSize: 22 }}>🥚</span>, useId: "egg_rare" });
    }
    if ((inventory.beta_box || 0) > 0) {
      list.push({ key: "beta_box", cat: "other", name: "BOX DO PRÉ-REGISTRO",
        desc: "Recompensa por ter participado do pré-registro. Use para abrir.",
        qty: inventory.beta_box || 0, icon: <span style={{ fontSize: 22 }}>🎁</span>, useId: "beta_box" });
    }
    if ((inventory.event_box || 0) > 0) {
      list.push({ key: "event_box", cat: "other", name: "CAIXA DE EVENTO",
        desc: "Sorteia 1 prêmio entre morangos, limões, pokébolas, star dust ou incenso. Não vendável.",
        qty: inventory.event_box || 0, icon: <span style={{ fontSize: 22 }}>🎁</span>, useId: "event_box" });
    }
    if ((inventory.beta_egg || 0) > 0) {
      list.push({ key: "beta_egg", cat: "other", name: "OVO COMUM (EVENTO)",
        desc: "Pode chocar um Pokémon ou se desfazer em Star Dust. Vinculado à sua conta.",
        qty: inventory.beta_egg || 0, icon: <span style={{ fontSize: 22 }}>🥚</span>, useId: "beta_egg" });
    }
    if ((inventory.rare_mushroom || 0) > 0) {
      list.push({ key: "rare_mushroom", cat: "other", name: "COGUMELO RARO", desc: "Um cogumelo valioso pedido por NPCs em histórias.",
        qty: inventory.rare_mushroom || 0, icon: <RareMushroom size={28} />, useId: "rare_mushroom" });
    }
    // Craft items (Velho dos Mares forge)
    const craftStore = loadCraftStore();
    const craftMeta: { id: string; name: string; desc: string; img: string }[] = [
      { id: "madeira",     name: "MADEIRA REFORÇADA", desc: "Tábuas grossas tratadas com seiva e fibras marinhas.", img: imgCraftMadeira },
      { id: "pecas",       name: "PEÇAS METÁLICAS",   desc: "Engrenagens, parafusos e chapas forjadas.",          img: imgCraftPecas },
      { id: "cordas",      name: "CORDAS TRANÇADAS",  desc: "Cordame resistente para velame e cabos.",            img: imgCraftCorda },
      { id: "ancora",      name: "ÂNCORA",            desc: "Cada barco precisa da sua. Use uma vez.",            img: imgCraftAncora },
      { id: "combustivel", name: "COMBUSTÍVEL",       desc: "Querosene marítimo para longas travessias.",         img: imgCraftCombustivel },
      { id: "carta",       name: "CARTA NÁUTICA",     desc: "Autoriza donos de frota a navegar pelas rotas.",     img: imgCraftCarta },
    ];
    for (const c of craftMeta) {
      const qty = (craftStore.items as Record<string, number>)[c.id] || 0;
      if (qty > 0) {
        list.push({ key: `craft-${c.id}`, cat: "craft", name: c.name, desc: c.desc, qty,
          icon: <img src={c.img} alt={c.name} style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "pixelated" }} /> });
      }
    }

    const lenhaQty = (inventory.lenha || 0) + (inventory.madeira_bruta || 0);
    if (lenhaQty > 0) {
      list.push({ key: "lenha", cat: "other", name: "LENHA", desc: "Toras de madeira boa colhidas de árvores selvagens. Base de craft.",
        qty: lenhaQty, icon: <img src={imgLenha} alt="lenha" style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "pixelated" }} />, useId: "lenha" });
    }
    for (const tk of ["strawberry","lemon","pink"] as const) {
      const v = TREE_VARIANTS[tk];
      const qty = inventory[v.itemKey] || 0;
      if (qty > 0) {
        list.push({ key: v.itemKey, cat: "other", name: v.itemName, desc: v.desc,
          qty, icon: <span style={{ fontSize: 22 }}>{v.icon}</span>, useId: v.itemKey });
      }
    }

    // Materiais (sucata, ferro, bronze, pedra, etc.) — vindos da Caixa de Sucata e Mercador
    try {
      const mats = loadMaterialsStore();
      for (const m of MATERIAL_DEFS) {
        if (m.id === "lenha") continue; // já listado acima
        const qty = mats[m.id] || 0;
        if (qty > 0) {
          list.push({
            key: `mat-${m.id}`, cat: "craft", name: m.name.toUpperCase(), desc: m.desc, qty,
            icon: <img src={m.img} alt={m.name} style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "pixelated" }} />,
          });
        }
      }
    } catch { /* ignore */ }
    const known = new Set(["potion", "revive", "event_pokeball", "event_potion", "egg_rare", "rare_mushroom", "lenha", "madeira_bruta", "fruta_morango", "fruta_limao", "fruta_rosa", "fruta_azul", "beta_box", "beta_egg", "event_box", "incenseXp", "fish_bait", "apricorn_generic"]);
    for (const [k, v] of Object.entries(inventory)) {
      if (known.has(k) || !v) continue;
      list.push({ key: k, cat: "other", name: k.toUpperCase().replace(/_/g, " "), desc: "Item especial.",
        qty: v, icon: <span style={{ fontSize: 22 }}>📦</span>, useId: k });
    }

    return list;
  }, [balls, inventory]);

  const filtered = useMemo(() => {
    return items.filter((i) => cat === "all" || i.cat === cat);
  }, [items, cat]);

  const selected = useMemo(() => filtered.find((i) => i.key === selectedKey) ?? filtered[0] ?? null, [filtered, selectedKey]);

  const CATS: { id: Cat; label: string; icon: React.ReactNode }[] = [
    { id: "all",   label: "TUDO",        icon: <span style={{ fontSize: 14 }}>▦</span> },
    { id: "balls", label: "POKÉ BOLAS",  icon: <BallImg id="pokeball" size={16} /> },
    { id: "heal",  label: "MEDICINAS",   icon: <span style={{ fontSize: 14 }}>🧪</span> },
    { id: "craft", label: "CRAFT",       icon: <span style={{ fontSize: 14 }}>🛠</span> },
    { id: "keys",  label: "CHAVES",      icon: <span style={{ fontSize: 14 }}>🔑</span> },
    { id: "other", label: "OUTROS",      icon: <span style={{ fontSize: 14 }}>✦</span> },
  ];

  // Premium dark-navy "Switch UI" palette
  const C = {
    bg: "linear-gradient(160deg, #0b1a3a 0%, #0f2a55 40%, #0a1838 100%)",
    panel: "linear-gradient(180deg, rgba(20,40,86,0.92), rgba(12,26,60,0.92))",
    panelBorder: "1px solid rgba(120,170,255,0.18)",
    panelShadow: "0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(180,210,255,0.12)",
    accent: "linear-gradient(180deg, #4ea3ff, #1c66e6)",
    accentSoft: "linear-gradient(180deg, rgba(78,163,255,0.22), rgba(28,102,230,0.18))",
    text: "#e6efff",
    textDim: "#9bb3d8",
    textGold: "#ffd770",
  };

  return (
    <div className="absolute inset-0 flex items-stretch justify-center"
      style={{ background: "#06122b",
        backgroundImage: "radial-gradient(120% 80% at 50% 0%, #1a3b78 0%, #06122b 70%, #06122b 100%)",
        padding: 6, overflow: "hidden" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`
        .bag-main { display: grid; grid-template-columns: 140px minmax(0,1fr) 220px; gap: 6px; flex: 1 1 0; min-height: 0; }
        .bag-center { display: flex; flex-direction: column; gap: 6px; min-height: 0; min-width: 0; }
        @media (max-width: 760px) {
          .bag-main { grid-template-columns: 1fr; grid-template-rows: auto minmax(0,1fr) auto; overflow-y: auto; }
          .bag-sidebar { flex-direction: row !important; overflow-x: auto; overflow-y: hidden; max-height: 56px; }
          .bag-sidebar > button { flex: 0 0 auto; }
          .bag-grid-panel { max-height: 200px; }
        }
      `}</style>

      <div className="flex flex-col w-full" style={{ maxWidth: 900, height: "100%", gap: 6, color: C.text,
        fontFamily: "system-ui, -apple-system, sans-serif", minHeight: 0 }}>



        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", background: C.panel, border: C.panelBorder, borderRadius: 14,
          boxShadow: C.panelShadow, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "radial-gradient(circle at 35% 30%, #ff6b6b, #c92a2a 60%, #5a0d12)",
              boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.35), 0 0 10px rgba(255,107,107,0.35)",
              position: "relative" }}>
              <div style={{ position: "absolute", top: "47%", left: 0, right: 0, height: 3, background: "#0b1a3a" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5,
                borderRadius: "50%", background: "#e6efff", boxShadow: "inset 0 0 0 2px #0b1a3a" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 4, color: C.text,
              textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}>BOLSA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999,
              background: "linear-gradient(180deg, rgba(255,215,112,0.18), rgba(255,215,112,0.06))",
              boxShadow: "inset 0 0 0 1px rgba(255,215,112,0.35)" }}>
              <span style={{ fontSize: 13, color: C.textGold, fontWeight: 800 }}>₽</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.textGold, letterSpacing: 0.5 }}>
                {gold.toLocaleString("pt-BR")}
              </span>
            </div>
            <button onClick={onClose} aria-label="Fechar"
              style={{ width: 30, height: 30, borderRadius: 10, border: "none", cursor: "pointer",
                background: C.accent, color: "#fff", fontWeight: 800, fontSize: 16,
                boxShadow: "0 3px 10px rgba(28,102,230,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" }}>×</button>
          </div>
        </div>

        {/* Main: sidebar + list + leader showcase */}
        <div className="bag-main">

          {/* Sidebar — no scroll, equally distributed */}
          <div className="bag-sidebar" style={{ background: C.panel, border: C.panelBorder, borderRadius: 14,
            boxShadow: C.panelShadow, padding: 5, display: "flex", flexDirection: "column", gap: 3,
            overflow: "hidden" }}>
            {CATS.map((c) => {
              const active = cat === c.id;
              return (
                <button key={c.id} onClick={() => { setCat(c.id); setSelectedKey(null); }}
                  style={{ position: "relative", flex: "1 1 0", minHeight: 0, display: "flex", alignItems: "center", gap: 7,
                    padding: "4px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: active ? C.accentSoft : "transparent",
                    color: active ? C.text : C.textDim, textAlign: "left",
                    boxShadow: active ? "inset 0 0 0 1px rgba(120,170,255,0.45)" : "none" }}>
                  {active && (
                    <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: 2,
                      background: C.accent, boxShadow: "0 0 8px rgba(78,163,255,0.7)" }} />
                  )}
                  <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                    background: active ? C.accent : "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: active ? "0 2px 6px rgba(28,102,230,0.5)" : "inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
                    {c.icon}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.7 }}>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Center: item list — white shiny */}
          <div className="bag-center">
            <div className="bag-list" style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden",
              background: "linear-gradient(180deg, #ffffff 0%, #f2f6ff 60%, #e6edff 100%)",
              border: "1px solid rgba(120,170,255,0.55)", borderRadius: 14,
              boxShadow: "0 10px 26px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -20px 40px rgba(180,210,255,0.25)",
              padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>



              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "2px 4px 6px", borderBottom: "1px solid rgba(28,102,230,0.18)", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#0b1a3a" }}>
                  {(CATS.find((x) => x.id === cat)?.label) || "ITENS"}
                </span>
                <span style={{ fontSize: 9, color: "#6b8ac4", fontWeight: 700 }}>{filtered.length} itens</span>
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: 20, color: "#6b8ac4", fontSize: 11 }}>Nenhum item nesta categoria.</div>
              )}
              {filtered.map((it) => {
                const active = selected?.key === it.key;
                return (
                  <button key={it.key} onClick={() => setSelectedKey(it.key)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                      borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                      background: active
                        ? "linear-gradient(180deg, rgba(78,163,255,0.22), rgba(78,163,255,0.08))"
                        : "rgba(255,255,255,0.6)",
                      boxShadow: active
                        ? "inset 0 0 0 1.5px rgba(28,102,230,0.55), 0 2px 10px rgba(78,163,255,0.25)"
                        : "inset 0 0 0 1px rgba(120,170,255,0.25), 0 1px 2px rgba(28,102,230,0.06)" }}>
                    {active && (
                      <div style={{ width: 0, height: 0, borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent", borderLeft: "6px solid #1c66e6",
                        flexShrink: 0 }} />
                    )}
                    <div style={{ width: 42, height: 42, borderRadius: 9, flexShrink: 0,
                      background: "radial-gradient(circle at 50% 35%, #ffffff, #c7d8ff 90%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "inset 0 0 0 1px rgba(120,170,255,0.45), 0 2px 6px rgba(28,102,230,0.15)" }}>
                      {it.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#0b1a3a", letterSpacing: 0.4, lineHeight: 1.15 }}>
                        {it.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#3b5b9e", lineHeight: 1.3, marginTop: 2, fontWeight: 600,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {it.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 900, color: active ? "#0b1a3a" : "#1c66e6",
                      letterSpacing: 0.5, flexShrink: 0 }}>
                      ×{String(it.qty).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* Selected detail panel — compact */}
            {selected && (
              <div style={{ background: C.panel, border: C.panelBorder, borderRadius: 14,
                boxShadow: C.panelShadow, padding: 10, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(180deg, rgba(78,163,255,0.28), rgba(12,26,60,0.7))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 0 0 1px rgba(120,170,255,0.45), 0 0 14px rgba(78,163,255,0.25)" }}>
                  {selected.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: C.text, letterSpacing: 0.5 }}>{selected.name}</div>
                  <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.3, marginTop: 2 }}>{selected.desc}</div>
                </div>
                {selected.useId && selected.qty > 0 && (
                  <button onClick={() => onUseItem(selected.useId!)}
                    style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10,
                      padding: "8px 16px", fontSize: 11, fontWeight: 900, letterSpacing: 1, cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(28,102,230,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                    USAR
                  </button>
                )}
              </div>

            )}

          </div>

          {/* Right: icon grid */}
          <div className="bag-grid-panel custom-scrollbar" style={{ background: C.panel, border: C.panelBorder, borderRadius: 14,
            boxShadow: C.panelShadow, padding: 8, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "2px 4px 6px", borderBottom: "1px solid rgba(120,170,255,0.12)" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: C.text }}>ITENS</span>
              <span style={{ fontSize: 9, color: C.textDim }}>{filtered.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
              {filtered.map((it) => {
                const active = selected?.key === it.key;
                return (
                  <button key={`g-${it.key}`} onClick={() => setSelectedKey(it.key)} title={it.name}
                    style={{ position: "relative", aspectRatio: "1", borderRadius: 10, border: "none",
                      cursor: "pointer", padding: 0,
                      background: active
                        ? "linear-gradient(180deg, rgba(78,163,255,0.35), rgba(12,26,60,0.7))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
                      boxShadow: active
                        ? "inset 0 0 0 2px #4ea3ff, 0 0 12px rgba(78,163,255,0.5)"
                        : "inset 0 0 0 1px rgba(120,170,255,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {it.icon}
                    <span style={{ position: "absolute", bottom: 2, right: 4, fontSize: 9, fontWeight: 800,
                      color: C.text, textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}>
                      ×{String(it.qty).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 14, color: C.textDim, fontSize: 10 }}>
                  Sem itens.
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Team strip — refined */}
        <div style={{ background: "linear-gradient(180deg, rgba(20,40,86,0.96), rgba(8,18,46,0.96))",
          border: "1px solid rgba(120,170,255,0.25)", borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(180,210,255,0.12)",
          padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 14, borderRadius: 2, background: C.accent,
                boxShadow: "0 0 8px rgba(78,163,255,0.7)" }} />
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2.5, color: C.text }}>EQUIPE</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: 1,
              padding: "2px 8px", borderRadius: 999, background: "rgba(120,170,255,0.1)",
              boxShadow: "inset 0 0 0 1px rgba(120,170,255,0.2)" }}>
              {team.length}/{TEAM_MAX}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${TEAM_MAX}, minmax(0, 1fr))`, gap: 6 }}>
            {Array.from({ length: TEAM_MAX }).map((_, i) => {
              const p = team[i];
              if (!p) {
                return (
                  <div key={`empty-${i}`} style={{ height: 88, borderRadius: 10,
                    background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 6px, transparent 6px 12px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 0 0 0 1px rgba(120,170,255,0.15)" }}>
                    <div style={{ opacity: 0.22 }}><BallImg id="pokeball" size={20} /></div>
                  </div>
                );
              }
              const hp = p.hp ?? p.maxHp;
              const pct = Math.max(0, Math.min(100, Math.round((hp / p.maxHp) * 100)));
              const hpColor = pct > 50 ? "linear-gradient(90deg, #22c55e, #84cc16)"
                : pct > 20 ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #ef4444, #f87171)";
              const isLeader = i === 0;
              return (
                <button key={p.uid} onClick={() => onPickPet(p)}
                  style={{ position: "relative", height: 88, borderRadius: 10,
                    background: isLeader
                      ? "linear-gradient(180deg, rgba(78,163,255,0.32) 0%, rgba(28,102,230,0.18) 45%, rgba(12,26,60,0.85) 100%)"
                      : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.15) 100%)",
                    border: "none", cursor: "pointer",
                    boxShadow: isLeader
                      ? "inset 0 0 0 1.5px rgba(120,170,255,0.7), 0 0 14px rgba(78,163,255,0.35), 0 3px 8px rgba(0,0,0,0.4)"
                      : "inset 0 0 0 1px rgba(120,170,255,0.22), 0 2px 6px rgba(0,0,0,0.3)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
                    padding: "5px 3px 4px", gap: 2, overflow: "hidden" }}>
                  {/* Top: pokemon image area */}
                  <div style={{ width: "100%", height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    background: isLeader
                      ? "radial-gradient(circle at 50% 60%, rgba(78,163,255,0.35), transparent 70%)"
                      : "radial-gradient(circle at 50% 60%, rgba(255,255,255,0.05), transparent 70%)",
                    borderRadius: 6, position: "relative" }}>
                    <img src={SPECIES_GIF[p.species]} alt={p.species} className="pixelated" width={32} height={32}
                      style={{ filter: p.faintedAt ? "grayscale(1) brightness(0.7)" : undefined }} />
                  </div>
                  {/* Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!p.faintedAt) onSetLeader(p.uid); }}
                    title={isLeader ? "Pokémon seguidor" : "Marcar como seguidor"}
                    disabled={!!p.faintedAt}
                    style={{ position: "absolute", top: 3, right: 3, width: 16, height: 16, borderRadius: "50%",
                      border: "none", cursor: p.faintedAt ? "not-allowed" : "pointer", padding: 0, zIndex: 2,
                      background: isLeader
                        ? "radial-gradient(circle at 35% 30%, #ff7da0, #c92a4a 70%)"
                        : "rgba(0,0,0,0.35)",
                      color: isLeader ? "#fff" : "#9bb3d8", fontSize: 9, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: isLeader
                        ? "0 0 8px rgba(255,125,160,0.75), inset 0 1px 0 rgba(255,255,255,0.4)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.18)" }}>
                    ♥
                  </button>
                  {isLeader && (
                    <div style={{ position: "absolute", top: 3, left: 3, fontSize: 7, fontWeight: 900,
                      color: "#ffd770", letterSpacing: 0.8, textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}>
                      ★ LÍDER
                    </div>
                  )}
                  {/* Name */}
                  <div style={{ fontSize: 8, fontWeight: 900, color: C.text, letterSpacing: 0.4,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "95%",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                    {SPECIES_NAME[p.species]}
                  </div>
                  {/* Level */}
                  <div style={{ fontSize: 7, color: C.textDim, fontWeight: 700, letterSpacing: 0.5 }}>
                    Lv. {p.level}
                  </div>
                  {/* HP bar */}
                  <div style={{ width: "88%", marginTop: 1 }}>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(0,0,0,0.45)",
                      overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: hpColor,
                        boxShadow: "0 0 4px rgba(255,255,255,0.3)" }} />
                    </div>
                    <div style={{ fontSize: 6.5, color: C.textDim, fontWeight: 700, textAlign: "center", marginTop: 1 }}>
                      {hp}/{p.maxHp}
                    </div>
                  </div>
                  {p.faintedAt && (inventory.revive || 0) > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); onRevive(p.uid); }}
                      style={{ position: "absolute", bottom: 3, right: 3, background: "linear-gradient(180deg, #c084fc, #a855f7)",
                        color: "#fff", border: "none", borderRadius: 5, padding: "1px 5px", fontSize: 6.5,
                        fontWeight: 900, letterSpacing: 0.5, cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(168,85,247,0.6)" }}>R</button>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



function BagRow({ icon, label, qty }: { icon: React.ReactNode; label: string; qty: number }) {
  return (
    <div className="flex items-center justify-between border-b py-1" style={{ borderColor: "var(--gb-darkest)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{icon} {label}</span><span>×{qty}</span>
    </div>
  );
}

function DPad({ onPress, onRelease }: { onPress: (d: Dir) => void; onRelease: (d: Dir) => void }) {
  const btn = (d: Dir, label: string, gridArea: string) => (
    <button aria-label={d}
      onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); onPress(d); }}
      onPointerUp={() => onRelease(d)} onPointerCancel={() => onRelease(d)} onPointerLeave={() => onRelease(d)}
      style={{ gridArea, background: "#222", color: "#eee", border: "none", width: 38, height: 38, fontSize: 11, boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.5)" }}>{label}</button>
  );
  return (
    <div style={{ display: "grid", gridTemplateAreas: `". up ." "left mid right" ". down ."`, gap: 0 }}>
      {btn("up", "▲", "up")}
      {btn("left", "◀", "left")}
      <div style={{ gridArea: "mid", background: "#222", width: 38, height: 38 }} />
      {btn("right", "▶", "right")}
      {btn("down", "▼", "down")}
    </div>
  );
}

function ActionButton({ label, onClick, variant = "default", sub }: { label: string; onClick: () => void; variant?: "default" | "primary" | "vip"; sub?: string }) {
  const bg =
    variant === "primary" ? "radial-gradient(circle at 30% 25%, #ff6b80, #a3243b 60%, #5c0f22)" :
    variant === "vip"     ? "radial-gradient(circle at 30% 25%, #fff3a0, #d4a017 55%, #6b4a08)" :
                            "radial-gradient(circle at 30% 25%, #7a4a4a, #3a1f1f 60%, #1a0a0a)";
  const color = variant === "vip" ? "#2a1a05" : "#fff";
  const ring = variant === "vip" ? "0 0 0 2px #f0c84a, 0 0 14px rgba(253,224,71,0.55)" : "0 0 0 2px rgba(0,0,0,0.5)";
  return (
    <div className="flex flex-col items-center" style={{ gap: 2 }}>
      <button onClick={onClick} className="gb-font"
        style={{ width: 46, height: 46, borderRadius: "50%", background: bg, color, border: "none",
          boxShadow: `${ring}, inset 0 -4px 0 rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.25), 0 3px 0 rgba(0,0,0,0.4)`,
          fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{label}</button>
      {sub && <span style={{ fontSize: 6, color: variant === "vip" ? "#fde047" : "#777", letterSpacing: 1 }}>{sub}</span>}
    </div>
  );
}

function PillButton({ label, onClick, sub }: { label: string; onClick: () => void; sub?: string }) {
  return (
    <button onClick={onClick} className="gb-font flex flex-col items-center" style={{ background: "transparent", border: "none", color: "#444" }}>
      <span style={{ background: "#3a3a3a", color: "#ddd", padding: "4px 10px", borderRadius: 10, fontSize: 8, boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.4)" }}>{label}</span>
      {sub && <span style={{ fontSize: 7, marginTop: 2 }}>{sub}</span>}
    </button>
  );
}

void calcMaxHp;

function RankedOverlay({ me, speciesGif, onClose }: {
  players: RemotePlayer[];
  me: { id: string; name: string; trainer_level: number; craft_points: number; leader_species: string | null };
  speciesGif: Record<string, string>;
  onClose: () => void;
}) {
  type Row = { id: string; name: string; trainer_level: number; craft_points: number; score: number; guild_name: string | null; leader_species: string | null; isMe?: boolean };
  const [rows, setRows] = useState<Row[]>([]);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [top, season] = await Promise.all([fetchTopRanked(50), fetchCurrentSeason()]);
      if (!active) return;
      const mapped: Row[] = (top as RankedRow[]).map((r) => ({
        id: r.user_id, name: r.username,
        trainer_level: r.trainer_level, craft_points: r.craft_points,
        score: r.score, guild_name: r.guild_name,
        leader_species: null,
        isMe: r.user_id === me.id,
      }));
      // garante que o jogador apareça mesmo se ainda não rankeou
      if (!mapped.some((r) => r.id === me.id)) {
        mapped.push({
          id: me.id, name: me.name,
          trainer_level: me.trainer_level, craft_points: me.craft_points,
          score: me.trainer_level * 100 + me.craft_points,
          guild_name: null, leader_species: me.leader_species, isMe: true,
        });
        mapped.sort((a, b) => b.score - a.score);
      }
      setRows(mapped);
      setEndsAt(season ? new Date(season.ends_at).getTime() : null);
      setLoading(false);
    };
    void load();
    const t = setInterval(load, 30_000);
    const c = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearInterval(t); clearInterval(c); };
  }, [me.id, me.name, me.trainer_level, me.craft_points, me.leader_species]);

  const myRank = rows.findIndex((r) => r.id === me.id) + 1;
  const remainMs = endsAt ? Math.max(0, endsAt - now) : 0;
  const hh = Math.floor(remainMs / 3_600_000);
  const mm = Math.floor((remainMs % 3_600_000) / 60_000);
  const ss = Math.floor((remainMs % 60_000) / 1000);
  const countdown = endsAt ? `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}` : "--:--:--";

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,12,28,0.94)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
      <div className="w-[92%] max-w-[440px] max-h-[92%] flex flex-col text-[8px] gb-font" style={{
        background: "linear-gradient(160deg,#2a1f0a 0%, #120a02 100%)",
        border: "3px solid #fbbf24", borderRadius: 14, color: "#fff",
        boxShadow: "0 18px 50px rgba(0,0,0,0.7), 0 0 30px #fbbf2455",
        overflow: "hidden",
      }}>
        <div style={{ background: "linear-gradient(135deg, #fbbf24 0%, #b45309 100%)", padding: "10px 12px", borderBottom: "2px solid rgba(0,0,0,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <div>
              <div className="name-font" style={{ fontSize: 13, letterSpacing: 1 }}>TOP RANKED</div>
              <div style={{ fontSize: 7, opacity: 0.9 }}>Seu rank: #{myRank || "-"} · Reset em {countdown}</div>
            </div>
          </div>
          <button onClick={onClose} className="gb-font" style={{ background: "rgba(0,0,0,0.4)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "2px 6px", fontSize: 8, borderRadius: 4 }}>X</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {loading && <div style={{ textAlign: "center", padding: 20, opacity: 0.6 }}>Carregando...</div>}
          {!loading && rows.map((r, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
            const gif = r.leader_species ? speciesGif[r.leader_species] : null;
            return (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: r.isMe ? "linear-gradient(90deg, #fbbf2433, transparent)" : "rgba(255,255,255,0.04)",
                border: r.isMe ? "1px solid #fbbf2488" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "6px 8px",
              }}>
                <div style={{ width: 36, textAlign: "center", fontSize: i < 3 ? 16 : 9, fontWeight: 700, color: i < 3 ? "#fbbf24" : "#fff" }}>{medal}</div>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {gif ? <img src={gif} alt="" className="pixelated" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 16 }}>👤</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9 }}>{r.isMe && "★ "}{r.name}{r.guild_name ? ` · ⚔ ${r.guild_name}` : ""}</div>
                  <div style={{ fontSize: 7, opacity: 0.7 }}>💎 {r.craft_points} craft · score {r.score}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>Lv {r.trainer_level}</div>
                  <div style={{ fontSize: 6, opacity: 0.6 }}>TREINADOR</div>
                </div>
              </div>
            );
          })}
          {!loading && rows.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, opacity: 0.6 }}>Sem treinadores rankeados ainda.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AscensionAnimation({ pet }: { pet: PetInstance }) {
  if (!pet) return null;
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400/50 blur-[50px] animate-pulse rounded-full" />
        <div className="absolute inset-0">
           {[...Array(12)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-2 h-2 bg-white rounded-full animate-ping"
               style={{
                 left: `${50 + 40 * Math.cos(i * Math.PI / 6)}%`,
                 top: `${50 + 40 * Math.sin(i * Math.PI / 6)}%`,
                 animationDelay: `${i * 0.1}s`,
                 animationDuration: '2s'
               }}
             />
           ))}
        </div>
        <div className="relative animate-bounce text-center">
          <img 
            src={SPECIES_GIF[pet.species]} 
            className="w-32 h-32 pixelated filter brightness-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mx-auto" 
          />
          <div className="mt-2 bg-yellow-500 text-black px-4 py-1 rounded-full font-bold text-lg gb-font border-2 border-white shadow-xl whitespace-nowrap">
             ASCENSÃO +{Object.keys(pet.ascensionStats || {}).length > 0 ? "!!" : "!"}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodexOverlay({ slots, team, gold, crystal, onClose, onRegister, onClaim }: {
  slots: Record<string, boolean>;
  team: PetInstance[];
  gold: number;
  crystal: number;
  onClose: () => void;
  onRegister: (entryId: string, petUid: string) => void;
  onClaim: (cat: CodexCategory) => void;
}) {
  const [page, setPage] = useState(0);
  const entriesPerPage = 4;
  const totalPages = Math.ceil(CODEX_ENTRIES.length / entriesPerPage);
  const pageEntries = CODEX_ENTRIES.slice(page * entriesPerPage, (page + 1) * entriesPerPage);
  const completedCount = CODEX_ENTRIES.filter(e => slots[e.id]).length;
  
  // Determine category for the current page to handle rewards
  const pageCategory: CodexCategory = pageEntries[0]?.category || "starters";
  const isCategoryClaimed = slots[`claimed_${pageCategory}`];
  const isPageDone = pageEntries.every(e => slots[e.id]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Premium Album Modal */}
      <div 
        className="w-full h-full max-h-full sm:max-w-3xl lg:max-w-4xl bg-[#fdf8f0] border-[8px] sm:border-[12px] border-[#8b5e3c] sm:rounded-[40px] flex flex-col shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-300"
        style={{ 
          boxShadow: "0 0 0 4px #5d3a1a, 0 40px 80px rgba(0,0,0,0.8)",
          margin: "auto"
        }}
      >

        
        {/* Elegant Wood-like Header */}
        <div className="bg-[#8b5e3c] p-3 sm:p-5 flex justify-between items-center shadow-lg flex-shrink-0 relative">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <div className="bg-[#fdf8f0] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-inner border-2 border-[#5d3a1a] flex-shrink-0">
              <span className="text-xl sm:text-2xl">📖</span>
            </div>
            <div className="leading-tight overflow-hidden">
              <div className="text-sm sm:text-xl font-black tracking-tight text-[#fdf8f0] uppercase drop-shadow-md truncate">ÁLBUM CODEX</div>
              <div className="text-[7px] sm:text-[10px] text-[#fdf8f0]/80 font-bold uppercase tracking-widest truncate">Coleção de Figurinhas Premium</div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="poke-glow-red bg-red-600 hover:bg-red-700 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 border-white transition-all active:scale-90 shadow-xl flex-shrink-0 ml-2"
          >
            <span className="text-xl sm:text-2xl font-bold">✕</span>
          </button>
        </div>


        {/* Navigation & Progress Section */}
        <div className="px-4 sm:px-8 py-2 sm:py-3 bg-[#f5e9d3] flex flex-col gap-1 sm:gap-2 border-b-4 border-[#8b5e3c]/20 flex-shrink-0">
          <div className="flex justify-between items-end">
            <div className="text-[9px] sm:text-[12px] font-black text-[#8b5e3c] uppercase">Página {page + 1} de {totalPages}</div>
            <div className="text-[9px] sm:text-[12px] font-black text-[#8b5e3c] tracking-tighter">{completedCount} / {CODEX_ENTRIES.length} DESBLOQUEADOS</div>
          </div>
          
          <div className="w-full h-3 sm:h-4 bg-[#e6d5b8] rounded-full overflow-hidden border border-[#8b5e3c]/30 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#d97706] to-[#fbbf24] transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(217,119,6,0.5)]" 
              style={{ width: `${(completedCount / CODEX_ENTRIES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Stickers Area with Grid Layout */}
        <div className="flex-1 min-h-0 p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-3 sm:gap-y-6 overflow-y-auto relative custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-repeat pb-10">
          {pageEntries.map(entry => {
            const isRegistered = slots[entry.id];
            const availableInTeam = team.find(p => p.species === entry.species);
            
            return (
              <div 
                key={entry.id} 
                className={`relative flex flex-col items-center justify-between p-2 sm:p-5 rounded-[20px] sm:rounded-[40px] border-2 sm:border-4 transition-all duration-500 shadow-xl
                  ${isRegistered 
                    ? 'bg-white border-[#fbbf24] scale-100 poke-float' 
                    : 'bg-[#e6d5b8]/50 border-[#8b5e3c]/20 grayscale opacity-70 scale-95'}`}
                style={{ 
                  minHeight: "110px",
                  boxShadow: isRegistered ? "0 15px 30px rgba(251,191,36,0.3), inset 0 0 20px rgba(251,191,36,0.1)" : "none"
                }}
              >
                {/* Sticker Shine Effect */}
                {isRegistered && (
                  <div className="absolute inset-0 rounded-[18px] sm:rounded-[36px] overflow-hidden pointer-events-none">
                    <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-br from-transparent via-white/40 to-transparent rotate-45 animate-[shine-anim_4s_infinite]" />
                  </div>
                )}

                <div className={`flex-1 flex items-center justify-center p-1 sm:p-2 transition-all duration-700 ${isRegistered ? 'scale-110 sm:scale-125' : 'opacity-20 scale-90'}`}>
                  <img 
                    src={SPECIES_GIF[entry.species]} 
                    className="w-12 h-12 sm:w-20 sm:h-20 object-contain pixelated drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)]" 
                  />
                </div>
                
                <div className="w-full flex flex-col items-center gap-2 mt-2">
                  <div className={`text-[8px] sm:text-[11px] font-black text-center px-2 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider truncate w-full
                    ${isRegistered ? 'text-[#8b5e3c] bg-[#fbbf24]/20 border border-sm:border-2 border-[#fbbf24]/40' : 'text-[#8b5e3c]/40 bg-[#8b5e3c]/5'}`}>
                    {isRegistered ? SPECIES_NAME[entry.species] : "???"}
                  </div>
                  
                  {!isRegistered && availableInTeam && (
                    <button 
                      onClick={() => onRegister(entry.id, availableInTeam.uid)}
                      className="poke-glow poke-sheen bg-gradient-to-b from-[#fbbf24] to-[#d97706] hover:from-[#fcd34d] hover:to-[#b45309] text-white text-[8px] sm:text-[10px] font-black px-3 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg border sm:border-2 border-white transition-all transform hover:scale-105 active:scale-95 w-full whitespace-nowrap"
                    >
                      COLAR ✨
                    </button>
                  )}
                </div>
                
                {isRegistered && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[#fbbf24] drop-shadow-md">
                    <svg className="w-3 h-3 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation & Reward */}
        <div className="bg-[#f5e9d3] px-3 py-3 sm:px-10 sm:pt-5 sm:pb-7 border-t-4 border-[#8b5e3c]/20 flex items-center justify-between gap-2 sm:gap-6 flex-shrink-0">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 sm:border-4 transition-all active:scale-90 shadow-lg flex-shrink-0
              ${page === 0 ? 'bg-[#e6d5b8] border-[#8b5e3c]/10 text-[#8b5e3c]/30' : 'poke-sheen bg-gradient-to-b from-[#a06a3f] to-[#8b5e3c] border-[#5d3a1a] text-[#fdf8f0] hover:brightness-110'}`}
          >
            <span className="text-base sm:text-xl">◀</span>
          </button>

          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="text-[7px] sm:text-[10px] font-black text-[#8b5e3c]/60 uppercase tracking-widest mb-1 truncate">🎁 RECOMPENSA</div>
            <button 
              disabled={!isPageDone || isCategoryClaimed}
              onClick={() => onClaim(pageCategory)}
              className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-full border-2 sm:border-4 shadow-xl transition-all w-full max-w-[160px] justify-center
                ${isCategoryClaimed 
                  ? 'bg-green-100 border-green-500 text-green-700 opacity-80' 
                  : isPageDone 
                    ? 'poke-glow poke-sheen bg-gradient-to-b from-[#fcd34d] to-[#f59e0b] border-white text-[#8b5e3c] animate-bounce hover:scale-105 active:scale-95' 
                    : 'bg-[#e6d5b8] border-[#8b5e3c]/20 text-[#8b5e3c]/40'}`}
            >
              <span className="text-sm sm:text-2xl">{isCategoryClaimed ? '✓' : '🍬'}</span>
              <span className="text-[8px] sm:text-[12px] font-black tracking-tight truncate uppercase">
                {isCategoryClaimed ? 'RESGATADO' : 'RARE CANDY'}
              </span>
            </button>
          </div>

          <button 
            disabled={page === totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 sm:border-4 transition-all active:scale-90 shadow-lg flex-shrink-0
              ${page === totalPages - 1 ? 'bg-[#e6d5b8] border-[#8b5e3c]/10 text-[#8b5e3c]/30' : 'poke-sheen bg-gradient-to-b from-[#a06a3f] to-[#8b5e3c] border-[#5d3a1a] text-[#fdf8f0] hover:brightness-110'}`}
          >
            <span className="text-base sm:text-xl">▶</span>
          </button>
        </div>

        {/* Glossy Overlay */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>

      <style>{`
        @keyframes shine-anim {
          0% { left: -100%; top: -100%; }
          20% { left: 100%; top: 100%; }
          100% { left: 100%; top: 100%; }
        }
      `}</style>
    </div>
  );
}


