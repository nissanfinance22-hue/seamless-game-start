import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

/**
 * Ascensão do Treinador — styled to match Capitão Navio overlay (same
 * 3-column layout: sidebar tabs, main panel, right column with the
 * Pokémon + required items), but using a bright orange palette instead
 * of mossy green.
 */

const KEY = "rubym.trainerTree.v1";
export const TRAINER_BUFFS_KEY = "rubym.trainerBuffs.v1";

export type TrainerBuffs = { xpPct: number; goldPct: number; capturePct: number };
export function loadTrainerBuffs(): TrainerBuffs {
  if (typeof window === "undefined") return { xpPct: 0, goldPct: 0, capturePct: 0 };
  try {
    const raw = localStorage.getItem(TRAINER_BUFFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xpPct: 0, goldPct: 0, capturePct: 0 };
}
function saveTrainerBuffs(b: TrainerBuffs) {
  try { localStorage.setItem(TRAINER_BUFFS_KEY, JSON.stringify(b)); } catch {}
}

type QuestKind = "battle" | "capture" | "puzzle" | "trainer" | "boss" | "event";
type Stats = {
  trainerLevel: number;
  caught: number;
  gold: number;
  crystal: number;
  capturePoints: number;
};
type Quest = {
  id: string;
  row: number;
  col: number;
  kind: QuestKind;
  title: string;
  goal: string;
  check: (s: Stats) => boolean;
  reward: { gold?: number; crystal?: number; capture?: number; xpPct?: number; goldPct?: number; capturePct?: number };
};

// ---------- GREEN + BROWN THEME ----------
const C = {
  ember:       "#5a9a3a", // primary forest green
  emberDark:   "#3d6b27",
  emberDarker: "#5a3a1c", // warm brown (borders / labels)
  emberDeep:   "#2a1808",
  cream:       "#f3e3bd",
  creamLight:  "#fbf2d5",
  creamShade:  "#d9c187",
  ink:         "#2a1808",
  red:         "#b8362a",
  blue:        "#2d6ea8",
  green:       "#86c94a", // brighter accent for "done"
  gold:        "#f5c542",
};

// ---------- ICON SET ----------
function TIcon({ type, size = 22 }: { type: string; size?: number }) {
  const common = {
    width: size, height: size, viewBox: "0 0 32 32",
    style: { display: "block", imageRendering: "pixelated" as const },
    shapeRendering: "crispEdges" as const,
  };
  const s = C.emberDarker;
  switch (type) {
    case "battle":
      return <svg {...common}><path d="M5 25l14-14 4 4L9 29z" fill="#b8362a" stroke={s} strokeWidth="2"/><path d="M22 5h5v5l-3 3-5-5z" fill={C.gold} stroke={s} strokeWidth="2"/></svg>;
    case "capture":
      return <svg {...common}><circle cx="16" cy="16" r="11" fill="#ef4444" stroke={s} strokeWidth="2"/><path d="M5 16h22" stroke={s} strokeWidth="2"/><circle cx="16" cy="16" r="3" fill={C.creamLight} stroke={s} strokeWidth="2"/></svg>;
    case "puzzle":
      return <svg {...common}><path d="M6 6h9v6h6v-6h5v9h-6v6h6v5h-9v-6h-6v6H6v-9h6v-6H6z" fill={C.ember} stroke={s} strokeWidth="2"/></svg>;
    case "trainer":
      return <svg {...common}><rect x="11" y="6" width="10" height="9" fill="#fcd9a0" stroke={s} strokeWidth="2"/><rect x="9" y="14" width="14" height="8" fill={C.ember} stroke={s} strokeWidth="2"/><rect x="13" y="22" width="6" height="6" fill={C.emberDark} stroke={s} strokeWidth="2"/></svg>;
    case "boss":
      return <svg {...common}><path d="M6 24l3-14h14l3 14-5 3h-10z" fill="#7f1d1d" stroke={s} strokeWidth="2"/><rect x="11" y="14" width="3" height="4" fill={C.gold}/><rect x="18" y="14" width="3" height="4" fill={C.gold}/></svg>;
    case "event":
    case "star":
      return <svg {...common}><path d="M16 3l4 9 9 1-7 6 2 10-8-5-8 5 2-10-7-6 9-1z" fill={C.gold} stroke={s} strokeWidth="2"/></svg>;
    case "pokeball":
      return <svg {...common}><circle cx="16" cy="16" r="12" fill={C.creamLight} stroke={s} strokeWidth="2"/><path d="M4 16a12 12 0 0 1 24 0" fill="#ef4444" stroke={s} strokeWidth="2"/><circle cx="16" cy="16" r="3.5" fill="#fff" stroke={s} strokeWidth="2"/></svg>;
    case "scroll":
      return <svg {...common}><rect x="7" y="6" width="18" height="20" fill={C.creamLight} stroke={s} strokeWidth="2"/><path d="M10 11h12M10 15h12M10 19h8" stroke={C.emberDarker} strokeWidth="2"/></svg>;
    case "gold":
      return <svg {...common}><circle cx="16" cy="16" r="11" fill={C.gold} stroke={s} strokeWidth="2"/><path d="M12 11h7M12 16h7M12 21h7" stroke={C.emberDarker} strokeWidth="2"/></svg>;
    case "crystal":
      return <svg {...common}><path d="M16 3l9 8-9 18-9-18z" fill="#67e8f9" stroke={s} strokeWidth="2"/><path d="M7 11h18M16 3v26" stroke="#bef0ff" strokeWidth="1.5"/></svg>;
    case "xp":
      return <svg {...common}><path d="M6 22l8-15 5 8 7-6-4 17z" fill={C.ember} stroke={s} strokeWidth="2"/></svg>;
    case "target":
      return <svg {...common}><circle cx="16" cy="16" r="12" fill="none" stroke={s} strokeWidth="2"/><circle cx="16" cy="16" r="7" fill="none" stroke={C.ember} strokeWidth="2"/><circle cx="16" cy="16" r="2.5" fill={C.red} stroke={s}/></svg>;
    case "tree":
      return <svg {...common}><rect x="14" y="18" width="4" height="10" fill={C.emberDeep}/><circle cx="16" cy="12" r="9" fill={C.ember} stroke={s} strokeWidth="2"/><circle cx="11" cy="14" r="5" fill={C.emberDark} stroke={s} strokeWidth="2"/><circle cx="21" cy="14" r="5" fill={C.emberDark} stroke={s} strokeWidth="2"/></svg>;
    case "crown":
      return <svg {...common}><path d="M5 22h22v5H5z" fill={C.gold} stroke={s} strokeWidth="2"/><path d="M5 22l2-10 5 5 4-9 4 9 5-5 2 10z" fill={C.ember} stroke={s} strokeWidth="2"/></svg>;
    default:
      return <svg {...common}><rect x="7" y="7" width="18" height="18" fill={C.gold} stroke={s} strokeWidth="2"/></svg>;
  }
}

const KIND_ICON: Record<QuestKind, string> = {
  battle: "battle", capture: "capture", puzzle: "puzzle",
  trainer: "trainer", boss: "boss", event: "event",
};

function buildQuests(): Quest[] {
  const Q = (id: string, row: number, col: number, kind: QuestKind, title: string, goal: string, check: Quest["check"], reward: Quest["reward"]): Quest =>
    ({ id, row, col, kind, title, goal, check, reward });
  return [
    Q("1-1", 1, 1, "battle",  "Primeira Batalha",  "Vença 3 batalhas",            (s) => s.trainerLevel >= 2,   { gold: 200,  xpPct: 1 }),
    Q("1-2", 1, 2, "capture", "Iniciante Caçador", "Capture 5 Pokémon",           (s) => s.caught >= 5,         { gold: 250,  capturePct: 1 }),
    Q("1-3", 1, 3, "puzzle",  "Aprendiz",          "Alcance Nível 3",              (s) => s.trainerLevel >= 3,   { gold: 300,  xpPct: 1 }),
    Q("1-4", 1, 4, "trainer", "Desafiante I",      "Acumule 100 Gold",             (s) => s.gold >= 100,         { crystal: 1, goldPct: 1 }),
    Q("1-5", 1, 5, "event",   "Estrela I",         "Conquiste 3 capture points",   (s) => s.capturePoints >= 3,  { gold: 300,  capturePct: 1 }),
    Q("2-1", 2, 1, "battle",  "Drop Raro",         "Cace até nível 5",             (s) => s.trainerLevel >= 5,   { gold: 400,  xpPct: 1 }),
    Q("2-2", 2, 2, "capture", "Colecionador",      "Capture 12 Pokémon",           (s) => s.caught >= 12,        { gold: 400,  capturePct: 2 }),
    Q("2-3", 2, 3, "puzzle",  "Explorador",        "Acumule 1 Cristal",            (s) => s.crystal >= 1,        { gold: 500,  xpPct: 2 }),
    Q("2-4", 2, 4, "trainer", "Caça Treinadores",  "Alcance Nível 7",              (s) => s.trainerLevel >= 7,   { gold: 600,  goldPct: 2 }),
    Q("2-5", 2, 5, "event",   "Estrela II",        "10 capture points",            (s) => s.capturePoints >= 10, { crystal: 2, capturePct: 2 }),
    Q("3-1", 3, 1, "boss",    "Sombra do Mato",    "Acumule 1000 Gold",            (s) => s.gold >= 1000,        { crystal: 3, goldPct: 2 }),
    Q("3-2", 3, 2, "battle",  "Chamas Vivas",      "Capture 25 Pokémon",           (s) => s.caught >= 25,        { gold: 900,  xpPct: 3 }),
    Q("3-3", 3, 3, "puzzle",  "Corrente Elétrica","Alcance Nível 10",              (s) => s.trainerLevel >= 10,  { crystal: 3, capturePct: 3 }),
    Q("3-4", 3, 4, "trainer", "Mestre em Treino",  "Acumule 3 Cristais",           (s) => s.crystal >= 3,        { gold: 1200, goldPct: 3 }),
    Q("3-5", 3, 5, "event",   "Estrela III",       "20 capture points",            (s) => s.capturePoints >= 20, { crystal: 3, capturePct: 3 }),
    Q("4-1", 4, 1, "boss",    "Pedras Antigas",    "Acumule 2500 Gold",            (s) => s.gold >= 2500,        { crystal: 5, goldPct: 3 }),
    Q("4-2", 4, 2, "battle",  "Maré Cheia",        "Capture 40 Pokémon",           (s) => s.caught >= 40,        { gold: 1500, xpPct: 4 }),
    Q("4-3", 4, 3, "puzzle",  "Gelo Eterno",       "Alcance Nível 15",             (s) => s.trainerLevel >= 15,  { crystal: 5, capturePct: 4 }),
    Q("4-4", 4, 4, "trainer", "Veterano",          "Acumule 5 Cristais",           (s) => s.crystal >= 5,        { gold: 2000, goldPct: 4 }),
    Q("4-5", 4, 5, "event",   "Estrela IV",        "35 capture points",            (s) => s.capturePoints >= 35, { crystal: 5, capturePct: 4 }),
    Q("5-1", 5, 1, "boss",    "Sombra Final",      "Nível 20",                     (s) => s.trainerLevel >= 20,  { crystal: 8, xpPct: 5 }),
    Q("5-2", 5, 2, "puzzle",  "Lua Cheia",         "Capture 60 Pokémon",           (s) => s.caught >= 60,        { crystal: 8, capturePct: 5 }),
    Q("5-3", 5, 3, "event",   "Coração Raro",      "Acumule 8 Cristais",           (s) => s.crystal >= 8,        { gold: 4000, goldPct: 5 }),
    Q("5-4", 5, 4, "trainer", "Lenda",             "Nível 25",                     (s) => s.trainerLevel >= 25,  { crystal: 10, goldPct: 5 }),
    Q("5-5", 5, 5, "event",   "Estrela Mestre",    "50 capture points",            (s) => s.capturePoints >= 50, { crystal: 10, capturePct: 5 }),
  ];
}

type Progress = { done: Record<string, boolean> };
function loadProgress(): Progress {
  if (typeof window === "undefined") return { done: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  return { done: {} };
}
function saveProgress(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

type Tab = "overview" | "tier1" | "tier2" | "tier3" | "tier4" | "tier5";
const TABS: { id: Tab; label: string; icon: string; row?: number }[] = [
  { id: "overview", label: "GERAL",     icon: "tree" },
  { id: "tier1",    label: "TIER I",    icon: "star", row: 1 },
  { id: "tier2",    label: "TIER II",   icon: "star", row: 2 },
  { id: "tier3",    label: "TIER III",  icon: "star", row: 3 },
  { id: "tier4",    label: "TIER IV",   icon: "star", row: 4 },
  { id: "tier5",    label: "MESTRE",    icon: "crown", row: 5 },
];

function playTone(kind: "open" | "tab" | "confirm" = "tab") {
  try {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const notes = kind === "open" ? [880, 1175, 1568] : kind === "confirm" ? [659, 988] : [1175];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    gain.connect(ctx.destination);
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      osc.connect(gain);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.12);
    });
    setTimeout(() => void ctx.close(), 420);
  } catch {}
}

