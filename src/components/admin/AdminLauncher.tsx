import { useEffect, useState } from "react";
import { CodeOverlay } from "./CodeOverlay";
import { AdminDashboard } from "./AdminDashboard";
import { AdminQuickBar } from "./AdminQuickBar";
import { isAdmin } from "./adminStore";

/**
 * Global launcher: floating button bottom-right.
 * - Opens a small menu with "Inserir Código" → CodeOverlay
 * - If admin unlocked, shows "Admin Dashboard" → AdminDashboard
 * - Keyboard shortcut: Shift + K to open the code modal
 */
export function AdminLauncher() {
  const [open, setOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDash, setShowDash] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "K" || e.key === "k")) {
        setShowCode(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AdminQuickBar />

      {/* Floating launcher */}
      <div className="fixed bottom-3 right-3 z-[9000] flex flex-col items-end gap-2 font-sans">
        {open && (
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/90 p-2 shadow-2xl shadow-amber-500/10 backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => { setShowCode(true); setOpen(false); }}
              className="block w-full rounded-md px-3 py-2 text-left text-xs text-amber-100 hover:bg-amber-500/10"
            >
              ✦ Inserir Código
            </button>
            {admin && (
              <button
                onClick={() => { setShowDash(true); setOpen(false); }}
                className="block w-full rounded-md px-3 py-2 text-left text-xs text-fuchsia-200 hover:bg-fuchsia-500/10"
              >
                ★ Admin Dashboard
              </button>
            )}
            <div className="px-3 py-1 text-[10px] text-slate-500 border-t border-slate-800 mt-1">Atalho: Shift+K</div>
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`grid h-11 w-11 place-items-center rounded-full border shadow-lg transition ${
            admin
              ? "border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-500 to-amber-500 text-slate-950 shadow-fuchsia-500/30"
              : "border-amber-400/40 bg-slate-900/90 text-amber-200 hover:bg-slate-800 shadow-amber-500/10"
          }`}
          title="Menu / Dashboard"
        >
          <span className="text-lg leading-none">{admin ? "★" : "≡"}</span>
        </button>
      </div>

      {showCode && (
        <CodeOverlay
          onClose={() => setShowCode(false)}
          onAdminUnlocked={() => {
            setAdmin(true);
            setShowCode(false);
            setShowDash(true);
          }}
        />
      )}
      {showDash && <AdminDashboard onClose={() => { setShowDash(false); setAdmin(isAdmin()); }} />}
    </>
  );
}
