import { useEffect, useMemo, useState, type CSSProperties } from "react";
import imgMadeira from "@/assets/craft/madeira.png";
import imgPecas from "@/assets/craft/pecas.png";
import imgCorda from "@/assets/craft/corda.png";
import imgAncora from "@/assets/craft/ancora.png";
import imgCarta from "@/assets/craft/carta.png";
import imgCombustivel from "@/assets/craft/combustivel.png";

// Materiais do mercador (mesmos itens / mesmos ícones)
import imgLenha from "@/assets/materials/lenha.png";
import imgFibra from "@/assets/materials/fibra.png";
import imgFerro from "@/assets/materials/ferro.png";
import imgPedra from "@/assets/materials/pedra.png";
import imgBronze from "@/assets/materials/bronze.png";
import imgOleo from "@/assets/materials/oleo.png";
import imgChicote from "@/assets/materials/chicote.png";
import imgSucata from "@/assets/materials/sucata.png";

import {
  loadMaterialsStore,
  saveMaterialsStore,
  type MaterialId,
  type MaterialsStore,
} from "@/components/MercadorMateriaisOverlay";

export const CRAFT_STORE_KEY = "rubymon.craft.materials.v1";

export type CraftId = "madeira" | "pecas" | "cordas" | "ancora" | "combustivel" | "carta";

export type CraftStore = {
  items: Record<CraftId, number>;
};

const DEFAULT_STORE: CraftStore = {
  items: { madeira: 0, pecas: 0, cordas: 0, ancora: 0, combustivel: 0, carta: 0 },
};

export function loadCraftStore(): CraftStore {
  try {
    const r = localStorage.getItem(CRAFT_STORE_KEY);
    if (!r) return DEFAULT_STORE;
    const p = JSON.parse(r) as Partial<CraftStore>;
    return { items: { ...DEFAULT_STORE.items, ...(p.items ?? {}) } };
  } catch { return DEFAULT_STORE; }
}
export function saveCraftStore(s: CraftStore) {
  try { localStorage.setItem(CRAFT_STORE_KEY, JSON.stringify(s)); } catch {}
}
export function consumeCraftItem(id: CraftId, qty = 1): boolean {
  const s = loadCraftStore();
  if ((s.items[id] ?? 0) < qty) return false;
  s.items[id] -= qty;
  saveCraftStore(s);
  return true;
}

type Recipe = {
  id: CraftId;
  name: string;
  img: string;
  gold: number;
  cost: Partial<Record<MaterialId, number>>;
  desc: string;
};

// Receitas usam APENAS materiais que existem no Mercador Gustavo
const RECIPES: Recipe[] = [
  { id: "madeira",     name: "Madeira Reforçada", img: imgMadeira,     gold: 250, cost: { lenha: 6, fibra: 2 },        desc: "Tábuas grossas tratadas com seiva e fibras. Lenha vem das árvores que você corta." },
  { id: "pecas",       name: "Peças Metálicas",   img: imgPecas,       gold: 400, cost: { sucata: 2, ferro: 2 },       desc: "Engrenagens, parafusos e chapas forjadas a partir de sucata e ferro." },
  { id: "cordas",      name: "Cordas Trançadas",  img: imgCorda,       gold: 150, cost: { chicote: 3 },                desc: "Cordame vivo trançado a partir do CHICOTE VERDE dos Bulbasaur." },
  { id: "ancora",      name: "Âncora",            img: imgAncora,      gold: 800, cost: { ferro: 4, pedra: 3 },        desc: "Cada barco precisa da sua. Use uma vez." },
  { id: "combustivel", name: "Combustível",       img: imgCombustivel, gold: 200, cost: { oleo: 4 },                   desc: "Querosene marítimo refinado do óleo bruto." },
  { id: "carta",       name: "Carta Náutica",     img: imgCarta,       gold: 600, cost: { fibra: 3, bronze: 1 },       desc: "Pergaminho com selo de bronze. Autoriza donos de frota a navegar pelas rotas." },
];

type Props = { onClose: () => void; gold: number; spendGold: (n: number) => boolean };

const C = {
  sea: "#2a5e80",
  seaDark: "#143a55",
  seaDarker: "#0c2638",
  seaDeep: "#061826",
  cream: "#f4ecd0",
  creamLight: "#fbf5dd",
  creamShade: "#d8c89a",
  ink: "#171018",
  red: "#b8362a",
  green: "#3d8a3a",
  gold: "#d9b441",
  goldDark: "#b48a26",
};

