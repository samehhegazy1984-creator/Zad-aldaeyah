-- ====================================================================
-- زاد الداعية | ZAD AL-DA'IYAH - PHASE 4: ADMIN DASHBOARD SCHEMA
-- Safe, Idempotent: extends existing tables and creates admin tables
-- ====================================================================

-- 1. UPDATE PROFILES ROLE CONSTRAINT TO INCLUDE 'editor'
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'editor', 'admin'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. EXTEND CONTENTS TABLE WITH STATUS AND SEO FIELDS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='status') THEN
    ALTER TABLE public.contents ADD COLUMN status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'under_review', 'published', 'archived'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='seo_title') THEN
    ALTER TABLE public.contents ADD COLUMN seo_title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='seo_description') THEN
    ALTER TABLE public.contents ADD COLUMN seo_description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='canonical_url') THEN
    ALTER TABLE public.contents ADD COLUMN canonical_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='og_title') THEN
    ALTER TABLE public.contents ADD COLUMN og_title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='og_description') THEN
    ALTER TABLE public.contents ADD COLUMN og_description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contents' AND column_name='og_image') THEN
    ALTER TABLE public.contents ADD COLUMN og_image TEXT;
  END IF;
END $$;

-- 3. EXTEND CATEGORIES TABLE WITH STATUS AND SORT_ORDER
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='status') THEN
    ALTER TABLE public.categories ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='sort_order') THEN
    ALTER TABLE public.categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 4. CREATE ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT 'مسؤول النظام',
  user_role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, ARCHIVE, ROLE_CHANGE, LOGIN, LOGOUT, SETTINGS_UPDATE
  entity_type TEXT NOT NULL, -- content, category, user, role, ai_material, settings
  entity_id TEXT,
  details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATE PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  site_name TEXT NOT NULL DEFAULT 'زاد الداعية',
  tagline TEXT NOT NULL DEFAULT 'من الفكرة إلى الكلمة النافعة',
  site_description TEXT DEFAULT 'منصة رقمية متخصصة وموسوعة دعوية وتربوية شاملة لإعداد وتطوير المحتوى الإسلامي والخطب والمواعظ',
  admin_email TEXT DEFAULT 'admin@zad-aldaiah.org',
  allow_registration BOOLEAN NOT NULL DEFAULT TRUE,
  enable_ai_generation BOOLEAN NOT NULL DEFAULT TRUE,
  ai_daily_limit INTEGER NOT NULL DEFAULT 10,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row if not exists
INSERT INTO public.platform_settings (id, site_name, tagline, site_description, admin_email, allow_registration, enable_ai_generation, ai_daily_limit)
VALUES ('general', 'زاد الداعية', 'من الفكرة إلى الكلمة النافعة', 'منصة رقمية متخصصة وموسوعة دعوية وتربوية شاملة لإعداد وتطوير المحتوى الإسلامي والخطب والمواعظ', 'admin@zad-aldaiah.org', TRUE, TRUE, 10)
ON CONFLICT (id) DO NOTHING;

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_contents_status ON public.contents(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.admin_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.admin_activity_logs(action);

-- 7. RLS POLICIES FOR ADMIN & EDITOR
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activity Logs Policies
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Authenticated users can insert activity logs" ON public.admin_activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Platform Settings Policies
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.platform_settings;
CREATE POLICY "Settings viewable by everyone" ON public.platform_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can update settings" ON public.platform_settings;
CREATE POLICY "Only admins can update settings" ON public.platform_settings
  FOR UPDATE USING (public.is_admin());

-- Contents Admin Policies (Allow editors/admins to create, update, delete)
DROP POLICY IF EXISTS "Editors and Admins can insert content" ON public.contents;
CREATE POLICY "Editors and Admins can insert content" ON public.contents
  FOR INSERT WITH CHECK (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors and Admins can update content" ON public.contents;
CREATE POLICY "Editors and Admins can update content" ON public.contents
  FOR UPDATE USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors and Admins can delete content" ON public.contents;
CREATE POLICY "Editors and Admins can delete content" ON public.contents
  FOR DELETE USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors and Admins can view all content including drafts" ON public.contents;
CREATE POLICY "Editors and Admins can view all content including drafts" ON public.contents
  FOR SELECT USING (published = true OR public.is_editor_or_admin());

-- Categories Admin Policies
DROP POLICY IF EXISTS "Editors and Admins can insert categories" ON public.categories;
CREATE POLICY "Editors and Admins can insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors and Admins can update categories" ON public.categories;
CREATE POLICY "Editors and Admins can update categories" ON public.categories
  FOR UPDATE USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors and Admins can delete categories" ON public.categories;
CREATE POLICY "Editors and Admins can delete categories" ON public.categories
  FOR DELETE USING (public.is_editor_or_admin());

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
