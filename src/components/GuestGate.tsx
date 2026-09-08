import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { IDENTITY_KEY, loadIdentity, type LocalIdentity } from "@/components/AuthGate";

/**
 * GuestGate: entra no jogo IMEDIATAMENTE, sem login/senha.
 * Se ainda não existir identidade local, pede o nome do treinador
 * antes de deixar entrar (para multiplayer / chat global).
 */
export function GuestGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = loadIdentity();
    if (!id) {
      setNeedsName(true);
      return;
    }
    setReady(true);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim().slice(0, 16);
    if (name.length < 2) {
      setErr("Nome muito curto (mínimo 2 letras).");
      return;
    }
    const guest: LocalIdentity = {
      id: `guest-${crypto.randomUUID?.() ?? Date.now()}`,
      name,
      secretKey: "",
      createdAt: Date.now(),
    };
    try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(guest)); } catch { /* ignore */ }
    setReady(true);
  };

  if (needsName && !ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "grid", placeItems: "center",
        background: "radial-gradient(ellipse at top, #1a0b2e 0%, #0b0510 70%)",
        color: "#f3e5c5", fontFamily: "'Press Start 2P', monospace",
        padding: 20,
      }}>
        <form onSubmit={submit} style={{
          background: "rgba(20,10,35,0.92)",
          border: "2px solid #c084fc",
          borderRadius: 8,
          padding: "28px 24px",
          maxWidth: 380, width: "100%",
          boxShadow: "0 0 40px rgba(192,132,252,0.35)",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ fontSize: 14, color: "#f5cf6b", textAlign: "center", lineHeight: 1.5 }}>
            RubyM Idle
          </div>
          <label style={{ fontSize: 10, color: "#bcdcff", lineHeight: 1.7 }}>
            Nome do Treinador
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setErr(null); }}
              maxLength={16}
              placeholder="Ash"
              style={{
                display: "block", width: "100%", marginTop: 10,
                background: "#0b0510", color: "#f3e5c5",
                border: "1px solid #6bd4ff", borderRadius: 4,
                padding: "10px 12px", fontSize: 12,
                fontFamily: "monospace", outline: "none",
              }}
            />
          </label>
          {err && (
            <div style={{ fontSize: 10, color: "#ff6b3d", textAlign: "center" }}>{err}</div>
          )}
          <button type="submit" style={{
            background: "linear-gradient(180deg,#c084fc,#7b3fb0)",
            border: "1px solid #f3e5c5",
            color: "#0b0510", fontFamily: "inherit",
            fontSize: 11, padding: "12px 16px", borderRadius: 4,
            cursor: "pointer", fontWeight: 700, letterSpacing: 0.5,
          }}>
            ENTRAR
          </button>
          <div style={{ fontSize: 8, color: "#8a7a9c", textAlign: "center", lineHeight: 1.6 }}>
            Este nome aparece pros outros jogadores no chat global e no mapa.
          </div>
        </form>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "grid", placeItems: "center",
        background: "#0b0510", color: "#f3e5c5", fontFamily: "monospace",
      }}>
        Carregando…
      </div>
    );
  }

  return <>{children}</>;
}
