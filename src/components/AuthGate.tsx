import { useEffect, useState, type ReactNode } from "react";

// ============================================================
// MODO LOCAL (OFFLINE) — sem login, sem senha.
// O jogo cria automaticamente uma identidade local no navegador
// e entra direto na aventura.
// ============================================================

export const IDENTITY_KEY = "rubym.identity.v1";
export const GUEST_KEY = "rubym.guest.v1";
export const GUEST_PASSWORD = "RBM";

export type LocalIdentity = {
  id: string;
  name: string;
  secretKey: string;
  createdAt: number;
};

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}

export function loadIdentity(): LocalIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const id = JSON.parse(raw) as LocalIdentity;
    if (!id?.name || !id?.id) return null;
    return id;
  } catch {
    return null;
  }
}

export function ensureLocalIdentity(): LocalIdentity {
  const existing = loadIdentity();
  if (existing) return existing;
  const identity: LocalIdentity = {
    id: newId(),
    name: "TREINADOR",
    secretKey: "",
    createdAt: Date.now(),
  };
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* ignore */
  }
  return identity;
}

/** Entra direto: garante identidade local e renderiza o jogo. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureLocalIdentity();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1f0d",
          color: "#e0f8d0",
          fontSize: 12,
          letterSpacing: 1,
        }}
      >
        CARREGANDO…
      </div>
    );
  }

  return <>{children}</>;
}

/** Reinicia a identidade local (não há sessão remota no modo offline). */
export async function signOutRubyM() {
  try {
    localStorage.removeItem(IDENTITY_KEY);
  } catch {
    /* ignore */
  }
}
