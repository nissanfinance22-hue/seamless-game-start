import { useEffect, useMemo, useState, type CSSProperties } from "react";
import imgMorango from "@/assets/materials/morango.png";
import imgBuque from "@/assets/materials/buque.png";
import imgFlorRed from "@/assets/materials/flor-red.png";
import imgFlorBlue from "@/assets/materials/flor-blue.png";
import imgFlorPurple from "@/assets/materials/flor-purple.png";
import imgRareCandy from "@/assets/items/rare-candy.png";
import imgStarDust from "@/assets/items/star-dust.png";
import npcMoranguinhoAsset from "@/assets/npc-moranguinho.png.asset.json";
const npcMoranguinho = npcMoranguinhoAsset.url;
import { loadKurtStore, saveKurtStore } from "@/components/KurtCraftOverlay";

export const MORANG_STORE_KEY = "rubymon.moranguinho.v1";

export type MorangItemId = "morango" | "buque" | "flor_red" | "flor_blue" | "flor_purple" | "rare_candy" | "star_dust";
export type MorangStore = Record<MorangItemId, number>;
const DEFAULT_STORE: MorangStore = { morango: 0, buque: 0, flor_red: 0, flor_blue: 0, flor_purple: 0, rare_candy: 0, star_dust: 0 };

export function loadMorangStore(): MorangStore {
  try {
    const r = localStorage.getItem(MORANG_STORE_KEY);
    if (!r) return { ...DEFAULT_STORE };
    return { ...DEFAULT_STORE, ...(JSON.parse(r) as Partial<MorangStore>) };
  } catch { return { ...DEFAULT_STORE }; }
}
export function saveMorangStore(s: MorangStore) {
  try { localStorage.setItem(MORANG_STORE_KEY, JSON.stringify(s)); } catch {}
}

type Item = { id: MorangItemId; name: string; img: string; desc: string; price: number; xp: number };
const ITEMS: Item[] = [
  { id: "morango",     name: "Morango Doce",       img: imgMorango,    price: 50,  xp: 1, desc: "Colhido ao amanhecer. Doce como um primeiro beijo no campo de Pallet." },
  { id: "flor_red",    name: "Rosa Vermelha",      img: imgFlorRed,    price: 50,  xp: 2, desc: "Pétalas de fogo. Diz a lenda que floresce onde o coração de um treinador foi tocado." },
  { id: "flor_blue",   name: "Não-me-Esqueças",    img: imgFlorBlue,   price: 50,  xp: 2, desc: "Azul como o manto de Suicune. Eleva o espírito da forja." },
  { id: "flor_purple", name: "Violeta Mística",    img: imgFlorPurple, price: 50,  xp: 2, desc: "Brota nas trilhas onde os lendários já passaram. Misteriosa e perfumada." },
  { id: "buque",       name: "Buquê dos Campos",   img: imgBuque,      price: 150, xp: 8, desc: "Vermelha, azul e roxa entrelaçadas. O presente perfeito — e o melhor catalisador de forja." },
  { id: "rare_candy",  name: "Rare Candy",         img: imgRareCandy,  price: 50,  xp: 0, desc: "Doce raro que acelera a ascensão dos Pokémon de nível 100. Direto para sua mochila." },
  { id: "star_dust",   name: "Star Dust",          img: imgStarDust,   price: 50,  xp: 0, desc: "Pó estelar místico usado em rituais de ascensão. Vai direto para seus Capture Points." },
];

const DIALOGUES: string[] = [
  "Bem-vindo aos campos de Pallet, treinador… sente esse perfume? É o amor da terra.",
  "Ruby M não é só um jogo… é uma dimensão de cultura, cuidado e muita aventura.",
  "Os campos floridos guardam segredos antigos. Caminhe devagar, e eles falam.",
  "Dizem que SUICUNE corre pelas ilhas distantes… às vezes deixa pegadas em flores azuis.",
  "Quem cuida de uma flor, aprende a cuidar de um Pokémon. E quem cuida de um Pokémon, aprende a amar.",
  "Pokémons lendários não aparecem por sorte… aparecem para quem mantém o coração em flor.",
  "Eu colho morangos, mas o que mais cultivo é esperança.",
  "Leve um buquê na mochila. Floresta, mar e forja — tudo melhora com beleza.",
];

type Props = {
  onClose: () => void;
  crystal: number;
  spendCrystal: (n: number) => boolean;
  onBuyRareCandy?: (n: number) => void;
  onBuyStarDust?: (n: number) => void;
};

const C = {
  rose: "#e35a8e",
  roseDark: "#8a2447",
  roseDarker: "#5a142e",
  cream: "#fff3f0",
  creamLight: "#fffaf6",
  creamShade: "#f0d3c4",
  ink: "#2a121b",
  leaf: "#3d8a3a",
  red: "#b8362a",
  crystal: "#7ecbe6",
  crystalDark: "#3a8fb8",
};

