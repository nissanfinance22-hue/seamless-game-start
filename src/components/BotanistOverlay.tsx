import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import treeFullAsset from "@/assets/harvest/tree-full.png.asset.json";
import treeStrawberryAsset from "@/assets/harvest/tree-strawberry.png.asset.json";
import treeYellowAsset from "@/assets/harvest/tree-yellow.png.asset.json";
import treePinkAsset from "@/assets/harvest/tree-pink.png.asset.json";

import npcBotanist from "@/assets/npc-botanist.png.asset.json";

/**
 * Botânico Yggdran — guia das árvores coletáveis.
 * Layout inspirado no sistema de Ascensão do Treinador:
 * 3 colunas (sidebar de árvores · painel central · coluna direita com a
 * própria árvore destacada + lista de mapas onde aparece).
 */

const C = {
  ember:       "#5a9a3a",
  emberDark:   "#3d6b27",
  emberDarker: "#5a3a1c",
  emberDeep:   "#2a1808",
  cream:       "#f3e3bd",
  creamLight:  "#fbf2d5",
  creamShade:  "#d9c187",
  ink:         "#2a1808",
  gold:        "#f5c542",
};

type TreeInfo = {
  id: string;
  name: string;
  img: string;
  drop: string;
  dropIcon: string;
  desc: string;
  maps: string[];
  rarity: "Comum" | "Incomum" | "Raro" | "Épico";
  color: string;
};

const TREES: TreeInfo[] = [
  {
    id: "wood",
    name: "ÁRVORE COMUM",
    img: treeFullAsset.url,
    drop: "Madeira Bruta",
    dropIcon: "🪵",
    desc: "A árvore mais comum dos bosques. Sua madeira é a base de toda construção naval e do artesanato de Pallet.",
    maps: ["Porto Florido", "Floresta (Rota 1)", "Rota 2", "Rota de Pallet"],
    rarity: "Comum",
    color: "#8b5a2b",
  },
  {
    id: "strawberry",
    name: "MORANGUEIRA SILVESTRE",
    img: treeStrawberryAsset.url,
    drop: "Morango Silvestre",
    dropIcon: "🍓",
    desc: "Árvore mística cujas folhas dão morangos doces durante todo o ano. Diz-se que atraem Pokémon de coração puro.",
    maps: ["Porto Florido", "Floresta (Rota 1)", "Rota 2", "Rota de Pallet"],
    rarity: "Incomum",
    color: "#e23b53",
  },
  {
    id: "lemon",
    name: "LIMOEIRO DOURADO",
    img: treeYellowAsset.url,
    drop: "Limão Dourado",
    dropIcon: "🍋",
    desc: "Cítricos dourados perfumados, usados em poções e na culinária dos marinheiros para afastar o escorbuto.",
    maps: ["Floresta (Rota 1)", "Rota 2", "Rota de Pallet"],
    rarity: "Raro",
    color: "#f5c542",
  },
  {
    id: "pink",
    name: "ÁRVORE DAS BAGAS ROSAS",
    img: treePinkAsset.url,
    drop: "Baga Rosa",
    dropIcon: "🌸",
    desc: "Florida o ano inteiro, deixa cair pequenas bagas rosas que cicatrizam Pokémon feridos e perfumam a forja.",
    maps: ["Porto Florido", "Floresta (Rota 1)", "Rota 3"],
    rarity: "Raro",
    color: "#ec4899",
  },
];

const RARITY_COLOR: Record<TreeInfo["rarity"], string> = {
  "Comum":   "#86c94a",
  "Incomum": "#2d6ea8",
  "Raro":    "#a855f7",
  "Épico":   "#f5c542",
};

