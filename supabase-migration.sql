-- Supabase migration for Stride Relay referrals table
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists referrals (
  id text primary key,
  campaign_id text not null,
  referrer_name text not null default '',
  candidate_id text not null,
  referrer_phone text,
  referee_name text,
  tracking_url text not null,
  channel text not null check (channel in ('whatsapp', 'email', 'copy', 'native')),
  status text not null default 'sent' check (status in ('sent', 'clicked', 'applied', 'viewed')),
  created_at timestamptz not null default now(),
  clicked_at timestamptz,
  applied_at timestamptz,
  viewed_at timestamptz,
  job_title text,
  company text,
  shine_job_url text,
  campaign_slug text
);

-- Index for fast lookups by job
create index if not exists idx_referrals_campaign_id on referrals (campaign_id);

-- Index for fast lookups by candidate (referrer)
create index if not exists idx_referrals_candidate_id on referrals (candidate_id);

-- Index for dashboard aggregations
create index if not exists idx_referrals_status on referrals (status);

-- Enable Row Level Security (public anon insert + read for now)
alter table referrals enable row level security;

-- Policy: anyone can insert referrals (from the share page)
create policy "Allow anonymous inserts"
  on referrals for insert
  to anon
  with check (true);

-- Policy: anyone can read referrals (for dashboard)
create policy "Allow anonymous reads"
  on referrals for select
  to anon
  using (true);
