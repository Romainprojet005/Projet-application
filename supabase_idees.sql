-- Boîte à idées : à exécuter une fois dans Supabase (SQL Editor → New query → Run)
create table if not exists game_ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) between 1 and 1500),
  players text check (players is null or char_length(players) <= 40),
  contact text check (contact is null or char_length(contact) <= 120),
  created_at timestamptz default now()
);

-- Les visiteurs peuvent envoyer une idée, mais personne ne peut lire les idées
-- depuis le site : on les consulte dans Supabase (Table Editor → game_ideas).
alter table game_ideas enable row level security;

drop policy if exists "envoyer une idee" on game_ideas;
create policy "envoyer une idee" on game_ideas
  for insert to anon, authenticated
  with check (true);
