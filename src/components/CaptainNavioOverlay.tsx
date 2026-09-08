import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { loadCraftStore, saveCraftStore, type CraftId } from "@/components/VelhoDosMaresOverlay";
import imgMadeira from "@/assets/craft/madeira.png";
import imgPecas from "@/assets/craft/pecas.png";
import imgCorda from "@/assets/craft/corda.png";
import imgCarta from "@/assets/craft/carta.png";
import imgAncora from "@/assets/craft/ancora.png";
import imgCombustivel from "@/assets/craft/combustivel.png";



type Props = {
  onClose: () => void;
  playerName: string;
};

type Tab = "overview" | "build" | "materials" | "quests" | "fleet" | "voyage";

type SaveData = {
  progress: number;
  materials: Record<string, number>;
  missions: Record<string, boolean>;
  currentShip?: string | null;
};

const SAVE_KEY = "rubymon.captain.navio.v2";
const DEFAULT_SAVE: SaveData = {
  progress: 15,
  materials: { wood: 5, iron: 3, rope: 2, rubynail: 1, special: 0 },
  missions: {},
  currentShip: "raft",
};

function loadSave(): SaveData {
  try {
    const r = localStorage.getItem(SAVE_KEY);
    if (!r) return DEFAULT_SAVE;
    const parsed = JSON.parse(r) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      materials: { ...DEFAULT_SAVE.materials, ...(parsed.materials ?? {}) },
      missions: { ...DEFAULT_SAVE.missions, ...(parsed.missions ?? {}) },
    };
  }
  catch { return DEFAULT_SAVE; }
}
function persist(d: SaveData) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch {} }

type IconProps = { type: string; size?: number };

function MaritimeIcon({ type, size = 24 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    style: { display: "block", imageRendering: "pixelated" as const },
    shapeRendering: "crispEdges" as const,
  };
  const stroke = C.mossDarker;
  const wood = "#7b4a27";
  const woodDark = "#3b2415";
  const sail = C.creamLight;
  const gold = C.gold;
  const blue = C.blue;

  switch (type) {
    case "anchor":
      return <svg {...common}><path d="M15 5h2v19h-2zM11 8h10v3H11zM8 18h4v3H8zM20 18h4v3h-4z" fill={gold} stroke={stroke} /><path d="M7 18c1 6 5 9 9 9s8-3 9-9h-3c-1 4-3 6-6 6s-5-2-6-6z" fill="none" stroke={stroke} strokeWidth="2" /></svg>;
    case "hammer":
      return <svg {...common}><path d="M8 8h13l3 3-3 4H8z" fill={wood} stroke={woodDark} strokeWidth="2" /><path d="M14 15l3-3 10 10-3 3z" fill={C.creamShade} stroke={stroke} strokeWidth="2" /></svg>;
    case "crate":
      return <svg {...common}><rect x="6" y="9" width="20" height="17" fill="#9a642e" stroke={woodDark} strokeWidth="2" /><path d="M8 12h16M8 23h16M10 10l12 16M22 10L10 26" stroke="#d19b52" strokeWidth="2" /></svg>;
    case "scroll":
      return <svg {...common}><path d="M8 7h15v19H8z" fill={sail} stroke={stroke} strokeWidth="2" /><path d="M8 7c-4 0-4 6 0 6M23 26c4 0 4-6 0-6" fill="none" stroke={stroke} strokeWidth="2" /><path d="M12 13h7M12 18h8" stroke={C.mossDark} strokeWidth="2" /></svg>;
    case "sail":
      return <svg {...common}><path d="M15 5h3v19h-3z" fill={woodDark} /><path d="M18 6v13h9z" fill={sail} stroke={stroke} strokeWidth="2" /><path d="M14 10v10H5z" fill={C.creamShade} stroke={stroke} strokeWidth="2" /><path d="M5 23h22l-4 5H10z" fill={wood} stroke={woodDark} strokeWidth="2" /></svg>;
    case "map":
      return <svg {...common}><path d="M5 8l7-3 8 3 7-3v19l-7 3-8-3-7 3z" fill={sail} stroke={stroke} strokeWidth="2" /><path d="M12 5v19M20 8v19M9 14h5M18 17h6" stroke={C.mossDark} strokeWidth="2" /></svg>;
    case "rudder":
      return <svg {...common}><circle cx="16" cy="16" r="9" fill="none" stroke={stroke} strokeWidth="3" /><circle cx="16" cy="16" r="3" fill={gold} stroke={stroke} strokeWidth="2" /><path d="M16 2v9M16 21v9M2 16h9M21 16h9M6 6l6 6M20 20l6 6M26 6l-6 6M12 20l-6 6" stroke={stroke} strokeWidth="3" /></svg>;
    case "wood":
      return <svg {...common}><rect x="5" y="9" width="22" height="6" fill={wood} stroke={woodDark} strokeWidth="2" /><rect x="8" y="18" width="19" height="6" fill="#a86b32" stroke={woodDark} strokeWidth="2" /><path d="M10 12h8M13 21h8" stroke="#d29655" strokeWidth="2" /></svg>;
    case "iron":
      return <svg {...common}><path d="M9 10h14l3 5-5 8H11l-5-8z" fill="#9aa0a2" stroke="#444a4c" strokeWidth="2" /><path d="M12 14h8" stroke="#d7dcda" strokeWidth="2" /></svg>;
    case "rope":
      return <svg {...common}><path d="M8 10c8-8 22 4 12 12-8 7-20-3-12-9 5-4 12 2 7 6" fill="none" stroke="#b98a42" strokeWidth="4" /><path d="M8 10c8-8 22 4 12 12-8 7-20-3-12-9 5-4 12 2 7 6" fill="none" stroke={woodDark} strokeWidth="1" /></svg>;
    case "ruby":
      return <svg {...common}><path d="M16 4l10 8-10 16L6 12z" fill="#c83345" stroke="#6d1e27" strokeWidth="2" /><path d="M10 12h12M16 4v24" stroke="#ff9aa0" strokeWidth="2" opacity="0.8" /></svg>;
    case "special":
    case "star":
      return <svg {...common}><path d="M16 3l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill={gold} stroke={stroke} strokeWidth="2" /></svg>;
    case "gauge":
      return <svg {...common}><path d="M6 22a10 10 0 0 1 20 0" fill="none" stroke={stroke} strokeWidth="3" /><path d="M16 20l7-8" stroke={C.red} strokeWidth="3" /><rect x="13" y="21" width="6" height="4" fill={gold} stroke={stroke} /></svg>;
    case "raft":
      return <svg {...common}><path d="M5 20h22v5H5zM7 15h18v5H7z" fill={wood} stroke={woodDark} strokeWidth="2" /><path d="M10 14v12M16 14v12M22 14v12" stroke="#d29655" strokeWidth="2" /></svg>;
    case "ship":
      return <svg {...common}><path d="M6 17h20l-4 9H10z" fill={wood} stroke={woodDark} strokeWidth="2" /><rect x="11" y="10" width="10" height="7" fill={C.creamShade} stroke={stroke} strokeWidth="2" /><path d="M12 6h8l2 4H10z" fill={gold} stroke={stroke} strokeWidth="2" /></svg>;
    case "island":
      return <svg {...common}><path d="M5 24h22" stroke={blue} strokeWidth="3" /><path d="M9 23c2-5 12-5 14 0z" fill={gold} stroke={stroke} strokeWidth="2" /><path d="M16 20V8" stroke={woodDark} strokeWidth="3" /><path d="M16 8c-7 0-8 4-8 4 6 1 8-4 8-4zM16 8c7 0 8 4 8 4-6 1-8-4-8-4z" fill={C.green} stroke={stroke} strokeWidth="1" /></svg>;
    case "volcano":
      return <svg {...common}><path d="M7 26l8-18h4l7 18z" fill="#72523a" stroke={woodDark} strokeWidth="2" /><path d="M14 8h6l-2 5h-3z" fill={C.red} /><path d="M16 3l3 4h-6z" fill={gold} /></svg>;
    case "ice":
      return <svg {...common}><path d="M16 3l9 7v12l-9 7-9-7V10z" fill="#a9d7e7" stroke={blue} strokeWidth="2" /><path d="M16 3v26M7 10l18 12M25 10L7 22" stroke="#f4fbff" strokeWidth="2" /></svg>;
    case "wind":
      return <svg {...common}><path d="M5 12h16c5 0 5-6 0-6M7 18h19c4 0 4 5 0 5M5 24h11" fill="none" stroke={blue} strokeWidth="3" /></svg>;
    default:
      return <svg {...common}><rect x="7" y="7" width="18" height="18" fill={gold} stroke={stroke} strokeWidth="2" /></svg>;
  }
}

