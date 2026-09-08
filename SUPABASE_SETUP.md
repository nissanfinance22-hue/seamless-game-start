# Setup do Supabase (projeto omkbvllmrwkftedgfkxc)

Cole **todo** o bloco SQL abaixo no **SQL Editor** do Supabase e clique em **Run**.
É idempotente — pode rodar quantas vezes quiser. Ele:

- cria `profiles` e `game_saves`
- garante `username` nullable
- cria/atualiza `handle_new_user()` + trigger `on_auth_user_created`
- aplica policies RLS por dono (`auth.uid()`)
- aplica `GRANT`s para `authenticated` e `service_role`
- **limpa usernames automáticos** gerados pelo setup antigo (= parte local do e-mail),
  forçando contas antigas a passar pela tela "Criar Treinador"

```sql
-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  level       INTEGER NOT NULL DEFAULT 1,
  gold        INTEGER NOT NULL DEFAULT 0,
  ruby        INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garante colunas mesmo em bases antigas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level      INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gold       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ruby       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ NOT NULL DEFAULT now();

-- username opcional (jogador define depois na tela "Criar Treinador")
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- =========================================================================
-- TRIGGER: cria profile com username NULL no signup
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- CORREÇÃO: limpa usernames automáticos (parte local do e-mail) gerados
-- pelo setup antigo. Contas que já escolheram um nome diferente ficam intactas.
-- =========================================================================
UPDATE public.profiles p
   SET username = NULL
  FROM auth.users u
 WHERE u.id = p.id
   AND p.username IS NOT NULL
   AND p.username = split_part(u.email, '@', 1);

-- =========================================================================
-- GAME SAVES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.game_saves (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.game_saves ADD COLUMN IF NOT EXISTS data       JSONB;
ALTER TABLE public.game_saves ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.game_saves ALTER COLUMN data SET NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_saves TO authenticated;
GRANT ALL ON public.game_saves TO service_role;

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_saves_select_own" ON public.game_saves;
DROP POLICY IF EXISTS "game_saves_insert_own" ON public.game_saves;
DROP POLICY IF EXISTS "game_saves_update_own" ON public.game_saves;
DROP POLICY IF EXISTS "game_saves_delete_own" ON public.game_saves;

CREATE POLICY "game_saves_select_own" ON public.game_saves
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "game_saves_insert_own" ON public.game_saves
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "game_saves_update_own" ON public.game_saves
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "game_saves_delete_own" ON public.game_saves
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================================
-- TRIGGER: updated_at automático em game_saves
-- =========================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_saves_set_updated_at ON public.game_saves;
CREATE TRIGGER game_saves_set_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

## Configurações no Dashboard

1. **Authentication → URL Configuration**
   - Site URL: a URL onde o jogo roda (preview do Lovable e/ou seu domínio).
   - Redirect URLs: adicione a mesma URL.
2. **Authentication → Providers → Email**: deixe **Email/Password** habilitado.
3. (Recomendado em dev) Desligue *Confirm email* para o signup já criar sessão
   e cair direto na tela "Criar Treinador".

## admin_gifts (Painel Admin → enviar presentes)

```sql
create table if not exists public.admin_gifts (
  id uuid primary key default gen_random_uuid(),
  recipient_username text not null,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  kind text not null check (kind in ('gold','crystal','ruby','item','ball')),
  item_id text,
  qty integer not null check (qty > 0),
  note text,
  sender text not null default 'admin',
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create index if not exists admin_gifts_recipient_user_idx
  on public.admin_gifts (recipient_user_id) where claimed_at is null;
create index if not exists admin_gifts_recipient_name_idx
  on public.admin_gifts (lower(recipient_username)) where claimed_at is null;

grant select, insert, update on public.admin_gifts to authenticated;
grant all on public.admin_gifts to service_role;

alter table public.admin_gifts enable row level security;

-- Qualquer autenticado pode inserir (controle é client-side via senha admin Ryuuu)
create policy "auth_insert_gifts" on public.admin_gifts
  for insert to authenticated with check (true);

-- Destinatário lê seus próprios gifts (por user_id OU por username via profile)
create policy "recipient_select_gifts" on public.admin_gifts
  for select to authenticated using (
    recipient_user_id = auth.uid()
    or lower(recipient_username) = (
      select lower(username) from public.profiles where id = auth.uid()
    )
  );

-- Destinatário marca como claimed
create policy "recipient_update_gifts" on public.admin_gifts
  for update to authenticated using (
    recipient_user_id = auth.uid()
    or lower(recipient_username) = (
      select lower(username) from public.profiles where id = auth.uid()
    )
  );
```

## guilds + guild_members + guild_invites (Sistema de Guilda)

```sql
-- (presença é via realtime; guild_name é enviado pelo cliente no payload de presence)


create table if not exists public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  element text not null check (element in ('fire','water','grass','psychic','poison','fairy','flying')),
  level int not null default 1,
  xp int not null default 0,
  total_donated int not null default 0,
  treasury_gold int not null default 0,
  treasury_crystal int not null default 0,
  treasury_ruby int not null default 0,
  founder_id uuid not null,
  vice_leader_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.guild_members (
  guild_id uuid not null references public.guilds(id) on delete cascade,
  user_id uuid not null,
  username text not null,
  role text not null default 'member' check (role in ('leader','vice','member')),
  leader_species text,
  level int not null default 1,
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id),
  unique (user_id) -- impede entrar em mais de uma guilda
);

