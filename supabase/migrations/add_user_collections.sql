-- ============================================================
-- Migration: Add per-user collections table
-- Run this in Supabase SQL Editor: Project → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_collections (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles ON DELETE CASCADE,
  title      text NOT NULL,
  skill_ids  uuid[] NOT NULL DEFAULT '{}'::uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_updated ON user_collections(updated_at DESC);

ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_collections_select_own"
  ON user_collections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_collections_insert_own"
  ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_collections_update_own"
  ON user_collections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_collections_delete_own"
  ON user_collections FOR DELETE USING (auth.uid() = user_id);