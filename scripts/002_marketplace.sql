-- 002_marketplace.sql — Shared marketplace tables for the buyer↔seller bridge.
--
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
--
-- Design: all app access goes through server endpoints that use the service_role
-- key (which bypasses RLS). We enable RLS with NO policies, so the browser anon
-- key cannot touch these tables directly — the phone number in ads.contact is
-- never exposed to the client until /api/reveal authorizes it.

-- ── Ads ────────────────────────────────────────────────────────────────────────
create table if not exists public.ads (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid,                              -- auth user id of the poster
  type           text not null check (type in ('buy','sell')),
  category       text not null,
  product        text not null,
  quantity_value numeric,
  quantity_unit  text,
  quantity_freq  text,
  region         text,                              -- viloyat / shahar
  district       text,                              -- tuman / mahalla (for near-me matching)
  location       text,                              -- free-text display fallback
  price_value    numeric,
  price_unit     text,
  contact        text,                              -- revealed only via /api/reveal
  status         text not null default 'active' check (status in ('active','closed')),
  created_at     timestamptz not null default now()
);
create index if not exists ads_type_cat_idx on public.ads (type, category, status);
create index if not exists ads_owner_idx    on public.ads (owner_id);

-- ── Notifications (match alerts) ───────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,                         -- recipient
  kind       text not null default 'match',
  ad_id      uuid,                                  -- the other party's matching ad
  my_ad_id   uuid,                                  -- the recipient's ad it matched
  score      int,
  title      text,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notif_user_idx on public.notifications (user_id, read, created_at desc);

-- ── Deal fees (mock payments + reveal records) ─────────────────────────────────
create table if not exists public.deal_fees (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null,
  ad_id    uuid not null,
  amount   numeric not null,
  method   text default 'mock',
  paid_at  timestamptz not null default now(),
  unique (user_id, ad_id)
);

-- ── Lock down: RLS on, no policies → only the service_role key (server) can read/write.
alter table public.ads           enable row level security;
alter table public.notifications enable row level security;
alter table public.deal_fees     enable row level security;
