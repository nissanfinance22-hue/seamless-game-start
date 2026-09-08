// Live admin runtime: custom-placed Pokémon spawns + reactive config hook.
// 100% client-side (localStorage), notifies via window events so the game
// reacts immediately without prop-drilling.

import { useEffect, useState } from "react";
import { getConfig, type AdminConfig, ADMIN_CONFIG_KEY } from "./adminStore";

const PLACED_KEY = "rubym.admin.placed.v2";
const EVT_PLACED = "rubym:placed";
const EVT_CONFIG = "rubym:config";

export type PlacedSpawn = {
  id: string;          // "placed-xxxx"
  mapId: string;
  x: number;
  y: number;
  species: string;     // fixed species — sempre o mesmo no respawn
  level: number;       // fixed level
  respawnMs: number;   // ms after kill to respawn
  killedAt: number | null;
  /** When true, this spawn is a Group Legendary: only visible to players in
   * a Party, with a unique aura, and synced via group_legendary_state. */
  groupLegendary?: boolean;
};

function read(): PlacedSpawn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLACED_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Partial<PlacedSpawn>[];
    return list.map((p) => ({
      id: p.id ?? `placed-${Math.random().toString(36).slice(2, 8)}`,
      mapId: p.mapId ?? "town",
      x: p.x ?? 0,
      y: p.y ?? 0,
      species: p.species ?? "caterpie",
      level: p.level ?? 5,
      respawnMs: p.respawnMs ?? 600_000,
      killedAt: p.killedAt ?? null,
      groupLegendary: p.groupLegendary ?? false,
    }));
  } catch { return []; }
}
function write(list: PlacedSpawn[]) {
  try {
    localStorage.setItem(PLACED_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVT_PLACED));
  } catch { /* ignore */ }
}

export function getPlaced(): PlacedSpawn[] { return read(); }

export function addPlaced(
  mapId: string,
  x: number,
  y: number,
  species: string,
  level: number,
  respawnMs: number,
  groupLegendary: boolean = false,
) {
  const list = read();
  list.push({
    id: `placed-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    mapId, x, y, species, level, respawnMs, killedAt: null, groupLegendary,
  });
  write(list);
}

export function markPlacedKilled(id: string) {
  const list = read();
  const it = list.find((p) => p.id === id);
  if (!it) return;
  it.killedAt = Date.now();
  write(list);
}

export function removePlaced(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function clearPlaced(mapId?: string) {
  write(mapId ? read().filter((p) => p.mapId !== mapId) : []);
}

export function notifyConfigChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT_CONFIG));
}

// React hook: subscribes to placed spawns + admin config in real-time.
export function useAdminLive() {
  const [config, setConfig] = useState<AdminConfig>(() => getConfig());
  const [placed, setPlacedState] = useState<PlacedSpawn[]>(() => read());

  useEffect(() => {
    const refreshCfg = () => setConfig(getConfig());
    const refreshPlaced = () => setPlacedState(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_CONFIG_KEY) refreshCfg();
      if (e.key === PLACED_KEY) refreshPlaced();
    };
    window.addEventListener(EVT_CONFIG, refreshCfg);
    window.addEventListener(EVT_PLACED, refreshPlaced);
    window.addEventListener("storage", onStorage);
    const iv = setInterval(() => { refreshCfg(); refreshPlaced(); }, 1500);
    return () => {
      window.removeEventListener(EVT_CONFIG, refreshCfg);
      window.removeEventListener(EVT_PLACED, refreshPlaced);
      window.removeEventListener("storage", onStorage);
      clearInterval(iv);
    };
  }, []);

  return { config, placed };
}
