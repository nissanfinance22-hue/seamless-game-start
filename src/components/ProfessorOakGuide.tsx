import { useState, useEffect } from "react";
import npcOakSprite from "@/assets/npc-oak.png";

export type GuideTopic =
  | "welcome"
  | "capture"
  | "rarity"
  | "evolution"
  | "quests"
  | "farm"
  | "safiras"
  | "stardust"
  | "incense"
  | "incense_warning"
  | "autohunt";

export interface GuideEntry {
  title: string;
  text: string;
  topic: GuideTopic;
}

const GUIDE_ENTRIES: Record<GuideTopic, GuideEntry> = {
  welcome: {
    title: "BEM-VINDO!",
    topic: "welcome",
    text: "Ola, treinador! Eu sou o Professor Carvalho. Estou aqui para te guiar nesta jornada incrivel pelo mundo Pokemon Ruby M Online!",
  },
  capture: {
    title: "COMO CAPTURAR",
    topic: "capture",
    text: "Para capturar um Pokemon, voce precisa de Pokebolas. Use-as quando encontrar um Pokemon selvagem. Lembre-se: enfraquece-lo primeiro aumenta suas chances!",
  },
  rarity: {
    title: "RARIDADES",
    topic: "rarity",
    text: "Existem varias raridades: Comum, Incomum, Raro, Epico, Lendario, Mitico e o ultra-raro Mitico Brilhante! Quanto mais raro, mais forte o Pokemon.",
  },
  evolution: {
    title: "EVOLUÇÃO E ASCENSÃO",
    topic: "evolution",
    text: "Seu Pokemon pode evoluir ao atingir certos niveis. Alem disso, voce pode usar o sistema de Ascensao para torná-lo ainda mais poderoso usando Rare Candies e Safiras!",
  },
  quests: {
    title: "MISSÕES (QUESTS)",
    topic: "quests",
    text: "Fale com NPCs espalhados pelo mapa para receber missoes. Elas dao recompensas valiosas como Stardust, Safiras e itens raros.",
  },
  farm: {
    title: "FARM DE ITENS",
    topic: "farm",
    text: "Derrote Pokemon selvagens e complete desafios para farmar itens importantes para sua progressao.",
  },
  safiras: {
    title: "SISTEMA DE SAFIRAS",
    topic: "safiras",
    text: "Safiras sao uma moeda especial usada para compras premium e para o sistema de Ascensao de seus Pokemon.",
  },
  stardust: {
    title: "STARDUST",
    topic: "stardust",
    text: "O Stardust e essencial para fortalecer seus Pokemon. Voce o consegue capturando Pokemon e completando certas missoes.",
  },
  incense: {
    title: "INCENSOS",
    topic: "incense",
    text: "Use incensos para atrair mais Pokemon e ganhar bonus de XP. Existem raridades de incenso: Comum, Raro e Epico!",
  },
  incense_warning: {
    title: "INCENSO ACABANDO!",
    topic: "incense_warning",
    text: "Atencao, treinador! Seu incenso esta quase acabando. Use outro agora para nao perder o bonus de XP e atrair Pokemon raros!",
  },
  autohunt: {
    title: "AUTO HUNT",
    topic: "autohunt",
    text: "O Auto Hunt permite que voce batalhe e capture Pokemon automaticamente. Configure-o com sabedoria para otimizar seu farm!",
  },
};

export function ProfessorOakGuide({
  topic,
  onClose,
}: {
  topic: GuideTopic;
  onClose: () => void;
}) {
  const entry = GUIDE_ENTRIES[topic];
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < entry.text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + entry.text[index]);
        setIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [index, entry.text]);

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center pb-8 bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#f8f8f8] border-4 border-[#333] rounded-lg p-4 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20 h-20 bg-white border-2 border-[#888] rounded-md overflow-hidden p-1">
            <img
              src={npcOakSprite}
              alt="Professor Oak"
              className="w-full h-full object-contain pixelated"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-[#c00] font-bold text-xs mb-1 tracking-wider gb-font">
                PROF. CARVALHO
              </h3>
              <p className="text-[#333] text-[10px] leading-tight gb-font min-h-[40px]">
                {displayText}
                {index < entry.text.length && (
                  <span className="inline-block w-1.5 h-3 bg-black/40 animate-pulse ml-0.5" />
                )}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2 border-t border-[#ddd] pt-2">
              <span className="text-[8px] text-[#666] font-medium gb-font">
                {entry.title}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="bg-[#c00] text-white px-3 py-1 rounded text-[10px] font-bold gb-font hover:brightness-110 active:scale-95 transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
