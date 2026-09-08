/*
 * MODO LOCAL (OFFLINE)
 *
 * O jogo roda 100% no navegador: sem login, sem servidor.
 * Este arquivo mantém a mesma interface usada pelo código do jogo,
 * mas todas as chamadas de rede são inofensivas (não fazem nada e
 * nunca lançam erro). Assim os recursos online (ranking, guilda,
 * party, save na nuvem) ficam simplesmente inativos.
 */

type AnyRecord = Record<string, unknown>;

const emptyResult = { data: null, error: null, count: 0, status: 200, statusText: "OK" };
const emptyListResult = { data: [] as unknown[], error: null, count: 0, status: 200, statusText: "OK" };

function makeQuery(list: boolean): AnyRecord {
  const result = list ? emptyListResult : emptyResult;
  const handler: ProxyHandler<AnyRecord> = {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
      }
      if (prop === "catch" || prop === "finally") {
        return () => makeQuery(list);
      }
      if (prop === "select") return () => makeQuery(true);
      if (prop === "single" || prop === "maybeSingle") return () => makeQuery(false);
      return () => makeQuery(list);
    },
  };
  return new Proxy({} as AnyRecord, handler);
}

type OfflineChannel = {
  on: (
    type: string,
    filter: Record<string, unknown>,
    callback: (payload: { payload?: unknown; new?: unknown; old?: unknown }) => void,
  ) => OfflineChannel;
  subscribe: (callback?: (status: string) => void | Promise<void>) => OfflineChannel;
  send: (args: unknown) => Promise<string>;
  unsubscribe: () => Promise<string>;
  track: (args: unknown) => Promise<string>;
  untrack: () => Promise<string>;
  presenceState: <T = unknown>() => Record<string, T[]>;
};

const channelStub: OfflineChannel = {
  on: () => channelStub,
  subscribe: () => channelStub,
  send: async () => "ok",
  unsubscribe: async () => "ok",
  track: async () => "ok",
  untrack: async () => "ok",
  presenceState: () => ({}),
};

const authStub = {
  getSession: async () => ({ data: { session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
  signInWithPassword: async () => ({
    data: { session: null, user: null },
    error: { message: "Modo local: login desativado." },
  }),
  signUp: async () => ({
    data: { session: null, user: null },
    error: { message: "Modo local: cadastro desativado." },
  }),
  resetPasswordForEmail: async () => ({ data: null, error: null }),
  updateUser: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({ error: null }),
};

const offlineClient = {
  auth: authStub,
  from: () => makeQuery(true),
  rpc: async () => ({ data: null, error: null }),
  channel: (_name?: string, _opts?: unknown): OfflineChannel => channelStub,
  removeChannel: async (_ch?: OfflineChannel) => "ok",
  removeAllChannels: async () => "ok",
  functions: { invoke: async () => ({ data: null, error: null }) },
  storage: { from: () => ({ upload: async () => ({ data: null, error: null }) }) },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type OfflineClient = Omit<typeof offlineClient, "from" | "rpc"> & {
  from: (table: string) => any;
  rpc: (fn: string, args?: unknown) => Promise<any>;
};

export const supabase = offlineClient as unknown as OfflineClient;
