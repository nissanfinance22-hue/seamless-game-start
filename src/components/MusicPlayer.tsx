// Music player using real audio files served from CDN.
// Tracks crossfade when the map / battle state changes.
// Volume + mute lives in the in-game menu via "@/lib/musicControl".

import { useEffect, useRef } from "react";
import { subscribeMusic, getMusicState } from "@/lib/musicControl";

import townAsset from "@/assets/music/town.mp3.asset.json";
import fieldAsset from "@/assets/music/field.mp3.asset.json";
import wildBattleAsset from "@/assets/music/wild-battle.mp3.asset.json";
import gymBattleAsset from "@/assets/music/gym-battle.mp3.asset.json";

type TrackId = "town" | "field" | "wildBattle" | "gymBattle";

const TRACK_URLS: Record<TrackId, string> = {
  town: townAsset.url,
  field: fieldAsset.url,
  wildBattle: wildBattleAsset.url,
  gymBattle: gymBattleAsset.url,
};

// Maps that should use the "town" theme. Everything else gets "field".
const TOWN_MAPS = new Set<string>([
  "village", "viridian", "pkmart", "pkc", "labo",
]);

function pickTrack(mapId: string, inBattle: boolean, isTrainerBattle: boolean): TrackId {
  if (inBattle) return isTrainerBattle ? "gymBattle" : "wildBattle";
  return TOWN_MAPS.has(mapId) ? "town" : "field";
}

export function MusicPlayer({
  mapId,
  inBattle,
  isTrainerBattle = false,
}: {
  mapId: string;
  inBattle: boolean;
  isTrainerBattle?: boolean;
}) {
  // Map of trackId -> audio element. We keep them around to avoid re-fetching.
  const audiosRef = useRef<Partial<Record<TrackId, HTMLAudioElement>>>({});
  const currentRef = useRef<TrackId | null>(null);
  const unlockedRef = useRef(false);
  const desiredRef = useRef<TrackId>("field");
  const switchRef = useRef<() => void>(() => {});

  const desired = pickTrack(mapId, inBattle, isTrainerBattle);
  desiredRef.current = desired;

  // Lazily create audio elements (browsers require a user gesture to start audio).
  useEffect(() => {
    const ensureAudio = (id: TrackId) => {
      if (audiosRef.current[id]) return audiosRef.current[id]!;
      const a = new Audio(TRACK_URLS[id]);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      audiosRef.current[id] = a;
      return a;
    };

    const applyVolume = () => {
      const st = getMusicState();
      const target = st.muted ? 0 : st.volume;
      for (const [id, a] of Object.entries(audiosRef.current) as [TrackId, HTMLAudioElement][]) {
        a.volume = id === currentRef.current ? target : 0;
      }
    };

    const playDesired = () => {
      const id = desiredRef.current;
      const a = ensureAudio(id);
      currentRef.current = id;
      // Pause every other track.
      for (const [other, oa] of Object.entries(audiosRef.current) as [TrackId, HTMLAudioElement][]) {
        if (other !== id) { oa.pause(); oa.volume = 0; }
      }
      applyVolume();
      a.play().catch(() => { /* will retry on next gesture */ });
    };

    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      playDesired();
    };

    // Track changes are handled by a second effect; here we just react to
    // mute/volume updates from the menu.
    const unsub = subscribeMusic(() => applyVolume());

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);

    // Expose a "switch track" helper on the ref so the next effect can call it.
    switchRef.current = () => { if (unlockedRef.current) playDesired(); };

    return () => {
      unsub();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);


  // Switch tracks when desired changes.
  useEffect(() => {
    if (currentRef.current === desired) return;
    switchRef.current();
  }, [desired]);

  return null;
}