function CaptainBadge() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" shapeRendering="crispEdges" style={{ imageRendering: "pixelated", display: "block" }}>
      <rect x="10" y="11" width="14" height="15" rx="2" fill="#c78255" stroke={C.mossDarker} strokeWidth="2" />
      <path d="M8 11h18l-3-5H11z" fill={C.blue} stroke={C.mossDarker} strokeWidth="2" />
      <rect x="13" y="4" width="8" height="4" fill={C.creamLight} stroke={C.mossDarker} strokeWidth="1" />
      <rect x="12" y="17" width="3" height="2" fill={C.ink} /><rect x="20" y="17" width="3" height="2" fill={C.ink} />
      <path d="M14 23h7" stroke={C.ink} strokeWidth="2" />
      <path d="M10 27h14l3 6H7z" fill={C.mossDark} stroke={C.mossDarker} strokeWidth="2" />
    </svg>
  );
}

function playCaptainTone(kind: "open" | "tab" | "confirm" = "tab") {
  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const notes = kind === "open" ? [660, 880, 1175] : kind === "confirm" ? [523, 784] : [988];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    gain.connect(ctx.destination);
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + index * 0.055);
      osc.connect(gain);
      osc.start(now + index * 0.055);
      osc.stop(now + index * 0.055 + 0.12);
    });
    setTimeout(() => void ctx.close(), 420);
  } catch {}
}

const QUOTES = [
  "Vamos construir o melhor barco para suas aventuras!",
  "Os mares de RubyMon escondem segredos que poucos viram.",
  "Precisamos concluir esta embarcação para alcançar novas ilhas.",
  "Os ventos estão favoráveis hoje, treinador.",
  "Ouvi rumores sobre Pokémon raros ao sul.",
  "Seu barco está ficando impressionante.",
  "O oceano guarda muitos mistérios.",
];

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "GERAL", icon: "anchor" },
  { id: "build",    label: "BARCO", icon: "hammer" },
  { id: "materials", label: "CARGA", icon: "crate" },
  { id: "quests",   label: "MISSÕES", icon: "scroll" },
  { id: "fleet",    label: "FROTA", icon: "sail" },
  { id: "voyage",   label: "ROTAS", icon: "map" },
];

