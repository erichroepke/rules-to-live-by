-- Rules to Live By - Database Schema
-- Run this in your Supabase SQL Editor

-- Rules table
create table if not exists rules (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  author text not null,
  upvotes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes table
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  rule_id uuid references rules(id) on delete cascade not null,
  voter text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(rule_id, voter)
);

-- Enable Row Level Security
alter table rules enable row level security;
alter table votes enable row level security;

-- Allow public read/write (no auth)
create policy "Allow public read on rules" on rules for select using (true);
create policy "Allow public insert on rules" on rules for insert with check (true);
create policy "Allow public update on rules" on rules for update using (true);

create policy "Allow public read on votes" on votes for select using (true);
create policy "Allow public insert on votes" on votes for insert with check (true);
create policy "Allow public delete on votes" on votes for delete using (true);

-- Enable realtime
alter publication supabase_realtime add table rules;
alter publication supabase_realtime add table votes;