create table if not exists public.guild_invites (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid not null references public.guilds(id) on delete cascade,
  guild_name text not null,
  from_user_id uuid not null,
  from_username text not null,
  to_user_id uuid,
  to_username text not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now()
);

create index if not exists guild_invites_to_user_idx
  on public.guild_invites (to_user_id) where status = 'pending';
create index if not exists guild_invites_to_name_idx
  on public.guild_invites (lower(to_username)) where status = 'pending';

grant select, insert, update, delete on public.guilds to authenticated;
grant select, insert, update, delete on public.guild_members to authenticated;
grant select, insert, update, delete on public.guild_invites to authenticated;
grant all on public.guilds to service_role;
grant all on public.guild_members to service_role;
grant all on public.guild_invites to service_role;

alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.guild_invites enable row level security;

-- guilds
create policy "guilds_read_all" on public.guilds
  for select to authenticated using (true);
create policy "guilds_insert_self" on public.guilds
  for insert to authenticated with check (auth.uid() = founder_id);
create policy "guilds_update_member" on public.guilds
  for update to authenticated using (
    exists (select 1 from public.guild_members m where m.guild_id = guilds.id and m.user_id = auth.uid())
  );
create policy "guilds_delete_founder" on public.guilds
  for delete to authenticated using (founder_id = auth.uid());

-- guild_members
create policy "gm_read_all" on public.guild_members
  for select to authenticated using (true);
create policy "gm_insert_self" on public.guild_members
  for insert to authenticated with check (user_id = auth.uid());
create policy "gm_update_self_or_leader" on public.guild_members
  for update to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.guilds g where g.id = guild_id and (g.founder_id = auth.uid() or g.vice_leader_id = auth.uid()))
  );
create policy "gm_delete_self_or_leader" on public.guild_members
  for delete to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.guilds g where g.id = guild_id and (g.founder_id = auth.uid() or g.vice_leader_id = auth.uid()))
  );

-- guild_invites
create policy "gi_read_involved" on public.guild_invites
  for select to authenticated using (
    from_user_id = auth.uid() or to_user_id = auth.uid()
  );
create policy "gi_insert_member" on public.guild_invites
  for insert to authenticated with check (
    from_user_id = auth.uid()
    and exists (select 1 from public.guild_members m where m.guild_id = guild_invites.guild_id and m.user_id = auth.uid())
  );
create policy "gi_update_recipient" on public.guild_invites
  for update to authenticated using (to_user_id = auth.uid() or from_user_id = auth.uid());
create policy "gi_delete_involved" on public.guild_invites
  for delete to authenticated using (from_user_id = auth.uid() or to_user_id = auth.uid());
```
