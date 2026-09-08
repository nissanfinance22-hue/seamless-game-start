import { useState } from "react";
import {
  type Guild, type GuildElement, GUILD_ELEMENTS, GUILD_OPEN_COST,
  bonusesFor, xpForLevel, nextLevelCost, GUILD_MAX_LEVEL,
} from "@/game/guild";
import type { GuildInvite } from "@/lib/guildApi";

type Props = {
  guild: Guild | null;
  meId: string;
  meName: string;
  meLevel: number;
  meLeaderSpecies?: string | null;
  gold: number;
  setGold: (fn: (g: number) => number) => void;
  crystal: number;
  ruby: number;
  capturePoints: number;
  setCapturePoints: (fn: (n: number) => number) => void;
  speciesGif: Record<string, string>;
  onClose: () => void;
  onMessage: (m: string) => void;

  // Async actions (Supabase-backed)
  pendingInvites: GuildInvite[];
  onCreate: (args: { name: string; element: GuildElement }) => Promise<void>;
  onDonate: (xp: number) => Promise<void>;
  onDonateResource: (kind: "gold" | "crystal" | "ruby", qty: number) => Promise<void>;
  onEvolve: () => Promise<void>;
  onPromoteVice: (memberId: string, memberName: string) => Promise<void>;
  onDemoteVice: () => Promise<void>;
  onKick: (memberId: string, memberName: string) => Promise<void>;
  onDissolve: () => Promise<void>;
  onLeave: () => Promise<void>;
  onAcceptInvite: (inv: GuildInvite) => Promise<void>;
  onDeclineInvite: (inv: GuildInvite) => Promise<void>;
  onInviteByUsername: (username: string) => Promise<void>;
};