export function BotanistOverlay({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string>(TREES[0].id);
  const selected = TREES.find(t => t.id === selectedId)!;

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="name-font"
        style={{
          width: "min(1080px, 96vw)", maxHeight: "92vh",
          background: C.creamLight,
          border: `5px solid ${C.emberDarker}`,
          borderRadius: 14,
          boxShadow: `0 18px 48px rgba(0,0,0,0.55), 0 0 0 3px ${C.cream} inset`,
          overflow: "hidden", display: "flex", flexDirection: "column",
          color: C.ink,
        }}
      >
        {/* ===== HEADER ===== */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 18px",
          background: `linear-gradient(180deg, ${C.ember}, ${C.emberDark})`,
          borderBottom: `4px solid ${C.emberDarker}`,
          color: C.creamLight,
        }}>
          <img
            src={npcBotanist.url}
            alt="Botânico"
            className="pixelated"
            style={{ width: 56, height: 56, objectFit: "contain",
              background: C.creamLight, border: `3px solid ${C.emberDarker}`,
              borderRadius: 8, padding: 2 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>
              BOTÂNICO YGGDRAN
            </div>
            <div style={{ fontSize: 9, opacity: 0.9, marginTop: 2 }}>
              "Cada árvore guarda um segredo. Deixe-me te contar os meus..."
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.creamLight, color: C.emberDarker,
              border: `2px solid ${C.emberDarker}`, borderRadius: 6,
              padding: "4px 10px", fontWeight: 700, cursor: "pointer",
              fontSize: 12,
            }}
          >✕</button>
        </div>

        {/* ===== 3-COLUMN BODY ===== */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 240px",
          gap: 0,
          flex: 1, minHeight: 0,
        }}>
          {/* SIDEBAR — lista de árvores */}
          <div style={{
            background: C.cream,
            borderRight: `3px solid ${C.emberDarker}`,
            padding: 10, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ fontSize: 9, color: C.emberDarker, opacity: 0.7, marginBottom: 4, paddingLeft: 4 }}>
              ESPÉCIES CONHECIDAS
            </div>
            {TREES.map(t => {
              const active = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px",
                    background: active ? C.creamLight : "transparent",
                    border: `2px solid ${active ? C.emberDarker : "transparent"}`,
                    borderRadius: 6, cursor: "pointer",
                    textAlign: "left", color: C.ink,
                    boxShadow: active ? `inset 0 0 0 1px ${C.gold}` : "none",
                  }}
                >
                  <img src={t.img} alt={t.name} className="pixelated"
                    style={{ width: 32, height: 32, objectFit: "contain" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.1 }}>
                      {t.name}
                    </div>
                    <div style={{
                      fontSize: 7, marginTop: 3,
                      color: RARITY_COLOR[t.rarity], fontWeight: 700,
                    }}>
                      {t.rarity}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN — descrição da árvore selecionada */}
          <div style={{
            padding: "18px 22px", overflowY: "auto",
            background: C.creamLight,
          }}>
            <div style={{ fontSize: 10, color: C.emberDarker, opacity: 0.7, marginBottom: 4 }}>
              ESPÉCIE
            </div>
            <h2 style={{
              fontSize: 18, fontWeight: 800, color: selected.color,
              margin: 0, letterSpacing: 1,
              textShadow: `1px 1px 0 ${C.emberDeep}`,
            }}>{selected.name}</h2>

            <div style={{
              marginTop: 14, padding: 12,
              background: C.cream, border: `2px solid ${C.emberDarker}`,
              borderRadius: 8, fontSize: 10, lineHeight: 1.6,
              color: C.ink,
            }}>
              {selected.desc}
            </div>

            {/* DROP */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 9, color: C.emberDarker, opacity: 0.7, marginBottom: 6 }}>
                RECURSO COLHIDO
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px",
                background: `linear-gradient(180deg, ${C.creamLight}, ${C.cream})`,
                border: `3px solid ${selected.color}`,
                borderRadius: 10,
              }}>
                <div style={{
                  width: 44, height: 44, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: C.creamLight, borderRadius: 8,
                  border: `2px solid ${C.emberDarker}`,
                  fontSize: 26,
                }}>{selected.dropIcon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: selected.color }}>
                    +1 {selected.drop}
                  </div>
                  <div style={{ fontSize: 8, color: C.emberDarker, marginTop: 3, opacity: 0.85 }}>
                    Por cada árvore cortada · respawn em 45s
                  </div>
                </div>
              </div>
            </div>

            {/* COMENTÁRIO MISTERIOSO DO BOTÂNICO */}
            <div style={{
              marginTop: 18, padding: 12,
              background: "rgba(90,58,28,0.10)",
              border: `2px dashed ${C.emberDarker}`,
              borderRadius: 8, fontSize: 9, color: C.emberDeep,
              lineHeight: 1.65, fontStyle: "italic",
            }}>
              <b style={{ color: selected.color, fontStyle: "normal" }}>YGGDRAN sussurra:</b>{" "}
              {selected.rarity === "Comum" && <>"Comum aos olhos... mas até a madeira mais simples vale ouro nas mãos certas. Há quem pague <b>50g</b> só por um tronco. Quem sabe o que se esconde no <i>caroço</i>?"</>}
              {selected.rarity === "Incomum" && <>"Poucos a encontram. Mercadores oferecem até <b>250g</b> por uma cesta — e dizem que algo <i>mais raro</i> brota quando a lua cresce..."</>}
              {selected.rarity === "Raro" && <>"Cuidado ao colher. Vale <b>800g</b> a unidade no mercado negro... mas há rumores de que <i>algo observa</i> quem corta demais."</>}
              {selected.rarity === "Épico" && <>"Lendária. Vi um colecionador pagar <b>5.000g</b> por um único fruto. O que isso desperta na floresta... ninguém quer descobrir sozinho."</>}
            </div>

          </div>

          {/* RIGHT — preview + mapas */}
          <div style={{
            background: C.cream,
            borderLeft: `3px solid ${C.emberDarker}`,
            padding: 12, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{
              background: C.creamLight,
              border: `3px solid ${C.emberDarker}`,
              borderRadius: 10, padding: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              aspectRatio: "1/1",
            }}>
              <img src={selected.img} alt={selected.name} className="pixelated"
                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <div>
              <div style={{ fontSize: 9, color: C.emberDarker, opacity: 0.7, marginBottom: 6 }}>
                ENCONTRADA EM
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {selected.maps.map(m => (
                  <div key={m} style={{
                    padding: "5px 8px",
                    background: C.creamLight,
                    border: `2px solid ${C.emberDarker}`,
                    borderRadius: 6, fontSize: 9, color: C.ink,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: selected.color }}>●</span>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: "auto", padding: 8,
              background: C.emberDeep, color: C.creamLight,
              borderRadius: 6, fontSize: 8, textAlign: "center",
              border: `2px solid ${C.emberDarker}`,
            }}>
              RARIDADE
              <div style={{
                marginTop: 4, fontSize: 11, fontWeight: 800,
                color: RARITY_COLOR[selected.rarity],
              }}>{selected.rarity.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
