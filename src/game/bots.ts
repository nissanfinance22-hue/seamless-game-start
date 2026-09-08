import { Species, Rarity } from "./systems";

export interface BotPlayer {
  id: string;
  name: string;
  avatarIdx: number;
  avatarHue: number;
  trainer_level: number;
  craft_points: number;
  leader_species: Species;
  leader_rarity: Rarity;
  map: string;
  x: number;
  y: number;
  dir: "up" | "down" | "left" | "right";
  isBot: boolean;
}

const BOT_NAMES = [
  "Lucas", "Gabriel", "Pedro", "Mateus", "Rafael", "Bruno", "Thiago", "Felipe",
  "Carlos", "Daniel", "Michael", "James", "Ethan", "Oliver", "Noah", "Liam",
  "Mason", "Jacob", "Logan", "Aiden", "Sophia", "Mia", "Ava", "Luna",
  "Helena", "Beatriz", "Isabela", "Larissa", "Renan", "Vitor",
];

// Apenas pokémon COMUNS (IDs precisam bater com SPECIES_GIF em index.tsx)
const COMMON_SPECIES: Species[] = [
  "bulbasaur", "charmander", "squirtle", "rattata_f",
] as unknown as Species[];

// Mapas onde os fake players podem aparecer
const SPAWN_MAPS: { map: string; xRange: [number, number]; yRange: [number, number] }[] = [
  { map: "viridian",        xRange: [300, 1400], yRange: [400, 1400] },
  { map: "village",         xRange: [180, 700],  yRange: [200, 900]  },
  { map: "route2",          xRange: [200, 900],  yRange: [200, 1200] },
  { map: "route3",          xRange: [180, 900],  yRange: [200, 900]  },
  { map: "forest",          xRange: [180, 900],  yRange: [200, 900]  },
  { map: "palletRoute",     xRange: [120, 900],  yRange: [200, 1700] },
  { map: "route22",         xRange: [200, 1400], yRange: [300, 900]  },
  { map: "forestCave",      xRange: [200, 900],  yRange: [200, 900]  },
  { map: "florestaSecreta", xRange: [200, 900],  yRange: [200, 900]  },
  { map: "eliteRoute",      xRange: [200, 900],  yRange: [200, 900]  },
  { map: "pkc",             xRange: [180, 600],  yRange: [180, 500]  },
  { map: "pkmart",          xRange: [180, 600],  yRange: [180, 500]  },
];

const TOTAL_BOTS = 30;
const DIRS = ["down", "up", "left", "right"] as const;

function pick<T>(arr: readonly T[], i?: number): T {
  return arr[(i ?? Math.floor(Math.random() * arr.length)) % arr.length];
}

export function generateBots(): BotPlayer[] {
  const bots: BotPlayer[] = [];
  for (let i = 0; i < TOTAL_BOTS; i++) {
    const spot = SPAWN_MAPS[i % SPAWN_MAPS.length];
    const level = 5 + Math.floor(Math.random() * 45); // 5-49 (níveis modestos)
    const species = pick(COMMON_SPECIES);
    const rarity: Rarity = Math.random() < 0.15 ? "uncommon" : "common";
    const x = spot.xRange[0] + Math.floor(Math.random() * (spot.xRange[1] - spot.xRange[0]));
    const y = spot.yRange[0] + Math.floor(Math.random() * (spot.yRange[1] - spot.yRange[0]));
    bots.push({
      id: `bot-${i}`,
      name: BOT_NAMES[i % BOT_NAMES.length],
      avatarIdx: Math.floor(Math.random() * 4),
      avatarHue: Math.floor(Math.random() * 360),
      trainer_level: level,
      craft_points: level * 20 + Math.floor(Math.random() * 200),
      leader_species: species,
      leader_rarity: rarity,
      map: spot.map,
      x,
      y,
      dir: pick(DIRS),
      isBot: true,
    });
  }
  return bots;
}

export const FAKE_PLAYERS = generateBots();
