import { useEffect, useMemo, useState, type CSSProperties } from "react";
import apriRed from "@/assets/apricorn/red.png.asset.json";
import apriBlu from "@/assets/apricorn/blu.png.asset.json";
import apriGrn from "@/assets/apricorn/grn.png.asset.json";
import apriBlk from "@/assets/apricorn/blk.png.asset.json";
import apriWht from "@/assets/apricorn/wht.png.asset.json";
import apriYlw from "@/assets/apricorn/ylw.png.asset.json";
import apriGen from "@/assets/apricorn/pnk.png.asset.json";

import iconPokeball from "@/assets/icon-pokeball.png";
import iconGreatball from "@/assets/icon-greatball.png";

import iconFastball from "@/assets/icon-fastball.png";

export type ApricornId = "generic" | "red" | "blue" | "green" | "black" | "white" | "yellow";
export type KurtBallId = "pokeball" | "greatball" | "fastball";

export const KURT_STORE_KEY = "rubymon.kurt.apricorns.v2";
const MASTERY_XP = 500;

export type KurtStore = {
  apricorns: Record<ApricornId, number>;
  xp: number;
};

const DEFAULT_STORE: KurtStore = {
  apricorns: { generic: 12, red: 3, blue: 3, green: 0, black: 0, white: 0, yellow: 0 },
  xp: 0,
};

export function loadKurtStore(): KurtStore {
  try {
    const r = localStorage.getItem(KURT_STORE_KEY);
    if (!r) return DEFAULT_STORE;
    const p = JSON.parse(r) as Partial<KurtStore>;
    return {
      apricorns: { ...DEFAULT_STORE.apricorns, ...(p.apricorns ?? {}) },
      xp: typeof p.xp === "number" ? p.xp : 0,
    };
  } catch { return DEFAULT_STORE; }
}
export function saveKurtStore(s: KurtStore) {
  try { localStorage.setItem(KURT_STORE_KEY, JSON.stringify(s)); } catch {}
}

type BallRecipe = {
  id: string;
  name: string;
  ball: KurtBallId;
  yieldQty: number;
  gold: number;
  cost: Partial<Record<ApricornId, number>>;
  desc: string;
  xpReward: number;
  requiresXp?: number;
};

type ConvRecipe = {
  id: string;
  name: string;
  result: ApricornId;
  yieldQty: number;
  gold: number;
  cost: Partial<Record<ApricornId, number>>;
  desc: string;
  xpReward: number;
};

const APRICORNS: Record<ApricornId, { label: string; img: string; tint: string }> = {
  generic: { label: "Apricom Bruta", img: apriGen.url, tint: "#b07a3a" },
  red:     { label: "Vermelha",      img: apriRed.url, tint: "#c0392b" },
  blue:    { label: "Azul",          img: apriBlu.url, tint: "#2563eb" },
  green:   { label: "Verde",         img: apriGrn.url, tint: "#16a34a" },
  black:   { label: "Preta",         img: apriBlk.url, tint: "#1f1f1f" },
  white:   { label: "Branca",        img: apriWht.url, tint: "#f1f5f9" },
  yellow:  { label: "Amarela",       img: apriYlw.url, tint: "#eab308" },
};

const BALL_META: Record<KurtBallId, { name: string; icon: string }> = {
  pokeball:  { name: "Poké Ball",  icon: iconPokeball },
  greatball: { name: "Great Ball", icon: iconGreatball },
  fastball:  { name: "Fast Ball",  icon: iconFastball },
};

const BALL_RECIPES: BallRecipe[] = [
  { id: "poke",  name: "Poké Ball (Tradicional)", ball: "pokeball",  yieldQty: 1, gold: 80,  cost: { red: 2 },              desc: "Apricoms vermelhas tostadas em fogo de cedro. A receita tradicional de Kurt.", xpReward: 2 },
  { id: "great", name: "Great Ball",              ball: "greatball", yieldQty: 1, gold: 400, cost: { blue: 2 },             desc: "Apricoms azuis seladas com resina marinha. Captura aprimorada.",               xpReward: 5 },
  { id: "fast",  name: "Fast Ball",               ball: "fastball",  yieldQty: 1, gold: 650, cost: { white: 2, yellow: 1 }, desc: "Apricom branca leve e amarela solar. Ideal para Pokémon velozes.",            xpReward: 8, requiresXp: 500 },
];

