create table if not exists public.cup_state (
  id bigint primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.cup_state enable row level security;

create policy "Public can read cup state"
on public.cup_state for select
to anon, authenticated
using (true);

create policy "Authenticated admin can insert cup state"
on public.cup_state for insert
to authenticated
with check (true);

create policy "Authenticated admin can update cup state"
on public.cup_state for update
to authenticated
using (true)
with check (true);

insert into public.cup_state (id, payload)
values (1, '{"roundStatus":"PROVISIONAL","finals":{"week":0,"matches":{},"champion":null}}'::jsonb)
on conflict (id) do nothing;
