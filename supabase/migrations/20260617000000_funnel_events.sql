-- Funnel event tracking table.
-- Stores lightweight client-side events (no PII) for conversion analysis.

create table if not exists public.funnel_events (
  id         uuid        primary key default gen_random_uuid(),
  event      text        not null,
  properties jsonb,
  created_at timestamptz not null default now()
);

alter table public.funnel_events enable row level security;

-- Any visitor (anon or signed-in) can insert events; nobody can read via anon key.
grant insert on public.funnel_events to anon, authenticated;

create policy "funnel_events_insert" on public.funnel_events
  for insert to anon, authenticated with check (true);
