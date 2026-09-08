// QuestLogOverlay — lista de quests ativas / concluídas, com botão "Entregar"
// quando o jogador tem os itens. Também expõe <NpcQuestSection> que pode ser
// embutido em qualquer overlay de NPC pra mostrar o pedido atual + entregar.

import { useState, useMemo } from "react";
import {
  QUESTS, NPC_LABEL, getStepIndex, currentStep, questsForNpc, advanceQuestStep, activeQuestsCount,
  type NpcId, type Quest, type QuestStep, type QuestReward,
} from "@/game/quests";

export type QuestDeliverContext = {
  inventory: Record<string, number>;
  teamSpecies: string[]; // species presentes na party + storage
};

export type QuestDeliverHandler = (args: {
  questId: string;
  step: QuestStep;
}) => { ok: boolean; message?: string };

function canDeliver(step: QuestStep, ctx: QuestDeliverContext): boolean {
  if (!step.need) return true;
  const { item, qty } = step.need;
  if (item.startsWith("pet:")) {
    const sp = item.slice(4);
    return ctx.teamSpecies.includes(sp);
  }
  return (ctx.inventory[item] || 0) >= qty;
}

function progressPct(step: QuestStep, ctx: QuestDeliverContext): number {
  if (!step.need) return 100;
  const { item, qty } = step.need;
  if (item.startsWith("pet:")) {
    const sp = item.slice(4);
    return ctx.teamSpecies.includes(sp) ? 100 : 0;
  }
  return Math.min(100, Math.round(((ctx.inventory[item] || 0) / Math.max(1, qty)) * 100));
}

function needLabel(step: QuestStep): string {
  if (!step.need) return "Receber itens";
  const { item, qty } = step.need;
  if (item.startsWith("pet:")) return `Trazer 1× Pokémon (${item.slice(4)})`;
  return `Entregar ${qty}× ${item.replace(/_/g, " ")}`;
}

function rewardLabel(r?: QuestReward, give?: Record<string, number>): string {
  const parts: string[] = [];
  if (r?.gold) parts.push(`${r.gold}g`);
  if (r?.items) for (const [k, v] of Object.entries(r.items)) parts.push(`${v}× ${k.replace(/_/g, " ")}`);
  if (give) for (const [k, v] of Object.entries(give)) parts.push(`${v}× ${k.replace(/_/g, " ")}`);
  return parts.length ? parts.join(", ") : "—";
}

// Keep the embedded NPC section using the GB-style theme (it sits inside NPC dialogue boxes)
const cardStyle: React.CSSProperties = {
  background: "var(--gb-screen)",
  border: "3px solid var(--gb-darkest)",
  borderRadius: 6,
  padding: 8,
  color: "var(--gb-darkest)",
};

