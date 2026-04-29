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
