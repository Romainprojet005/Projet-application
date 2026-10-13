-- Blind test multi, bouton « Je ne sais pas » : à exécuter une fois dans Supabase (SQL Editor → New query → Run)
-- passed_idx = numéro de la chanson sur laquelle le joueur a passé.
-- Quand tous les joueurs ont passé la chanson en cours, la manche se termine (BlindMultiGameScreen.js).
alter table blind_players add column if not exists passed_idx int;