const CONV_RECIPES: ConvRecipe[] = [
  { id: "to_red",    name: "Tingir Vermelha", result: "red",    yieldQty: 1, gold: 40,  cost: { generic: 2 }, desc: "Queima as apricoms brutas em brasa de carvalho. Resulta em apricom vermelha.", xpReward: 1 },
  { id: "to_blue",   name: "Tingir Azul",     result: "blue",   yieldQty: 1, gold: 80,  cost: { generic: 3 }, desc: "Imersão em água salgada por uma lua inteira. Surge a apricom azul.",        xpReward: 1 },
  { id: "to_green",  name: "Tingir Verde",    result: "green",  yieldQty: 1, gold: 120, cost: { generic: 3 }, desc: "Banho de seiva de bambu fresco. Apricom verde, calmante.",                    xpReward: 2 },
  { id: "to_yellow", name: "Tingir Amarela",  result: "yellow", yieldQty: 1, gold: 120, cost: { generic: 3 }, desc: "Curtida sob sol pleno até dourar. Resulta em apricom amarela.",              xpReward: 2 },
  { id: "to_white",  name: "Tingir Branca",   result: "white",  yieldQty: 1, gold: 180, cost: { generic: 4 }, desc: "Alvejada com cinzas sagradas. Apricom branca, leve e pura.",                  xpReward: 3 },
  { id: "to_black",  name: "Tingir Preta",    result: "black",  yieldQty: 1, gold: 200, cost: { generic: 4 }, desc: "Carbonizada em forja profunda. Apricom preta, densa e firme.",                xpReward: 3 },
];

type Props = {
  onClose: () => void;
  gold: number;
  spendGold: (n: number) => boolean;
  addBall: (id: KurtBallId, qty: number) => void;
};

const C = {
  red: "#9b1c1c", redDark: "#5b0e0e", redDeep: "#2a0606",
  ember: "#dc2626", crimson: "#b91c1c",
  cream: "#f5e6c8", creamLight: "#fdf6e0", creamShade: "#d4bf8a",
  ink: "#1a0f0a", gold: "#e0b145", goldDark: "#9c7a1c",
  green: "#3d8a3a", bamboo: "#6b8e23",
};

type Tab = "balls" | "apri";