type Material = { id: CraftId; name: string; img: string; target: number };
const MATERIALS: Material[] = [
  { id: "madeira",     name: "Madeira Reforçada", img: imgMadeira,     target: 8 },
  { id: "pecas",       name: "Peças Metálicas",   img: imgPecas,       target: 6 },
  { id: "cordas",      name: "Cordas Trançadas",  img: imgCorda,       target: 4 },
  { id: "ancora",      name: "Âncora",            img: imgAncora,      target: 1 },
  { id: "combustivel", name: "Combustível",       img: imgCombustivel, target: 3 },
];

const MISSIONS = [
  { id: "m1", title: "Construção Naval",     desc: "Colete 50 Tábuas.",  reward: "+10% progresso" },
  { id: "m2", title: "Marinheiro Experiente", desc: "Derrote 20 Pokémon aquáticos.", reward: "Cordas x5" },
  { id: "m3", title: "Cartógrafo Perdido",    desc: "Encontre o Mapa Marítimo Antigo.", reward: "Rota destravada" },
  { id: "m4", title: "Fragmentos do Oceano",  desc: "Reúna 10 Fragmentos Aquáticos.", reward: "Prego de Aço x3" },
];


const ISLANDS = [
  { id: "coral",    name: "Ilha Coral",     icon: "island", req: 25 },
  { id: "rubi",     name: "Ilha Rubi",      icon: "ruby", req: 50 },
  { id: "vulcao",   name: "Ilha Vulcânica", icon: "volcano", req: 70 },
  { id: "gelo",     name: "Ilha Congelada", icon: "ice", req: 85 },
  { id: "lendaria", name: "Ilha Lendária",  icon: "star", req: 100 },
];

const BUILD_STAGES = [
  { pct: 0, label: "Barco inexistente" },
  { pct: 25, label: "Estrutura básica" },
  { pct: 50, label: "Casco montado" },
  { pct: 75, label: "Velas instaladas" },
  { pct: 100, label: "Barco completo" },
];

function boatStageName(p: number): string {
  if (p < 25) return "Barco inexistente";
  if (p < 50) return "Estrutura básica";
  if (p < 75) return "Casco montado";
  if (p < 100) return "Velas instaladas";
  return "Barco completo";
}
function boatLabel(p: number): string {
  if (p < 25) return "Madeira separada no estaleiro.";
  if (p < 50) return "Estrutura básica sendo montada.";
  if (p < 75) return "Casco montado e reforçado.";
  if (p < 100) return "Velas instaladas, faltam acabamentos.";
  return "Barco completo e pronto para zarpar!";
}

// ---------- THEME ----------
const C = {
  moss:        "#7c8f5a",
  mossDark:    "#5d6f44",
  mossDarker:  "#3f4d2c",
  cream:       "#e6e3c4",
  creamLight:  "#f1eed4",
  creamShade:  "#cfcb9b",
  ink:         "#2c3320",
  red:         "#b8362a",
  blue:        "#2d6ea8",
  green:       "#4a8a3a",
  gold:        "#c9a13a",
};

