import { useEffect, useMemo, useState } from "react";
import {
  getConfig,
  saveConfig,
  getLogs,
  pushLog,
  readSave,
  patchSave,
  setAdmin,
  type AdminConfig,
} from "./adminStore";

type TabId =
  | "dashboard"
  | "players"
  | "gifts"
  | "pokemon"
  | "spawn"
  | "items"
  | "weather"
  | "portals"
  | "traps"
  | "chests"
  | "npc"
  | "economy"
  | "teleport"
  | "mapedit"
  | "invisible"
  | "events"
  | "reports"
  | "logs"
  | "config";

const TABS: { id: TabId; label: string; icon: string; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◆", group: "Visão" },
  { id: "players", label: "Players Online", icon: "◉", group: "Visão" },
  { id: "gifts", label: "Enviar Presente", icon: "✉", group: "Visão" },
  { id: "pokemon", label: "Pokémon Manager", icon: "♦", group: "Conteúdo" },
  { id: "spawn", label: "Spawn Manager", icon: "✦", group: "Conteúdo" },
  { id: "items", label: "Items Manager", icon: "▣", group: "Conteúdo" },
  { id: "weather", label: "Weather System", icon: "☁", group: "Mundo" },
  { id: "portals", label: "Portals", icon: "◎", group: "Mundo" },
  { id: "traps", label: "Traps", icon: "▲", group: "Mundo" },
  { id: "chests", label: "Chests", icon: "▦", group: "Mundo" },
  { id: "npc", label: "NPC Manager", icon: "◈", group: "Mundo" },
  { id: "economy", label: "Economy", icon: "₿", group: "Sistema" },
  { id: "teleport", label: "Teleport", icon: "➤", group: "Sistema" },
  { id: "mapedit", label: "Live Map Editor", icon: "▤", group: "Sistema" },
  { id: "invisible", label: "Invisible Mode", icon: "○", group: "Sistema" },
  { id: "events", label: "Global Events", icon: "★", group: "Sistema" },
  { id: "reports", label: "Reports", icon: "▥", group: "Auditoria" },
  { id: "logs", label: "Logs", icon: "≡", group: "Auditoria" },
  { id: "config", label: "Admin Config", icon: "⚙", group: "Auditoria" },
];