export function MoranguinhoOverlay({ onClose, crystal, spendCrystal, onBuyRareCandy, onBuyStarDust }: Props) {
  const [store, setStore] = useState<MorangStore>(() => loadMorangStore());
  const [selectedId, setSelectedId] = useState<MorangItemId>("morango");
  const [flash, setFlash] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [qty, setQty] = useState(1);
  const [line, setLine] = useState(() => DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)]);

  useEffect(() => { saveMorangStore(store); }, [store]);
  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 1800); return () => clearTimeout(t); }, [flash]);

  const selected = useMemo(() => ITEMS.find(i => i.id === selectedId)!, [selectedId]);
  const total = selected.price * qty;
  const xpTotal = selected.xp * qty;
  const ok = crystal >= total;

  const buy = (it: Item, n: number) => {
    const cost = it.price * n;
    if (crystal < cost) { setFlash("Cristais insuficientes."); return; }
    if (!spendCrystal(cost)) { setFlash("Cristais insuficientes."); return; }
    if (it.id === "rare_candy") {
      onBuyRareCandy?.(n);
      setFlash(`✓ +${n} Rare Candy adicionado à mochila`);
      return;
    }
    if (it.id === "star_dust") {
      onBuyStarDust?.(n);
      setFlash(`✓ +${n} Star Dust adicionado aos Capture Points`);
      return;
    }
    setStore((s) => ({ ...s, [it.id]: (s[it.id] ?? 0) + n }));
    const k = loadKurtStore();
    const gained = it.xp * n;
    saveKurtStore({ ...k, xp: (k.xp ?? 0) + gained });
    setFlash(`✓ +${n} ${it.name}  ·  +${gained} XP Forja`);
  };

  const newLine = () => {
    let next = line;
    while (next === line) next = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
    setLine(next);
  };

  const cream: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.roseDarker}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.18)`,
    borderRadius: 10,
    color: C.ink,
  };

  const tabBtn = (active: boolean): CSSProperties => ({
    ...cream,
    background: active
      ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`
      : `linear-gradient(180deg, ${C.rose}, ${C.roseDark})`,
    color: active ? C.ink : "#fff",
    padding: "8px 8px",
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer", fontSize: 11, fontWeight: 900, letterSpacing: 0.4,
    width: "100%", textAlign: "left",
    boxShadow: active
      ? `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.25)`
      : `inset 0 -2px 0 ${C.roseDarker}, 0 2px 0 rgba(0,0,0,0.25)`,
    textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
    transition: "transform 100ms, background 150ms",
    transform: active ? "translateX(2px)" : "translateX(0)",
    minHeight: 38,
  });

  const sectionTitle = (txt: string) => (
    <div style={{
      textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
      color: C.roseDarker, padding: "6px 0", borderBottom: `1px dashed ${C.roseDark}55`,
      marginBottom: 8,
    }}>{txt}</div>
  );

  return (
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "rgba(40,10,20,0.5)",
        backdropFilter: "blur(4px)",
        padding: 6,
        transition: "opacity 220ms ease",
        opacity: opened ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="gb-font flex flex-col"
        style={{
          width: "94%",
          height: "94%",
          maxWidth: 860,
          maxHeight: 520,
          background: `linear-gradient(180deg, ${C.rose} 0%, ${C.roseDark} 100%)`,
          border: `3px solid ${C.roseDarker}`,
          borderRadius: 14,
          boxShadow: `inset 0 0 0 2px ${C.cream}55, 0 18px 50px rgba(0,0,0,0.65)`,
          padding: 5, gap: 5, color: "#fff",
          transform: opened ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 240ms cubic-bezier(.2,.9,.3,1.2)",
          fontSize: 10, overflow: "hidden",
          fontFamily: '"Pixelify Sans", ui-monospace, monospace',
        }}
      >
        {/* HEADER */}
        <div className="morang-header" style={{ ...cream, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", gap: 8, padding: "5px 7px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: `linear-gradient(180deg, ${C.creamShade}, ${C.cream})`,
            border: `2px solid ${C.roseDarker}`,
            display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden",
          }}>
            <img src={npcMoranguinho} alt="Moranguinho" style={{ width: 34, height: 34, objectFit: "contain", imageRendering: "pixelated" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 13, color: C.roseDarker, letterSpacing: 1, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              MORANGUINHO 🍓
            </div>
            <div
              onClick={newLine}
              title="Clique para nova fala"
              style={{
                fontSize: 9, color: C.ink, marginTop: 3, opacity: 0.9, cursor: "pointer",
                lineHeight: 1.2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              "{line}"
            </div>
          </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{
            background: `linear-gradient(180deg, ${C.crystal}, ${C.crystalDark})`,
            color: C.ink, border: `2px solid ${C.roseDarker}`, borderRadius: 8,
            padding: "4px 7px", fontWeight: 900, fontSize: 11, flexShrink: 0,
            whiteSpace: "nowrap",
          }}>💎 {crystal}</div>
          <button onClick={onClose} aria-label="Fechar" style={{
            background: C.roseDarker, color: C.cream,
            border: `2px solid ${C.ink}`, borderRadius: 8,
            width: 28, height: 28, display: "grid", placeItems: "center",
            cursor: "pointer", fontWeight: 900, fontSize: 12,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)", flexShrink: 0, lineHeight: 1,
          }}>✕</button>
          </div>
        </div>


        {/* BODY */}
        <div className="merc-body" style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr) 190px", gap: 6, flex: 1, minHeight: 0 }}>
          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, overflow: "auto" }}>
            {ITEMS.map((m) => {
              const active = selectedId === m.id;
              const have = store[m.id] ?? 0;
              return (
                <button key={m.id} onClick={() => { setSelectedId(m.id); setQty(1); }} style={tabBtn(active)}>
                  <span style={{
                    width: 28, height: 28, display: "grid", placeItems: "center",
                    background: active ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.18)",
                    border: `1px solid ${active ? C.roseDarker : "rgba(255,255,255,0.35)"}`,
                    borderRadius: 5, flexShrink: 0, overflow: "hidden",
                  }}>
                    <img src={m.img} alt="" style={{ width: 24, height: 24, objectFit: "contain", imageRendering: "pixelated" }} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 900,
                    background: active ? C.roseDarker : "rgba(0,0,0,0.25)",
                    color: active ? C.cream : "#fff",
                    padding: "1px 6px", borderRadius: 999, flexShrink: 0,
                  }}>{have}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN PANEL */}
          <div style={{ ...cream, padding: 10, overflow: "auto", minWidth: 0 }}>
            {sectionTitle(selected.name.toUpperCase())}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 96, height: 96, flexShrink: 0,
                background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                border: `2px solid ${C.roseDarker}`, borderRadius: 10,
                display: "grid", placeItems: "center", padding: 6,
                boxShadow: `inset 0 0 0 1px ${C.creamShade}`,
              }}>
                <img src={selected.img} alt={selected.name}
                  style={{ width: 82, height: 82, objectFit: "contain", imageRendering: "pixelated" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, lineHeight: 1.4, color: C.ink }}>{selected.desc}</div>
                <div style={{ marginTop: 8, fontSize: 10, color: C.roseDarker, fontWeight: 900, letterSpacing: 0.5 }}>
                  ESTOQUE: <span style={{ color: C.leaf }}>{store[selected.id] ?? 0}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 10, color: C.roseDarker, fontWeight: 900, letterSpacing: 0.5 }}>
                  PREÇO: <span style={{ color: C.crystalDark }}>💎 {selected.price}</span> · BÔNUS: <span style={{ color: C.leaf }}>+{selected.xp} XP Forja</span>
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
                        ? `linear-gradient(180deg, ${C.crystal}, ${C.crystalDark})`
                        : `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                      color: C.ink, cursor: "pointer", minWidth: 44,
                    }}>x{n}</button>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.roseDarker, fontWeight: 900 }}>
                TOTAL: <span style={{ color: ok ? C.leaf : C.red }}>💎 {total}</span> · <span style={{ color: C.leaf }}>+{xpTotal} XP</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 0, overflow: "hidden" }}>
            <div style={{ ...cream, padding: 7, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              {sectionTitle("CESTO")}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minHeight: 0, overflow: "auto" }}>
                {ITEMS.map(m => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                    border: `1px solid ${C.roseDark}55`, borderRadius: 6,
                    padding: "3px 6px", fontSize: 10, fontWeight: 800, color: C.ink,
                  }}>
                    <img src={m.img} alt="" style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                    <span style={{ color: C.roseDarker, flexShrink: 0 }}>{store[m.id] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={!ok}
              onClick={() => buy(selected, qty)}
              style={{
                width: "100%", padding: "10px 6px",
                background: ok
                  ? `linear-gradient(180deg, ${C.crystal}, ${C.crystalDark})`
                  : `linear-gradient(180deg, ${C.creamShade}, #9c8a5c)`,
                color: C.ink, fontWeight: 900, letterSpacing: 1, fontSize: 11,
                border: `2px solid ${C.roseDarker}`, borderRadius: 8,
                boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                cursor: ok ? "pointer" : "not-allowed",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {ok ? `💎 COMPRAR x${qty}` : "SEM CRISTAIS"}
            </button>

            {flash && (
              <div style={{
                ...cream, padding: "6px 8px", fontSize: 9.5, fontWeight: 800,
                color: C.roseDarker, textAlign: "center",
              }}>{flash}</div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 760px) {
          .merc-body { grid-template-columns: 1fr !important; overflow-y: auto; }
        }
        @media (max-width: 520px) {
          .merc-body { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .morang-header { gap: 5px !important; padding: 4px 5px !important; }
          .morang-header .name-font { font-size: 11px !important; }
        }
      `}</style>

    </div>
  );
}
