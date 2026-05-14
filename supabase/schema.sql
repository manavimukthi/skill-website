-- ============================================================
-- TrySkill Database Schema
-- Run this in Supabase SQL Editor: Project → SQL Editor → New Query
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id           uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username     text UNIQUE NOT NULL,
  display_name text,
  bio          text,
  avatar_url   text,
  github_url   text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  color       text,
  skill_count integer DEFAULT 0,
  sort_order  integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  filename         text NOT NULL,
  title            text NOT NULL,
  description      text NOT NULL,
  content          text NOT NULL,
  category_id      uuid REFERENCES categories ON DELETE SET NULL,
  author_id        uuid REFERENCES profiles ON DELETE SET NULL,
  file_url         text,
  file_size_bytes  integer,
  download_count   integer DEFAULT 0,
  view_count       integer DEFAULT 0,
  featured         boolean DEFAULT false,
  published        boolean DEFAULT true,
  tags             text[],
  preview_bg       text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Generated column for full-text search (title + description + content)
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(content, '')
    )
  ) STORED;

CREATE TABLE IF NOT EXISTS downloads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id   uuid REFERENCES skills ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles ON DELETE SET NULL,
  ip_hash    text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    uuid REFERENCES profiles ON DELETE CASCADE,
  skill_id   uuid REFERENCES skills ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id   uuid REFERENCES skills ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_collections (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles ON DELETE CASCADE,
  title      text NOT NULL,
  skill_ids  uuid[] NOT NULL DEFAULT '{}'::uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_skills_slug        ON skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category    ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_author      ON skills(author_id);
CREATE INDEX IF NOT EXISTS idx_skills_featured    ON skills(featured);
CREATE INDEX IF NOT EXISTS idx_skills_created     ON skills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skills_fts         ON skills USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_downloads_skill    ON downloads(skill_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created  ON downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user     ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_skill    ON favorites(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_updated ON user_collections(updated_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills     ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT USING (true);

-- Skills
CREATE POLICY "skills_select_published"
  ON skills FOR SELECT USING (published = true);

CREATE POLICY "skills_insert_own"
  ON skills FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "skills_update_own"
  ON skills FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "skills_delete_own"
  ON skills FOR DELETE USING (auth.uid() = author_id);

-- Downloads
CREATE POLICY "downloads_insert_anyone"
  ON downloads FOR INSERT WITH CHECK (true);

CREATE POLICY "downloads_select_all"
  ON downloads FOR SELECT USING (true);

-- Favorites
CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_select_all"
  ON comments FOR SELECT USING (true);

CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- User collections
CREATE POLICY "user_collections_select_own"
  ON user_collections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_collections_insert_own"
  ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_collections_update_own"
  ON user_collections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_collections_delete_own"
  ON user_collections FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update skills.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skills_updated_at ON skills;
CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-increment categories.skill_count on skill insert
CREATE OR REPLACE FUNCTION increment_category_skill_count()
RETURNS trigger AS $$
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    UPDATE categories SET skill_count = skill_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skill_inserted ON skills;
CREATE TRIGGER skill_inserted
  AFTER INSERT ON skills
  FOR EACH ROW EXECUTE FUNCTION increment_category_skill_count();

-- Auto-decrement categories.skill_count on skill delete
CREATE OR REPLACE FUNCTION decrement_category_skill_count()
RETURNS trigger AS $$
BEGIN
  IF OLD.category_id IS NOT NULL THEN
    UPDATE categories SET skill_count = GREATEST(skill_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skill_deleted ON skills;
CREATE TRIGGER skill_deleted
  AFTER DELETE ON skills
  FOR EACH ROW EXECUTE FUNCTION decrement_category_skill_count();

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- HELPER RPCs (atomic counters)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_skill_view(skill_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE skills SET view_count = view_count + 1 WHERE id = skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_skill_download(skill_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE skills SET download_count = download_count + 1 WHERE id = skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA — 7 categories (matches frontend FilterBar)
-- ============================================================

INSERT INTO categories (slug, name, description, color, sort_order) VALUES
  ('writing',      'Writing',      'Blog posts, essays, copywriting and content creation',       '#D4E4D4', 1),
  ('coding',       'Coding',       'Code review, documentation, SQL, and development skills',    '#D4EAD4', 2),
  ('marketing',    'Marketing',    'Ad copy, product descriptions, and marketing automation',    '#F5DEB3', 3),
  ('research',     'Research',     'Market research, data analysis, and academic summarization', '#FFF9C4', 4),
  ('automation',   'Automation',   'Workflow builders, email sequences, and process automation', '#E8D5F0', 5),
  ('business',     'Business',     'Business plans, competitive analysis, and strategy',         '#FFE4CC', 6),
  ('social-media', 'Social Media', 'Twitter threads, LinkedIn posts, and YouTube scripts',       '#DCEEFB', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STORAGE — public bucket for .md skill files
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'skill-files',
  'skill-files',
  true,
  102400,  -- 100 KB limit
  ARRAY['text/markdown', 'text/plain', 'text/x-markdown']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "storage_read_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skill-files');

CREATE POLICY "storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'skill-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'skill-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'skill-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