export function CaptainNavioOverlay({ onClose, playerName }: Props) {
  const [tab, setTab] = useState<Tab>("build");
  const [data, setData] = useState<SaveData>(() => loadSave());
  const [craftStore, setCraftStore] = useState(() => loadCraftStore());
  const [opened, setOpened] = useState(false);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  useEffect(() => {
    playCaptainTone("open");
    const t = setTimeout(() => setOpened(true), 10);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { persist(data); }, [data]);
  // reload crafted items whenever overlay regains focus / tab changes
  useEffect(() => { setCraftStore(loadCraftStore()); }, [tab]);

  const update = (fn: (d: SaveData) => SaveData) => setData((d) => fn({ ...d }));
  const chooseTab = (next: Tab) => {
    if (next !== tab) playCaptainTone("tab");
    setTab(next);
  };
  const matHave = (id: CraftId) => craftStore.items[id] ?? 0;
  const allMaterialsReady = MATERIALS.every((m) => matHave(m.id) >= m.target);
  const deliverMaterials = () => {
    if (!allMaterialsReady) return;
    playCaptainTone("confirm");
    const next = { ...craftStore, items: { ...craftStore.items } };
    MATERIALS.forEach((m) => { next.items[m.id] = Math.max(0, next.items[m.id] - m.target); });
    saveCraftStore(next);
    setCraftStore(next);
    update((d) => ({ ...d, progress: Math.min(100, d.progress + 20) }));
  };


  // Cream inset panel (used for main, right column boxes)
  const cream: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.mossDarker}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.18)`,
    borderRadius: 10,
    color: C.ink,
  };

  // Tab side button
  const tabBtn = (active: boolean): CSSProperties => ({
    ...cream,
    background: active
      ? `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`
      : `linear-gradient(180deg, ${C.moss}, ${C.mossDark})`,
    color: active ? C.ink : "#fbf6d8",
    padding: "6px 6px",
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer", fontSize: 9, fontWeight: 900, letterSpacing: 0.4,
    width: "100%", textAlign: "left",
    boxShadow: active
      ? `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.25)`
      : `inset 0 -2px 0 ${C.mossDarker}, 0 2px 0 rgba(0,0,0,0.25)`,
    textShadow: active ? "none" : "0 1px 0 rgba(0,0,0,0.45)",
    transition: "transform 100ms, background 150ms",
    transform: active ? "translateX(2px)" : "translateX(0)",
    minHeight: 32,
  });

  const sectionTitle = (txt: string) => (
    <div style={{
      textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
      color: C.mossDarker, padding: "6px 0", borderBottom: `1px dashed ${C.mossDark}55`,
      marginBottom: 8,
    }}>{txt}</div>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{
        background: "rgba(12,18,10,0.22)",
        backdropFilter: "none",
        transition: "opacity 220ms ease",
        opacity: opened ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="gb-font flex flex-col"
        style={{
          width: "min(720px, calc(100vw - 16px))", height: "min(430px, calc(100vh - 18px))", maxHeight: "94vh",
          background: `linear-gradient(180deg, ${C.moss} 0%, ${C.mossDark} 100%)`,
          border: `3px solid ${C.mossDarker}`,
          borderRadius: 14,
          boxShadow: `inset 0 0 0 2px ${C.cream}55, 0 18px 50px rgba(0,0,0,0.65)`,
          padding: 6,
          gap: 6,
          color: "#fff",
          transform: opened ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 240ms cubic-bezier(.2,.9,.3,1.2)",
          fontSize: 9.5,
          overflow: "hidden",
        }}
      >
        {/* ===== HEADER ===== */}
        <div style={{
          ...cream,
          display: "flex", alignItems: "center", gap: 10,
          padding: "7px 10px",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: `linear-gradient(180deg, ${C.creamShade}, ${C.cream})`,
            border: `2px solid ${C.mossDarker}`,
            display: "grid", placeItems: "center", lineHeight: 1,
            flexShrink: 0,
          }}><CaptainBadge /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: C.mossDarker, letterSpacing: 1, lineHeight: 1 }}>
              CAPITÃO NAVIO
            </div>
            <div style={{ fontSize: 9, color: C.ink, marginTop: 3, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {quote}
            </div>
          </div>
          <div style={{
            width: 34, height: 34, display: "grid", placeItems: "center",
            color: C.mossDarker, lineHeight: 1,
            animation: "spinSlow 8s linear infinite",
            flexShrink: 0,
          }}><MaritimeIcon type="rudder" size={28} /></div>
          <button onClick={onClose} style={{
            background: C.mossDarker, color: C.cream,
            border: `2px solid ${C.ink}`, borderRadius: 8,
            padding: "5px 9px", cursor: "pointer", fontWeight: 900,
            boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
          }}>X</button>
        </div>

        {/* ===== BODY 3 COLUMNS ===== */}
        <div className="captain-body" style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr) 156px", gap: 6, flex: 1, minHeight: 0 }}>
          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => chooseTab(t.id)} style={tabBtn(active)}>
                  <span style={{
                    width: 18, height: 18, display: "grid", placeItems: "center",
                    background: active ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
                    border: `1px solid ${active ? C.mossDarker : "rgba(255,255,255,0.3)"}`,
                    borderRadius: 5, flexShrink: 0,
                  }}><MaritimeIcon type={t.icon} size={13} /></span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN PANEL */}
          <div style={{ ...cream, padding: 8, overflow: "hidden", minWidth: 0 }}>
            {tab === "overview" && (
              <>
                {sectionTitle("VISÃO GERAL")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Stat icon="sail" label="Etapa atual" value={`${boatStageName(data.progress)} · ${boatLabel(data.progress)}`} />
                  <Stat icon="gauge" label="Progresso" value={`${data.progress}%`} />
                  <Stat icon="crate" label="Materiais" value={`${Object.values(data.materials).reduce((a,b)=>a+b,0)} itens`} />
                  <Stat icon="scroll" label="Missões" value={`${Object.values(data.missions).filter(Boolean).length}/${MISSIONS.length}`} />
                </div>
                <div style={{ marginTop: 12, fontSize: 11, lineHeight: 1.5, color: C.ink }}>
                  Treinador <b>{playerName}</b>, reúna os materiais nas rotas, complete as missões marítimas
                  e ajude-me a terminar este navio. Quando ele estiver pronto, navegaremos para ilhas
                  distantes em busca de Pokémon que ninguém jamais viu.
                </div>
              </>
            )}

            {tab === "build" && (
              <>
                <div className="name-font" style={{ fontSize: 13, color: C.mossDarker, letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>
                  CONSTRUÇÃO DO BARCO
                </div>

                {/* Boat illustration — full width like a hero */}
                <PixelBoat progress={data.progress} />

                {/* Stage + progress bar */}
                <div style={{ ...cream, padding: 7, marginTop: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 8, color: C.mossDarker, fontWeight: 800, letterSpacing: 1.2 }}>ETAPA ATUAL</div>
                      <div style={{ fontSize: 11, color: C.ink, fontWeight: 900, marginTop: 2 }}>{boatStageName(data.progress)}</div>
                    </div>
                    <div style={{ fontWeight: 900, color: C.green, fontSize: 18, lineHeight: 1 }}>{data.progress}%</div>
                  </div>
                  <div style={{ fontSize: 9, color: C.ink, marginTop: 2, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{boatLabel(data.progress)}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <div style={{
                      flex: 1, height: 12,
                      background: "#bdb98a",
                      border: `2px solid ${C.mossDarker}`, borderRadius: 4, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${data.progress}%`,
                        background: `linear-gradient(180deg, #8fd25a, ${C.green})`,
                        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.25)",
                        transition: "width 400ms",
                      }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3, marginTop: 4 }}>
                    {BUILD_STAGES.map((s) => (
                      <div key={s.pct} title={s.label} style={{
                        height: 16,
                        border: `2px solid ${C.mossDarker}`,
                        background: data.progress >= s.pct ? C.gold : C.creamShade,
                        boxShadow: data.progress >= s.pct ? "inset 0 -3px 0 rgba(0,0,0,0.18)" : "none",
                        display: "grid", placeItems: "center",
                        fontSize: 8, fontWeight: 900, color: data.progress >= s.pct ? C.ink : C.mossDark,
                      }}>{s.pct}%</div>
                    ))}
                  </div>
                </div>

              </>
            )}

            {tab === "materials" && (
              <>
                {sectionTitle("MATERIAIS DO ESTALEIRO")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {MATERIALS.map((m) => (
                    <div key={m.id} style={{ ...cream, padding: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={m.img} alt={m.name} className="pixelated"
                        style={{ width: 56, height: 56, objectFit: "contain", imageRendering: "pixelated", background: "rgba(255,255,255,0.5)", borderRadius: 6, padding: 4, border: `1px solid ${C.creamShade}` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: C.mossDarker }}>x{matHave(m.id)} / {m.target}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 9, color: C.mossDarker, textAlign: "center" }}>
                  Forje os materiais com o <b>VELHO DOS MARES</b> e traga até aqui.
                </div>

              </>
            )}

            {tab === "fleet" && (() => {
              const ships = [
                { id: "raft",    name: "Jangada de Treino", icon: "raft", ready: true,                  free: true },
                { id: "rubymon", name: "Barco RubyMon",     icon: "sail", ready: data.progress >= 100,  free: false },
                { id: "coral",   name: "Veleiro Coral",    icon: "sail", ready: false,                 free: false },
                { id: "lendario",name: "Navio Lendário",   icon: "ship", ready: false,                 free: false },
              ];
              const equipShip = (id: string, free: boolean) => {
                if (data.currentShip === id) return;
                if (!free) {
                  const s = loadCraftStore();
                  if ((s.items.ancora ?? 0) < 1) {
                    alert("Você precisa de 1 ÂNCORA para trocar de barco. Forje uma com o Velho dos Mares.");
                    return;
                  }
                  s.items.ancora -= 1;
                  saveCraftStore(s); setCraftStore(s);
                }
                update((d) => ({ ...d, currentShip: id }));
              };
              return (
                <>
                  {sectionTitle("FROTA DO CAPITÃO")}
                  <div style={{ fontSize: 9, color: C.mossDarker, textAlign: "center", marginBottom: 6 }}>
                    Trocar de barco consome <b>1 Âncora</b> (exceto a Jangada).
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {ships.map((ship) => {
                      const active = data.currentShip === ship.id;
                      return (
                        <div key={ship.id} style={{ ...cream, padding: 10, minHeight: 92, border: active ? `2px solid ${C.green}` : undefined }}>
                          <div style={{ height: 38, display: "grid", placeItems: "center" }}><MaritimeIcon type={ship.icon} size={34} /></div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: C.ink, textAlign: "center", marginTop: 6 }}>{ship.name}</div>
                          <div style={{ fontSize: 8, color: ship.ready ? C.green : C.mossDark, textAlign: "center", marginTop: 2 }}>
                            {ship.ready ? "OPERACIONAL" : "BLOQUEADO"}
                          </div>
                          <button disabled={!ship.ready || active}
                            onClick={() => equipShip(ship.id, ship.free)}
                            style={{
                              marginTop: 5, width: "100%", padding: "4px", fontSize: 9, fontWeight: 900,
                              border: `1px solid ${C.mossDarker}`, borderRadius: 4,
                              background: active ? C.green : ship.ready ? C.gold : "#aaa",
                              color: active ? "#fff" : C.ink, cursor: ship.ready && !active ? "pointer" : "default",
                            }}>{active ? "EM USO" : ship.free ? "EQUIPAR" : "EQUIPAR ⚓"}</button>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}


            {tab === "quests" && (
              <>
                {sectionTitle("MISSÕES MARÍTIMAS")}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {MISSIONS.map((m) => {
                    const done = !!data.missions[m.id];
                    return (
                      <div key={m.id} style={{ ...cream, padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: done ? C.green : C.mossDarker }}>
                            {done ? "✔ " : "📜 "}{m.title}
                          </div>
                          <button
                            disabled={done}
                            onClick={() => update((d) => ({
                              ...d,
                              missions: { ...d.missions, [m.id]: true },
                              progress: Math.min(100, d.progress + 10),
                            }))}
                            style={{
                              background: done ? "#9aa78a" : C.moss,
                              color: "#fff", border: `1px solid ${C.mossDarker}`,
                              borderRadius: 4, padding: "3px 10px", fontSize: 9,
                              cursor: done ? "default" : "pointer", fontWeight: 700,
                            }}>{done ? "FEITO" : "CONCLUIR"}</button>
                        </div>
                        <div style={{ fontSize: 10, color: C.ink, marginTop: 4 }}>{m.desc}</div>
                        <div style={{ fontSize: 9, color: C.blue, marginTop: 4 }}>Recompensa: {m.reward}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {tab === "voyage" && (() => {
              const cartas = craftStore.items.carta ?? 0;
              const authorized = cartas > 0;
              return (
                <>
                  {sectionTitle("ROTAS MARÍTIMAS")}
                  <div style={{
                    ...cream, padding: 18, textAlign: "center",
                    display: "flex", flexDirection: "column", gap: 10, alignItems: "center",
                  }}>
                    <img src={imgCarta} alt="Carta Náutica" className="pixelated"
                      style={{ width: 64, height: 64, objectFit: "contain", imageRendering: "pixelated" }} />
                    {authorized ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.green, letterSpacing: 1 }}>FROTA AUTORIZADA</div>
                        <div style={{ fontSize: 10, color: C.ink, lineHeight: 1.4, maxWidth: 320 }}>
                          Você possui <b>{cartas}</b> Carta(s) Náutica(s). Novas rotas serão liberadas em breve pelo Capitão.
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.red, letterSpacing: 1 }}>ROTAS BLOQUEADAS</div>
                        <div style={{ fontSize: 10, color: C.ink, lineHeight: 1.4, maxWidth: 320 }}>
                          Apenas donos de frota com <b>Carta Náutica</b> podem navegar. Forje uma com o <b>Velho dos Mares</b>.
                        </div>
                      </>
                    )}
                  </div>
                </>
              );
            })()}

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
            {tab === "build" && (
              <div style={{ ...cream, padding: 7 }}>
                {sectionTitle("MATERIAIS")}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {MATERIALS.map((m) => {
                    const have = matHave(m.id);
                    const done = have >= m.target;
                    return (
                      <div key={m.id} style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr) auto", alignItems: "center", gap: 6, color: C.ink }}>
                        <img src={m.img} alt={m.name} className="pixelated"
                          style={{ width: 32, height: 32, objectFit: "contain", imageRendering: "pixelated" }} />
                        <span style={{ fontSize: 9, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                        <span style={{
                          minWidth: 38, padding: "3px 5px", fontSize: 9, fontWeight: 900,
                          color: done ? C.green : C.creamLight,
                          background: done ? C.creamShade : C.mossDark,
                          border: `1px solid ${C.mossDarker}`, borderRadius: 4, textAlign: "center",
                        }}>{have}/{m.target}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  disabled={!allMaterialsReady}
                  onClick={deliverMaterials}
                  style={{
                    marginTop: 7,
                    width: "100%",
                    padding: "7px 5px",
                    background: allMaterialsReady ? `linear-gradient(180deg, #d9b441, ${C.gold})` : `linear-gradient(180deg, ${C.creamShade}, #b3b08a)`,
                    color: allMaterialsReady ? C.ink : C.mossDarker,
                    fontWeight: 900,
                    letterSpacing: 0.6,
                    fontSize: 8.8,
                    border: `2px solid ${C.mossDarker}`,
                    borderRadius: 6,
                    boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                    cursor: allMaterialsReady ? "pointer" : "not-allowed",
                  }}
                >ENTREGAR</button>
              </div>
            )}
            <div style={{ ...cream, padding: 8 }}>
              {sectionTitle("RECOMPENSA")}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, display: "grid", placeItems: "center" }}><MaritimeIcon type="ship" size={28} /></div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>Barco do Capitão</div>
                  <div style={{ fontSize: 10, color: C.ink, marginTop: 2 }}>Permite viajar para novos lugares!</div>
                </div>
              </div>
            </div>

            {tab !== "build" && <div style={{ ...cream, padding: 10 }}>
              {sectionTitle("BENEFÍCIOS")}
              <Benefit icon="map" text="Viajar para novas áreas" />
              <Benefit icon="wind" text="Transporte rápido" />
              <Benefit icon="island" text="Acesso a ilhas secretas" />
            </div>}

            {tab !== "build" && <div style={{ ...cream, padding: 10 }}>
              {sectionTitle("QUEST RELACIONADA")}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: C.gold, color: "#fff",
                  display: "grid", placeItems: "center", fontWeight: 800,
                  border: `2px solid ${C.mossDarker}`, flexShrink: 0,
                }}>!</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>O Barco do Capitão</div>
                  <div style={{ fontSize: 10, color: C.ink, marginTop: 2 }}>
                    Ajude o Capitão a construir seu barco.
                  </div>
                  <div style={{ fontSize: 10, color: C.blue, marginTop: 4 }}>Em andamento</div>
                </div>
              </div>
            </div>}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <button onClick={onClose} style={{
          ...cream,
          margin: "0 auto",
          padding: "6px 22px",
          background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
          color: C.mossDarker, fontWeight: 800, letterSpacing: 2, fontSize: 10,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>⚓ VOLTAR</button>
      </div>

      <style>{`
        @keyframes spinSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @media (max-width: 860px) {
          .captain-body { grid-template-columns: 1fr !important; overflow-y: auto; }
        }
      `}</style>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.4)",
      border: `1px solid ${C.creamShade}`, borderRadius: 8,
      padding: 8, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 25, height: 25, display: "grid", placeItems: "center", flexShrink: 0 }}><MaritimeIcon type={icon} size={22} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 9, color: C.mossDarker, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: 11, color: C.ink, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function PixelBoat({ progress }: { progress: number }) {
  const hasHull = progress >= 25;
  const mast = progress >= 50;
  const hasSail = progress >= 75;
  const complete = progress >= 100;
  const dark = "#1a0c04";
  const woodA = "#c8843f";
  const woodB = "#8a4f22";
  const woodC = "#5a2f12";
  const woodD = "#3a1d09";
  return (
    <div style={{
      position: "relative",
      height: 172,
      borderRadius: 8,
      overflow: "hidden",
      border: `3px solid ${C.mossDarker}`,
      boxShadow: `inset 0 0 0 2px ${C.creamLight}55, 0 4px 0 rgba(0,0,0,0.25)`,
    }}>
      <svg viewBox="0 0 160 110" width="100%" height="100%" preserveAspectRatio="none" shapeRendering="crispEdges" style={{ display: "block", imageRendering: "pixelated" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec8d8" />
            <stop offset="60%" stopColor="#cbe0c9" />
            <stop offset="100%" stopColor="#f0d893" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ea0c8" />
            <stop offset="60%" stopColor="#235d86" />
            <stop offset="100%" stopColor="#0c2a44" />
          </linearGradient>
        </defs>

        {/* SKY */}
        <rect x="0" y="0" width="160" height="62" fill="url(#sky)" />
        {/* sun + glow */}
        <circle cx="130" cy="22" r="11" fill="#ffe07a" opacity="0.5" />
        <circle cx="130" cy="22" r="8" fill="#ffd45c" />
        <circle cx="130" cy="22" r="5" fill="#fff0a8" />
        {/* gulls */}
        <g fill={dark}>
          <path d="M40 18 l3 -2 l3 2 l3 -2 l3 2" stroke={dark} strokeWidth="0.8" fill="none" />
          <path d="M96 12 l2 -1 l2 1 l2 -1 l2 1" stroke={dark} strokeWidth="0.8" fill="none" />
        </g>
        {/* pixel clouds */}
        <g fill="#fdfbe6">
          <rect x="14" y="14" width="22" height="3" /><rect x="18" y="11" width="14" height="3" /><rect x="22" y="17" width="10" height="2" />
          <rect x="58" y="26" width="24" height="3" /><rect x="64" y="23" width="14" height="3" />
        </g>

        {/* DISTANT ISLAND */}
        <g>
          <rect x="2" y="52" width="40" height="3" fill="#6e5028" />
          <rect x="6" y="49" width="32" height="3" fill="#8a6a3c" />
          <rect x="10" y="45" width="24" height="4" fill="#3a6f33" />
          <rect x="14" y="41" width="16" height="4" fill="#4a8a3a" />
          <rect x="18" y="38" width="8" height="3" fill="#5fa047" />
          {/* palm */}
          <rect x="20" y="34" width="2" height="6" fill={woodC} />
          <rect x="16" y="32" width="10" height="2" fill="#5fa047" />
        </g>

        {/* SEA */}
        <rect x="0" y="60" width="160" height="50" fill="url(#sea)" />
        {/* sun reflection */}
        <g fill="#ffe89a" opacity="0.4">
          <rect x="124" y="64" width="14" height="1" />
          <rect x="122" y="68" width="18" height="1" />
          <rect x="124" y="72" width="14" height="1" />
          <rect x="126" y="76" width="10" height="1" />
        </g>
        {/* waves */}
        <g fill="#bfe6ec" opacity="0.85">
          <rect x="4" y="64" width="10" height="1" /><rect x="22" y="66" width="14" height="1" />
          <rect x="46" y="64" width="12" height="1" /><rect x="70" y="68" width="16" height="1" />
          <rect x="96" y="65" width="8" height="1" />
          <rect x="10" y="76" width="20" height="1" /><rect x="40" y="80" width="18" height="1" />
          <rect x="70" y="82" width="22" height="1" /><rect x="110" y="80" width="20" height="1" />
          <rect x="20" y="90" width="24" height="1" /><rect x="80" y="92" width="30" height="1" />
        </g>
        {/* tiny fish */}
        <g fill="#ffd45c">
          <rect x="34" y="98" width="3" height="1" /><rect x="33" y="97" width="1" height="3" />
          <rect x="120" y="96" width="3" height="1" /><rect x="123" y="95" width="1" height="3" />
        </g>

        {/* SCAFFOLD when empty */}
        {!hasHull && (
          <g>
            {/* dock */}
            <rect x="44" y="70" width="72" height="4" fill={woodB} stroke={dark} />
            <rect x="44" y="74" width="72" height="2" fill={woodD} />
            <rect x="48" y="76" width="4" height="20" fill={woodC} />
            <rect x="108" y="76" width="4" height="20" fill={woodC} />
            <rect x="78" y="76" width="4" height="20" fill={woodC} />
            {/* plank stack */}
            <rect x="56" y="62" width="48" height="4" fill={woodA} stroke={dark} />
            <rect x="60" y="58" width="40" height="4" fill={woodA} stroke={dark} />
            <rect x="64" y="54" width="32" height="4" fill={woodA} stroke={dark} />
            <rect x="68" y="50" width="24" height="4" fill={woodA} stroke={dark} />
            {/* wood grain */}
            <rect x="58" y="63" width="44" height="1" fill={woodC} opacity="0.6" />
            <rect x="62" y="59" width="36" height="1" fill={woodC} opacity="0.6" />
            {/* hammer prop */}
            <rect x="100" y="44" width="12" height="4" fill="#d6d2c2" stroke={dark} />
            <rect x="104" y="48" width="2" height="14" fill={woodC} />
            {/* saw */}
            <polygon points="34,66 46,66 44,70 36,70" fill="#cfcfcf" stroke={dark} />
            <rect x="30" y="64" width="6" height="4" fill={woodC} stroke={dark} />
          </g>
        )}

        {/* HULL */}
        {hasHull && (
          <g>
            {/* lower hull (dark) */}
            <polygon points="42,90 118,90 112,98 48,98" fill={woodD} stroke={dark} />
            {/* main hull */}
            <polygon points="30,74 130,74 122,90 38,90" fill={woodB} stroke={dark} strokeWidth="1" />
            {/* plank lines */}
            <rect x="38" y="78" width="84" height="1" fill={woodC} opacity="0.8" />
            <rect x="40" y="82" width="80" height="1" fill={woodC} opacity="0.8" />
            <rect x="42" y="86" width="76" height="1" fill={woodC} opacity="0.8" />
            {/* gold trim band */}
            <rect x="30" y="72" width="100" height="2" fill={C.gold} />
            <rect x="30" y="74" width="100" height="1" fill="#7a5e1c" />
            {/* portholes */}
            <circle cx="56" cy="82" r="2.5" fill="#a8e0ff" stroke={dark} />
            <circle cx="56" cy="82" r="1" fill="#ffffff" />
            <circle cx="78" cy="82" r="2.5" fill="#a8e0ff" stroke={dark} />
            <circle cx="78" cy="82" r="1" fill="#ffffff" />
            <circle cx="100" cy="82" r="2.5" fill="#a8e0ff" stroke={dark} />
            <circle cx="100" cy="82" r="1" fill="#ffffff" />
            {/* bowsprit */}
            <rect x="128" y="71" width="14" height="2" fill={woodC} stroke={dark} />
            <polygon points="142,72 146,73 142,74" fill={C.gold} stroke={dark} />
            {/* anchor */}
            <rect x="36" y="78" width="1.5" height="9" fill="#5a5a5a" />
            <rect x="33" y="86" width="8" height="1.5" fill="#5a5a5a" />
            <rect x="33" y="86" width="1.5" height="3" fill="#5a5a5a" />
            <rect x="39" y="86" width="1.5" height="3" fill="#5a5a5a" />
            {/* wave foam at bow */}
            <g fill="#ffffff" opacity="0.7">
              <rect x="120" y="89" width="10" height="1" />
              <rect x="34" y="89" width="6" height="1" />
            </g>
          </g>
        )}

        {/* MAST */}
        {mast && (
          <g>
            {/* main mast */}
            <rect x="79" y="28" width="3" height="46" fill={woodC} stroke={dark} />
            <rect x="80" y="28" width="1" height="46" fill={woodA} opacity="0.6" />
            {/* yard arm */}
            <rect x="60" y="40" width="42" height="2" fill={woodC} stroke={dark} />
            {/* top cap */}
            <rect x="77" y="26" width="7" height="2" fill={C.gold} stroke={dark} />
            {/* crow's nest */}
            <rect x="73" y="34" width="15" height="3" fill={woodB} stroke={dark} />
            <rect x="73" y="32" width="15" height="2" fill={woodA} />
            {/* rigging ropes */}
            <line x1="80" y1="28" x2="38" y2="74" stroke={woodD} strokeWidth="0.6" />
            <line x1="81" y1="28" x2="122" y2="74" stroke={woodD} strokeWidth="0.6" />
            <line x1="60" y1="42" x2="48" y2="72" stroke={woodD} strokeWidth="0.4" />
            <line x1="102" y1="42" x2="114" y2="72" stroke={woodD} strokeWidth="0.4" />
          </g>
        )}

        {/* SAILS */}
        {hasSail && (
          <g>
            {/* main sail (billowing) */}
            <path d="M82,42 Q112,46 112,56 Q112,66 82,68 Z" fill={C.creamLight} stroke={dark} strokeWidth="1" />
            <path d="M82,46 Q108,50 108,56" fill="none" stroke={C.creamShade} strokeWidth="0.8" />
            <path d="M82,54 Q108,56 108,62" fill="none" stroke={C.creamShade} strokeWidth="0.8" />
            {/* fore sail */}
            <path d="M79,42 Q56,52 79,66 Z" fill="#f5efc8" stroke={dark} strokeWidth="1" />
            <path d="M79,48 Q64,54 79,60" fill="none" stroke={C.creamShade} strokeWidth="0.8" />
            {/* red emblem on main sail */}
            <circle cx="96" cy="56" r="3" fill={C.red} stroke={dark} strokeWidth="0.6" />
            {/* flag */}
            <rect x="82" y="22" width="12" height="5" fill={C.red} stroke={dark} />
            <polygon points="94,22 98,24 94,27" fill={C.red} stroke={dark} />
            <rect x="84" y="24" width="2" height="1" fill={C.gold} />
          </g>
        )}

        {/* COMPLETE — sparkles + name */}
        {complete && (
          <g>
            <g fill={C.gold}>
              <rect x="100" y="16" width="2" height="2" /><rect x="48" y="10" width="2" height="2" />
              <rect x="142" y="38" width="2" height="2" /><rect x="18" y="30" width="2" height="2" />
              <rect x="70" y="20" width="1" height="1" /><rect x="115" y="32" width="1" height="1" />
            </g>
            <rect x="60" y="100" width="40" height="8" fill={woodD} stroke={C.gold} />
            <text x="80" y="106" textAnchor="middle" fontSize="6" fontWeight="900" fill={C.gold}>RUBYMON</text>
          </g>
        )}

        {/* progress badge */}
        <g>
          <rect x="3" y="98" width="36" height="9" fill={C.mossDarker} stroke={dark} />
          <rect x="3" y="98" width="36" height="2" fill={C.moss} />
          <text x="21" y="105" textAnchor="middle" fontSize="6" fontWeight="900" fill={C.creamLight}>{progress}%</text>
        </g>
      </svg>
    </div>
  );
}

function Benefit({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 11, color: C.ink }}>
      <span style={{ width: 18, height: 18, display: "grid", placeItems: "center", flexShrink: 0 }}><MaritimeIcon type={icon} size={16} /></span>
      <span>{text}</span>
    </div>
  );
}
