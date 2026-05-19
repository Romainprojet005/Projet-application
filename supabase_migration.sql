-- Tables pour Mime Express
create table if not exists mime_rooms (
  id uuid default gen_random_uuid() primary key,
  code char(4) unique not null,
  status text default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  max_rounds int default 5,
  round_number int default 0,
  current_mime_player_id uuid,
  current_word text,
  round_started_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists mime_players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references mime_rooms(id) on delete cascade,
  device_id text,
  name text not null,
  score int default 0,
  turn_order int default 0,
  is_host boolean default false,
  created_at timestamptz default now()
);

-- Activer le realtime
alter publication supabase_realtime add table mime_rooms;
alter publication supabase_realtime add table mime_players;

-- Nettoyage auto des vieilles salles (+ de 2h)
create or replace function cleanup_old_mime_rooms() returns void language sql as $$
  delete from mime_rooms where created_at < now() - interval '2 hours';
$$;

-- Tables pour Tribunal
create table if not exists tribunal_rooms (
  id uuid default gen_random_uuid() primary key,
  code char(4) unique not null,
  status text default 'lobby' check (status in ('lobby', 'writing', 'trial', 'finished')),
  trial_phase text default 'defense' check (trial_phase in ('defense', 'voting', 'reveal')),
  current_accused_idx int default 0,
  created_at timestamptz default now()
);

create table if not exists tribunal_players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references tribunal_rooms(id) on delete cascade,
  name text not null,
  is_host boolean default false,
  turn_order int default 0,
  target_id uuid,
  has_written boolean default false,
  has_voted boolean default false,
  vote text check (vote in ('vrai', 'faux')),
  malus int default 0,
  created_at timestamptz default now()
);

create table if not exists tribunal_writings (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references tribunal_rooms(id) on delete cascade,
  author_id uuid references tribunal_players(id) on delete cascade,
  target_id uuid references tribunal_players(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Activer le realtime
alter publication supabase_realtime add table tribunal_rooms;
alter publication supabase_realtime add table tribunal_players;
alter publication supabase_realtime add table tribunal_writings;

-- Nettoyage auto des vieilles salles Tribunal (+ de 4h)
create or replace function cleanup_old_tribunal_rooms() returns void language sql as $$
  delete from tribunal_rooms where created_at < now() - interval '4 hours';
$$;

-- ============================================================
-- ACCÈS ANON - obligatoire pour que les jeux fonctionnent
-- (aucune donnée sensible, jeux de soirée en local)
-- ============================================================

-- Mime : désactiver RLS + accès anon
alter table mime_rooms    disable row level security;
alter table mime_players  disable row level security;
grant select, insert, update, delete on mime_rooms   to anon;
grant select, insert, update, delete on mime_players to anon;

-- Tribunal : désactiver RLS + accès anon
alter table tribunal_rooms    disable row level security;
alter table tribunal_players  disable row level security;
alter table tribunal_writings disable row level security;
grant select, insert, update, delete on tribunal_rooms    to anon;
grant select, insert, update, delete on tribunal_players  to anon;
grant select, insert, update, delete on tribunal_writings to anon;
