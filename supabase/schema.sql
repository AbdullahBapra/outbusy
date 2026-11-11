-- Outbusy blog — run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run.

-- ---------- Posts ----------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  tag           text not null,
  excerpt       text not null default '',
  content       text not null default '',          -- Markdown (see src/lib/markdown.ts)
  read_time     text,                              -- e.g. "6 min"; auto-calculated when empty
  cover_url     text,
  cover_alt     text,
  author_name   text,
  author_role   text,
  takeaways     text[] not null default '{}',
  flow          text[] not null default '{}',      -- labels for the fallback cover animation
  published     boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (published, published_at desc);

-- Row Level Security: the public (anon) key can only read published posts.
-- All writes go through the admin panel's server code with the service-role key.
alter table public.posts enable row level security;

drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public"
  on public.posts for select
  to anon, authenticated
  using (published = true and (published_at is null or published_at <= now()));

-- ---------- Images ----------
-- Public bucket for cover and inline images (max 10 MB, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog', 'blog', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Blog images are public" on storage.objects;
create policy "Blog images are public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog');

-- ---------- Leads (Kirby chat assistant) ----------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  interest    text not null,
  message     text not null default '',
  page        text not null default '',
  source      text not null default 'kirby',
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- 0-100 interest score from the visitor's on-site behaviour (higher = warmer lead).
alter table public.leads add column if not exists engagement_score int;

create index if not exists leads_created_idx on public.leads (created_at desc);

-- Private: RLS on with no policies, so only the server (service-role key) can read or write.
alter table public.leads enable row level security;
