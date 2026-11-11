-- Outbusy chat system: team accounts, visitors, conversations, messages, leads,
-- knowledge base (RAG), settings, audit. Applied after supabase/schema.sql (posts).
-- Security model: RLS on everywhere, no anon policies. The public site talks to these
-- tables only through server routes (service-role key); team members read/write through
-- their own Supabase Auth session, so these policies are what enforce roles.

create extension if not exists vector with schema extensions;
create extension if not exists pg_cron;

-- ---------- Team ----------
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text not null,
  full_name       text not null default '',
  role            text not null default 'agent' check (role in ('owner', 'agent')),
  active          boolean not null default true,
  alerts_enabled  boolean not null default true,
  created_at      timestamptz not null default now()
);

create or replace function public.is_team() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active);
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'owner');
$$;

revoke all on function public.is_team() from public, anon;
revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_team() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- ---------- Visitors & conversations ----------
create table if not exists public.visitors (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  name          text,
  email         text,
  phone         text,
  company       text,
  consent_at    timestamptz,
  user_agent    text,
  referrer      text,
  utm           jsonb not null default '{}'
);

create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  visitor_id       uuid not null references public.visitors (id) on delete cascade,
  status           text not null default 'open' check (status in ('open', 'waiting_human', 'human', 'closed')),
  mode             text not null default 'ai' check (mode in ('ai', 'human')),
  assigned_to      uuid references public.profiles (id) on delete set null,
  taken_over_by    uuid references public.profiles (id) on delete set null,
  taken_over_at    timestamptz,
  handoff_reason   text,
  page             text not null default '',
  summary          text,
  message_count    int not null default 0,
  unread_count     int not null default 0,
  last_alert_at    timestamptz,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create index if not exists conversations_last_idx on public.conversations (last_message_at desc);
create index if not exists conversations_visitor_idx on public.conversations (visitor_id);
create index if not exists conversations_status_idx on public.conversations (status);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  role             text not null check (role in ('visitor', 'ai', 'agent', 'system')),
  author_id        uuid references public.profiles (id) on delete set null,
  content          text not null,
  sources          jsonb not null default '[]',
  meta             jsonb not null default '{}',
  created_at       timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------- Leads ----------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '',
  email       text not null default '',
  interest    text not null default '',
  message     text not null default '',
  page        text not null default '',
  source      text not null default 'chat',
  user_agent  text,
  created_at  timestamptz not null default now()
);
alter table public.leads
  add column if not exists engagement_score int,
  add column if not exists conversation_id uuid references public.conversations (id) on delete set null,
  add column if not exists visitor_id uuid references public.visitors (id) on delete set null,
  add column if not exists phone text,
  add column if not exists company text,
  add column if not exists services text[] not null default '{}',
  add column if not exists problem text,
  add column if not exists budget text,
  add column if not exists timeline text,
  add column if not exists goals text,
  add column if not exists score int not null default 0,
  add column if not exists temperature text not null default 'cold',
  add column if not exists status text not null default 'new',
  add column if not exists assigned_to uuid references public.profiles (id) on delete set null,
  add column if not exists notes text,
  add column if not exists consent_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();
alter table public.leads drop constraint if exists leads_temperature_check;
alter table public.leads add constraint leads_temperature_check check (temperature in ('hot', 'warm', 'cold'));
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost'));
create unique index if not exists leads_conversation_uidx on public.leads (conversation_id) where conversation_id is not null;
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status, temperature);

create table if not exists public.lead_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  actor_id    uuid references public.profiles (id) on delete set null,
  type        text not null check (type in ('created', 'status', 'note', 'assign', 'update')),
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists lead_events_lead_idx on public.lead_events (lead_id, created_at desc);

-- ---------- Knowledge base ----------
create table if not exists public.kb_sources (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('site', 'blog', 'manual', 'document')),
  ref         text not null,                      -- stable key, e.g. "service:ai-voice-agents", "blog:<slug>"
  title       text not null,
  url         text,
  body        text,                               -- manual entries: the markdown itself
  file_path   text,                               -- documents: object path in the kb-docs bucket
  checksum    text,
  status      text not null default 'pending' check (status in ('pending', 'indexed', 'error')),
  error       text,
  chunk_count int not null default 0,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (type, ref)
);

create table if not exists public.kb_chunks (
  id          uuid primary key default gen_random_uuid(),
  source_id   uuid not null references public.kb_sources (id) on delete cascade,
  ord         int not null default 0,
  content     text not null,
  embedding   extensions.vector(1024),
  fts         tsvector generated always as (to_tsvector('english', content)) stored,
  created_at  timestamptz not null default now()
);
create index if not exists kb_chunks_source_idx on public.kb_chunks (source_id);
create index if not exists kb_chunks_fts_idx on public.kb_chunks using gin (fts);
create index if not exists kb_chunks_embedding_idx on public.kb_chunks using hnsw (embedding extensions.vector_cosine_ops);

