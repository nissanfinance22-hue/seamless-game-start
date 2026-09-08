import { useEffect, useMemo, useState, type CSSProperties } from "react";
import imgLenha from "@/assets/materials/lenha.png";
import imgOuro from "@/assets/materials/ouro.png";
import imgPedra from "@/assets/materials/pedra.png";
import imgBronze from "@/assets/materials/bronze.png";
import imgFerro from "@/assets/materials/ferro.png";
import imgFibra from "@/assets/materials/fibra.png";
import imgSucata from "@/assets/materials/sucata.png";
import imgOleo from "@/assets/materials/oleo.png";
import imgPerola from "@/assets/materials/perola.png";
import imgMorango from "@/assets/materials/morango.png";
import imgChicote from "@/assets/materials/chicote.png";
import imgEscamas from "@/assets/materials/escamas.png";
import imgAgua from "@/assets/materials/agua.png";
import imgCrPrisma from "@/assets/materials/cristal-prisma.png";
import imgCrRed from "@/assets/materials/cristal-red.png";
import imgCrBlue from "@/assets/materials/cristal-blue.png";
import imgCrYellow from "@/assets/materials/cristal-yellow.png";
import imgCrGreen from "@/assets/materials/cristal-green.png";
import imgCrPurple from "@/assets/materials/cristal-purple.png";
import imgCogRed from "@/assets/materials/cogumelo-red.png";
import imgCogBrown from "@/assets/materials/cogumelo-brown.png";
import imgCogBlue from "@/assets/materials/cogumelo-blue.png";

export const MATERIALS_STORE_KEY = "rubymon.materials.v1";

export type MaterialId =
  | "lenha" | "ouro" | "pedra" | "bronze" | "ferro" | "fibra" | "sucata" | "oleo"
  | "perola" | "morango" | "chicote" | "escamas" | "agua"
  | "cr_prisma" | "cr_red" | "cr_blue" | "cr_yellow" | "cr_green" | "cr_purple"
  | "cog_red" | "cog_brown" | "cog_blue";

export type MaterialsStore = Record<MaterialId, number>;

const DEFAULT_STORE: MaterialsStore = {
  lenha: 0, ouro: 0, pedra: 0, bronze: 0, ferro: 0, fibra: 0, sucata: 0, oleo: 0,
  perola: 0, morango: 0, chicote: 0, escamas: 0, agua: 0,
  cr_prisma: 0, cr_red: 0, cr_blue: 0, cr_yellow: 0, cr_green: 0, cr_purple: 0,
  cog_red: 0, cog_brown: 0, cog_blue: 0,
};

export function loadMaterialsStore(): MaterialsStore {
  try {
    const r = localStorage.getItem(MATERIALS_STORE_KEY);
    if (!r) return { ...DEFAULT_STORE };
    const p = JSON.parse(r) as Partial<MaterialsStore>;
    return { ...DEFAULT_STORE, ...p };
  } catch { return { ...DEFAULT_STORE }; }
}
export function saveMaterialsStore(s: MaterialsStore) {
  try { localStorage.setItem(MATERIALS_STORE_KEY, JSON.stringify(s)); } catch {}
}

export type Mat = { id: MaterialId; name: string; img: string; desc: string };
const PRICE = 50;

export const MATERIALS: Mat[] = [
  { id: "lenha",     name: "Lenha",            img: imgLenha,   desc: "Toras de madeira boa. Base de toda construção." },
  { id: "ouro",      name: "Minério de Ouro",  img: imgOuro,    desc: "Pepitas brutas extraídas das minas profundas." },
  { id: "pedra",     name: "Pedra",            img: imgPedra,   desc: "Rocha bruta — pesada, sólida, indispensável." },
  { id: "bronze",    name: "Bronze",           img: imgBronze,  desc: "Liga quente, ideal para peças resistentes." },
  { id: "ferro",     name: "Ferro",            img: imgFerro,   desc: "Lingote de ferro forjado. O osso da forja." },
  { id: "fibra",     name: "Fibra",            img: imgFibra,   desc: "Talos vegetais trançados — leves e firmes." },
  { id: "sucata",    name: "Caixa de Sucata",  img: imgSucata,  desc: "Engrenagens e parafusos prontos para reuso." },
  { id: "oleo",      name: "Óleo (Oil)",       img: imgOleo,    desc: "Combustível bruto. Queima limpa, alimenta forjas." },
  { id: "perola",    name: "Pérola",           img: imgPerola,  desc: "Pérola marinha rara — brilho de lua submersa." },
  { id: "morango",   name: "Morango",          img: imgMorango, desc: "Fruta doce e suculenta, ótima em poções." },
  { id: "chicote",   name: "Chicote Verde",    img: imgChicote, desc: "Liana firme e flexível — corda viva da floresta." },
  { id: "escamas",   name: "Escamas",          img: imgEscamas, desc: "Escamas reluzentes de criaturas aquáticas." },
  { id: "agua",      name: "Água Purificada",  img: imgAgua,    desc: "Água destilada, base de elixires e poções." },
  { id: "cr_prisma", name: "Cristal Prismático", img: imgCrPrisma, desc: "Reflete todas as cores — raríssimo e poderoso." },
  { id: "cr_red",    name: "Cristal Vermelho", img: imgCrRed,    desc: "Pulsa com calor da chama — energia ardente." },
  { id: "cr_blue",   name: "Cristal Azul",     img: imgCrBlue,   desc: "Frio como o mar profundo — guarda a água." },
  { id: "cr_yellow", name: "Cristal Amarelo",  img: imgCrYellow, desc: "Crepita com faíscas — guarda a tempestade." },
  { id: "cr_green",  name: "Cristal Verde",    img: imgCrGreen,  desc: "Vivo como floresta — guarda a vida." },
  { id: "cr_purple", name: "Cristal Roxo",     img: imgCrPurple, desc: "Místico e sombrio — guarda o desconhecido." },
  { id: "cog_red",   name: "Cogumelo Vermelho",img: imgCogRed,   desc: "Cogumelo das clareiras — vivo e perigoso." },
  { id: "cog_brown", name: "Cogumelo Marrom",  img: imgCogBrown, desc: "Cogumelo de raiz — terroso e nutritivo." },
  { id: "cog_blue",  name: "Cogumelo Azul",    img: imgCogBlue,  desc: "Cogumelo luminescente — brilha no escuro." },
];