export function TrainerTreeOverlay({
  onClose, stats, onReward,
}: {
  onClose: () => void;
  stats: Stats;
  onReward: (gold: number, crystal: number, capture: number) => void;
}) {
  const quests = useMemo(() => buildQuests(), []);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [buffs, setBuffs] = useState<TrainerBuffs>(() => loadTrainerBuffs());
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState<Quest | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => { playTone("open"); const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => saveProgress(progress), [progress]);

  const doneCount = Object.values(progress.done).filter(Boolean).length;
  const total = quests.length;
  const rank =
    doneCount >= 25 ? "MESTRE" :
    doneCount >= 18 ? "VETERANO" :
    doneCount >= 10 ? "EXPERIENTE" :
    doneCount >= 4  ? "INICIANTE" : "NOVATO";

  const chooseTab = (next: Tab) => { if (next !== tab) playTone("tab"); setTab(next); setSelected(null); };

  const claim = (q: Quest) => {
    if (progress.done[q.id]) return;
    if (!q.check(stats)) return;
    playTone("confirm");
    setProgress((p) => ({ done: { ...p.done, [q.id]: true } }));
    onReward(q.reward.gold ?? 0, q.reward.crystal ?? 0, q.reward.capture ?? 0);
    const nb: TrainerBuffs = {
      xpPct: buffs.xpPct + (q.reward.xpPct ?? 0),
      goldPct: buffs.goldPct + (q.reward.goldPct ?? 0),
      capturePct: buffs.capturePct + (q.reward.capturePct ?? 0),
    };
    setBuffs(nb); saveTrainerBuffs(nb);
  };

  if (typeof document === "undefined") return null;

  // cream panel
  const cream: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.emberDarker}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.18)`,
    borderRadius: 10,
    color: C.ink,
  };

  const tabBtn = (active: boolean): CSSProperties => ({
    ...cream,
    background: active
      ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`
      : `linear-gradient(180deg, ${C.ember}, ${C.emberDark})`,
    color: active ? C.ink : "#fff8e7",
    padding: "6px 6px",
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer", fontSize: 9, fontWeight: 900, letterSpacing: 0.4,
    width: "100%", textAlign: "left",
    boxShadow: active
      ? `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.25)`
      : `inset 0 -2px 0 ${C.emberDarker}, 0 2px 0 rgba(0,0,0,0.25)`,
    textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
    transition: "transform 100ms, background 150ms",
    transform: active ? "translateX(2px)" : "translateX(0)",
    minHeight: 32,
  });

  const sectionTitle = (txt: string) => (
    <div style={{
      textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
      color: C.emberDarker, padding: "6px 0", borderBottom: `1px dashed ${C.emberDark}55`,
      marginBottom: 8,
    }}>{txt}</div>
  );

  const tierRow = tab.startsWith("tier") ? Number(tab.replace("tier","")) : null;
  const tierQuests = tierRow ? quests.filter(q => q.row === tierRow) : [];
  const activeQuest = selected ?? tierQuests.find(q => !progress.done[q.id] && q.check(stats)) ?? tierQuests[0] ?? null;

  const body = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{
        background: "rgba(40,15,5,0.4)",
        transition: "opacity 220ms ease",
        opacity: opened ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="gb-font flex flex-col"
        style={{
          width: "min(720px, calc(100vw - 16px))", height: "min(430px, calc(100vh - 18px))", maxHeight: "94vh",
          background: `linear-gradient(180deg, ${C.ember} 0%, ${C.emberDark} 100%)`,
          border: `3px solid ${C.emberDarker}`,
          borderRadius: 14,
          boxShadow: `inset 0 0 0 2px ${C.cream}55, 0 18px 50px rgba(0,0,0,0.65)`,
          padding: 6,
          gap: 6,
          color: "#fff",
          transform: opened ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 240ms cubic-bezier(.2,.9,.3,1.2)",
          fontSize: 9.5,
          overflow: "hidden",
          fontFamily: '"Pixelify Sans", ui-monospace, monospace',
        }}
      >
        {/* ===== HEADER ===== */}
        <div style={{ ...cream, display: "flex", alignItems: "center", gap: 10, padding: "7px 10px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: `linear-gradient(180deg, ${C.creamShade}, ${C.cream})`,
            border: `2px solid ${C.emberDarker}`,
            display: "grid", placeItems: "center", flexShrink: 0,
          }}><TIcon type="tree" size={30} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: C.emberDarker, letterSpacing: 1, lineHeight: 1 }}>
              ASCENSÃO DO TREINADOR
            </div>
            <div style={{ fontSize: 9, color: C.ink, marginTop: 3, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Complete os desafios para evoluir seu legado · {rank}
            </div>
          </div>
          <div style={{ width: 34, height: 34, display: "grid", placeItems: "center", color: C.emberDarker, flexShrink: 0 }}>
            <TIcon type="crown" size={28} />
          </div>
          <button onClick={onClose} style={{
            background: C.emberDarker, color: C.cream,
            border: `2px solid ${C.ink}`, borderRadius: 8,
            padding: "5px 9px", cursor: "pointer", fontWeight: 900,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
          }}>X</button>
        </div>

        {/* ===== BODY 3 COLUMNS ===== */}
        <div className="trainer-body" style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr) 156px", gap: 6, flex: 1, minHeight: 0 }}>
          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => chooseTab(t.id)} style={tabBtn(active)}>
                  <span style={{
                    width: 18, height: 18, display: "grid", placeItems: "center",
                    background: active ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.18)",
                    border: `1px solid ${active ? C.emberDarker : "rgba(255,255,255,0.35)"}`,
                    borderRadius: 5, flexShrink: 0,
                  }}><TIcon type={t.icon} size={13} /></span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN PANEL */}
          <div style={{ ...cream, padding: 8, overflow: "auto", minWidth: 0 }}>
            {tab === "overview" && (
              <>
                {sectionTitle("VISÃO GERAL")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Stat icon="tree" label="Progresso" value={`${doneCount}/${total}`} />
                  <Stat icon="crown" label="Patente" value={rank} />
                  <Stat icon="xp" label="Bônus XP" value={`+${buffs.xpPct}%`} />
                  <Stat icon="gold" label="Bônus Gold" value={`+${buffs.goldPct}%`} />
                  <Stat icon="target" label="Bônus Captura" value={`+${buffs.capturePct}%`} />
                  <Stat icon="trainer" label="Nível" value={String(stats.trainerLevel)} />
                </div>
                <div style={{ marginTop: 10, fontSize: 10.5, lineHeight: 1.5, color: C.ink }}>
                  Selecione um <b>Tier</b> à esquerda para ver os desafios. Cada conquista garante
                  recompensas instantâneas e um <b style={{ color: C.emberDarker }}>bônus permanente</b>.
                </div>
              </>
            )}

            {tierRow && (
              <>
                <div className="name-font" style={{ fontSize: 13, color: C.emberDarker, letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>
                  DESAFIOS — TIER {tierRow}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                  {tierQuests.map((q) => {
                    const done = !!progress.done[q.id];
                    const ready = !done && q.check(stats);
                    const isSel = activeQuest?.id === q.id;
                    return (
                      <button key={q.id} onClick={() => setSelected(q)} style={{
                        position: "relative",
                        background: done
                          ? `linear-gradient(180deg, #86efac, ${C.green})`
                          : ready
                          ? `linear-gradient(180deg, ${C.gold}, ${C.ember})`
                          : `linear-gradient(180deg, ${C.creamShade}, #b39a64)`,
                        border: `2px solid ${isSel ? C.emberDeep : C.emberDarker}`,
                        borderRadius: 8, padding: "8px 4px",
                        cursor: "pointer",
                        boxShadow: isSel
                          ? `inset 0 0 0 2px ${C.gold}, 0 2px 0 rgba(0,0,0,0.3)`
                          : "0 2px 0 rgba(0,0,0,0.25)",
                        display: "grid", placeItems: "center", gap: 3,
                        opacity: !done && !ready ? 0.85 : 1,
                      }}>
                        <TIcon type={KIND_ICON[q.kind]} size={22} />
                        <div style={{ fontSize: 7.5, fontWeight: 900, color: C.ink, letterSpacing: 0.5 }}>{q.id}</div>
                        {done && (
                          <div style={{
                            position: "absolute", top: -5, right: -5, width: 16, height: 16,
                            background: C.green, color: "#fff", borderRadius: 999,
                            border: `2px solid ${C.emberDeep}`, fontSize: 9, fontWeight: 900,
                            display: "grid", placeItems: "center",
                          }}>✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {activeQuest && (
                  <div style={{ ...cream, padding: 8, marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, display: "grid", placeItems: "center" }}>
                        <TIcon type={KIND_ICON[activeQuest.kind]} size={28} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: C.emberDarker }}>{activeQuest.title}</div>
                        <div style={{ fontSize: 10, color: C.ink, marginTop: 2 }}>{activeQuest.goal}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN — Pokémon + required items + action */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            <div style={{ ...cream, padding: 7 }}>
              {sectionTitle("SEU POKÉMON")}
              <div style={{
                display: "grid", placeItems: "center",
                background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                border: `2px solid ${C.emberDark}`, borderRadius: 8,
                padding: 6, marginBottom: 4,
              }}>
                <TIcon type="pokeball" size={44} />
                <div style={{ fontSize: 10, fontWeight: 900, color: C.emberDarker, marginTop: 4, letterSpacing: 1 }}>
                  NV. {stats.trainerLevel}
                </div>
                <div style={{ fontSize: 8, color: C.ink, opacity: 0.85 }}>
                  {stats.caught} capturados
                </div>
              </div>
            </div>

            {(tab === "overview" || tierRow) && (
              <div style={{ ...cream, padding: 7 }}>
                {sectionTitle("ITENS NECESSÁRIOS")}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Need icon="gold" label="Gold" have={stats.gold} need={activeQuest?.reward.gold ? Math.max(activeQuest.reward.gold, 100) : 100} />
                  <Need icon="crystal" label="Cristal" have={stats.crystal} need={activeQuest?.reward.crystal ?? 1} />
                  <Need icon="target" label="Captura" have={stats.capturePoints} need={3} />
                  <Need icon="pokeball" label="Pokémon" have={stats.caught} need={5} />
                </div>

                {tierRow && activeQuest && (() => {
                  const done = !!progress.done[activeQuest.id];
                  const canClaim = !done && activeQuest.check(stats);
                  return (
                    <button
                      disabled={!canClaim}
                      onClick={() => claim(activeQuest)}
                      style={{
                        marginTop: 7, width: "100%",
                        padding: "8px 5px",
                        background: done
                          ? `linear-gradient(180deg, #86efac, ${C.green})`
                          : canClaim
                          ? `linear-gradient(180deg, ${C.gold}, ${C.ember})`
                          : `linear-gradient(180deg, ${C.creamShade}, #b39a64)`,
                        color: C.ink,
                        fontWeight: 900,
                        letterSpacing: 0.6,
                        fontSize: 9,
                        border: `2px solid ${C.emberDarker}`,
                        borderRadius: 6,
                        boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                        cursor: canClaim ? "pointer" : "not-allowed",
                        textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                      }}
                    >
                      {done ? "✓ CONCLUÍDO" : canClaim ? "REIVINDICAR" : "BLOQUEADO"}
                    </button>
                  );
                })()}
              </div>
            )}

            <div style={{ ...cream, padding: 7 }}>
              {sectionTitle("BUFFS")}
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 9, color: C.ink }}>
                <Buff icon="xp" label="XP" val={buffs.xpPct} />
                <Buff icon="gold" label="Gold" val={buffs.goldPct} />
                <Buff icon="target" label="Captura" val={buffs.capturePct} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <button onClick={onClose} style={{
          ...cream,
          margin: "0 auto",
          padding: "6px 22px",
          background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
          color: C.emberDarker, fontWeight: 800, letterSpacing: 2, fontSize: 10,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>◀ VOLTAR</button>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .trainer-body { grid-template-columns: 1fr !important; overflow-y: auto; }
        }
      `}</style>
    </div>
  );

  return createPortal(body, document.body);
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.45)",
      border: `1px solid ${C.creamShade}`, borderRadius: 8,
      padding: 8, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 25, height: 25, display: "grid", placeItems: "center", flexShrink: 0 }}><TIcon type={icon} size={22} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 9, color: C.emberDarker, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: 11, color: C.ink, fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

function Need({ icon, label, have, need }: { icon: string; label: string; have: number; need: number }) {
  const ok = have >= need;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "18px minmax(0,1fr) auto", alignItems: "center", gap: 4, color: C.ink }}>
      <span style={{ width: 18, height: 18, display: "grid", placeItems: "center" }}><TIcon type={icon} size={15} /></span>
      <span style={{ fontSize: 8.5, fontWeight: 800 }}>{label}</span>
      <span style={{
        minWidth: 40, textAlign: "center",
        padding: "2px 5px", fontSize: 8, fontWeight: 900,
        color: ok ? C.green : C.emberDeep,
        background: ok ? "#dcfce7" : "#fde6c8",
        border: `1px solid ${ok ? C.green : C.emberDark}`,
        borderRadius: 4,
      }}>{Math.min(have, need)}/{need}</span>
    </div>
  );
}

function Buff({ icon, label, val }: { icon: string; label: string; val: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 16, height: 16, display: "grid", placeItems: "center" }}><TIcon type={icon} size={13} /></span>
      <span style={{ flex: 1, fontWeight: 800 }}>{label}</span>
      <span style={{ fontWeight: 900, color: C.emberDarker }}>+{val}%</span>
    </div>
  );
}
