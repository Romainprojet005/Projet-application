-- Statistiques des jeux : à exécuter une fois dans Supabase (SQL Editor → New query → Run)
-- Le site enregistre une ligne quand on ouvre un jeu et quand on lance une partie (src/services/stats.js).
-- Aucune donnée personnelle : ni nom, ni IP, ni identifiant d'appareil.
create table if not exists parties (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,
  jeu text not null check (char_length(jeu) <= 40),
  etape text not null check (etape in ('ouverture', 'lancement')),
  mode text check (mode in ('local', 'multi')),
  joueurs smallint check (joueurs between 0 and 50)
);

-- Les visiteurs peuvent seulement ajouter des lignes ; personne ne peut les lire depuis le site.
alter table parties enable row level security;

drop policy if exists "enregistrer une partie" on parties;
create policy "enregistrer une partie" on parties
  for insert to anon, authenticated
  with check (true);

-- Classement des 30 derniers jours : Table Editor → stats_jeux (ou `select * from stats_jeux;`)
-- security_invoker : la vue respecte la sécurité de la table, donc elle reste illisible depuis le site.
create or replace view stats_jeux with (security_invoker = true) as
select
  jeu,
  count(*) filter (where etape = 'lancement')                    as parties_lancees,
  count(*) filter (where etape = 'ouverture')                    as ouvertures,
  round(100.0 * count(*) filter (where etape = 'lancement')
        / nullif(count(*) filter (where etape = 'ouverture'), 0)) as taux_lancement_pct,
  count(*) filter (where etape = 'lancement' and mode = 'multi') as dont_multi,
  round(avg(joueurs) filter (where etape = 'lancement'), 1)       as joueurs_moyens
from parties
where created_at > now() - interval '30 days'
group by jeu
order by parties_lancees desc;

-- Parties lancées par jour de la semaine et par heure (heure de Paris)
create or replace view stats_horaires with (security_invoker = true) as
select
  to_char(created_at at time zone 'Europe/Paris', 'ID-Dy') as jour,
  extract(hour from created_at at time zone 'Europe/Paris')::int as heure,
  count(*) as parties_lancees
from parties
where etape = 'lancement' and created_at > now() - interval '30 days'
group by 1, 2
order by 1, 2;
