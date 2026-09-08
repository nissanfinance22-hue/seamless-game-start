import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  PARTY_MAX,
  createParty, getMyParty, leaveParty, kickMember as kickPartyMember,
  transferLeadership, invitePlayer, listInvitesFor, acceptInvite, declineInvite,
  pingPresence,
  type PartyRow, type PartyMemberRow, type PartyInviteRow,
} from "@/game/party";
import { supabase } from "@/integrations/supabase/client";

type Me = { id: string; name: string; level: number; mapId: string };
type WildInfo = { id: string; name: string; level: number; hpPct: number; rarity: string };
type RemoteInfo = { id: string; name: string; level: number };

export function PartyOverlay({
  me,
  onClose,
  onPartyChange,
  nearbyPlayers,
  wildsOnMap = [],
  remotePlayersOnMap = [],
  onChallenge,
}: {
  me: Me;
  onClose: () => void;
  onPartyChange?: (p: { party: PartyRow; members: PartyMemberRow[] } | null) => void;
  nearbyPlayers: { id: string; name: string }[];
  wildsOnMap?: WildInfo[];
  remotePlayersOnMap?: RemoteInfo[];
  onChallenge?: (playerId: string) => void;
}) {
  const [state, setState] = useState<{ party: PartyRow; members: PartyMemberRow[] } | null>(null);
  const [invites, setInvites] = useState<PartyInviteRow[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"members" | "map">("members");

  const refresh = useCallback(async () => {
    const [p, inv] = await Promise.all([getMyParty(me.id), listInvitesFor(me.id)]);
    setState(p);
    setInvites(inv);
    onPartyChange?.(p);
    setLoading(false);
  }, [me.id, onPartyChange]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const ch = supabase.channel(`party-overlay-${me.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "party_members" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "party_invites" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "parties" }, refresh)
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [me.id, refresh]);

  useEffect(() => {
    if (!state) return;
    const t = setInterval(() => { void pingPresence(me.id, me.mapId, me.level); }, 15_000);
    return () => clearInterval(t);
  }, [state, me.id, me.mapId, me.level]);

  const isLeader = state?.party.leader_id === me.id;

  const handleCreate = async () => {
    try {
      await createParty({ name: newPartyName.trim(), leaderId: me.id, leaderName: me.name, level: me.level, mapId: me.mapId });
      toast.success("Party criada!");
      setNewPartyName("");
      await refresh();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleLeave = async () => {
    if (!state) return;
    await leaveParty(me.id, state.party.id, isLeader);
    toast(isLeader ? "Party dissolvida." : "Você saiu da party.");
    await refresh();
  };

  const handleInvite = async (target: { id: string; name: string }) => {
    if (!state) return;
    if (state.members.length >= PARTY_MAX) { toast.error(`Party cheia (${PARTY_MAX}).`); return; }
    try {
      await invitePlayer({ partyId: state.party.id, partyName: state.party.name, fromId: me.id, fromName: me.name, targetId: target.id, targetName: target.name });
      toast.success(`Convite enviado para ${target.name}.`);
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleAccept = async (inv: PartyInviteRow) => {
    try {
      await acceptInvite(inv, me);
      toast.success(`Você entrou em "${inv.party_name}".`);
      await refresh();
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleDecline = async (inv: PartyInviteRow) => { await declineInvite(inv.id); await refresh(); };
  const handleKick = async (m: PartyMemberRow) => { if (!state) return; await kickPartyMember(state.party.id, me.id, m.player_id); toast(`${m.player_name} foi removido.`); };
  const handleTransfer = async (m: PartyMemberRow) => { if (!state) return; await transferLeadership(state.party.id, m.player_id, m.player_name); toast.success(`Liderança transferida para ${m.player_name}.`); };

  const fmtOnline = (lastSeen: string) => {
    const age = Date.now() - new Date(lastSeen).getTime();
    if (age < 60_000) return { txt: "Online", color: "#22c55e" };
    if (age < 300_000) return { txt: "Recente", color: "#facc15" };
    return { txt: "Ausente", color: "#94a3b8" };
  };

  const rarityColor = (r: string) =>
    r === "mythic" ? "#fb7185" : r === "epic" ? "#c084fc" : r === "rare" ? "#60a5fa" : "#a3e635";

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center font-mono"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg border-2 flex flex-col overflow-hidden"
        style={{
          width: "94%",
          height: "94%",
          maxWidth: 460,
          maxHeight: 520,
          background: "linear-gradient(180deg,#0a1226,#11183a)",
          borderColor: "#22c55e",
          boxShadow: "0 0 18px rgba(34,197,94,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-[#14532d] flex-shrink-0">
          <h2 className="text-[11px] font-bold tracking-[3px]" style={{ color: "#bbf7d0" }}>PARTY</h2>
          <button onClick={onClose} className="bg-[#1f2937] text-white px-2 py-0.5 rounded text-[11px] font-bold transition-active active:scale-90">✕</button>
        </div>

        {state && (
          <div className="flex border-b border-[#14532d] bg-black/30 flex-shrink-0">
            {([
              { k: "members", label: `MEMBROS (${state.members.length}/${PARTY_MAX})` },
              { k: "map", label: `MAPA (${wildsOnMap.length})` },
            ] as const).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className="flex-1 py-1.5 text-[9px] tracking-[2px] font-bold transition-colors"
                style={{
                  color: tab === t.k ? "#04140a" : "#bbf7d0",
                  background: tab === t.k ? "linear-gradient(180deg,#22c55e,#15803d)" : "transparent",
                }}
              >{t.label}</button>
            ))}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">

          {loading ? (
            <div className="text-xs text-emerald-300">Carregando...</div>
          ) : !state ? (
            <div className="space-y-3">
              {invites.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] tracking-[2px]" style={{ color: "#bbf7d0" }}>CONVITES</div>
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-2 p-2 rounded" style={{ background: "#06060b", border: "1px solid #14532d" }}>
                      <div className="text-xs text-emerald-100">
                        <div className="font-bold">{inv.party_name}</div>
                        <div style={{ opacity: 0.7 }}>de {inv.from_name}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleAccept(inv)} className="text-[11px] px-2 py-1 rounded font-bold" style={{ background: "#22c55e", color: "#04140a" }}>Aceitar</button>
                        <button onClick={() => handleDecline(inv)} className="text-[11px] px-2 py-1 rounded" style={{ background: "#3f3f3f", color: "#e5e7eb" }}>Recusar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[11px] tracking-[2px]" style={{ color: "#bbf7d0" }}>CRIAR PARTY</div>
              <input
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value.slice(0, 32))}
                placeholder={`Grupo de ${me.name}`}
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{ background: "#06060b", color: "#e6fff0", border: "2px solid #14532d" }}
              />
              <button onClick={handleCreate} className="w-full py-2 rounded font-bold tracking-wider" style={{ background: "linear-gradient(180deg,#22c55e,#15803d)", color: "#04140a", border: "2px solid #064e2a" }}>
                CRIAR PARTY
              </button>
              <div className="text-[10px] text-emerald-400/70 mt-3 leading-relaxed p-2 rounded border border-emerald-900/40 bg-black/30">
                ★ Em party, XP de mobs é dividido entre membros no mesmo mapa, com <b>+10% por membro</b>.
              </div>
            </div>
          ) : tab === "members" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-emerald-200">{state.party.name}</div>
                  <div className="text-[10px] text-emerald-400">Líder: {state.party.leader_name}</div>
                </div>
                <div className="text-[11px] text-emerald-300">
                  XP share: <b style={{ color: "#fde047" }}>+{(state.members.length - 1) * 10}%</b>
                </div>
              </div>

              <div className="space-y-1">
                {state.members.map((m) => {
                  const st = fmtOnline(m.last_seen);
                  const isMe = m.player_id === me.id;
                  const sameMap = m.map_id === me.mapId;
                  return (
                    <div key={m.player_id} className="flex items-center justify-between gap-2 p-2 rounded" style={{ background: "#06060b", border: `1px solid ${sameMap ? "#22c55e" : "#14532d"}` }}>
                      <div className="text-xs text-emerald-100 flex-1 min-w-0">
                        <div className="font-bold truncate flex items-center gap-1">
                          <span style={{ color: "#ef4444" }}>★</span>
                          {m.player_name}
                          {m.player_id === state.party.leader_id && <span style={{ color: "#facc15" }}>👑</span>}
                          {isMe && <span className="text-[9px] opacity-60">(você)</span>}
                        </div>
                        <div className="text-[10px] flex items-center gap-2" style={{ opacity: 0.8 }}>
                          <span>Lv {m.level}</span>
                          <span style={{ color: st.color }}>● {st.txt}</span>
                          {m.map_id && <span style={{ color: sameMap ? "#22c55e" : "#94a3b8" }}>{sameMap ? "● mesmo mapa" : `· ${m.map_id}`}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!isMe && onChallenge && (
                          <button onClick={() => onChallenge(m.player_id)} title="Desafiar PvP" className="text-[10px] px-2 py-1 rounded font-bold" style={{ background: "#7c2d12", color: "#fed7aa", border: "1px solid #ea580c" }}>⚔ PvP</button>
                        )}
                        {isLeader && !isMe && (
                          <>
                            <button onClick={() => handleTransfer(m)} title="Transferir liderança" className="text-[10px] px-2 py-1 rounded" style={{ background: "#1f2937", color: "#facc15" }}>👑</button>
                            <button onClick={() => handleKick(m)} title="Remover" className="text-[10px] px-2 py-1 rounded" style={{ background: "#7f1d1d", color: "#fecaca" }}>✕</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isLeader && state.members.length < PARTY_MAX && nearbyPlayers.length > 0 && (
                <div>
                  <div className="text-[11px] tracking-[2px] mb-1" style={{ color: "#bbf7d0" }}>CONVIDAR JOGADORES PRÓXIMOS</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {nearbyPlayers
                      .filter((p) => !state.members.some((m) => m.player_id === p.id))
                      .slice(0, 8)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleInvite(p)}
                          className="w-full text-left text-xs px-2 py-1 rounded flex justify-between items-center"
                          style={{ background: "#06060b", border: "1px solid #14532d", color: "#bbf7d0" }}
                        >
                          <span>{p.name}</span>
                          <span className="text-[10px]" style={{ color: "#22c55e" }}>+ Convidar</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <button onClick={handleLeave} className="w-full py-2 rounded font-bold tracking-wider text-xs" style={{ background: "#7f1d1d", color: "#fecaca", border: "2px solid #450a0a" }}>
                {isLeader ? "DISSOLVER PARTY" : "SAIR DA PARTY"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] tracking-[2px]" style={{ color: "#bbf7d0" }}>JOGADORES NO MAPA</div>
              <div className="space-y-1">
                {remotePlayersOnMap.length === 0 ? (
                  <div className="text-[10px] text-emerald-400/60 italic">Ninguém por perto.</div>
                ) : remotePlayersOnMap.map((p) => {
                  const inParty = state.members.some((m) => m.player_id === p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-2 p-2 rounded" style={{ background: "#06060b", border: "1px solid #14532d" }}>
                      <div className="text-xs text-emerald-100 flex-1 min-w-0">
                        <div className="font-bold truncate flex items-center gap-1">
                          {inParty && <span style={{ color: "#ef4444" }}>★</span>}
                          {p.name}
                          <span className="text-[10px] opacity-60">Lv {p.level}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {onChallenge && p.id !== me.id && (
                          <button onClick={() => onChallenge(p.id)} className="text-[10px] px-2 py-1 rounded font-bold" style={{ background: "#7c2d12", color: "#fed7aa", border: "1px solid #ea580c" }}>⚔ DESAFIAR</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] tracking-[2px] mt-3" style={{ color: "#bbf7d0" }}>MOBS NO MAPA</div>
              <div className="space-y-1">
                {wildsOnMap.length === 0 ? (
                  <div className="text-[10px] text-emerald-400/60 italic">Nenhum selvagem agora.</div>
                ) : wildsOnMap.slice(0, 20).map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-2 px-2 py-1 rounded" style={{ background: "#06060b", border: "1px solid #14532d" }}>
                    <div className="text-xs flex items-center gap-2 min-w-0">
                      <span style={{ color: rarityColor(w.rarity), fontSize: 10 }}>●</span>
                      <span className="font-bold truncate" style={{ color: "#e6fff0" }}>{w.name}</span>
                      <span className="text-[10px] opacity-70">Lv{w.level}</span>
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: w.hpPct > 50 ? "#22c55e" : w.hpPct > 20 ? "#facc15" : "#ef4444" }}>{w.hpPct}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
