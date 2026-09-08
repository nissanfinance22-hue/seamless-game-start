import { useState } from "react";
import { tryRedeemCode, isRewardUsed, isAdmin, type Reward } from "./adminStore";

type Status =
  | { kind: "idle" }
  | { kind: "reward"; bundle: Reward[] }
  | { kind: "beta"; bundle: Reward[] }
  | { kind: "masterball"; bundle: Reward[] }
  | { kind: "admin" }
  | { kind: "already-used" }
  | { kind: "invalid" };

export function CodeOverlay({ onClose, onAdminUnlocked }: { onClose: () => void; onAdminUnlocked: () => void }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const rewardUsed = isRewardUsed();
  const admin = isAdmin();

  const submit = () => {
    const res = tryRedeemCode(code);
    setStatus(res);
    if (res.kind === "admin") {
      setTimeout(() => onAdminUnlocked(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 shadow-2xl shadow-amber-500/10">
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-semibold">Dashboard</div>
            <h2 className="text-xl font-bold text-amber-50 mt-1">Inserir Código</h2>
            <p className="text-xs text-slate-400 mt-1">Resgate recompensas ou desbloqueie modos especiais.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700/60 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/60"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Digite o código secreto…"
            spellCheck={false}
            autoFocus
            className="flex-1 rounded-lg border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-amber-50 placeholder:text-slate-500 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            onClick={submit}
            className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow shadow-amber-500/30 hover:from-amber-300 hover:to-amber-500 active:translate-y-[1px]"
          >
            Resgatar
          </button>
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-400">Código de recompensa</span>
            <span className={rewardUsed ? "text-emerald-400" : "text-slate-300"}>
              {rewardUsed ? "✓ Resgatado" : "Disponível"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-400">Modo administrador</span>
            <span className={admin ? "text-fuchsia-400" : "text-slate-300"}>
              {admin ? "★ Ativo" : "Bloqueado"}
            </span>
          </div>
        </div>

        {status.kind === "reward" && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="text-sm font-semibold text-emerald-300">✦ Recompensa entregue!</div>
            <div className="text-xs text-emerald-100/70 mt-1">Itens vinculados à sua conta (não podem ser vendidos, trocados ou dropados).</div>
            <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
              {status.bundle.map((r, i) => (
                <li
                  key={i}
                  className={`rounded-md border px-2 py-1.5 flex items-center justify-between ${
                    r.rare
                      ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
                      : "border-slate-700/60 bg-slate-900/60 text-slate-200"
                  }`}
                >
                  <span>{r.label}</span>
                  <span className="font-bold">×{r.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status.kind === "beta" && (
          <div className="mt-5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
            <div className="text-sm font-semibold text-cyan-200">★ BETA RUBY ATIVADO!</div>
            <div className="text-xs text-cyan-100/70 mt-1">Itens de evento (não vão pro Market) + AUTO por 3 dias.</div>
            <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
              {status.bundle.map((r, i) => (
                <li key={i} className="rounded-md border border-cyan-400/40 bg-cyan-500/10 text-cyan-100 px-2 py-1.5 flex items-center justify-between">
                  <span>{r.label}</span>
                  <span className="font-bold">×{r.qty}</span>
                </li>
              ))}
            </ul>
            <div className="text-[10px] text-cyan-100/60 mt-2">Recarregue a página para ativar os itens.</div>
          </div>
        )}

        {status.kind === "masterball" && (
          <div className="mt-5 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4">
            <div className="text-sm font-semibold text-fuchsia-200">🟣 MASTER BALL ×10 ENTREGUES!</div>
            <div className="text-xs text-fuchsia-100/70 mt-1">Vinculadas à sua conta. Recarregue para ver no inventário.</div>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 text-xs">
              {status.bundle.map((r, i) => (
                <li key={i} className="rounded-md border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100 px-2 py-1.5 flex items-center justify-between">
                  <span>{r.label}</span>
                  <span className="font-bold">×{r.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status.kind === "admin" && (
          <div className="mt-5 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4 text-center">
            <div className="text-sm font-semibold text-fuchsia-200">★ ADMIN MODE ATIVADO</div>
            <div className="text-xs text-fuchsia-100/70 mt-1">Abrindo dashboard administrativa…</div>
          </div>
        )}

        {status.kind === "already-used" && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
            Este código já foi resgatado nesta conta.
          </div>
        )}

        {status.kind === "invalid" && (
          <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-200">
            Código inválido. Verifique e tente novamente.
          </div>
        )}
      </div>
    </div>
  );
}
