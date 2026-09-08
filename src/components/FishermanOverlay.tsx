import { useEffect, useMemo, useState, type CSSProperties } from "react";
import npcFishermanAsset from "@/assets/npc-fisherman.png.asset.json";
import rodAsset from "@/assets/items/fishing-rod.png.asset.json";
import hookAsset from "@/assets/items/fish-hook.png.asset.json";
import baitAsset from "@/assets/items/fish-bait.png.asset.json";

const npcFishermanSprite = npcFishermanAsset.url;
const imgRod = rodAsset.url;
const imgHook = hookAsset.url;
const imgBait = baitAsset.url;

export const FISHER_STORE_KEY = "rubymon.fisherman.v1";
export const CATERPIE_COUNTER_KEY = "rubymon.fisherman.caterpieCount.v1";

export type FisherStore = {
  rodOwned: boolean;
  hook: number;
  bait: number;
  claimed: boolean;
};
const DEFAULT_STORE: FisherStore = { rodOwned: false, hook: 0, bait: 0, claimed: false };

export function loadFisherStore(): FisherStore {
  try {
    const r = localStorage.getItem(FISHER_STORE_KEY);
    if (!r) return { ...DEFAULT_STORE };
    return { ...DEFAULT_STORE, ...(JSON.parse(r) as Partial<FisherStore>) };
  } catch { return { ...DEFAULT_STORE }; }
}
export function saveFisherStore(s: FisherStore) {
  try { localStorage.setItem(FISHER_STORE_KEY, JSON.stringify(s)); } catch {}
}
export function loadCaterpieCount(): number {
  try { return Number(localStorage.getItem(CATERPIE_COUNTER_KEY) ?? "0") || 0; } catch { return 0; }
}
export function bumpCaterpieCount() {
  try {
    const cur = loadCaterpieCount();
    localStorage.setItem(CATERPIE_COUNTER_KEY, String(cur + 1));
  } catch {}
}

export const FISHER_QUEST = { caterpieGoal: 30, goldCost: 10000 };

type ShopItemId = "hook" | "bait";
type ShopItem = { id: ShopItemId; name: string; img: string; price: number; desc: string };
const SHOP: ShopItem[] = [
  { id: "hook", name: "Anzol", img: imgHook, price: 1000, desc: "Anzol de aço temperado. Aumenta a chance de fisgada de pokémons aquáticos." },
  { id: "bait", name: "Isca",  img: imgBait, price: 500,  desc: "Isca viva preparada pelo pescador. Atrai cardumes raros para o anzol." },
];

const DIALOGUES = [
  "Ei, marujo! Os Caterpie estão dando sopa por aqui… traga 30 deles e eu te equipo!",
  "O mar de Viridian guarda peixes que ninguém vê. Mas sem vara, é só molhar o pé.",
  "Vara, anzol e isca: a santíssima trindade do pescador.",
  "Já cacei um Magikarp tão grande que virou Gyarados na minha frente, treinador!",
  "Caterpie viram lagarta, lagarta vira isca, isca vira peixe. Ciclo perfeito.",
];

const C = {
  blue: "#3b8bd6",
  blueDark: "#1f5a96",
  blueDarker: "#11385f",
  cream: "#fdf6e3",
  creamLight: "#fffaf0",
  creamShade: "#e6d8b5",
  ink: "#1a2438",
  green: "#3a8a3d",
  gold: "#d9a533",
  goldDark: "#8a6a1b",
  red: "#b8362a",
};

type Props = {
  onClose: () => void;
  gold: number;
  spendGold: (n: number) => boolean;
};

