-- ============================================================
-- Migration: Add site_settings table for persistent JSON storage
-- Run this in Supabase SQL Editor: Project → SQL Editor → New Query
-- ============================================================

-- Generic key-value JSON store used for collections, site settings, etc.
CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Only service-role (admin) can read/write settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- No public SELECT — only the service-role key bypasses RLS
-- So no policies needed (service_role key skips RLS by default)

-- Seed: empty collections list
INSERT INTO site_settings (key, value) VALUES ('collections', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