type Props = {
  onClose: () => void;
  crystal: number;
  spendCrystal: (n: number) => boolean;
};

const C = {
  sea: "#2a5e80",
  seaDark: "#143a55",
  seaDarker: "#0c2638",
  cream: "#f4ecd0",
  creamLight: "#fbf5dd",
  creamShade: "#d8c89a",
  ink: "#171018",
  red: "#b8362a",
  green: "#3d8a3a",
  crystal: "#7ecbe6",
  crystalDark: "#3a8fb8",
};

export function MercadorMateriaisOverlay({ onClose, crystal, spendCrystal }: Props) {
  const [store, setStore] = useState<MaterialsStore>(() => loadMaterialsStore());
  const [selectedId, setSelectedId] = useState<MaterialId>("lenha");
  const [flash, setFlash] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => { saveMaterialsStore(store); }, [store]);
  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 1600); return () => clearTimeout(t); }, [flash]);

  const quote = useMemo(() => [
    "Material bruto move o mundo, treinador.",
    "Tudo aqui custa 50 cristais. Sem regateio.",
    "Compre em peso, forje em paz.",
    "Sem lenha não há forja. Sem fibra não há corda.",
  ][Math.floor(Math.random() * 4)], []);

  const selected = MATERIALS.find(m => m.id === selectedId)!;
  const total = PRICE * qty;
  const ok = crystal >= total;

  const buy = (m: Mat, n: number) => {
    const cost = PRICE * n;
    if (crystal < cost) { setFlash("Cristais insuficientes."); return; }
    if (!spendCrystal(cost)) { setFlash("Cristais insuficientes."); return; }
    setStore((s) => ({ ...s, [m.id]: (s[m.id] ?? 0) + n }));
    setFlash(`✓ +${n} ${m.name}`);
  };

  const cream: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.seaDarker}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.18)`,
    borderRadius: 10,
    color: C.ink,
  };

  const tabBtn = (active: boolean): CSSProperties => ({
    ...cream,
    background: active
      ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`
      : `linear-gradient(180deg, ${C.sea}, ${C.seaDark})`,
    color: active ? C.ink : "#eaf3fb",
    padding: "8px 8px",
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer", fontSize: 11, fontWeight: 900, letterSpacing: 0.4,
    width: "100%", textAlign: "left",
    boxShadow: active
      ? `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.25)`
      : `inset 0 -2px 0 ${C.seaDarker}, 0 2px 0 rgba(0,0,0,0.25)`,
    textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
    transition: "transform 100ms, background 150ms",
    transform: active ? "translateX(2px)" : "translateX(0)",
    minHeight: 38,
  });

  const sectionTitle = (txt: string) => (
    <div style={{
      textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
      color: C.seaDarker, padding: "6px 0", borderBottom: `1px dashed ${C.seaDark}55`,
      marginBottom: 8,
    }}>{txt}</div>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{
        background: "rgba(6,18,30,0.5)",
        transition: "opacity 220ms ease",
        opacity: opened ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="gb-font flex flex-col"
        style={{
          width: "min(820px, calc(100vw - 16px))",
          height: "min(500px, calc(100vh - 18px))",
          maxHeight: "94vh",
          background: `linear-gradient(180deg, ${C.sea} 0%, ${C.seaDark} 100%)`,
          border: `3px solid ${C.seaDarker}`,
          borderRadius: 14,
          boxShadow: `inset 0 0 0 2px ${C.cream}55, 0 18px 50px rgba(0,0,0,0.65)`,
          padding: 6,
          gap: 6,
          color: "#fff",
          transform: opened ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 240ms cubic-bezier(.2,.9,.3,1.2)",
          fontSize: 11,
          overflow: "hidden",
          fontFamily: '"Pixelify Sans", ui-monospace, monospace',
        }}
      >
        {/* HEADER */}
        <div style={{ ...cream, display: "flex", alignItems: "center", gap: 10, padding: "7px 10px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: `linear-gradient(180deg, ${C.creamShade}, ${C.cream})`,
            border: `2px solid ${C.seaDarker}`,
            display: "grid", placeItems: "center", flexShrink: 0, fontSize: 24,
          }}>🧔</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: C.seaDarker, letterSpacing: 1, lineHeight: 1 }}>
              MERCADOR GUSTAVO
            </div>
            <div style={{ fontSize: 9, color: C.ink, marginTop: 3, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {quote}
            </div>
          </div>
          <div style={{
            background: `linear-gradient(180deg, ${C.crystal}, ${C.crystalDark})`,
            color: C.ink, border: `2px solid ${C.seaDarker}`, borderRadius: 8,
            padding: "4px 9px", fontWeight: 900, fontSize: 11, flexShrink: 0,
          }}>💎 {crystal}</div>
          <button onClick={onClose} style={{
            background: C.seaDarker, color: C.cream,
            border: `2px solid ${C.ink}`, borderRadius: 8,
            padding: "5px 9px", cursor: "pointer", fontWeight: 900,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
          }}>X</button>
        </div>

        {/* BODY 3 COLUMNS */}
        <div className="merc-body" style={{ display: "grid", gridTemplateColumns: "190px minmax(0, 1fr) 180px", gap: 6, flex: 1, minHeight: 0 }}>
          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, overflow: "auto" }}>
            {MATERIALS.map((m) => {
              const active = selectedId === m.id;
              const have = store[m.id] ?? 0;
              return (
                <button key={m.id} onClick={() => { setSelectedId(m.id); setQty(1); }} style={tabBtn(active)}>
                  <span style={{
                    width: 28, height: 28, display: "grid", placeItems: "center",
                    background: active ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.18)",
                    border: `1px solid ${active ? C.seaDarker : "rgba(255,255,255,0.35)"}`,
                    borderRadius: 5, flexShrink: 0, overflow: "hidden",
                  }}>
                    <img src={m.img} alt="" style={{ width: 24, height: 24, objectFit: "contain", imageRendering: "pixelated" }} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 900,
                    background: active ? C.seaDarker : "rgba(0,0,0,0.25)",
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
                border: `2px solid ${C.seaDarker}`, borderRadius: 10,
                display: "grid", placeItems: "center", padding: 6,
                boxShadow: `inset 0 0 0 1px ${C.creamShade}`,
              }}>
                <img src={selected.img} alt={selected.name}
                  style={{ width: 82, height: 82, objectFit: "contain", imageRendering: "pixelated" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, lineHeight: 1.4, color: C.ink }}>{selected.desc}</div>
                <div style={{
                  marginTop: 8, fontSize: 10, color: C.seaDarker, fontWeight: 900, letterSpacing: 0.5,
                }}>
                  ESTOQUE: <span style={{ color: C.green }}>{store[selected.id] ?? 0}</span>
                </div>
                <div style={{
                  marginTop: 4, fontSize: 10, color: C.seaDarker, fontWeight: 900, letterSpacing: 0.5,
                }}>
                  PREÇO: <span style={{ color: C.crystalDark }}>💎 {PRICE}</span> por unidade
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
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.seaDarker, fontWeight: 900 }}>
                TOTAL: <span style={{ color: ok ? C.green : C.red }}>💎 {total}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            <div style={{ ...cream, padding: 7 }}>
              {sectionTitle("INVENTÁRIO")}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflow: "auto" }}>
                {MATERIALS.map(m => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                    border: `1px solid ${C.seaDark}66`, borderRadius: 6,
                    padding: "3px 6px", fontSize: 10, fontWeight: 800, color: C.ink,
                  }}>
                    <img src={m.img} alt="" style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated" }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                    <span style={{ color: C.seaDarker }}>{store[m.id] ?? 0}</span>
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
                border: `2px solid ${C.seaDarker}`, borderRadius: 8,
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
                color: C.seaDarker, textAlign: "center",
              }}>{flash}</div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <button onClick={onClose} style={{
          ...cream,
          margin: "0 auto",
          padding: "6px 22px",
          background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
          color: C.seaDarker, fontWeight: 800, letterSpacing: 2, fontSize: 10,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>◀ VOLTAR</button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .merc-body { grid-template-columns: 1fr !important; overflow-y: auto; }
        }
      `}</style>
    </div>
  );
}