export function FishermanOverlay({ onClose, gold, spendGold }: Props) {
  const [store, setStore] = useState<FisherStore>(() => loadFisherStore());
  const [caterpieCount, setCaterpieCount] = useState<number>(() => loadCaterpieCount());
  const [opened, setOpened] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [tab, setTab] = useState<"quest" | "shop">("quest");
  const [line, setLine] = useState(() => DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)]);
  const [selectedId, setSelectedId] = useState<ShopItemId>("hook");
  const [qty, setQty] = useState(1);

  useEffect(() => { saveFisherStore(store); }, [store]);
  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 1800); return () => clearTimeout(t); }, [flash]);
  // re-read caterpie count when overlay opens / on focus
  useEffect(() => {
    const refresh = () => setCaterpieCount(loadCaterpieCount());
    window.addEventListener("focus", refresh);
    const i = setInterval(refresh, 2000);
    return () => { window.removeEventListener("focus", refresh); clearInterval(i); };
  }, []);

  const selected = useMemo(() => SHOP.find(s => s.id === selectedId)!, [selectedId]);
  const total = selected.price * qty;
  const canBuy = store.rodOwned && gold >= total;

  const goalMet = caterpieCount >= FISHER_QUEST.caterpieGoal;
  const canClaim = !store.rodOwned && goalMet && gold >= FISHER_QUEST.goldCost;

  const newLine = () => {
    let next = line;
    while (next === line) next = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
    setLine(next);
  };

  const claimRod = () => {
    if (store.rodOwned) { setFlash("Você já tem a vara!"); return; }
    if (!goalMet) { setFlash(`Faltam ${FISHER_QUEST.caterpieGoal - caterpieCount} Caterpie.`); return; }
    if (!spendGold(FISHER_QUEST.goldCost)) { setFlash("Gold insuficiente."); return; }
    setStore(s => ({ ...s, rodOwned: true, claimed: true }));
    setFlash("✓ VARA DE PESCA recebida! Agora você pode comprar anzóis e iscas.");
    setTab("shop");
  };

  const buy = (it: ShopItem, n: number) => {
    if (!store.rodOwned) { setFlash("Conclua a quest primeiro!"); return; }
    const cost = it.price * n;
    if (!spendGold(cost)) { setFlash("Gold insuficiente."); return; }
    setStore(s => ({ ...s, [it.id]: (s[it.id] as number) + n }));
    setFlash(`✓ +${n} ${it.name}`);
  };

  const cream: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.blueDarker}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.18)`,
    borderRadius: 10,
    color: C.ink,
  };

  const tabBtn = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: "8px 10px",
    background: active
      ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`
      : `linear-gradient(180deg, ${C.blue}, ${C.blueDark})`,
    color: active ? C.ink : "#fff",
    border: `2px solid ${C.blueDarker}`,
    borderRadius: 8,
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: 0.5,
    cursor: "pointer",
    boxShadow: active ? `inset 0 0 0 1px ${C.creamShade}` : `inset 0 -2px 0 ${C.blueDarker}`,
    textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
  });

  const sectionTitle = (txt: string) => (
    <div style={{
      textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
      color: C.blueDarker, padding: "6px 0", borderBottom: `1px dashed ${C.blueDark}55`,
      marginBottom: 8,
    }}>{txt}</div>
  );

  const progressPct = Math.min(100, (caterpieCount / FISHER_QUEST.caterpieGoal) * 100);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center"
      style={{
        background: "rgba(10,20,40,0.55)",
        backdropFilter: "blur(4px)",
        transition: "opacity 220ms ease",
        opacity: opened ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @media (max-width: 520px) {
          .fisher-quest-row { flex-direction: column; align-items: stretch !important; }
          .fisher-shop-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="gb-font flex flex-col"
        style={{
          width: "94%",
          height: "94%",
          maxWidth: 820,
          maxHeight: 520,
          background: `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
          border: `3px solid ${C.blueDarker}`,
          borderRadius: 14,
          boxShadow: `inset 0 0 0 2px ${C.cream}55, 0 18px 50px rgba(0,0,0,0.65)`,
          padding: 6, gap: 6, color: "#fff",
          transform: opened ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 240ms cubic-bezier(.2,.9,.3,1.2)",
          fontSize: 11, overflow: "hidden",
          fontFamily: '"Pixelify Sans", ui-monospace, monospace',
        }}
      >

        {/* HEADER */}
        <div style={{ ...cream, position: "relative", padding: "6px 44px 6px 7px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: `linear-gradient(180deg, ${C.creamShade}, ${C.cream})`,
              border: `2px solid ${C.blueDarker}`,
              display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden",
            }}>
              <img src={npcFishermanSprite} alt="Pescador" style={{ width: 36, height: 36, objectFit: "contain", imageRendering: "pixelated" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <div className="name-font" style={{ fontSize: 12, color: C.blueDarker, letterSpacing: 0.5, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
                  PESCADOR BARBOSA 🎣
                </div>
                <div style={{
                  background: `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`,
                  color: C.ink, border: `2px solid ${C.blueDarker}`, borderRadius: 6,
                  padding: "2px 6px", fontWeight: 900, fontSize: 10, whiteSpace: "nowrap", flexShrink: 0,
                }}>🪙 {gold.toLocaleString()}</div>
              </div>
              <div
                onClick={newLine}
                title="Nova fala"
                style={{
                  fontSize: 9, color: C.ink, marginTop: 3, opacity: 0.9, cursor: "pointer",
                  lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                "{line}"
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{
            position: "absolute", top: 6, right: 6,
            background: C.red, color: "#fff",
            border: `2px solid ${C.blueDarker}`, borderRadius: 8,
            width: 32, height: 32, display: "grid", placeItems: "center",
            cursor: "pointer", fontWeight: 900, fontSize: 14,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)", lineHeight: 1, zIndex: 2,
          }}>✕</button>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setTab("quest")} style={tabBtn(tab === "quest")}>📜 QUEST</button>
          <button onClick={() => setTab("shop")} style={tabBtn(tab === "shop")}>🛒 LOJA</button>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", ...cream, padding: 12 }}>
          {tab === "quest" && (
            <div>
              {sectionTitle("A PROVA DO PESCADOR")}
              <div className="fisher-quest-row" style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{
                  width: 120, height: 120, flexShrink: 0,
                  background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                  border: `2px solid ${C.blueDarker}`, borderRadius: 10,
                  display: "grid", placeItems: "center", padding: 6,
                }}>
                  <img src={imgRod} alt="Vara de Pesca" style={{ width: 100, height: 100, objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.blueDarker, letterSpacing: 0.5 }}>
                    VARA DE PESCA LENDÁRIA
                  </div>
                  <div style={{ fontSize: 10.5, lineHeight: 1.5, color: C.ink, marginTop: 6 }}>
                    Os Caterpie de Viridian fazem a melhor isca natural do mundo.
                    Capture <b>{FISHER_QUEST.caterpieGoal} Caterpie</b> e me traga{" "}
                    <b>{FISHER_QUEST.goldCost.toLocaleString()} de gold</b> — eu te entrego
                    a vara que pertenceu ao meu velho mestre.
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 900, color: C.blueDarker, marginBottom: 4 }}>
                      <span>🐛 CATERPIE</span>
                      <span style={{ color: goalMet ? C.green : C.red }}>{caterpieCount} / {FISHER_QUEST.caterpieGoal}</span>
                    </div>
                    <div style={{
                      height: 12, background: C.creamShade, borderRadius: 6,
                      border: `1px solid ${C.blueDarker}`, overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${progressPct}%`, height: "100%",
                        background: `linear-gradient(90deg, ${C.green}, #6cc06f)`,
                        transition: "width 300ms",
                      }} />
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 900, color: C.blueDarker }}>
                    <span>🪙 GOLD</span>
                    <span style={{ color: gold >= FISHER_QUEST.goldCost ? C.green : C.red }}>
                      {gold.toLocaleString()} / {FISHER_QUEST.goldCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                {store.rodOwned ? (
                  <div style={{
                    padding: "10px 16px", background: `linear-gradient(180deg, ${C.green}, #2c6b2f)`,
                    color: "#fff", fontWeight: 900, fontSize: 12, letterSpacing: 1,
                    border: `2px solid ${C.blueDarker}`, borderRadius: 10,
                    boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                  }}>✓ QUEST CONCLUÍDA — VARA OBTIDA</div>
                ) : (
                  <button
                    disabled={!canClaim}
                    onClick={claimRod}
                    style={{
                      padding: "12px 22px",
                      background: canClaim
                        ? `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`
                        : `linear-gradient(180deg, ${C.creamShade}, #9c8a5c)`,
                      color: C.ink, fontWeight: 900, fontSize: 12, letterSpacing: 1,
                      border: `2px solid ${C.blueDarker}`, borderRadius: 10,
                      boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                      cursor: canClaim ? "pointer" : "not-allowed",
                      textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                    }}
                  >
                    {!goalMet
                      ? `FALTAM ${FISHER_QUEST.caterpieGoal - caterpieCount} CATERPIE`
                      : gold < FISHER_QUEST.goldCost
                        ? "GOLD INSUFICIENTE"
                        : `🎣 RECEBER VARA (-${FISHER_QUEST.goldCost.toLocaleString()} GOLD)`}
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === "shop" && (
            <div>
              {sectionTitle(store.rodOwned ? "LOJA DO PESCADOR" : "🔒 LOJA BLOQUEADA — CONCLUA A QUEST")}
              <div className="fisher-shop-grid" style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr)", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {SHOP.map(it => {
                    const active = selectedId === it.id;
                    const have = store[it.id];
                    return (
                      <button key={it.id} onClick={() => { setSelectedId(it.id); setQty(1); }} style={{
                        ...cream,
                        background: active
                          ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`
                          : `linear-gradient(180deg, ${C.blue}, ${C.blueDark})`,
                        color: active ? C.ink : "#fff",
                        padding: "8px 8px",
                        display: "flex", alignItems: "center", gap: 6,
                        cursor: "pointer", fontSize: 11, fontWeight: 900, letterSpacing: 0.4,
                        textAlign: "left",
                        textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
                        opacity: store.rodOwned ? 1 : 0.6,
                      }}>
                        <span style={{
                          width: 28, height: 28, display: "grid", placeItems: "center",
                          background: active ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.18)",
                          border: `1px solid ${active ? C.blueDarker : "rgba(255,255,255,0.35)"}`,
                          borderRadius: 5, flexShrink: 0, overflow: "hidden",
                        }}>
                          <img src={it.img} alt="" style={{ width: 24, height: 24, objectFit: "contain", imageRendering: "pixelated" }} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 900,
                          background: active ? C.blueDarker : "rgba(0,0,0,0.25)",
                          color: active ? C.cream : "#fff",
                          padding: "1px 6px", borderRadius: 999, flexShrink: 0,
                        }}>{have}</span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 96, height: 96, flexShrink: 0,
                      background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                      border: `2px solid ${C.blueDarker}`, borderRadius: 10,
                      display: "grid", placeItems: "center", padding: 6,
                    }}>
                      <img src={selected.img} alt={selected.name}
                        style={{ width: 82, height: 82, objectFit: "contain", imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: C.blueDarker, letterSpacing: 0.5 }}>{selected.name.toUpperCase()}</div>
                      <div style={{ fontSize: 10.5, lineHeight: 1.4, color: C.ink, marginTop: 4 }}>{selected.desc}</div>
                      <div style={{ marginTop: 6, fontSize: 10, color: C.blueDarker, fontWeight: 900 }}>
                        PREÇO: <span style={{ color: C.goldDark }}>🪙 {selected.price}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    {sectionTitle("QUANTIDADE")}
                    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
                      {[1, 5, 10, 25].map((n) => (
                        <button key={n} onClick={() => setQty(n)}
                          style={{
                            ...cream,
                            padding: "6px 12px", fontWeight: 900, fontSize: 11,
                            background: qty === n
                              ? `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`
                              : `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                            color: C.ink, cursor: "pointer", minWidth: 44,
                          }}>x{n}</button>
                      ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.blueDarker, fontWeight: 900 }}>
                      TOTAL: <span style={{ color: canBuy ? C.green : C.red }}>🪙 {total.toLocaleString()}</span>
                    </div>
                    <button
                      disabled={!canBuy}
                      onClick={() => buy(selected, qty)}
                      style={{
                        marginTop: 10, width: "100%", padding: "10px 6px",
                        background: canBuy
                          ? `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`
                          : `linear-gradient(180deg, ${C.creamShade}, #9c8a5c)`,
                        color: C.ink, fontWeight: 900, letterSpacing: 1, fontSize: 11,
                        border: `2px solid ${C.blueDarker}`, borderRadius: 8,
                        boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                        cursor: canBuy ? "pointer" : "not-allowed",
                        textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                      }}
                    >
                      {!store.rodOwned ? "🔒 QUEST INCOMPLETA" : gold < total ? "GOLD INSUFICIENTE" : `🪙 COMPRAR x${qty}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {flash && (
            <div style={{
              marginTop: 10, padding: "6px 8px", fontSize: 10, fontWeight: 800,
              color: C.blueDarker, textAlign: "center",
              background: C.creamLight, border: `1px dashed ${C.blueDark}`, borderRadius: 6,
            }}>{flash}</div>
          )}
        </div>
      </div>
    </div>
  );
}
