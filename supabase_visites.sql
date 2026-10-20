-- Fréquentation du site : à exécuter une fois dans Supabase (SQL Editor → New query → Run).
-- Le site enregistre une ligne par visite (une seule fois par onglet ouvert, src/services/stats.js).
-- Aucune donnée personnelle : ni cookie, ni adresse IP, ni identifiant d'appareil.
create table if not exists visites (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,
  page text not null check (char_length(page) <= 40),          -- page d'arrivée (« accueil », « undercover »…)
  source text check (char_length(source) <= 60),                -- site d'origine, domaine seulement (google.com…)
  ecran text check (ecran in ('mobile', 'tablette', 'ordinateur')),
  installe boolean default false                                -- site ouvert depuis l'icône installée
);

-- Les visiteurs peuvent seulement ajouter des lignes ; personne ne peut les lire depuis le site.
alter table visites enable row level security;
drop policy if exists "enregistrer une visite" on visites;
create policy "enregistrer une visite" on visites
  for insert to anon, authenticated
  with check (true);

-- Visites par jour sur 60 jours : Table Editor → stats_visites_jour (ou `select * from stats_visites_jour;`)
create or replace view stats_visites_jour with (security_invoker = true) as
select
  (created_at at time zone 'Europe/Paris')::date as jour,
  count(*)                                        as visites,
  count(*) filter (where ecran = 'mobile')        as dont_mobile,
  count(*) filter (where installe)                as dont_appli_installee
from visites
where created_at > now() - interval '60 days'
group by 1
order by 1 desc;

-- D'où viennent les visiteurs (30 derniers jours)
create or replace view stats_visites_sources with (security_invoker = true) as
select coalesce(source, 'accès direct') as source, count(*) as visites
from visites
where created_at > now() - interval '30 days'
group by 1
order by 2 desc;

-- Pages d'arrivée (30 derniers jours) : utile pour voir si Google amène sur les pages des jeux
create or replace view stats_visites_pages with (security_invoker = true) as
select page, count(*) as visites
from visites
where created_at > now() - interval '30 days'
group by 1
order by 2 desc;

-- Nettoyage : les visites de plus de 2 ans sont effacées (lancé par la tâche de supabase_nettoyage.sql)
create or replace function sdl_nettoyage_visites() returns void
language sql security definer set search_path = public as $$
  delete from visites where created_at < now() - interval '2 years';
$$;
revoke all on function sdl_nettoyage_visites() from public, anon, authenticated;
create extension if not exists pg_cron;
select cron.unschedule('sdl-nettoyage-visites') where exists (select 1 from cron.job where jobname = 'sdl-nettoyage-visites');
select cron.schedule('sdl-nettoyage-visites', '23 4 * * *', 'select sdl_nettoyage_visites()');
