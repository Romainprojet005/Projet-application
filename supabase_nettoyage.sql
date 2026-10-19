-- Nettoyage automatique des données personnelles : à exécuter une fois dans Supabase
-- (SQL Editor → New query → Run). Ces durées sont celles annoncées dans la politique
-- de confidentialité du site (/confidentialite/) : ne les changez pas sans la modifier aussi.
--   - salles multi-téléphones (prénoms, votes, textes du Tribunal) : 24 heures
--   - idées envoyées par « Proposer un jeu » : 2 ans
-- Les statistiques (table parties) ne contiennent aucune donnée personnelle : elles restent.

create or replace function sdl_nettoyage() returns void
language plpgsql security definer set search_path = public as $$
declare
  jeu text;
  enfant text;
begin
  foreach jeu in array array['mime', 'tribunal', 'lolselect', 'blind', 'blanc', 'vote'] loop
    if to_regclass(jeu || '_rooms') is null then continue; end if;

    -- Tables liées à une salle (joueurs, votes, textes…) : effacées avant la salle,
    -- au cas où la clé étrangère n'est pas en « on delete cascade ».
    for enfant in
      select c.table_name from information_schema.columns c
      where c.table_schema = 'public' and c.column_name = 'room_id'
        and c.table_name like jeu || '\_%' and c.table_name <> jeu || '_rooms'
    loop
      execute format(
        'delete from %I where room_id in (select id from %I where created_at < now() - interval ''24 hours'')',
        enfant, jeu || '_rooms');
    end loop;

    execute format('delete from %I where created_at < now() - interval ''24 hours''', jeu || '_rooms');
  end loop;

  delete from game_ideas where created_at < now() - interval '2 years';
end $$;

-- Personne ne peut l'appeler depuis le site : seule la tâche planifiée la lance.
revoke all on function sdl_nettoyage() from public, anon, authenticated;

-- Tâche planifiée toutes les heures (extension pg_cron, incluse dans Supabase).
create extension if not exists pg_cron;
select cron.unschedule('sdl-nettoyage') where exists (select 1 from cron.job where jobname = 'sdl-nettoyage');
select cron.schedule('sdl-nettoyage', '17 * * * *', 'select sdl_nettoyage()');

-- Premier passage immédiat
select sdl_nettoyage();
