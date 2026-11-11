-- Inbox list preview: the latest message and who sent it.
alter table public.conversations add column if not exists last_preview text;
alter table public.conversations add column if not exists last_role text;