-- Hybrid search: vector similarity + full text, merged with reciprocal-rank fusion.
create or replace function public.match_kb(query_embedding extensions.vector(1024), query_text text, match_count int default 6)
returns table (id uuid, source_id uuid, content text, title text, url text, type text, similarity float, score float)
language sql stable set search_path = '' as $$
  with semantic as (
    select c.id, row_number() over (order by c.embedding operator(extensions.<=>) query_embedding) as rank,
           1 - (c.embedding operator(extensions.<=>) query_embedding) as similarity
    from public.kb_chunks c
    where c.embedding is not null
    order by c.embedding operator(extensions.<=>) query_embedding
    limit match_count * 4
  ),
  keyword as (
    select c.id, row_number() over (order by ts_rank_cd(c.fts, q) desc) as rank
    from public.kb_chunks c, websearch_to_tsquery('english', query_text) q
    where c.fts @@ q
    order by ts_rank_cd(c.fts, q) desc
    limit match_count * 4
  ),
  fused as (
    select coalesce(s.id, k.id) as id,
           coalesce(1.0 / (60 + s.rank), 0) + coalesce(1.0 / (60 + k.rank), 0) as score,
           coalesce(s.similarity, 0) as similarity
    from semantic s full outer join keyword k on s.id = k.id
  )
  select c.id, c.source_id, c.content, src.title, src.url, src.type, f.similarity, f.score
  from fused f
  join public.kb_chunks c on c.id = f.id
  join public.kb_sources src on src.id = c.source_id
  order by f.score desc
  limit match_count;
$$;
revoke all on function public.match_kb(extensions.vector, text, int) from public, anon, authenticated;
grant execute on function public.match_kb(extensions.vector, text, int) to service_role;

-- ---------- Settings, login attempts, audit ----------
create table if not exists public.chat_settings (
  id                        int primary key default 1 check (id = 1),
  ai_enabled                boolean not null default true,
  model                     text not null default 'claude-opus-5-5',
  greeting                  text not null default 'Hi! I''m the Outbusy AI assistant. Ask me anything about automating your business.',
  starter_chips             text[] not null default '{"What can you automate?","How much does it cost?","Talk to a human"}',
  hot_score_threshold       int not null default 70,
  low_confidence_threshold  float not null default 0.45,
  handoff_keywords          text[] not null default '{"human","real person","agent","speak to someone","call me"}',
  alert_on_handoff          boolean not null default true,
  alert_on_hot_lead         boolean not null default true,
  alert_on_low_confidence   boolean not null default false,
  updated_at                timestamptz not null default now(),
  updated_by                uuid references public.profiles (id) on delete set null
);
insert into public.chat_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.login_attempts (
  id          bigint generated always as identity primary key,
  email       text not null,
  ip          text not null,
  success     boolean not null,
  created_at  timestamptz not null default now()
);
create index if not exists login_attempts_email_idx on public.login_attempts (email, created_at desc);
create index if not exists login_attempts_ip_idx on public.login_attempts (ip, created_at desc);

create table if not exists public.rate_limits (
  key         text not null,
  created_at  timestamptz not null default now()
);
create index if not exists rate_limits_key_idx on public.rate_limits (key, created_at desc);

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  target      text,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.visitors enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.kb_sources enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.chat_settings enable row level security;
alter table public.login_attempts enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_log enable row level security;

-- profiles: team sees the team; members edit only their own alert preference; owners manage all.
drop policy if exists "team reads profiles" on public.profiles;
create policy "team reads profiles" on public.profiles for select to authenticated using ((select public.is_team()));
drop policy if exists "owners manage profiles" on public.profiles;
create policy "owners manage profiles" on public.profiles for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));

-- Day-to-day data: any active team member.
do $$
declare t text;
begin
  foreach t in array array['visitors', 'conversations', 'messages', 'leads', 'lead_events'] loop
    execute format('drop policy if exists "team manages %1$s" on public.%1$I', t);
    execute format('create policy "team manages %1$s" on public.%1$I for all to authenticated using ((select public.is_team())) with check ((select public.is_team()))', t);
  end loop;
end $$;

-- Knowledge, settings: team reads, owners write.
do $$
declare t text;
begin
  foreach t in array array['kb_sources', 'kb_chunks', 'chat_settings'] loop
    execute format('drop policy if exists "team reads %1$s" on public.%1$I', t);
    execute format('create policy "team reads %1$s" on public.%1$I for select to authenticated using ((select public.is_team()))', t);
    execute format('drop policy if exists "owners write %1$s" on public.%1$I', t);
    execute format('create policy "owners write %1$s" on public.%1$I for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()))', t);
  end loop;
end $$;

drop policy if exists "owners read audit" on public.audit_log;
create policy "owners read audit" on public.audit_log for select to authenticated using ((select public.is_owner()));
-- login_attempts, rate_limits: no policies — server (service role) only.

-- ---------- Realtime for the admin inbox ----------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'conversations') then
    alter publication supabase_realtime add table public.conversations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ---------- Private bucket for knowledge documents ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kb-docs', 'kb-docs', false, 20971520, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/markdown'
])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ---------- Retention: chats without a lead are deleted after 12 months ----------
create or replace function public.purge_old_chats() returns void
language sql security definer set search_path = '' as $$
  delete from public.conversations c
  where c.last_message_at < now() - interval '12 months'
    and not exists (select 1 from public.leads l where l.conversation_id = c.id);
  delete from public.visitors v
  where v.last_seen_at < now() - interval '12 months'
    and not exists (select 1 from public.conversations c where c.visitor_id = v.id)
    and not exists (select 1 from public.leads l where l.visitor_id = v.id);
  delete from public.login_attempts where created_at < now() - interval '30 days';
  delete from public.rate_limits where created_at < now() - interval '1 day';
$$;
revoke all on function public.purge_old_chats() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'purge-old-chats';
select cron.schedule('purge-old-chats', '17 3 * * *', 'select public.purge_old_chats()');