export function KurtCraftOverlay({ onClose, gold, spendGold, addBall }: Props) {
  const [store, setStore] = useState<KurtStore>(() => loadKurtStore());
  const [tab, setTab] = useState<Tab>("balls");
  const [selectedBall, setSelectedBall] = useState<string>(BALL_RECIPES[0].id);
  const [selectedConv, setSelectedConv] = useState<string>(CONV_RECIPES[0].id);
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => { saveKurtStore(store); }, [store]);
  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 1800); return () => clearTimeout(t); }, [flash]);

  const quote = useMemo(() => [
    "As apricoms guardam segredos antigos. Traga-as, e farei pokébolas únicas.",
    "Forjo desde antes do seu avô nascer. Cada bola, uma história.",
    "Vermelha para a clássica. Azul para a profunda. Preta para a lendária.",
    "Paciência, jovem treinador. Boa forja não tem pressa.",
  ][Math.floor(Math.random() * 4)], []);

  const xp = store.xp;
  const mastered = xp >= MASTERY_XP;
  const xpPct = Math.min(100, (xp / MASTERY_XP) * 100);

  const selected: BallRecipe | ConvRecipe =
    tab === "balls"
      ? (BALL_RECIPES.find(r => r.id === selectedBall) ?? BALL_RECIPES[0])
      : (CONV_RECIPES.find(r => r.id === selectedConv) ?? CONV_RECIPES[0]);

  const selectedLocked = tab === "balls" && !!(selected as BallRecipe).requiresXp && xp < ((selected as BallRecipe).requiresXp ?? 0);
  const canPay = gold >= selected.gold;
  const canMats = Object.entries(selected.cost).every(([k, v]) =>
    (store.apricorns[k as ApricornId] ?? 0) >= (v ?? 0));
  const ok = canPay && canMats && !selectedLocked;

  const doCraft = () => {
    if (selectedLocked) { setFlash({ msg: "Receita ainda bloqueada.", ok: false }); return; }
    if (gold < selected.gold) { setFlash({ msg: "Ouro insuficiente.", ok: false }); return; }
    for (const [k, v] of Object.entries(selected.cost)) {
      if ((store.apricorns[k as ApricornId] ?? 0) < (v ?? 0)) {
        setFlash({ msg: `Faltam ${APRICORNS[k as ApricornId].label}.`, ok: false }); return;
      }
    }
    if (!spendGold(selected.gold)) { setFlash({ msg: "Ouro insuficiente.", ok: false }); return; }
    const next = { ...store.apricorns };
    for (const [k, v] of Object.entries(selected.cost)) next[k as ApricornId] -= (v ?? 0);

    if (tab === "balls") {
      const r = selected as BallRecipe;
      addBall(r.ball, r.yieldQty);
      setStore({ apricorns: next, xp: store.xp + r.xpReward });
      setFlash({ msg: `+${r.yieldQty} ${BALL_META[r.ball].name}!  (+${r.xpReward} XP)`, ok: true });
    } else {
      const r = selected as ConvRecipe;
      next[r.result] = (next[r.result] ?? 0) + r.yieldQty;
      setStore({ apricorns: next, xp: store.xp + r.xpReward });
      setFlash({ msg: `+${r.yieldQty} Apricom ${APRICORNS[r.result].label}!  (+${r.xpReward} XP)`, ok: true });
    }
  };

  const panel: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.redDark}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.22)`,
    borderRadius: 10, color: C.ink,
  };
  const sectionTitle = (txt: string) => (
    <div style={{ textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: 1.6,
      color: C.redDark, padding: "4px 0", borderBottom: `1px dashed ${C.crimson}66`,
      marginBottom: 6 }}>{txt}</div>
  );

  const TabBtn = ({ id, label, icon }: { id: Tab; label: string; icon: string }) => {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} style={{
        flex: 1, padding: "6px 8px",
        background: active ? `linear-gradient(180deg, ${C.gold}, ${C.ember})` : `linear-gradient(180deg, ${C.red}, ${C.redDark})`,
        color: active ? C.ink : "#fff8e7",
        border: `2px solid ${C.redDeep}`, borderRadius: 8, cursor: "pointer",
        fontSize: 10, fontWeight: 900, letterSpacing: 1,
        textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
        boxShadow: active ? `inset 0 0 0 1px ${C.cream}` : "0 2px 0 rgba(0,0,0,0.25)",
      }}>{icon} {label}</button>
    );
  };

  const list = tab === "balls" ? BALL_RECIPES : CONV_RECIPES;

  const renderSelectedHero = () => {
    if (tab === "balls") {
      const r = selected as BallRecipe;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={BALL_META[r.ball].icon} alt={r.ball} className="pixelated"
            style={{ width: 60, height: 60, objectFit: "contain", imageRendering: "pixelated",
              filter: selectedLocked ? "grayscale(1) opacity(0.5)" : "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }} />
          <div style={{ fontSize: 24, color: C.redDark, fontWeight: 900 }}>×{r.yieldQty}</div>
        </div>
      );
    }
    const r = selected as ConvRecipe;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={APRICORNS[r.result].img} alt={r.result}
          style={{ width: 60, height: 60, objectFit: "contain", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }} />
        <div style={{ fontSize: 24, color: C.redDark, fontWeight: 900 }}>×{r.yieldQty}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{ background: "rgba(20,5,5,0.62)", transition: "opacity 220ms", opacity: opened ? 1 : 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gb-font flex flex-col" style={{
        width: "min(760px, calc(100vw - 16px))", height: "min(490px, calc(100vh - 18px))", maxHeight: "94vh",
        background: `linear-gradient(180deg, ${C.red} 0%, ${C.redDark} 100%)`,
        border: `3px solid ${C.redDeep}`, borderRadius: 14,
        boxShadow: `inset 0 0 0 2px ${C.gold}55, 0 18px 50px rgba(0,0,0,0.7)`,
        padding: 6, gap: 6, color: "#fff", overflow: "hidden",
        transform: opened ? "translateY(0) scale(1)" : "translateY(22px) scale(0.96)",
        transition: "transform 260ms cubic-bezier(.2,.9,.3,1.2)",
        fontSize: 9.5, fontFamily: '"Pixelify Sans", ui-monospace, monospace',
      }}>
        {/* Header */}
        <div style={{ ...panel, display: "flex", alignItems: "center", gap: 10, padding: "7px 10px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, fontSize: 26,
            background: `linear-gradient(180deg, ${C.gold}, ${C.ember})`,
            border: `2px solid ${C.redDeep}`, display: "grid", placeItems: "center", flexShrink: 0,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}>⛩</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: C.redDark, letterSpacing: 1.2, lineHeight: 1 }}>
              MESTRE KURT · FORJA DE APRICOMS
            </div>
            <div style={{ fontSize: 8.5, color: C.ink, marginTop: 3, opacity: 0.82,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              “{quote}”
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 110 }}>
            <div style={{ fontSize: 8, color: C.redDark, fontWeight: 900, letterSpacing: 1 }}>
              FORJA XP · {xp}{mastered ? " ★ MESTRE" : `/${MASTERY_XP}`}
            </div>
            <div style={{ height: 8, background: "#3a1a0a", borderRadius: 4, overflow: "hidden", border: `1px solid ${C.redDeep}` }}>
              <div style={{
                width: `${xpPct}%`, height: "100%",
                background: mastered
                  ? `linear-gradient(90deg, ${C.gold}, #ffeb99, ${C.gold})`
                  : `linear-gradient(90deg, ${C.ember}, ${C.gold})`,
                transition: "width 300ms ease",
              }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px",
            background: `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`,
            border: `2px solid ${C.redDeep}`, borderRadius: 8, color: C.ink, fontWeight: 900, fontSize: 10 }}>
            💰 {gold.toLocaleString()}
          </div>
          <button onClick={onClose} style={{ background: C.redDeep, color: C.cream,
            border: `2px solid ${C.ink}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontWeight: 900,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)" }}>X</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          <TabBtn id="balls" label="POKÉBOLAS" icon="⚪" />
          <TabBtn id="apri" label="APRICOMS · QUEIMA" icon="🔥" />
        </div>

        {/* Body */}
        <div className="kurt-body" style={{ display: "grid", gridTemplateColumns: "160px minmax(0,1fr) 200px", gap: 6, flex: 1, minHeight: 0 }}>
          {/* Recipes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, overflow: "auto" }}>
            {list.map(r => {
              const isBall = tab === "balls";
              const active = isBall ? selectedBall === r.id : selectedConv === r.id;
              const haveAll = Object.entries(r.cost).every(([k, v]) => (store.apricorns[k as ApricornId] ?? 0) >= (v ?? 0)) && gold >= r.gold;
              const lock = isBall && !!(r as BallRecipe).requiresXp && xp < ((r as BallRecipe).requiresXp ?? 0);
              const icon = isBall ? BALL_META[(r as BallRecipe).ball].icon : APRICORNS[(r as ConvRecipe).result].img;
              return (
                <button key={r.id} onClick={() => isBall ? setSelectedBall(r.id) : setSelectedConv(r.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 7px",
                  background: active ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})` : `linear-gradient(180deg, ${C.red}, ${C.redDark})`,
                  color: active ? C.ink : "#fff8e7",
                  border: `2px solid ${C.redDeep}`, borderRadius: 8, cursor: "pointer",
                  fontSize: 9, fontWeight: 900, letterSpacing: 0.3, textAlign: "left",
                  boxShadow: active ? `inset 0 0 0 1px ${C.gold}` : `inset 0 -2px 0 ${C.redDeep}`,
                  textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
                  minHeight: 44, position: "relative", opacity: lock ? 0.7 : 1,
                }}>
                  <img src={icon} alt="" className="pixelated"
                    style={{ width: 24, height: 24, objectFit: "contain", imageRendering: "pixelated",
                      filter: lock ? "grayscale(1)" : "none", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ fontSize: 7.5, opacity: 0.88, fontWeight: 700, marginTop: 1 }}>
                      x{r.yieldQty} · {r.gold}g
                    </div>
                  </div>
                  {lock
                    ? <span style={{ position: "absolute", top: 3, right: 4, fontSize: 9 }}>🔒</span>
                    : haveAll && <span style={{ position: "absolute", top: 3, right: 4, fontSize: 8, color: active ? C.green : "#bbf7d0" }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Center detail */}
          <div style={{ ...panel, padding: 10, overflow: "auto", minWidth: 0 }}>
            {sectionTitle(tab === "balls" ? "POKÉBOLA SELECIONADA" : "QUEIMA SELECIONADA")}
            <div style={{ display: "grid", placeItems: "center",
              background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
              border: `2px solid ${C.crimson}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
              {renderSelectedHero()}
              <div style={{ fontSize: 12, fontWeight: 900, color: C.redDark, marginTop: 6, letterSpacing: 1 }}>{selected.name}</div>
              <div style={{ fontSize: 9, color: C.ink, marginTop: 2, textAlign: "center", lineHeight: 1.4, padding: "0 6px" }}>
                {selected.desc}
              </div>
              {selectedLocked && (
                <div style={{ marginTop: 6, padding: "3px 8px", borderRadius: 6,
                  background: C.redDeep, color: C.gold, fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>
                  🔒 RECEITA BLOQUEADA
                </div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${C.creamShade}`, borderRadius: 8, padding: 8 }}>
              <div style={{ fontSize: 9, color: C.redDark, fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>INGREDIENTES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
                {(Object.entries(selected.cost) as [ApricornId, number][]).map(([k, v]) => {
                  const have = store.apricorns[k] ?? 0;
                  const okMat = have >= v;
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 7px", background: okMat ? "#dcfce7" : "#fde6c8",
                      border: `1.5px solid ${okMat ? C.green : C.crimson}`, borderRadius: 6 }}>
                      <img src={APRICORNS[k].img} alt={APRICORNS[k].label}
                        style={{ width: 26, height: 26, objectFit: "contain", filter: okMat ? "none" : "grayscale(0.4)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 8.5, fontWeight: 900, color: C.ink, lineHeight: 1.1 }}>
                          {APRICORNS[k].label}
                        </div>
                        <div style={{ fontSize: 8.5, fontWeight: 900, color: okMat ? "#3d6b27" : C.redDark, marginTop: 1 }}>
                          {have}/{v}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 7px", background: canPay ? "#dcfce7" : "#fde6c8",
                  border: `1.5px solid ${canPay ? C.green : C.crimson}`, borderRadius: 6 }}>
                  <div style={{ width: 26, height: 26, display: "grid", placeItems: "center", fontSize: 18 }}>💰</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 8.5, fontWeight: 900, color: C.ink }}>Ouro</div>
                    <div style={{ fontSize: 8.5, fontWeight: 900, color: canPay ? "#3d6b27" : C.redDark, marginTop: 1 }}>
                      {gold}/{selected.gold}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button disabled={!ok} onClick={doCraft} style={{
              marginTop: 10, width: "100%", padding: "10px 5px",
              background: ok ? `linear-gradient(180deg, ${C.gold}, ${C.ember})` : `linear-gradient(180deg, ${C.creamShade}, #b39a64)`,
              color: C.ink, fontWeight: 900, letterSpacing: 1, fontSize: 11,
              border: `2px solid ${C.redDeep}`, borderRadius: 8,
              boxShadow: "0 3px 0 rgba(0,0,0,0.25)",
              cursor: ok ? "pointer" : "not-allowed",
              textShadow: "0 1px 0 rgba(255,255,255,0.35)",
            }}>{tab === "balls" ? "⚒ FORJAR" : "🔥 QUEIMAR"}</button>

            {flash && (
              <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 6,
                background: flash.ok ? "#dcfce7" : "#fde6c8",
                border: `1.5px solid ${flash.ok ? C.green : C.crimson}`,
                color: flash.ok ? "#1e5a14" : C.redDark,
                fontSize: 9.5, fontWeight: 900, textAlign: "center" }}>
                {flash.msg}
              </div>
            )}
          </div>

          {/* Right: apricorn inventory */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "auto" }}>
            <div style={{ ...panel, padding: 8 }}>
              {sectionTitle("SEUS APRICOMS")}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {(Object.keys(APRICORNS) as ApricornId[]).map(k => {
                  const a = APRICORNS[k];
                  const have = store.apricorns[k] ?? 0;
                  return (
                    <div key={k} style={{ display: "grid", gridTemplateColumns: "30px 1fr auto", alignItems: "center", gap: 6,
                      padding: "4px 6px", background: "#fff8e7",
                      border: `1.5px solid ${C.creamShade}`, borderRadius: 6 }}>
                      <img src={a.img} alt={a.label} style={{ width: 26, height: 26, objectFit: "contain" }} />
                      <span style={{ fontSize: 9, fontWeight: 800, color: C.ink }}>{a.label}</span>
                      <span style={{ minWidth: 26, textAlign: "center", padding: "2px 6px", fontSize: 9, fontWeight: 900,
                        color: C.ink, background: C.cream,
                        border: `1px solid ${C.creamShade}`, borderRadius: 4 }}>{have}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ ...panel, padding: 8 }}>
              {sectionTitle("DICA DO MESTRE")}
              <div style={{ fontSize: 8.5, color: C.ink, lineHeight: 1.5 }}>
                A <b style={{ color: C.redDark }}>Apricom Bruta</b> pode ser <b style={{ color: C.redDark }}>queimada</b> em outras cores. Forje muito para subir sua <b style={{ color: C.redDark }}>XP de Forja</b> e tornar-se um Mestre.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <button onClick={onClose} style={{
          ...panel, margin: "0 auto", padding: "6px 22px",
          background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
          color: C.redDark, fontWeight: 800, letterSpacing: 2, fontSize: 10,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        }}>◀ SAIR DA FORJA</button>
      </div>

      <style>{`@media (max-width: 860px) { .kurt-body { grid-template-columns: 1fr !important; overflow-y: auto; } }`}</style>
    </div>
  );
}