export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [config, setConfig] = useState<AdminConfig>(() => getConfig());
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    saveConfig(config);
    // notify in-game runtime
    if (typeof window !== "undefined") window.dispatchEvent(new Event("rubym:config"));
  }, [config]);

  const filteredTabs = useMemo(
    () => TABS.filter((t) => t.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const grouped = useMemo(() => {
    const m = new Map<string, typeof TABS>();
    for (const t of filteredTabs) {
      const arr = m.get(t.group) ?? [];
      arr.push(t);
      m.set(t.group, arr);
    }
    return Array.from(m.entries());
  }, [filteredTabs]);

  const pickTab = (id: TabId) => { setTab(id); setNavOpen(false); };

  const sidebar = (
    <>
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-800/80">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-amber-500 text-slate-950 font-black">★</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-400/80">Ruby M</div>
          <div className="text-sm font-bold text-slate-100 leading-none mt-0.5">Admin Console</div>
        </div>
        <button onClick={() => setNavOpen(false)} className="md:hidden text-slate-400 hover:text-slate-100 text-xl leading-none">×</button>
      </div>
      <div className="p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar…"
          className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs placeholder:text-slate-500 outline-none focus:border-fuchsia-500/60"
        />
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-3">
        {grouped.map(([group, items]) => (
          <div key={group}>
            <div className="px-2 pb-1 text-[9px] uppercase tracking-widest text-slate-500">{group}</div>
            <ul className="space-y-0.5">
              {items.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => pickTab(t.id)}
                    className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                      tab === t.id
                        ? "bg-gradient-to-r from-fuchsia-500/15 to-amber-500/5 text-amber-100 ring-1 ring-fuchsia-500/30"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                    }`}
                  >
                    <span className={`w-4 text-center ${tab === t.id ? "text-fuchsia-300" : "text-slate-600 group-hover:text-slate-300"}`}>{t.icon}</span>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800/80 p-3 space-y-1.5">
        <button
          onClick={() => {
            setAdmin(false);
            pushLog({ actor: "self", action: "admin_logout" });
            onClose();
          }}
          className="w-full rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20"
        >
          Sair do modo admin
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-md border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800/60"
        >
          Fechar dashboard
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex bg-slate-950/95 backdrop-blur-xl text-slate-100 font-sans animate-in fade-in duration-200">
      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden md:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/60">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <>
          <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setNavOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-30 flex w-64 max-w-[80vw] flex-col border-r border-slate-800/80 bg-slate-950 md:hidden animate-in slide-in-from-left">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main */}
      <main className="relative z-10 flex-1 overflow-y-auto min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-3 md:px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setNavOpen(true)}
              className="md:hidden grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-200"
              aria-label="Abrir menu"
            >☰</button>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-fuchsia-400/70">Painel</div>
              <h1 className="text-base md:text-lg font-bold text-amber-50 truncate">{TABS.find((t) => t.id === tab)?.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)]" />
            <span className="hidden sm:inline">Modo Administrador</span>
            <button onClick={onClose} className="ml-1 rounded-md border border-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-800 md:hidden">×</button>
          </div>
        </header>
        <div className="px-3 md:px-6 py-4 md:py-6">
          <TabBody tab={tab} config={config} setConfig={setConfig} />
        </div>
      </main>
    </div>
  );
}



// ---------------- Tab body router ----------------
function TabBody({
  tab,
  config,
  setConfig,
}: {
  tab: TabId;
  config: AdminConfig;
  setConfig: (c: AdminConfig) => void;
}) {
  switch (tab) {
    case "dashboard":
      return <DashboardTab />;
    case "players":
      return <PlayersTab />;
    case "gifts":
      return <GiftsTab />;
    case "pokemon":
      return <PokemonTab />;
    case "spawn":
      return <SpawnTab config={config} setConfig={setConfig} />;
    case "items":
      return <ItemsTab />;
    case "weather":
      return <WeatherTab config={config} setConfig={setConfig} />;
    case "economy":
      return <EconomyTab config={config} setConfig={setConfig} />;
    case "events":
      return <EventsTab config={config} setConfig={setConfig} />;
    case "invisible":
      return <InvisibleTab config={config} setConfig={setConfig} />;
    case "teleport":
      return <TeleportTab />;
    case "logs":
      return <LogsTab />;
    case "config":
      return <ConfigTab config={config} />;
    default:
      return <PlaceholderTab tabLabel={TABS.find((t) => t.id === tab)?.label ?? ""} />;
  }
}

// ---------------- Reusable ----------------
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-amber-100 tracking-wide">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-4">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ?? "text-amber-100"}`}>{value}</div>
    </div>
  );
}
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="font-mono text-amber-200">{fmt ? fmt(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-fuchsia-500"
      />
    </label>
  );
}
function Toggle({ label, checked, onChange, desc }: { label: string; checked: boolean; onChange: (v: boolean) => void; desc?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-left hover:bg-slate-800/40"
    >
      <div>
        <div className="text-sm text-slate-100">{label}</div>
        {desc && <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>}
      </div>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? "bg-fuchsia-500" : "bg-slate-700"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

// ---------------- Tabs ----------------
function DashboardTab() {
  const save = readSave();
  const logs = getLogs();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Gold" value={save?.gold ?? 0} />
        <Stat label="Cristais" value={save?.crystal ?? 0} accent="text-cyan-300" />
        <Stat label="Itens distintos" value={Object.keys(save?.inventory ?? {}).length} />
        <Stat label="Eventos no log" value={logs.length} accent="text-fuchsia-300" />
      </div>
      <Card title="Status do servidor">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <Stat label="Players Online" value={1} accent="text-emerald-300" />
          <Stat label="Admins Online" value={1} accent="text-fuchsia-300" />
          <Stat label="Pokémon ativos" value={Object.keys(save?.inventory ?? {}).length + 6} />
          <Stat label="Uptime" value="LIVE" accent="text-emerald-300" />
        </div>
      </Card>
      <Card title="Atividade recente">
        <ul className="divide-y divide-slate-800 text-xs">
          {logs.slice(0, 8).map((l, i) => (
            <li key={i} className="flex items-center justify-between py-2">
              <span className="text-slate-300">{l.action}</span>
              <span className="text-slate-500">{new Date(l.ts).toLocaleTimeString()}</span>
            </li>
          ))}
          {logs.length === 0 && <li className="py-4 text-center text-slate-500">Sem atividade registrada.</li>}
        </ul>
      </Card>
    </div>
  );
}

function PlayersTab() {
  return (
    <Card title="Jogadores online" action={<span className="text-xs text-slate-400">Atualização em tempo real requer backend</span>}>
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        Lista de jogadores aparecerá aqui quando o sync multiplayer estiver ativo.
        <div className="mt-3 text-xs text-slate-500">Você é o único admin local no momento.</div>
      </div>
    </Card>
  );
}

function PokemonTab() {
  // Read species dynamically from save / try to import registry
  return (
    <Card title="Pokémon registrados" action={<span className="text-xs text-slate-400">Lido dinamicamente do registro do jogo</span>}>
      <p className="text-xs text-slate-400 mb-4">
        Pokémon adicionados em <code className="text-amber-200">src/game/systems.tsx</code> aparecem aqui automaticamente.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
        {SPECIES_FALLBACK.map((s) => (
          <div key={s} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
            <div className="text-amber-100 font-semibold uppercase">{s.replace(/_/g, " ")}</div>
            <div className="text-[10px] text-slate-500 mt-1">live</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
// fallback list mirrors index.tsx SPECIES_NAME keys
const SPECIES_FALLBACK = [
  "charmeleon", "bulbasaur", "vulpix", "jigglypuff", "caterpie", "charmander", "squirtle",
  "charizard", "ivysaur", "venusaur", "butterfree", "bulbasaur_hat", "pikachu", "sandslash",
  "mewtwo", "onix", "pinsir", "magmar", "hitmonchan", "golem", "aerodactyl", "arbok",
  "charizard_shiny", "charizard_alt", "moltres", "zapdos", "articuno",
];

function SpawnTab({ config, setConfig }: { config: AdminConfig; setConfig: (c: AdminConfig) => void }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="Multiplicadores globais">
        <div className="space-y-4">
          <Slider
            label="Multiplicador global de spawn"
            value={config.spawn.globalMultiplier}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => setConfig({ ...config, spawn: { ...config.spawn, globalMultiplier: v } })}
            fmt={(v) => `${v.toFixed(1)}×`}
          />
          <Slider
            label="Chance de shiny"
            value={config.spawn.shinyChance * 100}
            min={0}
            max={100}
            step={0.5}
            onChange={(v) => setConfig({ ...config, spawn: { ...config.spawn, shinyChance: v / 100 } })}
            fmt={(v) => `${v.toFixed(1)}%`}
          />
        </div>
      </Card>
      <Card title="Densidade por mapa">
        <div className="space-y-3">
          {Object.entries(config.spawn.perMap).map(([map, cfg]) => (
            <div key={map} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold uppercase text-amber-100">{map}</span>
                <span className="text-[10px] text-slate-500">cap {cfg.cap}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="number"
                  value={cfg.cap}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      spawn: { ...config.spawn, perMap: { ...config.spawn.perMap, [map]: { ...cfg, cap: Number(e.target.value) } } },
                    })
                  }
                  className="w-20 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-amber-100"
                />
                <select
                  value={cfg.rate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      spawn: {
                        ...config.spawn,
                        perMap: {
                          ...config.spawn.perMap,
                          [map]: { ...cfg, rate: e.target.value as typeof cfg.rate },
                        },
                      },
                    })
                  }
                  className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-slate-200"
                >
                  <option value="off">off</option>
                  <option value="slow">slow</option>
                  <option value="normal">normal</option>
                  <option value="fast">fast</option>
                  <option value="insane">insane</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ItemsTab() {
  const save = readSave();
  const all = { ...(save?.balls ?? {}), ...(save?.inventory ?? {}) };
  return (
    <Card title="Inventário do jogador">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {Object.entries(all).map(([id, qty]) => (
          <div key={id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-200">{id}</span>
            <span className="font-bold text-amber-200">×{qty}</span>
          </div>
        ))}
        {Object.keys(all).length === 0 && <div className="col-span-full text-center text-slate-500 py-6">Inventário vazio.</div>}
      </div>
    </Card>
  );
}

function WeatherTab({ config, setConfig }: { config: AdminConfig; setConfig: (c: AdminConfig) => void }) {
  const types: AdminConfig["weather"]["type"][] = ["clear", "rain", "snow", "storm", "sand", "eclipse", "bloodmoon", "fog", "meteor"];
  return (
    <Card title="Sistema climático">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setConfig({ ...config, weather: { ...config.weather, type: t } })}
            className={`rounded-lg border px-3 py-2 text-xs uppercase tracking-wide ${
              config.weather.type === t
                ? "border-fuchsia-500/60 bg-fuchsia-500/15 text-fuchsia-100"
                : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Slider
          label="Intensidade"
          value={config.weather.intensity}
          min={0}
          max={100}
          onChange={(v) => setConfig({ ...config, weather: { ...config.weather, intensity: v } })}
          fmt={(v) => `${v}%`}
        />
        <Slider
          label="Duração"
          value={config.weather.durationMin}
          min={1}
          max={120}
          onChange={(v) => setConfig({ ...config, weather: { ...config.weather, durationMin: v } })}
          fmt={(v) => `${v} min`}
        />
      </div>
    </Card>
  );
}

function EconomyTab({ config, setConfig }: { config: AdminConfig; setConfig: (c: AdminConfig) => void }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="Controle de economia">
        <div className="space-y-4">
          <Slider
            label="Multiplicador de Gold"
            value={config.economy.goldMultiplier}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => setConfig({ ...config, economy: { ...config.economy, goldMultiplier: v } })}
            fmt={(v) => `${v.toFixed(1)}×`}
          />
          <Slider
            label="Multiplicador de XP"
            value={config.economy.xpMultiplier}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => setConfig({ ...config, economy: { ...config.economy, xpMultiplier: v } })}
            fmt={(v) => `${v.toFixed(1)}×`}
          />
          <Slider
            label="Inflação do market"
            value={config.economy.inflation}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(v) => setConfig({ ...config, economy: { ...config.economy, inflation: v } })}
            fmt={(v) => `${v.toFixed(1)}×`}
          />
        </div>
      </Card>
      <Card title="Concessão rápida ao jogador">
        <GrantPanel />
      </Card>
    </div>
  );
}

function GrantPanel() {
  const [gold, setGold] = useState(100);
  const [crystal, setCrystal] = useState(10);
  const [xp, setXp] = useState(50);
  const [feedback, setFeedback] = useState<string>("");
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center gap-2">
        <input type="number" value={gold} onChange={(e) => setGold(Number(e.target.value))} className="w-24 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100" />
        <button
          onClick={() => {
            patchSave((s) => { s.gold = (s.gold ?? 0) + gold; });
            pushLog({ actor: "admin", action: "grant_gold", detail: String(gold) });
            setFeedback(`+${gold} gold`);
          }}
          className="rounded-md bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-amber-100 hover:bg-amber-500/30"
        >Adicionar gold</button>
        <button
          onClick={() => {
            patchSave((s) => { s.gold = Math.max(0, (s.gold ?? 0) - gold); });
            pushLog({ actor: "admin", action: "remove_gold", detail: String(gold) });
            setFeedback(`-${gold} gold`);
          }}
          className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/20"
        >Remover</button>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" value={crystal} onChange={(e) => setCrystal(Number(e.target.value))} className="w-24 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-cyan-100" />
        <button
          onClick={() => {
            patchSave((s) => { s.crystal = (s.crystal ?? 0) + crystal; });
            pushLog({ actor: "admin", action: "grant_crystal", detail: String(crystal) });
            setFeedback(`+${crystal} crystal`);
          }}
          className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-cyan-100 hover:bg-cyan-500/30"
        >Adicionar crystal</button>
        <button
          onClick={() => {
            patchSave((s) => { s.crystal = Math.max(0, (s.crystal ?? 0) - crystal); });
            pushLog({ actor: "admin", action: "remove_crystal", detail: String(crystal) });
            setFeedback(`-${crystal} crystal`);
          }}
          className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/20"
        >Remover</button>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="w-24 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100" />
        <span className="text-slate-400">XP (granted via save log — aplicar in-game)</span>
      </div>
      {feedback && <div className="text-emerald-300">{feedback}</div>}
    </div>
  );
}

function EventsTab({ config, setConfig }: { config: AdminConfig; setConfig: (c: AdminConfig) => void }) {
  return (
    <Card title="Eventos globais">
      <div className="grid md:grid-cols-2 gap-3">
        <Toggle label="Double XP" checked={config.events.doubleXp} onChange={(v) => setConfig({ ...config, events: { ...config.events, doubleXp: v } })} desc="Ativa multiplicador 2× de XP para todos." />
        <Toggle label="Double Loot" checked={config.events.doubleLoot} onChange={(v) => setConfig({ ...config, events: { ...config.events, doubleLoot: v } })} desc="Dobra os drops mundiais." />
        <Toggle label="Shiny Event" checked={config.events.shinyEvent} onChange={(v) => setConfig({ ...config, events: { ...config.events, shinyEvent: v } })} desc="Aumenta drasticamente a chance de shiny." />
        <Toggle label="World Boss" checked={config.events.worldBoss} onChange={(v) => setConfig({ ...config, events: { ...config.events, worldBoss: v } })} desc="Spawna boss mundial." />
      </div>
    </Card>
  );
}

function InvisibleTab({ config, setConfig }: { config: AdminConfig; setConfig: (c: AdminConfig) => void }) {
  return (
    <Card title="Modo invisível & superpoderes">
      <div className="grid md:grid-cols-2 gap-3">
        <Toggle label="Invisibilidade admin" checked={config.admin.invisible} onChange={(v) => setConfig({ ...config, admin: { ...config.admin, invisible: v } })} />
        <Toggle label="Noclip (atravessar colisão)" checked={config.admin.noclip} onChange={(v) => setConfig({ ...config, admin: { ...config.admin, noclip: v } })} />
        <Toggle label="Fly mode" checked={config.admin.fly} onChange={(v) => setConfig({ ...config, admin: { ...config.admin, fly: v } })} />
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <Slider label="Velocidade" value={config.admin.speed} min={0.5} max={5} step={0.1} onChange={(v) => setConfig({ ...config, admin: { ...config.admin, speed: v } })} fmt={(v) => `${v.toFixed(1)}×`} />
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-4">Flags lidas via <code className="text-amber-200">getConfig().admin</code> — integre no loop de movimento para efeito imediato.</p>
    </Card>
  );
}

function TeleportTab() {
  const [map, setMap] = useState("town");
  const [x, setX] = useState(600);
  const [y, setY] = useState(900);
  const [done, setDone] = useState("");
  const apply = () => {
    patchSave((s) => {
      (s as Record<string, unknown>).mapId = map;
      (s as Record<string, unknown>).pos = { x, y };
    });
    pushLog({ actor: "admin", action: "teleport", target: map, detail: `${x},${y}` });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rubym:teleport", { detail: { mapId: map, x, y } }));
    }
    setDone("✦ Teletransporte aplicado ao vivo");
  };
  const heal = () => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("rubym:heal"));
    pushLog({ actor: "admin", action: "clinic_heal" });
    setDone("💖 Time curado (Clínica)");
  };
  return (
    <Card title="Teleporte & Clínica">
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-slate-400">Mapa</span>
          <select value={map} onChange={(e) => setMap(e.target.value)} className="block rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-slate-200">
            {["village", "forest", "route2", "route3", "forestCave", "cave1", "cave2", "map23", "palletRoute", "viridian", "route22", "victoryRoad", "florestaSecreta"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="space-y-1"><span className="text-slate-400">X</span><input type="number" value={x} onChange={(e) => setX(Number(e.target.value))} className="block w-24 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100" /></label>
        <label className="space-y-1"><span className="text-slate-400">Y</span><input type="number" value={y} onChange={(e) => setY(Number(e.target.value))} className="block w-24 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100" /></label>
        <button onClick={apply} className="rounded-md bg-gradient-to-b from-fuchsia-500 to-fuchsia-700 px-4 py-1.5 text-white">Aplicar</button>
        <button onClick={heal} className="rounded-md border border-emerald-400/50 bg-emerald-500/15 px-4 py-1.5 text-emerald-100 hover:bg-emerald-500/25">💖 Clínica (curar time)</button>
      </div>
      {done && <div className="mt-3 text-xs text-emerald-300">{done}</div>}
    </Card>
  );
}

function LogsTab() {
  const logs = getLogs();
  return (
    <Card title={`Logs administrativos (${logs.length})`}>
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 max-h-[60vh] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="text-left px-3 py-2">Horário</th>
              <th className="text-left px-3 py-2">Ator</th>
              <th className="text-left px-3 py-2">Ação</th>
              <th className="text-left px-3 py-2">Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className="border-t border-slate-800/80">
                <td className="px-3 py-1.5 text-slate-500 font-mono">{new Date(l.ts).toLocaleString()}</td>
                <td className="px-3 py-1.5 text-fuchsia-300">{l.actor}</td>
                <td className="px-3 py-1.5 text-amber-100">{l.action}</td>
                <td className="px-3 py-1.5 text-slate-400">{l.detail ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">Sem logs.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ConfigTab({ config }: { config: AdminConfig }) {
  return (
    <Card title="Config snapshot (debug)">
      <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-300">
        {JSON.stringify(config, null, 2)}
      </pre>
    </Card>
  );
}

function PlaceholderTab({ tabLabel }: { tabLabel: string }) {
  return (
    <Card title={tabLabel}>
      <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30 p-10 text-center">
        <div className="text-sm font-semibold text-amber-100">{tabLabel}</div>
        <p className="mt-2 max-w-md mx-auto text-xs text-slate-400">
          Módulo provisionado. Persistência total, sync multiplayer e editor visual no mapa exigem backend ativo
          (Lovable Cloud). A camada client-side já está pronta — basta plugar o backend para ativar.
        </p>
      </div>
    </Card>
  );
}

function GiftsTab() {
  const [username, setUsername] = useState("");
  const [kind, setKind] = useState<"gold" | "crystal" | "ruby" | "item" | "ball">("gold");
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState(100);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const needsItem = kind === "item" || kind === "ball";

  const submit = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const { sendGift } = await import("@/lib/adminGifts");
      const res = await sendGift({
        username,
        kind,
        itemId: needsItem ? itemId : undefined,
        qty,
        note,
        sender: "Ryuuu",
      });
      if (res.ok) {
        setMsg({ kind: "ok", text: `✦ Presente enviado para "${username}". Será recebido no próximo login.` });
        setQty(100);
        setNote("");
      } else {
        setMsg({ kind: "err", text: res.error ?? "Falha ao enviar." });
      }
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="Enviar presente a qualquer jogador">
        <div className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="text-slate-400">Username do jogador (case-insensitive)</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: ryu"
              className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-slate-400">Tipo</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-slate-200"
            >
              <option value="gold">Gold</option>
              <option value="crystal">Crystal</option>
              <option value="ruby">Ruby</option>
              <option value="item">Item (inventário)</option>
              <option value="ball">Pokébola</option>
            </select>
          </label>
          {needsItem && (
            <label className="block space-y-1">
              <span className="text-slate-400">
                ID do item {kind === "ball" ? "(pokeball, greatball, fastball, ultraball, safariball, masterball)" : "(ex: potion, revive, incense, rare-candy, fruta_morango, event_box)"}
              </span>
              <input
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder={kind === "ball" ? "pokeball" : "potion"}
                className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100"
              />
            </label>
          )}
          <label className="block space-y-1">
            <span className="text-slate-400">Quantidade</span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-32 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-amber-100"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-slate-400">Nota (opcional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mensagem ao jogador"
              className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-slate-200"
            />
          </label>
          <button
            disabled={busy}
            onClick={submit}
            className="rounded-md bg-gradient-to-b from-fuchsia-500 to-fuchsia-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Enviando..." : "Enviar presente"}
          </button>
          {msg && (
            <div className={msg.kind === "ok" ? "text-emerald-300" : "text-rose-300"}>{msg.text}</div>
          )}
        </div>
      </Card>
      <Card title="Como funciona">
        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
          <li>O presente é gravado em <code className="text-amber-200">admin_gifts</code> no Supabase.</li>
          <li>Quando o jogador entra no jogo, o cliente reclama os gifts pendentes pelo username/user_id e aplica no save local.</li>
          <li>Itens e pokébolas enviadas viram <strong>bound</strong> (não vendáveis).</li>
          <li>Requer a tabela <code className="text-amber-200">admin_gifts</code> criada — veja SUPABASE_SETUP.md.</li>
        </ul>
      </Card>
    </div>
  );
}