export function NpcQuestSection({
  npc, ctx, onDeliver,
}: { npc: NpcId; ctx: QuestDeliverContext; onDeliver: QuestDeliverHandler }) {
  const list = questsForNpc(npc);
  if (list.length === 0) return null;
  return (
    <div className="mt-2 space-y-2">
      {list.map(({ quest, step }) => {
        const can = canDeliver(step, ctx);
        return (
          <div key={quest.id} className="gb-font text-[8px]" style={cardStyle}>
            <div className="font-bold mb-1">📜 {quest.title}</div>
            <div className="mb-1" style={{ fontSize: 7 }}>"{step.ask}"</div>
            <div className="mb-1" style={{ fontSize: 7, opacity: 0.8 }}>
              • {needLabel(step)} {step.need ? `(${ctx.inventory[step.need.item] || 0}/${step.need.qty})` : ""}
            </div>
            <div className="mb-1" style={{ fontSize: 7, opacity: 0.7 }}>
              Recompensa: {rewardLabel(step.reward, step.give)}
            </div>
            <button
              disabled={!can}
              onClick={() => onDeliver({ questId: quest.id, step })}
              className="gb-font px-2 py-1 w-full"
              style={{
                background: can ? "var(--gb-darkest)" : "#888",
                color: can ? "#ffe066" : "#ddd",
                border: "none", fontSize: 8, opacity: can ? 1 : 0.6,
                cursor: can ? "pointer" : "not-allowed",
              }}
            >
              {step.need ? "ENTREGAR" : "RECEBER"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ====================== NEW MODERN OVERLAY ======================

export default function QuestLogOverlay({
  ctx, onDeliver, onClose,
}: { ctx: QuestDeliverContext; onDeliver: QuestDeliverHandler; onClose: () => void }) {
  const [tab, setTab] = useState<"active" | "done">("active");
  const [selected, setSelected] = useState<string | null>(null);

  const buckets = useMemo(() => {
    const b: { active: Quest[]; done: Quest[] } = { active: [], done: [] };
    for (const q of QUESTS) {
      if (getStepIndex(q.id) === "done") b.done.push(q);
      else b.active.push(q);
    }
    return b;
  }, []);

  const list = tab === "active" ? buckets.active : buckets.done;
  const activeQuest = selected ? QUESTS.find((q) => q.id === selected) : list[0];
  const activeStep = activeQuest ? currentStep(activeQuest) : null;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center font-mono"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg border-2 flex flex-col overflow-hidden"
        style={{
          width: "94%", height: "94%",
          background: "linear-gradient(180deg,#1a0f2e,#0f0820)",
          borderColor: "#a855f7",
          boxShadow: "0 0 18px rgba(168,85,247,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-black/40 border-b border-purple-900 flex-shrink-0">
          <div className="flex items-center gap-1 min-w-0">
            <span style={{ fontSize: 11 }}>📜</span>
            <h2 className="font-bold tracking-wider truncate" style={{ color: "#e9d5ff", fontSize: 9 }}>QUESTS</h2>
          </div>
          <button onClick={onClose} className="shrink-0 bg-purple-900/70 text-purple-100 rounded font-bold active:scale-90 hover:bg-purple-800" style={{ fontSize: 9, padding: "2px 7px" }}>✕</button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-purple-900/60 bg-black/30 flex-shrink-0">
          {([
            { k: "active" as const, label: `ATIVAS (${buckets.active.length})`, icon: "⚔" },
            { k: "done" as const, label: `OK (${buckets.done.length})`, icon: "✓" },
          ]).map((t) => (
            <button
              key={t.k}
              onClick={() => { setTab(t.k); setSelected(null); }}
              className="flex-1 py-1 tracking-[1px] font-bold transition-colors"
              style={{
                fontSize: 8,
                color: tab === t.k ? "#0f0820" : "#c4b5fd",
                background: tab === t.k ? "linear-gradient(180deg,#c084fc,#7c3aed)" : "transparent",
              }}
            >{t.icon} {t.label}</button>
          ))}
        </div>

        {/* BODY: stacked on small, two-col on wider */}
        <div className="flex-1 min-h-0 flex flex-col sm:grid sm:grid-cols-[140px_1fr] overflow-hidden">
          {/* LIST */}
          <div className="overflow-y-auto sm:border-r border-b sm:border-b-0 border-purple-900/40 bg-black/20 custom-scrollbar" style={{ maxHeight: "40%" }}>

            {list.length === 0 ? (
              <div className="p-3 text-[9px] text-purple-300/60 italic text-center">
                {tab === "active" ? "Nenhuma quest ativa." : "Nenhuma concluída."}
              </div>
            ) : list.map((q) => {
              const s = currentStep(q);
              const done = !s;
              const isSel = (activeQuest?.id === q.id);
              const pct = s ? progressPct(s, ctx) : 100;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelected(q.id)}
                  className="w-full text-left px-2 py-1 border-b border-purple-900/30 transition-colors"
                  style={{
                    background: isSel ? "linear-gradient(90deg,rgba(168,85,247,0.35),transparent)" : "transparent",
                    borderLeft: isSel ? "2px solid #c084fc" : "2px solid transparent",
                  }}
                >
                  <div className="font-bold truncate flex items-center gap-1" style={{ color: done ? "#86efac" : "#e9d5ff", fontSize: 9 }}>
                    {done ? "✓" : "•"} {q.title}
                  </div>
                  {s && (
                    <>
                      <div className="truncate" style={{ color: "#a78bfa", opacity: 0.8, fontSize: 7 }}>{NPC_LABEL[s.npc]}</div>
                      <div className="mt-0.5 h-0.5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#a855f7,#c084fc)" }} />
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>


          {/* DETAIL */}
          <div className="overflow-y-auto p-2 custom-scrollbar flex-1 min-h-0">
            {!activeQuest ? (
              <div className="text-[9px] text-purple-300/60 italic">Selecione uma quest.</div>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="font-bold" style={{ color: "#fde047", fontSize: 11 }}>{activeQuest.title}</div>
                  <div className="mt-0.5 leading-snug" style={{ color: "#c4b5fd", fontSize: 8 }}>{activeQuest.intro}</div>
                </div>
                {activeStep ? (
                  <div className="rounded p-2 border" style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(168,85,247,0.35)" }}>
                    <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                      <div className="tracking-[1px] shrink-0" style={{ color: "#a78bfa", fontSize: 7 }}>OBJETIVO</div>
                      <div className="px-1.5 py-0.5 rounded font-bold truncate min-w-0" style={{ background: "rgba(168,85,247,0.25)", color: "#e9d5ff", fontSize: 7 }}>{NPC_LABEL[activeStep.npc]}</div>
                    </div>
                    <div className="italic mb-1 leading-snug" style={{ color: "#f5d0fe", fontSize: 8 }}>"{activeStep.ask}"</div>
                    <div className="mb-1" style={{ color: "#e9d5ff", fontSize: 8 }}>
                      ► {needLabel(activeStep)}
                      {activeStep.need && (
                        <span className="ml-1 font-mono" style={{ color: canDeliver(activeStep, ctx) ? "#4ade80" : "#fbbf24" }}>
                          ({ctx.inventory[activeStep.need.item] || 0}/{activeStep.need.qty})
                        </span>
                      )}
                    </div>
                    <div className="h-1 rounded overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div style={{ width: `${progressPct(activeStep, ctx)}%`, height: "100%", background: canDeliver(activeStep, ctx) ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#a855f7,#c084fc)", transition: "width 0.3s" }} />
                    </div>
                    <div className="mb-2 p-1.5 rounded" style={{ background: "rgba(253,224,71,0.08)", border: "1px solid rgba(253,224,71,0.25)", color: "#fde047", fontSize: 8 }}>
                      🎁 {rewardLabel(activeStep.reward, activeStep.give)}
                    </div>
                    <button
                      disabled={!canDeliver(activeStep, ctx)}
                      onClick={() => onDeliver({ questId: activeQuest.id, step: activeStep })}
                      className="w-full py-1.5 rounded font-bold tracking-wider active:scale-95"
                      style={{
                        fontSize: 9,
                        background: canDeliver(activeStep, ctx) ? "linear-gradient(180deg,#a855f7,#7c3aed)" : "rgba(100,100,100,0.4)",
                        color: canDeliver(activeStep, ctx) ? "#fff" : "#888",
                        border: `1px solid ${canDeliver(activeStep, ctx) ? "#581c87" : "#333"}`,
                        cursor: canDeliver(activeStep, ctx) ? "pointer" : "not-allowed",
                      }}
                    >
                      {activeStep.need ? "⚡ ENTREGAR" : "🎁 RECEBER"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded p-2 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
                    <div style={{ fontSize: 16 }}>✓</div>
                    <div className="font-bold" style={{ color: "#86efac", fontSize: 9 }}>Concluída</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      <style>{`
        @keyframes questPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

// Helper para passar a quantidade exigida da etapa atual (usado na entrega).
export function deliverNeed(step: QuestStep): { item: string; qty: number } | null {
  return step.need ?? null;
}

// Reexport
export { advanceQuestStep, activeQuestsCount, getStepIndex };
