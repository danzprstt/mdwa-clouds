-- MDWA Cloud v5 Schema
-- Run in Supabase SQL Editor

-- USERS TABLE
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text unique not null,
  password_hash text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- FILES TABLE
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  filename text,
  mimetype text,
  size bigint default 0,
  url text not null,
  provider text default 'catbox',
  supabase_path text,
  thumbnail_url text,
  deleted_at timestamptz default null,
  created_at timestamptz default now()
);

-- Add new columns if upgrading from v4
alter table files add column if not exists provider text default 'catbox';
alter table files add column if not exists supabase_path text;
alter table files add column if not exists size bigint default 0;

-- INDEXES for performance
create index if not exists idx_files_user_id on files(user_id);
create index if not exists idx_files_deleted_at on files(deleted_at);
create index if not exists idx_files_created_at on files(created_at desc);

-- ROW LEVEL SECURITY
alter table users enable row level security;
alter table files enable row level security;

-- Policies (service role bypasses these)
drop policy if exists "users_service_only" on users;
drop policy if exists "files_service_only" on files;
create policy "users_service_only" on users for all using (false);
create policy "files_service_only" on files for all using (false);

-- Supabase Storage bucket
insert into storage.buckets (id, name, public) values ('mdwa-files', 'mdwa-files', true)
on conflict (id) do nothing;

-- Storage policy: service role only
drop policy if exists "storage_service_only" on storage.objects;
create policy "storage_service_only" on storage.objects for all using (bucket_id = 'mdwa-files');
