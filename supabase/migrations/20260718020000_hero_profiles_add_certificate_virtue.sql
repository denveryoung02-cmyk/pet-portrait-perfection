-- Hero Pack: adds the theme-appropriate virtue phrase used on the
-- certificate ("for outstanding {virtue} and {special_ability}"), replacing
-- a hardcoded "outstanding bravery" that never varied by theme.
-- Additive only — no existing column is altered.

alter table public.hero_profiles add column certificate_virtue text;
