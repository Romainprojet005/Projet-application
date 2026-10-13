-- Sécurité des salles multi-téléphones : à exécuter une fois dans Supabase (SQL Editor → New query → Run)
--
-- Avant : n'importe qui pouvait modifier ou supprimer n'importe quelle salle avec la clé publique du site.
-- Après : chaque téléphone envoie une clé secrète (en-tête x-client-secret, src/services/supabase.js).
-- La base garde seulement son empreinte (sha256) sur la ligne du joueur, et seuls les téléphones
-- qui ont rejoint une salle peuvent la modifier, la supprimer ou modifier ses joueurs.
-- La lecture reste ouverte : rejoindre avec un code et le temps réel continuent de fonctionner.
--
-- Les parties en cours au moment de l'exécution seront interrompues (leurs joueurs n'ont pas d'empreinte).

-- Empreinte de la clé envoyée par le téléphone qui fait la requête (null si absente)
create or replace function sdl_secret_hash() returns text
language sql stable as $$
  select encode(sha256(convert_to(
    nullif(current_setting('request.headers', true)::json ->> 'x-client-secret', ''), 'UTF8')), 'hex');
$$;

-- Vrai si le téléphone qui fait la requête est un joueur de la salle (jeu = mime, tribunal, …)
create or replace function sdl_is_member(jeu text, room uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare ok boolean;
begin
  if sdl_secret_hash() is null then return false; end if;
  execute format('select exists (select 1 from %I where room_id = $1 and secret_hash = $2)', jeu || '_players')
    into ok using room, sdl_secret_hash();
  return ok;
end;
$$;

-- L'empreinte est toujours posée par la base, jamais par le téléphone, et ne change plus ensuite
create or replace function sdl_set_secret_hash() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.secret_hash := sdl_secret_hash();
  else new.secret_hash := old.secret_hash;
  end if;
  return new;
end;
$$;

do $$
declare
  jeu text;
  t text;
  pol record;
begin
  foreach jeu in array array['mime', 'tribunal', 'lolselect', 'blind', 'blanc', 'vote'] loop
    -- Joueurs : colonne d'empreinte + déclencheur
    execute format('alter table %I add column if not exists secret_hash text', jeu || '_players');
    execute format('drop trigger if exists sdl_secret_hash on %I', jeu || '_players');
    execute format('create trigger sdl_secret_hash before insert or update on %I
                    for each row execute function sdl_set_secret_hash()', jeu || '_players');

    -- On repart de zéro sur les règles de toutes les tables du jeu
    foreach t in array array[jeu || '_rooms', jeu || '_players', jeu || '_writings', jeu || '_votes'] loop
      if to_regclass('public.' || t) is null then continue; end if;
      for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy %I on %I', pol.policyname, t);
      end loop;
      execute format('alter table %I enable row level security', t);
      execute format('create policy "lecture" on %I for select to anon, authenticated using (true)', t);
    end loop;

    -- Salles : tout le monde peut en créer, seuls ses joueurs la modifient ou la suppriment
    execute format('create policy "creer" on %I for insert to anon, authenticated with check (true)', jeu || '_rooms');
    execute format('create policy "modifier" on %I for update to anon, authenticated using (sdl_is_member(%L, id))', jeu || '_rooms', jeu);
    execute format('create policy "supprimer" on %I for delete to anon, authenticated using (sdl_is_member(%L, id))', jeu || '_rooms', jeu);

    -- Joueurs : tout le monde peut rejoindre, seuls les joueurs de la salle modifient ou retirent un joueur
    execute format('create policy "rejoindre" on %I for insert to anon, authenticated with check (true)', jeu || '_players');
    execute format('create policy "modifier" on %I for update to anon, authenticated using (sdl_is_member(%L, room_id))', jeu || '_players', jeu);
    execute format('create policy "supprimer" on %I for delete to anon, authenticated using (sdl_is_member(%L, room_id))', jeu || '_players', jeu);

    -- Tables annexes (écrits du Tribunal, votes) : réservées aux joueurs de la salle
    foreach t in array array[jeu || '_writings', jeu || '_votes'] loop
      if to_regclass('public.' || t) is null then continue; end if;
      execute format('create policy "ajouter" on %I for insert to anon, authenticated with check (sdl_is_member(%L, room_id))', t, jeu);
      execute format('create policy "modifier" on %I for update to anon, authenticated using (sdl_is_member(%L, room_id))', t, jeu);
      execute format('create policy "supprimer" on %I for delete to anon, authenticated using (sdl_is_member(%L, room_id))', t, jeu);
    end loop;
  end loop;
end;
$$;
