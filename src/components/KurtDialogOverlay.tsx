import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import npcKurtAsset from "@/assets/npc-kurt.png.asset.json";
import { loadKurtStore } from "./KurtCraftOverlay";

const KURT_STORY_KEY = "rubymon.kurt.story.v1";

type StoryFlags = {
  met: boolean;
  afterFirstShown: boolean;
  greatShown: boolean;
  fastShown: boolean;
  endingShown: boolean;
};

const DEFAULT_FLAGS: StoryFlags = {
  met: false, afterFirstShown: false, greatShown: false, fastShown: false, endingShown: false,
};

function loadFlags(): StoryFlags {
  try {
    const r = localStorage.getItem(KURT_STORY_KEY);
    if (!r) return DEFAULT_FLAGS;
    return { ...DEFAULT_FLAGS, ...(JSON.parse(r) as Partial<StoryFlags>) };
  } catch { return DEFAULT_FLAGS; }
}
function saveFlags(f: StoryFlags) {
  try { localStorage.setItem(KURT_STORY_KEY, JSON.stringify(f)); } catch {}
}

// Each "page" is an array of paragraph lines. "..." renders as a pause line.
type Page = string[];
type Script = { id: string; title: string; pages: Page[] };

const FIRST_MEET: Script = {
  id: "first-meet",
  title: "🌰 PRIMEIRO ENCONTRO",
  pages: [
    ["Kurt observa você em silêncio...", "...", "Hm..."],
    ["Então é você de quem todos estão falando.", "...", "Mais um treinador procurando Pokémon...", "Ou talvez algo maior do que isso."],
    ["Você vê estas árvores?", "Elas estavam aqui antes de mim.", "Antes dos ginásios.", "Antes das cidades."],
    ["Muitos treinadores entram por aquela porta acreditando que Pokébolas surgem das lojas.", "...", "Mas a verdade é diferente."],
    ["Cada Pokébola começa aqui.", "Em um simples Apricorn. 🌰"],
    ["Pequeno.", "Frágil.", "Fácil de ignorar.", "...", "Assim como muitos treinadores no início de suas jornadas."],
    ["Mas com paciência...", "Até a menor semente pode mudar o mundo."],
    ["Se deseja aprender meus segredos...", "Primeiro aprenda a respeitar a natureza.", "Depois volte para falar comigo."],
  ],
};

const AFTER_FIRST: Script = {
  id: "after-first",
  title: "🌰 APÓS A PRIMEIRA ENTREGA",
  pages: [
    ["Excelente.", "Você não trouxe apenas Apricorns.", "...", "Trouxe prova de dedicação."],
    ["A maioria desiste antes mesmo de começar.", "...", "Treinadores fortes são comuns.", "Treinadores persistentes são raros."],
    ["Continue assim.", "E as árvores continuarão recompensando você."],
  ],
};

const GREAT_UNLOCK: Script = {
  id: "great-unlock",
  title: "🌰 GREAT BALL FORJADA",
  pages: [
    ["Interessante...", "Você está começando a entender."],
    ["Pokébolas não são apenas ferramentas.", "...", "Elas representam confiança."],
    ["Um treinador oferece abrigo.", "E um Pokémon decide aceitá-lo.", "...", "Jamais se esqueça disso."],
  ],
};

const FAST_UNLOCK: Script = {
  id: "fast-unlock",
  title: "🌰 FAST BALL LIBERADA",
  pages: [
    ["Vejo que você cresceu.", "...", "Quando chegou aqui...", "Suas mãos carregavam apenas curiosidade."],
    ["Agora carregam experiência.", "...", "Mas cuidado."],
    ["Quanto maior o poder.", "Maior deve ser sua responsabilidade."],
  ],
};

const ENDING: Script = {
  id: "ending",
  title: "🌰 FINAL DA JORNADA",
  pages: [
    ["Kurt permanece em silêncio por alguns segundos.", "...", "Heh...", "Eu estava esperando por este dia."],
    ["Não porque você concluiu minhas tarefas.", "...", "Mas porque finalmente entendeu o que eu tentava ensinar."],
    ["Os Apricorns nunca foram apenas ingredientes.", "...", "E as Pokébolas nunca foram apenas objetos.", "...", "São símbolos."],
    ["De confiança.", "De crescimento.", "De jornada."],
    ["Hoje você não é apenas um treinador.", "...", "Você se tornou parte desta história. 🌰✨"],
  ],
};

const RETURNING: Script = {
  id: "returning",
  title: "🌰 BEM-VINDO DE VOLTA",
  pages: [
    ["Ah...", "Você voltou.", "...", "As árvores gostam de você.", "Posso perceber isso."],
    ["Nem todos conseguem ouvir a floresta.", "...", "Mas alguns conseguem sentir quando ela responde."],
  ],
};

