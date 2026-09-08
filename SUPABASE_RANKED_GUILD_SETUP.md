# Setup Supabase — Ranked + Guild + Roles + Marketplace

Cole **todo** o bloco SQL abaixo no **SQL Editor** do Supabase e clique em **Run**.
É idempotente — pode rodar várias vezes. Cria/garante:

- `user_roles` + função `has_role()` (segurança antiprivilegio)
- `guilds`, `guild_members`, `guild_invites` (caso já existam, mantém)
- `market_listings` (reforço de GRANTs/RLS — não recria se já existir)
- **Top Ranked Treinador** com temporadas de 20h:
  - `ranked_seasons`, `ranked_leaderboard`, `ranked_history`
  - função `record_ranked_score(level, craft_points)` (jogador envia score)
  - função `rotate_ranked_season()` (arquiva top 100 e abre nova temporada)
  - agendamento `pg_cron` a cada 5 min

```sql
-- =========================================================================
-- 1. USER ROLES + has_role()
-- =========================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin','moderator','user');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- =========================================================================
-- 2. GUILDS (reforço — mesmo schema do setup antigo)
-- =========================================================================
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
  unique (user_id)
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

grant select, insert, update, delete on public.guilds to authenticated;
grant select, insert, update, delete on public.guild_members to authenticated;
grant select, insert, update, delete on public.guild_invites to authenticated;
grant all on public.guilds, public.guild_members, public.guild_invites to service_role;

alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.guild_invites enable row level security;

drop policy if exists "guilds_read_all" on public.guilds;
create policy "guilds_read_all" on public.guilds for select to authenticated using (true);
drop policy if exists "guilds_insert_self" on public.guilds;
create policy "guilds_insert_self" on public.guilds for insert to authenticated with check (auth.uid() = founder_id);
drop policy if exists "guilds_update_member" on public.guilds;
create policy "guilds_update_member" on public.guilds for update to authenticated using (
  exists (select 1 from public.guild_members m where m.guild_id = guilds.id and m.user_id = auth.uid())
);
drop policy if exists "guilds_delete_founder" on public.guilds;
create policy "guilds_delete_founder" on public.guilds for delete to authenticated using (founder_id = auth.uid());

drop policy if exists "gm_read_all" on public.guild_members;
create policy "gm_read_all" on public.guild_members for select to authenticated using (true);
drop policy if exists "gm_insert_self" on public.guild_members;
create policy "gm_insert_self" on public.guild_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "gm_update_self_or_leader" on public.guild_members;
create policy "gm_update_self_or_leader" on public.guild_members for update to authenticated using (
  user_id = auth.uid() or exists (select 1 from public.guilds g where g.id = guild_id and (g.founder_id = auth.uid() or g.vice_leader_id = auth.uid()))
);
drop policy if exists "gm_delete_self_or_leader" on public.guild_members;
create policy "gm_delete_self_or_leader" on public.guild_members for delete to authenticated using (
  user_id = auth.uid() or exists (select 1 from public.guilds g where g.id = guild_id and (g.founder_id = auth.uid() or g.vice_leader_id = auth.uid()))
);

drop policy if exists "gi_read_involved" on public.guild_invites;
create policy "gi_read_involved" on public.guild_invites for select to authenticated using (
  from_user_id = auth.uid() or to_user_id = auth.uid()
);
drop policy if exists "gi_insert_member" on public.guild_invites;
create policy "gi_insert_member" on public.guild_invites for insert to authenticated with check (
  from_user_id = auth.uid()
  and exists (select 1 from public.guild_members m where m.guild_id = guild_invites.guild_id and m.user_id = auth.uid())
);
drop policy if exists "gi_update_recipient" on public.guild_invites;
create policy "gi_update_recipient" on public.guild_invites for update to authenticated using (to_user_id = auth.uid() or from_user_id = auth.uid());
drop policy if exists "gi_delete_involved" on public.guild_invites;
create policy "gi_delete_involved" on public.guild_invites for delete to authenticated using (from_user_id = auth.uid() or to_user_id = auth.uid());

-- =========================================================================
-- 3. MARKETPLACE — reforço de GRANTs/RLS (assume tabela já criada)
-- =========================================================================
grant select, insert, update, delete on public.market_listings to authenticated;
grant all on public.market_listings to service_role;

alter table public.market_listings enable row level security;

drop policy if exists "market_read_all" on public.market_listings;
create policy "market_read_all" on public.market_listings for select to authenticated using (true);
drop policy if exists "market_insert_self" on public.market_listings;
create policy "market_insert_self" on public.market_listings for insert to authenticated with check (seller_id = auth.uid());
drop policy if exists "market_delete_self" on public.market_listings;
create policy "market_delete_self" on public.market_listings
  for delete to authenticated using (true); -- compra remove qualquer item (lógica server-side futura)

-- =========================================================================
-- 4. TOP RANKED TREINADOR — temporadas de 20h
-- =========================================================================
create table if not exists public.ranked_seasons (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists ranked_seasons_one_current
  on public.ranked_seasons (is_current) where is_current = true;

create table if not exists public.ranked_leaderboard (
  season_id uuid not null references public.ranked_seasons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  trainer_level int not null default 1,
  craft_points int not null default 0,
  guild_name text,
  score int generated always as (trainer_level * 100 + craft_points) stored,
  updated_at timestamptz not null default now(),
  primary key (season_id, user_id)
);

create index if not exists ranked_leaderboard_score_idx
  on public.ranked_leaderboard (season_id, score desc);

create table if not exists public.ranked_history (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null,
  ended_at timestamptz not null,
  rank int not null,
  user_id uuid not null,
  username text not null,
  trainer_level int not null,
  craft_points int not null,
  score int not null,
  guild_name text
);

create index if not exists ranked_history_season_idx on public.ranked_history (season_id, rank);

grant select on public.ranked_seasons to authenticated, anon;
grant select on public.ranked_leaderboard to authenticated, anon;
grant select on public.ranked_history to authenticated, anon;
grant select, insert, update on public.ranked_leaderboard to authenticated;
grant all on public.ranked_seasons, public.ranked_leaderboard, public.ranked_history to service_role;

alter table public.ranked_seasons enable row level security;
alter table public.ranked_leaderboard enable row level security;
alter table public.ranked_history enable row level security;

drop policy if exists "rs_read_all" on public.ranked_seasons;
create policy "rs_read_all" on public.ranked_seasons for select to authenticated, anon using (true);
drop policy if exists "rl_read_all" on public.ranked_leaderboard;
create policy "rl_read_all" on public.ranked_leaderboard for select to authenticated, anon using (true);
drop policy if exists "rl_upsert_self" on public.ranked_leaderboard;
create policy "rl_upsert_self" on public.ranked_leaderboard for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "rl_update_self" on public.ranked_leaderboard;
create policy "rl_update_self" on public.ranked_leaderboard for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "rh_read_all" on public.ranked_history;
create policy "rh_read_all" on public.ranked_history for select to authenticated, anon using (true);

-- Garante uma temporada corrente
insert into public.ranked_seasons (started_at, ends_at, is_current)
select now(), now() + interval '20 hours', true
where not exists (select 1 from public.ranked_seasons where is_current = true);

-- Função: jogador envia seu score atual (level + craft_points)
create or replace function public.record_ranked_score(_level int, _craft_points int, _guild_name text default null)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  _sid uuid;
  _uname text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into _sid from public.ranked_seasons where is_current = true limit 1;
  if _sid is null then
    insert into public.ranked_seasons (started_at, ends_at, is_current)
    values (now(), now() + interval '20 hours', true) returning id into _sid;
  end if;
  select coalesce(username, 'Treinador') into _uname from public.profiles where id = auth.uid();

  insert into public.ranked_leaderboard (season_id, user_id, username, trainer_level, craft_points, guild_name, updated_at)
  values (_sid, auth.uid(), coalesce(_uname,'Treinador'), greatest(_level,1), greatest(_craft_points,0), _guild_name, now())
  on conflict (season_id, user_id) do update
    set trainer_level = greatest(excluded.trainer_level, ranked_leaderboard.trainer_level),
        craft_points  = greatest(excluded.craft_points,  ranked_leaderboard.craft_points),
        guild_name    = excluded.guild_name,
        username      = excluded.username,
        updated_at    = now();
end;
$$;

grant execute on function public.record_ranked_score(int,int,text) to authenticated;

-- Função: arquiva top 100 e abre nova temporada (chamada pelo cron)
create or replace function public.rotate_ranked_season()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  _old uuid;
  _ends timestamptz;
begin
  select id, ends_at into _old, _ends
    from public.ranked_seasons where is_current = true
    order by started_at desc limit 1;

  if _old is null or now() < _ends then return; end if;

  insert into public.ranked_history (season_id, ended_at, rank, user_id, username, trainer_level, craft_points, score, guild_name)
  select _old, now(), row_number() over (order by score desc, updated_at asc),
         user_id, username, trainer_level, craft_points, score, guild_name
    from public.ranked_leaderboard
   where season_id = _old
   order by score desc, updated_at asc
   limit 100;

  update public.ranked_seasons set is_current = false where id = _old;
  insert into public.ranked_seasons (started_at, ends_at, is_current)
  values (now(), now() + interval '20 hours', true);
end;
$$;

grant execute on function public.rotate_ranked_season() to authenticated, service_role;

-- pg_cron a cada 5 min
create extension if not exists pg_cron;
do $$ begin
  perform cron.unschedule('ranked_rotate_5min');
exception when others then null; end $$;
select cron.schedule('ranked_rotate_5min', '*/5 * * * *', $$select public.rotate_ranked_season();$$);
```

## Próximos passos no client

Depois de rodar o SQL, posso plugar:

1. Helper `src/lib/rankedApi.ts` com `recordRankedScore()` e `fetchTopRanked()`.
2. Chamada automática de `recordRankedScore(level, craftPoints, guildName)` quando o jogador ganha level/craft.
3. Overlay "Top Ranked" lendo de `ranked_leaderboard` + countdown até `ranked_seasons.ends_at`.

Me confirma "pluga client" que eu faço.
