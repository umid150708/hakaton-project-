-- 003_ranges.sql — Add optional max (range) columns to ads.
--
-- Run this ONCE in the Supabase SQL editor after 002_marketplace.sql.
-- Additive only — existing quantity_value / price_value become the range LOW end,
-- and these new columns are the HIGH end (null = single value, not a range).

alter table public.ads add column if not exists quantity_max numeric;
alter table public.ads add column if not exists price_max    numeric;