const RANDOM_POOL: Script[] = [
  { id: "r1", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Você sabia?", "...", "Algumas árvores Apricorn são mais antigas do que certas cidades.", "Elas guardam histórias que ninguém mais lembra."]] },
  { id: "r2", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Os Apricorns não escolhem os treinadores mais fortes.", "...", "Escolhem os mais pacientes."]] },
  { id: "r3", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Não tenha pressa.", "...", "Grandes jornadas não são medidas pela velocidade.", "Mas pelas histórias que deixam para trás."]] },
  { id: "r4", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Alguns procuram Pokémon raros.", "Outros procuram riquezas.", "...", "Mas os treinadores mais sábios...", "Procuram conhecimento."]] },
  { id: "r5", title: "🌰 SABEDORIA DA FLORESTA", pages: [["O Mar Rubi levou muitas coisas.", "...", "Mas não conseguiu levar a esperança.", "Ela continua viva.", "Assim como estas árvores."]] },
  { id: "r6", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Cada Apricorn possui um propósito.", "...", "Assim como cada treinador.", "A questão é descobrir qual é o seu."]] },
  { id: "r7", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Treinadores costumam olhar para o céu.", "...", "Mas às vezes as maiores descobertas estão sob seus pés."]] },
  { id: "r8", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Uma Pokébola bem feita não captura apenas um Pokémon.", "...", "Ela carrega uma promessa."]] },
  { id: "r9", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Quando você planta algo hoje...", "...", "Talvez outra geração colha amanhã."]] },
  { id: "r10", title: "🌰 SABEDORIA DA FLORESTA", pages: [["Os mares mudam.", "As cidades mudam.", "...", "Mas a natureza sempre encontra uma forma de continuar."]] },
];

const FIXED_PHRASE = "Enquanto existirem Apricorns... os treinadores jamais perderão a esperança. 🌰";

function pickScript(flags: StoryFlags, xp: number): { script: Script; consume: Partial<StoryFlags> } {
  if (!flags.met) return { script: FIRST_MEET, consume: { met: true } };
  if (xp >= 600 && !flags.endingShown) return { script: ENDING, consume: { endingShown: true } };
  if (xp >= 500 && !flags.fastShown) return { script: FAST_UNLOCK, consume: { fastShown: true } };
  if (xp >= 5 && !flags.greatShown) return { script: GREAT_UNLOCK, consume: { greatShown: true } };
  if (xp >= 2 && !flags.afterFirstShown) return { script: AFTER_FIRST, consume: { afterFirstShown: true } };
  if (Math.random() < 0.35) return { script: RETURNING, consume: {} };
  const r = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
  return { script: r, consume: {} };
}

type Props = {
  onClose: () => void;
  onOpenForge: () => void;
};

const C = {
  red: "#9b1c1c", redDark: "#5b0e0e", redDeep: "#2a0606",
  cream: "#f5e6c8", creamLight: "#fdf6e0", creamShade: "#d4bf8a",
  ink: "#1a0f0a", gold: "#e0b145", ember: "#dc2626",
};

export function KurtDialogOverlay({ onClose, onOpenForge }: Props) {
  const npcSprite = npcKurtAsset.url;
  const flagsRef = useRef<StoryFlags>(loadFlags());
  const xp = loadKurtStore().xp;

  const { script, consumed } = useMemo(() => {
    const pick = pickScript(flagsRef.current, xp);
    const newFlags = { ...flagsRef.current, ...pick.consume };
    saveFlags(newFlags);
    flagsRef.current = newFlags;
    return { script: pick.script, consumed: pick.consume };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  void consumed;

  const [pageIdx, setPageIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [opened, setOpened] = useState(false);

  const currentPage = script.pages[pageIdx] ?? [];
  const fullText = currentPage.join("\n");
  const isLastPage = pageIdx >= script.pages.length - 1;
  const isTyping = charCount < fullText.length;

  useEffect(() => { const t = setTimeout(() => setOpened(true), 10); return () => clearTimeout(t); }, []);

  // Typewriter
  useEffect(() => {
    setCharCount(0);
    if (!fullText) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setCharCount(i);
      if (i >= fullText.length) clearInterval(interval);
    }, 22);
    return () => clearInterval(interval);
  }, [fullText]);

  const advance = () => {
    if (isTyping) { setCharCount(fullText.length); return; }
    if (!isLastPage) { setPageIdx((p) => p + 1); return; }
  };

  const visibleText = fullText.slice(0, charCount);

  const panel: CSSProperties = {
    background: `linear-gradient(180deg, ${C.creamLight} 0%, ${C.cream} 100%)`,
    border: `2px solid ${C.redDark}`,
    boxShadow: `inset 0 0 0 1px ${C.creamShade}, 0 2px 0 rgba(0,0,0,0.22)`,
    borderRadius: 10, color: C.ink,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{ background: "rgba(20,5,5,0.62)", transition: "opacity 220ms", opacity: opened ? 1 : 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gb-font flex flex-col" style={{
        width: "min(680px, calc(100vw - 16px))", maxHeight: "min(560px, calc(100vh - 18px))",
        background: `linear-gradient(180deg, ${C.red} 0%, ${C.redDark} 100%)`,
        border: `3px solid ${C.redDeep}`, borderRadius: 14,
        boxShadow: `inset 0 0 0 2px ${C.gold}55, 0 18px 50px rgba(0,0,0,0.7)`,
        padding: 6, gap: 6, color: "#fff", overflow: "hidden",
        transform: opened ? "translateY(0) scale(1)" : "translateY(22px) scale(0.96)",
        transition: "transform 260ms cubic-bezier(.2,.9,.3,1.2)",
        fontSize: 10, fontFamily: '"Pixelify Sans", ui-monospace, monospace',
      }}>
        {/* Header */}
        <div style={{ ...panel, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(180deg, ${C.gold}33, ${C.ember}22)`,
            border: `2px solid ${C.redDeep}`, display: "grid", placeItems: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
            overflow: "hidden",
          }}>
            <img src={npcSprite} alt="Kurt" className="pixelated"
              style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="name-font" style={{ fontSize: 14, color: C.redDark, letterSpacing: 1.2, lineHeight: 1 }}>
              MESTRE KURT
            </div>
            <div style={{ fontSize: 9, color: C.ink, marginTop: 4, opacity: 0.85,
              letterSpacing: 1.2, fontWeight: 800 }}>
              {script.title}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6, fontSize: 14, fontWeight: 900,
            background: `linear-gradient(180deg, ${C.red}, ${C.redDark})`,
            color: "#fff8e7", border: `2px solid ${C.redDeep}`, cursor: "pointer",
            boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
          }}>×</button>
        </div>

        {/* Dialog body */}
        <div onClick={advance} style={{
          ...panel, padding: "16px 18px", flex: 1, cursor: "pointer",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          minHeight: 220,
        }}>
          <div style={{
            fontSize: 13, lineHeight: 1.7, color: C.ink, whiteSpace: "pre-wrap",
            fontFamily: '"Pixelify Sans", ui-monospace, monospace',
          }}>
            {visibleText}
            {isTyping && <span style={{ opacity: 0.5 }}>▍</span>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 12, paddingTop: 8, borderTop: `1px dashed ${C.redDark}44` }}>
            <div style={{ fontSize: 8, color: C.redDark, letterSpacing: 1.2, fontWeight: 800 }}>
              {pageIdx + 1} / {script.pages.length}
            </div>
            <div style={{ fontSize: 9, color: C.redDark, fontWeight: 900, letterSpacing: 1 }}>
              {isTyping ? "▸ CLIQUE PARA REVELAR" : isLastPage ? "▾ FIM" : "▸ CONTINUAR"}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ ...panel, display: "flex", gap: 8, padding: "8px 10px", alignItems: "center" }}>
          <div style={{ flex: 1, fontSize: 8.5, color: C.redDark, fontStyle: "italic",
            opacity: 0.85, lineHeight: 1.4 }}>
            “{FIXED_PHRASE}”
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px", fontSize: 10, fontWeight: 900, letterSpacing: 1,
              background: `linear-gradient(180deg, ${C.red}, ${C.redDark})`,
              color: "#fff8e7", border: `2px solid ${C.redDeep}`, borderRadius: 8,
              cursor: "pointer", boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
              textShadow: "0 1px 0 rgba(0,0,0,0.45)",
            }}>DESPEDIR</button>
          <button
            disabled={!flagsRef.current.met}
            onClick={() => { onClose(); onOpenForge(); }}
            style={{
              padding: "8px 14px", fontSize: 10, fontWeight: 900, letterSpacing: 1,
              background: flagsRef.current.met
                ? `linear-gradient(180deg, ${C.gold}, ${C.ember})`
                : `linear-gradient(180deg, #888, #555)`,
              color: C.ink, border: `2px solid ${C.redDeep}`, borderRadius: 8,
              cursor: flagsRef.current.met ? "pointer" : "not-allowed",
              boxShadow: `inset 0 0 0 1px ${C.cream}`,
              opacity: flagsRef.current.met ? 1 : 0.7,
            }}>⛩ ABRIR FORJA</button>
        </div>
      </div>
    </div>
  );
}