export function GuildOverlay({
  guild, meId, meName, meLevel, meLeaderSpecies: _meLeaderSpecies,
  gold, setGold: _setGold, crystal, ruby, capturePoints, setCapturePoints: _setCapturePoints, speciesGif,
  onClose, onMessage,
  pendingInvites, onCreate, onDonate, onDonateResource, onEvolve,
  onPromoteVice, onDemoteVice, onKick, onDissolve, onLeave,
  onAcceptInvite, onDeclineInvite, onInviteByUsername,
}: Props) {
  const [name, setName] = useState("");
  const [element, setElement] = useState<GuildElement>("fire");
  const [donate, setDonate] = useState(10);
  const [inviteUser, setInviteUser] = useState("");
  const [busy, setBusy] = useState(false);
  const [donateKind, setDonateKind] = useState<"gold" | "crystal" | "ruby">("gold");
  const [donateQty, setDonateQty] = useState(100);
  void _meLeaderSpecies; void _setGold; void _setCapturePoints; void meName; void meLevel;


  const overlayBg = "rgba(8,12,28,0.94)";
  void overlayBg;

  // ---------------- CREATE FORM ----------------
  if (!guild) {
    const el = GUILD_ELEMENTS.find((e) => e.id === element)!;
    const canCreate = name.trim().length >= 3 && gold >= GUILD_OPEN_COST && !busy;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="w-full max-w-[420px] max-h-[96vh] text-[9px] sm:text-[11px] gb-font flex flex-col" style={{
          background: "linear-gradient(160deg,#1a1f3a 0%, #0f1428 100%)",
          border: `3px solid ${el.color}`, borderRadius: 14, color: "#fff",
          boxShadow: `0 18px 50px rgba(0,0,0,0.7), 0 0 30px ${el.color}55`,
          overflow: "hidden",
        }}>
          <div style={{ background: `linear-gradient(135deg, ${el.color} 0%, ${el.color}cc 100%)`, padding: "12px 14px", borderBottom: "2px solid rgba(0,0,0,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
              <img src={el.image} alt={el.label} className="pixelated" style={{ width: 28, height: 28 }} />
              <div className="overflow-hidden">
                <div className="name-font truncate" style={{ fontSize: 13, letterSpacing: 1 }}>FUNDAR GUILDA</div>
                <div className="truncate" style={{ fontSize: 7, opacity: 0.9 }}>Reúna treinadores · cresça juntos</div>
              </div>
            </div>
            <button onClick={onClose} className="bg-black/40 text-white border-2 border-white/20 px-3 py-1 rounded font-bold transition-active active:scale-90 ml-2">X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Convites pendentes pra mim */}
            {pendingInvites.length > 0 && (
              <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid #22c55e", borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 8, color: "#86efac", marginBottom: 4 }}>✉️ CONVITES PENDENTES ({pendingInvites.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {pendingInvites.map((inv) => (
                    <div key={inv.id} style={{ background: "rgba(0,0,0,0.35)", borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 9 }}>
                        <b style={{ color: "#86efac" }}>{inv.guild_name}</b>
                        <span style={{ opacity: 0.7 }}> — convite de {inv.from_username}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <button disabled={busy} onClick={async () => { setBusy(true); await onAcceptInvite(inv); setBusy(false); }}
                          className="gb-font" style={{ flex: 1, background: "linear-gradient(180deg,#22c55e,#16a34a)", color: "#fff", border: "none", padding: "4px", fontSize: 8, borderRadius: 4 }}>ACEITAR</button>
                        <button disabled={busy} onClick={async () => { setBusy(true); await onDeclineInvite(inv); setBusy(false); }}
                          className="gb-font" style={{ flex: 1, background: "rgba(239,68,68,0.5)", color: "#fff", border: "none", padding: "4px", fontSize: 8, borderRadius: 4 }}>RECUSAR</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 8, opacity: 0.7, marginBottom: 3 }}>NOME DA GUILDA</div>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 18))} maxLength={18}
                placeholder="Ex: Sombras de Kanto"
                className="gb-font" style={{ width: "100%", background: "rgba(0,0,0,0.4)", color: "#fff", border: `1px solid ${el.color}`, padding: "6px 8px", fontSize: 9, borderRadius: 6, outline: "none" }} />
            </div>

            <div>
              <div style={{ fontSize: 8, opacity: 0.7, marginBottom: 4 }}>ELEMENTO DA GUILDA</div>
              <div className="grid grid-cols-4 gap-1">
                {GUILD_ELEMENTS.map((e) => (
                  <button key={e.id} onClick={() => setElement(e.id)}
                    style={{
                      background: element === e.id ? `linear-gradient(180deg, ${e.color}, ${e.color}99)` : "rgba(255,255,255,0.05)",
                      border: element === e.id ? `2px solid ${e.color}` : "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6, padding: "8px 2px", textAlign: "center", cursor: "pointer",
                      boxShadow: element === e.id ? `0 0 12px ${e.color}88` : "none",
                    }}>
                    <img src={e.image} alt={e.label} className="pixelated" style={{ width: 26, height: 26, margin: "0 auto", display: "block" }} />
                    <div className="gb-font" style={{ fontSize: 6, marginTop: 2, color: "#fff" }}>{e.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.35)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 6, padding: 8, fontSize: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>💰 Custo de fundação</span>
                <span style={{ color: gold >= GUILD_OPEN_COST ? "#86efac" : "#fca5a5" }}>{GUILD_OPEN_COST} G</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span>Seu ouro</span><span>{gold} G</span>
              </div>
            </div>

            <button disabled={!canCreate}
              onClick={async () => { setBusy(true); await onCreate({ name, element }); setBusy(false); }}
              className="gb-font btn-glow"
              style={{
                background: canCreate ? `linear-gradient(180deg, ${el.color}, ${el.color}aa)` : "rgba(255,255,255,0.08)",
                color: "#fff", border: "2px solid rgba(0,0,0,0.55)", borderRadius: 8,
                padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                opacity: canCreate ? 1 : 0.5, cursor: canCreate ? "pointer" : "not-allowed",
                boxShadow: canCreate ? `0 4px 0 rgba(0,0,0,0.4), 0 0 20px ${el.color}66` : "none",
              }}>
              {busy ? "..." : gold < GUILD_OPEN_COST ? "OURO INSUFICIENTE" : name.trim().length < 3 ? "DIGITE UM NOME (3+)" : "★ FUNDAR GUILDA ★"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- GUILD VIEW ----------------
  const el = GUILD_ELEMENTS.find((e) => e.id === guild.element)!;
  const need = xpForLevel(guild.level);
  const pct = Math.min(100, (guild.xp / need) * 100);
  const bonus = bonusesFor(guild.level);
  const nextBonus = bonusesFor(guild.level + 1);
  const isFounder = guild.founderId === meId;
  const isVice = guild.viceLeaderId === meId;
  const isOfficer = isFounder || isVice;
  const treasury = guild.treasury ?? { gold: 0, crystal: 0, ruby: 0 };
  const cost = nextLevelCost(guild.level);
  const isMax = guild.level >= GUILD_MAX_LEVEL;
  const canEvolve = !!cost
    && (cost.gold ?? 0) <= treasury.gold
    && (cost.crystal ?? 0) <= treasury.crystal
    && (cost.ruby ?? 0) <= treasury.ruby;


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[440px] flex flex-col text-[8px] sm:text-[10px] gb-font" style={{
        height: "92vh",
        background: "linear-gradient(160deg,#1a1f3a 0%, #0f1428 100%)",
        border: `3px solid ${el.color}`, borderRadius: 14, color: "#fff",
        boxShadow: `0 18px 50px rgba(0,0,0,0.7), 0 0 30px ${el.color}55`,
        overflow: "hidden",
      }}>
        <div style={{ background: `linear-gradient(135deg, ${el.color} 0%, ${el.color}aa 100%)`, padding: "12px 14px", borderBottom: "2px solid rgba(0,0,0,0.5)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <div className="flex-shrink-0" style={{
                width: 44, height: 44, borderRadius: 10,
                background: "rgba(0,0,0,0.4)", border: "2px solid rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, boxShadow: `inset 0 0 12px ${el.color}88`,
              }}>
                <img src={el.image} alt={el.label} className="pixelated" style={{ width: 36, height: 36 }} />
              </div>
              <div className="overflow-hidden">
                <div className="name-font truncate" style={{ fontSize: 14, letterSpacing: 1, textShadow: "0 1px 0 rgba(0,0,0,0.5)" }}>{guild.name.toUpperCase()}</div>
                <div className="truncate" style={{ fontSize: 7, opacity: 0.92 }}>{el.label} · Nv {guild.level}/50 · {guild.members.length}/{bonus.slots}</div>
              </div>
            </div>
            <button onClick={onClose} className="bg-black/40 text-white border-2 border-white/20 px-3 py-1 rounded font-bold transition-active active:scale-90 ml-2">X</button>
          </div>

          <div style={{ marginTop: 8, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.5)", borderRadius: 4, padding: 2 }}>
            <div style={{ width: `${pct}%`, height: 8, background: `linear-gradient(90deg, #fff, ${el.color})`, borderRadius: 2, boxShadow: `0 0 8px ${el.color}` }} />
          </div>
          <div style={{ fontSize: 7, opacity: 0.9, marginTop: 2, display: "flex", justifyContent: "space-between" }}>
            <span>XP {guild.xp} / {need}</span>
            <span>Total doado: {guild.totalDonated}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* INVITE BY USERNAME */}
          <section style={{ background: "rgba(34,197,94,0.08)", border: "1px solid #16a34a55", borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, color: "#86efac", marginBottom: 4 }}>✉️ CONVIDAR POR USERNAME</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input value={inviteUser} onChange={(e) => setInviteUser(e.target.value)}
                placeholder="Username"
                className="gb-font" style={{ flex: 1, background: "rgba(0,0,0,0.4)", color: "#fff", border: "1px solid #16a34a", padding: "4px 6px", fontSize: 9, borderRadius: 4, outline: "none" }} />
              <button disabled={busy || !inviteUser.trim()}
                onClick={async () => {
                  setBusy(true);
                  await onInviteByUsername(inviteUser.trim());
                  setInviteUser("");
                  setBusy(false);
                }}
                className="gb-font" style={{ background: "linear-gradient(180deg,#22c55e,#16a34a)", color: "#fff", border: "none", padding: "4px 10px", fontSize: 8, borderRadius: 4 }}>ENVIAR</button>
            </div>
          </section>

          {/* DONATE */}
          <section>
            <div style={{ fontSize: 8, opacity: 0.7, marginBottom: 4 }}>💎 DOAR FRAGMENTOS ({capturePoints} disp.)</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="number" min={1} value={donate}
                onChange={(e) => setDonate(Math.max(1, parseInt(e.target.value) || 1))}
                className="gb-font" style={{ width: 60, background: "rgba(0,0,0,0.4)", color: "#fff", border: `1px solid ${el.color}`, padding: "4px 6px", fontSize: 9, borderRadius: 4, outline: "none" }} />
              {[10, 50, 100].map((v) => (
                <button key={v} onClick={() => setDonate(v)} className="gb-font"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "3px 6px", fontSize: 7, borderRadius: 4 }}>{v}</button>
              ))}
              <button
                disabled={capturePoints < donate || busy}
                onClick={async () => { setBusy(true); await onDonate(donate); setBusy(false); }}
                className="gb-font btn-glow"
                style={{
                  flex: 1, background: capturePoints >= donate ? `linear-gradient(180deg,${el.color},${el.color}99)` : "rgba(255,255,255,0.08)",
                  color: "#fff", border: "2px solid rgba(0,0,0,0.5)", borderRadius: 6, padding: "6px", fontSize: 9, fontWeight: 700,
                  opacity: capturePoints >= donate ? 1 : 0.5,
                }}>DOAR</button>
            </div>
          </section>

          {/* TESOURO + EVOLUIR */}
          <section style={{ background: "rgba(251,191,36,0.06)", border: "1px solid #f59e0b55", borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, color: "#fcd34d", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
              <span>🏛️ TESOURO DA GUILDA</span>
              <span style={{ opacity: 0.7 }}>Nv {guild.level}/{GUILD_MAX_LEVEL}</span>
            </div>
            <div className="grid grid-cols-3 gap-1" style={{ fontSize: 8, marginBottom: 6 }}>
              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 4, padding: "4px 6px", textAlign: "center" }}>
                <div style={{ color: "#fcd34d" }}>💰 {treasury.gold}</div><div style={{ opacity: 0.5, fontSize: 6 }}>OURO</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 4, padding: "4px 6px", textAlign: "center" }}>
                <div style={{ color: "#93c5fd" }}>💎 {treasury.crystal}</div><div style={{ opacity: 0.5, fontSize: 6 }}>CRISTAL</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 4, padding: "4px 6px", textAlign: "center" }}>
                <div style={{ color: "#fca5a5" }}>🔴 {treasury.ruby}</div><div style={{ opacity: 0.5, fontSize: 6 }}>RUBY</div>
              </div>
            </div>

            {/* Doação multi-moeda */}
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {(["gold","crystal","ruby"] as const).map((k) => (
                <button key={k} onClick={() => setDonateKind(k)} className="gb-font"
                  style={{
                    flex: 1, fontSize: 7, padding: "3px",
                    background: donateKind === k ? `linear-gradient(180deg,${el.color},${el.color}99)` : "rgba(255,255,255,0.05)",
                    color: "#fff", border: donateKind === k ? `1px solid ${el.color}` : "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 4,
                  }}>
                  {k === "gold" ? `💰 ${gold}` : k === "crystal" ? `💎 ${crystal}` : `🔴 ${ruby}`}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <input type="number" min={1} value={donateQty}
                onChange={(e) => setDonateQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="gb-font" style={{ width: 70, background: "rgba(0,0,0,0.4)", color: "#fff", border: `1px solid ${el.color}`, padding: "3px 5px", fontSize: 9, borderRadius: 4, outline: "none" }} />
              <button
                disabled={busy || (donateKind === "gold" ? gold : donateKind === "crystal" ? crystal : ruby) < donateQty}
                onClick={async () => { setBusy(true); await onDonateResource(donateKind, donateQty); setBusy(false); }}
                className="gb-font"
                style={{
                  flex: 1, background: `linear-gradient(180deg,#f59e0b,#d97706)`, color: "#fff",
                  border: "1px solid rgba(0,0,0,0.4)", borderRadius: 4, padding: "4px", fontSize: 8, fontWeight: 700,
                  opacity: (donateKind === "gold" ? gold : donateKind === "crystal" ? crystal : ruby) >= donateQty ? 1 : 0.4,
                }}>DOAR P/ TESOURO</button>
            </div>

            {/* Evolução */}
            <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px dashed rgba(255,255,255,0.15)" }}>
              {isMax ? (
                <div style={{ fontSize: 8, textAlign: "center", color: "#86efac" }}>★ NÍVEL MÁXIMO ATINGIDO ★</div>
              ) : (
                <>
                  <div style={{ fontSize: 7, opacity: 0.75, marginBottom: 4 }}>
                    Para evoluir Nv {guild.level} → {guild.level + 1}:
                    {cost?.gold ? ` 💰${cost.gold}` : ""}{cost?.crystal ? ` 💎${cost.crystal}` : ""}{cost?.ruby ? ` 🔴${cost.ruby}` : ""}
                  </div>
                  {isOfficer ? (
                    <button
                      disabled={busy || !canEvolve}
                      onClick={async () => { setBusy(true); await onEvolve(); setBusy(false); }}
                      className="gb-font btn-glow"
                      style={{
                        width: "100%", background: canEvolve ? `linear-gradient(180deg,${el.color},${el.color}99)` : "rgba(255,255,255,0.06)",
                        color: "#fff", border: "2px solid rgba(0,0,0,0.5)", borderRadius: 6, padding: "6px",
                        fontSize: 9, fontWeight: 700, letterSpacing: 1,
                        opacity: canEvolve ? 1 : 0.5,
                        boxShadow: canEvolve ? `0 0 12px ${el.color}66` : "none",
                      }}>
                      {canEvolve ? "★ EVOLUIR GUILDA ★" : "TESOURO INSUFICIENTE"}
                    </button>
                  ) : (
                    <div style={{ fontSize: 7, opacity: 0.5, textAlign: "center" }}>Apenas líder/vice pode evoluir.</div>
                  )}
                </>
              )}
            </div>
          </section>


          {/* BONUSES */}
          <section>
            <div style={{ fontSize: 8, opacity: 0.7, marginBottom: 4 }}>★ BÔNUS ATIVOS</div>
            <div className="grid grid-cols-2 gap-1" style={{ fontSize: 7 }}>
              <BonusRow color={el.color} label="💰 Ouro" val={`+${Math.round(bonus.gold * 100)}%`} next={`+${Math.round(nextBonus.gold * 100)}%`} />
              <BonusRow color={el.color} label="⚡ XP" val={`+${Math.round(bonus.xp * 100)}%`} next={`+${Math.round(nextBonus.xp * 100)}%`} />
              <BonusRow color={el.color} label="🎯 Captura" val={`+${Math.round(bonus.capture * 100)}%`} next={`+${Math.round(nextBonus.capture * 100)}%`} />
              <BonusRow color={el.color} label="✨ Shiny" val={`+${(bonus.shiny * 100).toFixed(2)}%`} next={`+${(nextBonus.shiny * 100).toFixed(2)}%`} />
            </div>
          </section>

          {/* MEMBERS */}
          <section>
            <div style={{ fontSize: 8, opacity: 0.7, marginBottom: 4 }}>👥 MEMBROS ({guild.members.length}/{bonus.slots})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {guild.members.map((m) => {
                const gif = m.leaderSpecies ? speciesGif[m.leaderSpecies] : null;
                const founder = m.id === guild.founderId;
                const vice = m.id === guild.viceLeaderId;
                const badge = founder ? "👑 LÍDER" : vice ? "⭐ VICE" : null;
                const accentColor = founder ? el.color : vice ? "#86efac" : null;
                return (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: accentColor ? `linear-gradient(90deg, ${accentColor}33, transparent)` : "rgba(255,255,255,0.04)",
                    border: accentColor ? `1px solid ${accentColor}88` : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6, padding: "5px 7px",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6, background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                    }}>
                      {gif
                        ? <img src={gif} alt="" className="pixelated" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        : <span style={{ fontSize: 16 }}>👤</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="truncate">{m.name}</span>
                        {badge && <span style={{ fontSize: 6, color: accentColor ?? "#fff", opacity: 0.9 }}>{badge}</span>}
                      </div>
                      <div style={{ fontSize: 7, opacity: 0.65 }}>Lv {m.level}</div>
                    </div>
                    {/* Promover/Rebaixar vice (apenas fundador, não em si mesmo, não no fundador) */}
                    {isFounder && !founder && (
                      vice ? (
                        <button disabled={busy} onClick={async () => { setBusy(true); await onDemoteVice(); setBusy(false); }}
                          className="gb-font" title="Rebaixar vice"
                          style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d", border: "1px solid #f59e0b", padding: "2px 5px", fontSize: 7, borderRadius: 3 }}>↓V</button>
                      ) : (
                        <button disabled={busy} onClick={async () => { setBusy(true); await onPromoteVice(m.id, m.name); setBusy(false); }}
                          className="gb-font" title="Promover a vice"
                          style={{ background: "rgba(134,239,172,0.2)", color: "#86efac", border: "1px solid #22c55e", padding: "2px 5px", fontSize: 7, borderRadius: 3 }}>↑V</button>
                      )
                    )}
                    {/* Expulsar: líder pode expulsar qualquer um menos a si; vice pode expulsar members comuns */}
                    {((isFounder && !founder) || (isVice && !founder && !vice && m.id !== meId)) && (
                      <button disabled={busy} onClick={async () => { setBusy(true); await onKick(m.id, m.name); setBusy(false); }}
                        className="gb-font" style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5", border: "1px solid #ef4444", padding: "2px 5px", fontSize: 7, borderRadius: 3 }}>×</button>
                    )}
                  </div>
                );

              })}
            </div>
            <div style={{ fontSize: 7, opacity: 0.6, marginTop: 4, textAlign: "center" }}>
              💡 Use o campo acima ou clique em treinadores no mapa
            </div>
          </section>

          {isFounder ? (
            <button onClick={async () => {
              if (confirm("Desfazer a guilda? Esta ação é permanente.")) {
                setBusy(true); await onDissolve(); setBusy(false);
                onMessage("Guilda dissolvida.");
              }
            }} className="gb-font" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid #ef4444", padding: "6px", fontSize: 8, borderRadius: 6 }}>
              DISSOLVER GUILDA
            </button>
          ) : (
            <button onClick={async () => {
              if (confirm("Sair da guilda?")) {
                setBusy(true); await onLeave(); setBusy(false);
              }
            }} className="gb-font" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid #ef4444", padding: "6px", fontSize: 8, borderRadius: 6 }}>
              SAIR DA GUILDA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BonusRow({ color, label, val, next }: { color: string; label: string; val: string; next: string }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "4px 6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ opacity: 0.8 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{val}</span>
      </div>
      <div style={{ opacity: 0.45, fontSize: 6 }}>próx nv: {next}</div>
    </div>
  );
}
