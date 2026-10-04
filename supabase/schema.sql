-- ====================================================================
-- زاد الداعية | ZAD AL-DA'IYAH - SUPABASE DATABASE MIGRATION & SCHEMA
-- Production Safe, Idempotent, RLS Enabled & Schema Cache Reloaded
-- ====================================================================

-- 1. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'مستخدم زاد',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم زاد'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  content_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUTHORS TABLE
CREATE TABLE IF NOT EXISTS public.authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CONTENTS TABLE (Islamic Materials, Khutbahs, Lessons & Articles)
CREATE TABLE IF NOT EXISTS public.contents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_type TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  author_id TEXT REFERENCES public.authors(id) ON DELETE SET NULL,
  author_name TEXT,
  audience TEXT NOT NULL DEFAULT 'الجميع',
  reading_time INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  views INTEGER NOT NULL DEFAULT 0,
  date_text TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  "references" JSONB DEFAULT '[]'::jsonb,
  ayah_quotes JSONB DEFAULT '[]'::jsonb,
  hadith_quotes JSONB DEFAULT '[]'::jsonb,
  key_takeaways JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FAVORITES TABLE (User Bookmarks)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

-- 6. READING HISTORY TABLE (Latest Read Materials)
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

-- 7. USER SETTINGS TABLE (Preferences)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GENERATIONS TABLE (AI Generated Materials & Khutbahs)
CREATE TABLE IF NOT EXISTS public.generations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  audience TEXT NOT NULL,
  length TEXT NOT NULL,
  style TEXT NOT NULL,
  evidence_level TEXT NOT NULL,
  instructions TEXT,
  result JSONB NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_contents_slug ON public.contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_category ON public.contents(category_id);
CREATE INDEX IF NOT EXISTS idx_contents_author ON public.contents(author_id);
CREATE INDEX IF NOT EXISTS idx_contents_featured ON public.contents(featured);
CREATE INDEX IF NOT EXISTS idx_contents_published ON public.contents(published);
CREATE INDEX IF NOT EXISTS idx_contents_type ON public.contents(content_type);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_content_id ON public.favorites(content_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON public.reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read ON public.reading_history(user_id, last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Clean up existing policy names safely before applying
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  
  DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
  DROP POLICY IF EXISTS "Authors viewable by everyone" ON public.authors;
  DROP POLICY IF EXISTS "Published contents viewable by everyone" ON public.contents;
  
  DROP POLICY IF EXISTS "Users can select own favorites" ON public.favorites;
  DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
  DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
  
  DROP POLICY IF EXISTS "Users can view own reading history" ON public.reading_history;
  DROP POLICY IF EXISTS "Users can insert own reading history" ON public.reading_history;
  DROP POLICY IF EXISTS "Users can update own reading history" ON public.reading_history;
  DROP POLICY IF EXISTS "Users can delete own reading history" ON public.reading_history;
  
  DROP POLICY IF EXISTS "Users view own settings" ON public.user_settings;
  DROP POLICY IF EXISTS "Users insert own settings" ON public.user_settings;
  DROP POLICY IF EXISTS "Users update own settings" ON public.user_settings;
  
  DROP POLICY IF EXISTS "Users view own generations" ON public.generations;
  DROP POLICY IF EXISTS "Users insert own generations" ON public.generations;
  DROP POLICY IF EXISTS "Users update own generations" ON public.generations;
  DROP POLICY IF EXISTS "Users delete own generations" ON public.generations;
END $$;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Categories Policies (Public read-only)
CREATE POLICY "Categories viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- 3. Authors Policies (Public read-only)
CREATE POLICY "Authors viewable by everyone" ON public.authors
  FOR SELECT USING (true);

-- 4. Contents Policies (Public read-only for published)
CREATE POLICY "Published contents viewable by everyone" ON public.contents
  FOR SELECT USING (published = true);

-- 5. Favorites Policies (Strictly User-bound)
CREATE POLICY "Users can select own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Reading History Policies (Strictly User-bound)
CREATE POLICY "Users can view own reading history" ON public.reading_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading history" ON public.reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading history" ON public.reading_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading history" ON public.reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- 7. User Settings Policies (Strictly User-bound)
CREATE POLICY "Users view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Generations Policies (Strictly User-bound)
CREATE POLICY "Users view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own generations" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own generations" ON public.generations
  FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA CACHE IMMEDIATELY
-- ====================================================================
NOTIFY pgrst, 'reload schema';
