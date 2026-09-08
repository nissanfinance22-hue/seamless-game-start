// Floating in-game admin HUD. Only shown when admin is unlocked.
import { useEffect, useMemo, useState } from "react";
import { getConfig, saveConfig, isAdmin, pushLog } from "./adminStore";
import {
  addPlaced, clearPlaced, getPlaced, notifyConfigChanged,
  removePlaced, useAdminLive,
} from "./runtime";
import { SPECIES_BASE, type Species } from "@/game/systems";

type Pos = { mapId: string; x: number; y: number } | null;

function usePlayerPos(): Pos {
  const [p, setP] = useState<Pos>(null);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("rubym.save.v2");
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s?.pos && s?.mapId) setP({ mapId: s.mapId, x: s.pos.x, y: s.pos.y });
      } catch { /* ignore */ }
    };
    read();
    const iv = setInterval(read, 600);
    return () => clearInterval(iv);
  }, []);
  return p;
}

const SPECIES_LIST = Object.keys(SPECIES_BASE) as Species[];

export function AdminQuickBar() {
  const [admin, setAdmin] = useState(false);
  const [open, setOpen] = useState(true);
  const { config, placed } = useAdminLive();
  const pos = usePlayerPos();
  const [toast, setToast] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  // picker state
  const [pickSpecies, setPickSpecies] = useState<Species>("pikachu");
  const [pickLevel, setPickLevel] = useState(5);
  const [pickMin, setPickMin] = useState(10);

  useEffect(() => { setAdmin(isAdmin()); }, []);
  useEffect(() => {
    const iv = setInterval(() => setAdmin(isAdmin()), 1500);
    return () => clearInterval(iv);
  }, []);

  const placedHere = useMemo(
    () => placed.filter((p) => pos && p.mapId === pos.mapId),
    [placed, pos],
  );

  if (!admin) return null;

  const update = (patch: Partial<typeof config.admin>) => {
    saveConfig({ ...config, admin: { ...config.admin, ...patch } });
    notifyConfigChanged();
  };
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  const confirmSpawn = () => {
    if (!pos) return flash("Sem posição do jogador");
    const lvl = Math.max(1, Math.min(100, pickLevel));
    const ms = Math.max(5, Math.min(720, pickMin)) * 60_000;
    addPlaced(pos.mapId, pos.x, pos.y, pickSpecies, lvl, ms);
    pushLog({
      actor: "admin", action: "spawn_placed", target: pos.mapId,
      detail: `${pickSpecies} Lv${lvl} resp=${pickMin}m`,
    });
    flash(`✦ ${pickSpecies.toUpperCase()} Lv${lvl} fixado`);
    setPickerOpen(false);
  };

  const clearMap = () => {
    if (!pos) return;
    clearPlaced(pos.mapId);
    pushLog({ actor: "admin", action: "spawn_clear_map", target: pos.mapId });
    flash("Spawns removidos");
  };

  return (
    <div className="fixed left-2 top-2 z-[8500] flex flex-col items-start gap-1 font-sans select-none max-w-[calc(100vw-16px)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-fuchsia-400/60 bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-fuchsia-200 shadow-lg shadow-fuchsia-500/20 backdrop-blur"
      >
        {open ? "★ ADMIN ▾" : "★ ADMIN ▸"}
      </button>

      {open && (
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-fuchsia-500/30 bg-slate-950/85 p-1.5 shadow-xl backdrop-blur">
          <QBtn active={config.admin.invisible} onClick={() => update({ invisible: !config.admin.invisible })} label="👁 INVIS" />
          <QBtn active={config.admin.noclip} onClick={() => update({ noclip: !config.admin.noclip })} label="◇ NOCLIP" />
          <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900/70 px-1.5 py-0.5 text-[9px] text-amber-200">
            <span>⚡</span>
            <input type="range" min={0.5} max={5} step={0.5}
              value={config.admin.speed}
              onChange={(e) => update({ speed: Number(e.target.value) })}
              className="w-14 accent-fuchsia-500" />
            <span className="w-7 text-right">{config.admin.speed.toFixed(1)}×</span>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="rounded-md border border-emerald-400/50 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-100 hover:bg-emerald-500/25"
          >📍 SPAWN AQUI</button>
          <button
            onClick={() => setListOpen((v) => !v)}
            disabled={placedHere.length === 0}
            className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-200 hover:bg-amber-500/20 disabled:opacity-40"
          >📜 {placedHere.length}</button>
          <button
            onClick={clearMap}
            disabled={placedHere.length === 0}
            className="rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[10px] text-rose-200 hover:bg-rose-500/20 disabled:opacity-40"
          >✖ TUDO</button>
        </div>
      )}

      {listOpen && placedHere.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-slate-950/90 p-2 shadow-xl backdrop-blur text-[10px] text-slate-200 max-h-64 overflow-y-auto w-64">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-bold text-amber-200">Spawns em {pos?.mapId}</span>
            <button onClick={() => setListOpen(false)} className="text-slate-400 hover:text-slate-100">×</button>
          </div>
          {placedHere.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 border-t border-slate-800 py-1.5">
              <div className="min-w-0">
                <div className="text-amber-100 truncate">{p.species.toUpperCase()} Lv{p.level}</div>
                <div className="text-[9px] text-slate-500">({p.x},{p.y}) · respawn {Math.round(p.respawnMs/60000)}m {p.killedAt ? "· morto" : "· ativo"}</div>
              </div>
              <button
                onClick={() => { removePlaced(p.id); flash("Spawn deletado"); }}
                className="rounded border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-rose-200 hover:bg-rose-500/20"
              >Deletar</button>
            </div>
          ))}
        </div>
      )}

      {pickerOpen && (
        <div className="rounded-lg border border-emerald-500/40 bg-slate-950/95 p-3 shadow-xl backdrop-blur w-72 text-[11px] text-slate-200">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold text-emerald-200">Novo Spawn ({pos?.mapId})</span>
            <button onClick={() => setPickerOpen(false)} className="text-slate-400 hover:text-slate-100">×</button>
          </div>
          <label className="block mb-2">
            <span className="text-slate-400">Pokémon</span>
            <select value={pickSpecies} onChange={(e) => setPickSpecies(e.target.value as Species)}
              className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-amber-100">
              {SPECIES_LIST.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()} ({SPECIES_BASE[s].rarity})</option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 mb-2">
            <label className="flex-1">
              <span className="text-slate-400">Nível (1–100)</span>
              <input type="number" min={1} max={100} value={pickLevel}
                onChange={(e) => setPickLevel(Number(e.target.value))}
                className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-amber-100" />
            </label>
            <label className="flex-1">
              <span className="text-slate-400">Respawn (min)</span>
              <input type="number" min={1} max={720} value={pickMin}
                onChange={(e) => setPickMin(Number(e.target.value))}
                className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-amber-100" />
            </label>
          </div>
          <p className="mb-2 text-[10px] text-slate-500">
            Status balanceado automaticamente pelo nível. Sempre o mesmo Pokémon ao renascer.
          </p>
          <div className="flex gap-2">
            <button onClick={confirmSpawn}
              className="flex-1 rounded-md bg-emerald-500/80 px-3 py-1.5 font-bold text-slate-950 hover:bg-emerald-400">
              Criar
            </button>
            <button onClick={() => setPickerOpen(false)}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-100">
          {toast}
        </div>
      )}
    </div>
  );
}

function QBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-[10px] font-bold transition ${
        active
          ? "border-fuchsia-400/70 bg-fuchsia-500/25 text-fuchsia-50 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
          : "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

// also re-export so existing imports keep working
export { getPlaced };