const MAT_META: Record<MaterialId, { label: string; img?: string }> = {
  lenha:   { label: "Lenha",         img: imgLenha },
  fibra:   { label: "Fibra",         img: imgFibra },
  ferro:   { label: "Ferro",         img: imgFerro },
  pedra:   { label: "Pedra",         img: imgPedra },
  bronze:  { label: "Bronze",        img: imgBronze },
  oleo:    { label: "Óleo",          img: imgOleo },
  chicote: { label: "Chicote Verde", img: imgChicote },
  sucata:  { label: "Sucata",        img: imgSucata },
  // outros (não usados nas receitas, mas o tipo exige)
  ouro: { label: "Ouro" }, perola: { label: "Pérola" }, morango: { label: "Morango" },
  escamas: { label: "Escamas" }, agua: { label: "Água" },
  cr_prisma: { label: "Cristal" }, cr_red: { label: "Cristal" }, cr_blue: { label: "Cristal" },
  cr_yellow: { label: "Cristal" }, cr_green: { label: "Cristal" }, cr_purple: { label: "Cristal" },
  cog_red: { label: "Cogumelo" }, cog_brown: { label: "Cogumelo" }, cog_blue: { label: "Cogumelo" },
};

// Materiais mostrados na coluna "RECURSOS" (somente os que aparecem nas receitas)
const SHOWN_MATS: MaterialId[] = ["lenha", "fibra", "chicote", "ferro", "pedra", "bronze", "oleo", "sucata"];

export function VelhoDosMaresOverlay({ onClose, gold, spendGold }: Props) {
  const [craft, setCraft] = useState<CraftStore>(() => loadCraftStore());
  const [mats, setMats] = useState<MaterialsStore>(() => loadMaterialsStore());
  const [selectedId, setSelectedId] = useState<CraftId>("madeira");
  const [flash, setFlash] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => { saveCraftStore(craft); }, [craft]);
  useEffect(() => { saveMaterialsStore(mats); }, [mats]);
  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 1600); return () => clearTimeout(t); }, [flash]);

  const quote = useMemo(() => [
    "Os mares ensinam o que livros não dizem, jovem.",
    "Sem âncora, nenhum barco volta pra casa.",
    "Traga o chicote do Bulbasaur, faço corda firme.",
    "Junte os materiais. Eu trabalho a forja.",
  ][Math.floor(Math.random() * 4)], []);

  const selected = RECIPES.find(r => r.id === selectedId)!;
  const canPay = gold >= selected.gold;
  const canMats = Object.entries(selected.cost).every(([k, v]) =>
    (mats[k as MaterialId] ?? 0) >= (v ?? 0));
  const ok = canPay && canMats;

  const doCraft = (r: Recipe) => {
    if (gold < r.gold) { setFlash("Ouro insuficiente."); return; }
    for (const [k, v] of Object.entries(r.cost)) {
      if ((mats[k as MaterialId] ?? 0) < (v ?? 0)) {
        setFlash(`Faltam: ${MAT_META[k as MaterialId].label}`); return;
      }
    }
    if (!spendGold(r.gold)) { setFlash("Ouro insuficiente."); return; }
    const nextMats = { ...mats };
    for (const [k, v] of Object.entries(r.cost)) {
      nextMats[k as MaterialId] = (nextMats[k as MaterialId] ?? 0) - (v ?? 0);
    }
    setMats(nextMats);
    setCraft((s) => ({ items: { ...s.items, [r.id]: s.items[r.id] + 1 } }));
    setFlash(`✓ ${r.name} forjada!`);
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
          width: "min(780px, calc(100vw - 16px))",
          height: "min(470px, calc(100vh - 18px))",
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
          }}>🧓</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: C.seaDarker, letterSpacing: 1, lineHeight: 1 }}>
              VELHO DOS MARES
            </div>
            <div style={{ fontSize: 9, color: C.ink, marginTop: 3, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {quote}
            </div>
          </div>
          <div style={{
            background: `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`,
            color: C.ink, border: `2px solid ${C.seaDarker}`, borderRadius: 8,
            padding: "4px 9px", fontWeight: 900, fontSize: 11, flexShrink: 0,
          }}>💰 {gold}</div>
          <button onClick={onClose} style={{
            background: C.seaDarker, color: C.cream,
            border: `2px solid ${C.ink}`, borderRadius: 8,
            padding: "5px 9px", cursor: "pointer", fontWeight: 900,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
          }}>X</button>
        </div>

        {/* BODY 3 COLUMNS */}
        <div className="velho-body" style={{ display: "grid", gridTemplateColumns: "164px minmax(0, 1fr) 172px", gap: 6, flex: 1, minHeight: 0 }}>
          {/* SIDEBAR — recipe tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" }}>
            {RECIPES.map((r) => {
              const active = selectedId === r.id;
              const have = craft.items[r.id];
              return (
                <button key={r.id} onClick={() => setSelectedId(r.id)} style={tabBtn(active)}>
                  <span style={{
                    width: 28, height: 28, display: "grid", placeItems: "center",
                    background: active ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.18)",
                    border: `1px solid ${active ? C.seaDarker : "rgba(255,255,255,0.35)"}`,
                    borderRadius: 5, flexShrink: 0, overflow: "hidden",
                  }}>
                    <img src={r.img} alt="" style={{ width: 24, height: 24, objectFit: "contain", imageRendering: "pixelated" }} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
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
                width: 84, height: 84, flexShrink: 0,
                background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                border: `2px solid ${C.seaDarker}`, borderRadius: 10,
                display: "grid", placeItems: "center", padding: 6,
                boxShadow: `inset 0 0 0 1px ${C.creamShade}`,
              }}>
                <img src={selected.img} alt={selected.name} className="pixelated"
                  style={{ width: 70, height: 70, objectFit: "contain", imageRendering: "pixelated" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, lineHeight: 1.4, color: C.ink }}>{selected.desc}</div>
                <div style={{
                  marginTop: 8, fontSize: 10, color: C.seaDarker, fontWeight: 900, letterSpacing: 0.5,
                }}>
                  ESTOQUE FORJADO: <span style={{ color: C.green }}>{craft.items[selected.id]}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              {sectionTitle("CUSTO DE FORJA")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 6 }}>
                <CostRow emoji="💰" label="Ouro" have={gold} need={selected.gold} c={C} />
                {Object.entries(selected.cost).map(([k, v]) => {
                  const meta = MAT_META[k as MaterialId];
                  return (
                    <CostRow key={k} img={meta.img} label={meta.label}
                      have={mats[k as MaterialId] ?? 0} need={v ?? 0} c={C} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — recursos do mercador + ação */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            <div style={{ ...cream, padding: 7, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {sectionTitle("RECURSOS")}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, overflow: "auto" }}>
                {SHOWN_MATS.map(k => {
                  const meta = MAT_META[k];
                  return (
                    <div key={k} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                      border: `1px solid ${C.seaDark}66`, borderRadius: 6,
                      padding: "3px 6px", fontSize: 10, fontWeight: 800, color: C.ink,
                    }}>
                      {meta.img ? (
                        <img src={meta.img} alt="" style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated" }} />
                      ) : <span style={{ width: 16 }} />}
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.label}</span>
                      <span style={{ color: C.seaDarker }}>{mats[k] ?? 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              disabled={!ok}
              onClick={() => doCraft(selected)}
              style={{
                width: "100%", padding: "10px 6px",
                background: ok
                  ? `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`
                  : `linear-gradient(180deg, ${C.creamShade}, #9c8a5c)`,
                color: C.ink, fontWeight: 900, letterSpacing: 1, fontSize: 11,
                border: `2px solid ${C.seaDarker}`, borderRadius: 8,
                boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                cursor: ok ? "pointer" : "not-allowed",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {ok ? "🔨 FORJAR" : "BLOQUEADO"}
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
        @media (max-width: 860px) {
          .velho-body { grid-template-columns: 1fr !important; overflow-y: auto; }
        }
      `}</style>
    </div>
  );
}

function CostRow({ emoji, img, label, have, need, c }: { emoji?: string; img?: string; label: string; have: number; need: number; c: typeof C }) {
  const ok = have >= need;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: ok
        ? `linear-gradient(180deg, #e8f5d8, #d4ecb6)`
        : `linear-gradient(180deg, #fbe2dc, #f1c4b8)`,
      border: `1px solid ${c.seaDarker}`, borderRadius: 6,
      padding: "4px 7px", fontSize: 10, fontWeight: 800, color: c.ink,
    }}>
      {img ? (
        <img src={img} alt="" style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated" }} />
      ) : (
        <span style={{ width: 16, textAlign: "center" }}>{emoji}</span>
      )}
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ color: ok ? c.green : c.red, fontWeight: 900 }}>
        {Math.min(have, need)}/{need}
      </span>
    </div>
  );
}
