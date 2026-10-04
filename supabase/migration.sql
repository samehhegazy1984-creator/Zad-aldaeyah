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
-- ====================================================================
-- زاد الداعية | ZAD AL-DA'IYAH - SUPABASE INITIAL DATA SEED
-- Safe, Idempotent: uses ON CONFLICT DO NOTHING
-- ====================================================================

-- 1. CATEGORIES SEED
INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('faith', 'الإيمان والعقيدة', 'faith', 'ترسيخ اليقين، محبة الله، وأصول التوحيد في القلوب وسلوك الحياة اليومية.', 'Shield', 142)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('quran', 'القرآن', 'quran', 'تدبر آيات التنزيل، فهم المقاصد، والعيش مع رسائل الكتاب الحكيم.', 'BookOpen', 188)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('salah', 'الصلاة', 'salah', 'فقه الخشوع، استحضار القلب، وأثر الصلوات في السكينة وبناء المسلم.', 'Compass', 96)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('seerah', 'السيرة النبوية', 'seerah', 'مواقف من حياة المصطفى ﷺ نستخلص منها معالم القيادة والرحمة والمنهج.', 'Compass', 130)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('tazkiyah', 'تزكية النفس', 'tazkiyah', 'مداواة أمراض القلوب، الصدق، التواضع، ومقامات العبودية والورع.', 'Heart', 120)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('ethics', 'الأخلاق', 'ethics', 'السمت الصالح، حفظ اللسان، الصدق، الأمانة، وحسن المعاشرة مع الخلق.', 'Feather', 114)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('family', 'الأسرة والتربية', 'family', 'المودة والرحمة، غرس المبادئ في الأبناء، والتعامل الحكيم مع مشكلات البيت.', 'Users', 165)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('children-upbringing', 'الأبناء', 'abnaa', 'منهج نبوي وعلمي في رعاية فلذات الأكباد ومرافقتهم في مراحل النمو والتربية.', 'Smile', 84)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('youth', 'الشباب', 'youth', 'قضايا الهوية، إدارة الشبهات والشهوات، واكتشاف الطاقات وبناء الطموح الراشد.', 'Sparkles', 88)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('dawah', 'الدعوة', 'dawah', 'أصول الحكمة والموعظة الحسنة، أساليب التأثير، وفقه مخاطبة الناس بالرفق.', 'MessageSquare', 85)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('society', 'المجتمع', 'society', 'التكافل، صلة الأرحام، الإصلاح بين الناس، ونبذ العصبية والشائعات.', 'Globe', 102)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('ramadan', 'رمضان', 'ramadan', 'استثمار الموسم العظيم، فقه الصيام والقيام، وتجديد العهد مع الله تعالى.', 'Moon', 92)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('hajj', 'الحج والعمرة', 'hajj', 'أسرار المناسك، معاني التجريد والتلبية، ودروس المشاعر المقدسة في الإخلاص.', 'MapPin', 58)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('occasions', 'المناسبات', 'occasions', 'الأعياد، مواسم الطاعات، وفضل الأيام الفاضلة وكيفية إحيائها بالخير.', 'Calendar', 66)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;

INSERT INTO public.categories (id, name, slug, description, icon, content_count)
VALUES ('kids', 'الأطفال', 'children', 'قصص تربوية هادفة، تعليم المبادئ بأسلوب محبب ومناسب للفئات العمرية الأولى.', 'Smile', 78)
ON CONFLICT (id) DO UPDATE SET content_count = EXCLUDED.content_count;


-- 2. AUTHORS SEED
INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-mansoor', 'د. عبد الله المنصور', 'خطيب جامع وأستاذ الدراسات التربوية', 'مهتم بالقضايا التربوية وبناء السلوك الإيماني لدى الأبناء والأسرة المعاصرة.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-saadi', 'الشيخ إبراهيم السعدي', 'خطيب وباحث في الفقه المقارن', 'متخصص في فقه الخطابة المعاصرة وتناول هموم المصلين بلغة علمية رقراقة.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-tamimi', 'أ. سارة التميمي', 'مستشارة تربوية وأسرية', 'تكتب في تنمية المهارات الإيمانية وغرس العقيدة في نفوس الناشئة.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-barrak', 'الشيخ عبد الرحمن البراك', 'داعية وموجه وجداني', 'صاحب دروس ومواعظ قلبية في تزكية النفس ومعالجة الابتلاءات والفتن.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-qahtani', 'د. محمد بن صالح القحطاني', 'أستاذ الحديث وعلومه', 'باحث في فقه السنن النبوية وتطبيقاتها في صلة الأرحام وبر الوالدين.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-otaibi', 'الشيخ فهد العتيبي', 'داعية وخطيب مفوه', 'يركز على اغتنام الأوقات وحماية الشباب من الهدر وتشتت التركيز.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-habib', 'د. طارق الحبيب', 'باحث في الفكر الإسلامي وتدبر القرآن', 'يقدم رؤى معاصرة في كيفية صناعة الإنسان القرآني المعتز بحضارته.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-dawsari', 'أ. خالد الدوسري', 'مدرب وموجه شبابي', 'يعمل في برامج الهوية الشبابية ومواجهة تحديات الاستهلاك والسطحية.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-hazmi', 'د. يوسف الحازمي', 'أستاذ السيرة النبوية والتاريخ', 'مختص في استخراج العبر الإدارية والتربوية من أحداث العهد النبوي الشريف.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-subaie', 'الشيخ صالح السبيعي', 'خطيب وإمام جامع', 'يكتب في استثمار مواسم الطاعات واستدامة العمل الصالح بعد رمضان.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-sulaiman', 'أ. منيرة السليمان', 'معلمة ومؤلفة كتب أطفال', 'مبتكرة لأساليب الحوار الوجداني والقصة التربوية المحببة للأطفال.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-baz', 'د. وليد الباز', 'باحث في أصول الفقه وأدب الاختلاف', 'ينشر في فقه الائتلاف وتوحيد الكلمة وصيانة القلوب من النزاع.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-athar-team', 'فريق صناع الأثر', 'مختبر إنتاج المحتوى الرقمي الدعوي', 'فريق متخصص في كتابة سيناريوهات الفيديو الدعوي القصير والمنشورات المكثفة.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authors (id, name, title, bio, avatar)
VALUES ('author-radwan', 'أ. أنس رضوان', 'كاتب ومحرر محتوى رقمي', 'يصوغ الخواطر الدعوية السريعة ومفاهيم البركة والإنتاجية الإيمانية.', NULL)
ON CONFLICT (id) DO NOTHING;


-- 3. CONTENTS SEED (30 Curated Materials)
INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-01', 'لا تكن عونًا للشيطان على ابنك', 'la-takun-awna-ashaitan-ala-ibnik', 'منهج نبوي في معالجة زلات الأبناء بالرفق والستر دون دفعهم نحو المكابرة والانكسار النفسي.', '["إن التربية ليست امتحاناً يترصد فيه الوالد عثرات ولده، بل هي رحلة طويلة قوامها الستر والإقالة وبث الأمل. كثيراً ما يدفعنا الغضب أو الخوف الزائد على مستقبل أبنائنا إلى استخدام ألفاظ قاسية تكسر النفس، وتجعل الولد يرى نفسه فاشلاً لا أمل في صلاحه، فإذا بنا ندفعه دون قصد إلى ما يبتغيه الشيطان منه.","تأمل موقف الصحابة رضي الله عنهم حين أُتي برجل قد شرب الخمر، فلما أقاموا عليه الحد لعنه بعض القوم، فقال رسول الله ﷺ: «لا تسبوه، فوالله ما علمت إلا أنه يحب الله ورسوله»، وفي رواية: «لا تكونوا عون الشيطان على أخيكم». فإذا كان هذا في حق رجل وقع في كبيرة الحد، فكيف بابنك الذي هو بضعة منك إذا قصّر في صلاة، أو تهاون في واجب؟","المرحلة الأولى في تصحيح الخطأ تبدأ من احتواء المشاعر السلبية. لا تعاقب في فوران الغضب، ولا تناقش الخطأ أمام الإخوة أو الغرباء؛ فإن النصيحة في الملأ فضيحة تورث المكابرة. اجلس مع ابنك في خلوة هادئة، وأظهر له أنك حريص عليه، وأن محبتك له ثابتة لا تهتز بخطئه، وإنما استياؤك من السلوك لا من ذاته.","إن الفارق بين المربي الحكيم والمنفعل هو أن الأول ينظر إلى ما بعد التوبة، بينما الثاني يحبس نفسه وابنه في لحظة الذنب. حين يعلم ابنك أنك ملاذه الآمن إذا أخطأ، سيأتيك معترفاً تائباً، بدلاً من أن يهرب إلى رفقاء السوء مخفياً زلله."]'::jsonb, 'مادة تربوية',
  'family', 'الأسرة والتربية', 'author-mansoor', 'د. عبد الله المنصور',
  'الآباء والأمهات', 7, TRUE, TRUE, 3420, '15 ربيع الأول 1448',
  '["التربية","الأبناء","الرفق","معالجة الخطأ","الأسرة"]'::jsonb, '["صحيح البخاري، كتاب الحدود","تفسير ابن كثير، سورة آل عمران","قواعد تربوية نبوية، د. عبد الله المنصور"]'::jsonb, '[{"text":"فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ","surah":"سورة آل عمران: 159"}]'::jsonb, '[{"text":"«لا تكونوا عون الشيطان على أخيكم»","narrator":"صحيح البخاري، عن أبي هريرة رضي الله عنه"}]'::jsonb, '["الفصل التام بين محبة الابن كشخص وبين عدم الرضا عن سلوكه الخاطئ.","تجنب النصيحة أو العتاب أمام الآخرين لحفظ كرامة الابن من الانكسار.","التأني وتأجيل المحاسبة حتى تهدأ مشاعر الغضب والانفعال.","إبقاء باب العودة والصلح مفتوحاً لكي لا يشعر المخطئ باليأس."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-02', 'حين تصبح الصلاة حياة', 'heena-tasbehu-as-salah-hayah', 'الصلاة واحة السكينة التي ينفض بها المؤمن عن كاهله غبار الدنيا، مستحضراً معية الخالق العظيم.', '["الحمد لله الذي جعل الصلاة عماد الدين، وقرة عيون العارفين، وراحة لنفوس المؤمنين. وأشهد أن لا إله إلا الله وحده لا شريك له، جعلها صلة موصولة بين العبد وربه خمس مرات في اليوم والليلة، وأشهد أن نبينا محمداً عبده ورسوله، كان إذا حزبه أمر فزع إلى الصلاة.","عباد الله: كم من مصلٍ يقف في صفه، ولكن قلبه سارح في أودية الدنيا وتجارتها وهمومها! إن الفرق بين الصلاة العادة والصلاة العبادة هو حضور القلب وعمارته بتعظيم الله تعالى. حين يقول المصلي: «الله أكبر»، فهو يعلن انسلاخه من كل ما سواه، ويقرر أن الله أعظم من كل هَمٍّ يثقل صدره.","إن الخشوع في الصلاة ليس حالة تأتي فجأة دون مقدمات، بل له مفاتيح: إسباغ الوضوء، والتبكير إلى المسجد، والمشي بسكينة ووقار، وترديد الأذان خلف المؤذن، واستشعار أنك تخاطب رب السماوات والأرض في الفاتحة، والله تعالى يقول: «قسمت الصلاة بيني وبين عبدي نصفين ولعبدي ما سأل».","فلنتقِ الله عباد الله، ولنجعل صلاتنا موئلنا حين تضيق الصدور، وملاذنا حين تتكاثر الفتن. بارك الله لي ولكم في القرآن العظيم، ونفعني وإياكم بما فيه من الآيات والذكر الحكيم."]'::jsonb, 'خطبة جمعة',
  'salah', 'الصلاة', 'author-saadi', 'الشيخ إبراهيم السعدي',
  'الخطيب', 12, TRUE, TRUE, 4890, '10 ربيع الأول 1448',
  '["الصلاة","الخشوع","الخطبة","السكينة"]'::jsonb, '["جامع العلوم والحكم، ابن رجب الحنبلي","إحياء علوم الدين، الغزالي","زاد المعاد، ابن القيم"]'::jsonb, '[{"text":"وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ","surah":"سورة البقرة: 45"}]'::jsonb, '[{"text":"«يا بلال، أقم الصلاة، أرحنا بها»","narrator":"سنن أبي داود، وصححه الألباني"}]'::jsonb, '["استشعار معنى تكبيرة الإحرام والانفصال الذهني عن مشاغل الدنيا.","معرفة أن الخشوع ثمرة للاستعداد المسبق بالوضوء والتبكير والذكر.","تأمل حوار الفاتحة بين العبد وربه لاستحضار معية الله في كل ركعة."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-03', 'تربية الأبناء على الإيمان', 'tarbiyat-al-abna-ala-al-eeman', 'خطوات عملية وتطبيقات واقعية لتحويل الإيمان إلى تجربة دافئة يعيشها الصغير بالقدوة والامتنان.', '["يبدأ غرس الإيمان في قلب الطفل من الشعور بالحب والامتنان قبل الشعور بالخوف والوعيد. حين يرى الطفل نعم الله مبثوثة في لعبه وطعامه وجمال الطبيعة من حوله، ويربطه الوالدان بالمنعم جل جلاله: «من أعطانا هذا؟ الله الكريم»، ينشأ في قلبه تعلق فطري بربه.","من الأخطاء التربوية الشائعة تصوير الدين للأطفال على أنه قائمة من الممنوعات والعقوبات؛ كأن يقال: «إن لم تفعل كذا سيحرقك الله في النار». إن هذا الأسلوب ينفر الطفل ويشوه صورة الرحمة الإلهية في خياله الغض.","القدوة الصامتة أبلغ من مئات المواعظ الكلامية. عندما يرى الابن والديه يتركان ما بأيديهما فور سماع حي على الصلاة، وعندما يرى أمه تبتسم وتحمد الله في الضراء، تتشرب روحه الإيمان دون حاجة إلى تكلف."]'::jsonb, 'مادة تربوية',
  'children-upbringing', 'الأبناء', 'author-tamimi', 'أ. سارة التميمي',
  'المعلمون', 9, TRUE, TRUE, 2950, '5 ربيع الأول 1448',
  '["التربية","الأبناء","الإيمان","القدوة","الأطفال"]'::jsonb, '["تحفة المودود بأحكام المولود، ابن القيم","التربية الإيمانية للطفل، أ. سارة التميمي"]'::jsonb, '[]'::jsonb, '[{"text":"«يا غلام إني أعلمك كلمات: احفظ الله يحفظك، احفظ الله تجده تجاهك...»","narrator":"سنن الترمذي، عن عبد الله بن عباس رضي الله عنهما"}]'::jsonb, '["البدء بالتعريف بأسماء الله الحسنى الدالة على الرحمة واللطف والرزق.","ربط النعم اليومية الصغيرة بالله لتربية حاسة الامتنان.","القدوة الحية في البيت هي الدرس الأعظم أثراً ورسوخاً في الذاكرة."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-04', 'الصبر حين تضيق الحياة', 'as-sabr-heena-tadeeq-al-hayah', 'كلمات ترسم خارطة النور في عتمة الابتلاء، وتعيد ترتيب القلب مع ربه طلباً للفرج والسكينة.', '["أخي المبتلى، يا من ضاقت عليه الأرض بما رحبت: اعلم أن أقدار الله كلها خير، وأن المنع في حقه عين العطاء إن اقترن بالرضا. ما ابتلاك الله ليهلكك، وإنما ابتلاك ليهذبك ويسمع تضرعك.","تأمل في قصة يوسف عليه السلام؛ من غيابات الجب إلى قيد الرق، ومن كيد النسوة إلى غياهب السجن سنين عددا، ثم ماذا؟ كانت تلك المحن كلها درجات سلمه الله بها ليكون عزيز مصر وصاحب الرأي والتمكين.","إن الصبر الجميل هو صبر بلا شكوى لغير الله؛ أن تنادي في جوف الليل: «إنما أشكوا بثي وحزني إلى الله». فاستبشر، فإن بعد العسر يسراً، ولن يغلب عسر يسرين."]'::jsonb, 'موعظة',
  'tazkiyah', 'تزكية النفس', 'author-barrak', 'الشيخ عبد الرحمن البراك',
  'عامة المسلمين', 6, TRUE, TRUE, 3810, '1 ربيع الأول 1448',
  '["الصبر","الابتلاء","تزكية","الفرج","الرضا"]'::jsonb, '["عدة الصابرين وذخيرة الشاكرين، ابن القيم","الفوائد، ابن القيم"]'::jsonb, '[{"text":"إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ","surah":"سورة الزمر: 10"}]'::jsonb, '[]'::jsonb, '["اليقين بأن الابتلاء مقدر بحكمة ولطف وليس عن عشوائية.","رفع الشكوى إلى الخالق وحده وسؤال الفرج مع حسن الظن به سبحانه.","تذكر عواقب الصبر وجزاء الصابرين بغير حساب يوم القيامة."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-05', 'بر الوالدين... عبادة العمر', 'birr-al-walidayn-ibadat-al-umr', 'تأصيل شرعي وعملي لأعظم أبواب الجنة المفتوحة في أوقات الضعف والكبر وحسن الصحبة.', '["قرن الله تبارك وتعالى حقه في التوحيد بحق الوالدين في البر والإحسان، فقال سبحانه: ﴿وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾. وهذا الاقتران يدل دلالة قاطعة على عظم هذه العبادة وجلالة قدرها.","البر لا يقتصر على الإنفاق المالي أو قضاء الحوائج العاجلة، بل البر الأسمى هو بر المشاعر: خفض الجناح، والإنصات لحديثهما حتى لو تكرر عشرات المرات، وابتسامة الرضا، وعدم إظهار التبرم والضجر حين يثقل الكبر خطاهما.","ومن تمام البر بعد وفاتهما: الاستغفار لهما، وإنفاذ عهدهما، وصلة الرحم التي لا توصل إلا بهما، وإكرام صديقهما. فهنيئاً لمن أدرك والديه أو أحدهما فكان ذلك سبب دخوله الجنة."]'::jsonb, 'درس',
  'ethics', 'الأخلاق', 'author-qahtani', 'د. محمد بن صالح القحطاني',
  'الدعاة', 10, FALSE, TRUE, 2640, '24 صفر 1448',
  '["بر الوالدين","الأخلاق","الجنة","الأسرة","صلة الرحم"]'::jsonb, '["الأدب المفرد، الإمام البخاري","بر الوالدين، ابن الجوزي"]'::jsonb, '[{"text":"وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا","surah":"سورة الإسراء: 24"}]'::jsonb, '[]'::jsonb, '["البر عبادة قلبية تتجلى في التواضع وخفض الصوت والصبر على التغيرات النفسية للكبار.","الاستمرار في البر حتى بعد الرحيل بالدعاء والصدقة والصلة.","بر الوالدين سلف يُرد لك في الدنيا عبر بر أبنائك بك."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-06', 'اغتنام الوقت قبل الرحيل', 'ightinam-al-waqt-qabl-ar-raheel', 'كيف نحمي ساعاتنا من هدر الشاشات والملهيات لنبني رصيداً خالداً عند الله تعالى.', '["الوقت هو رأس مالك الحقيقي؛ كل يوم ينشق فجره ينادي: «يا ابن آدم، أنا خلق جديد، وعلى عملك شهيد، فتزود مني، فإني لا أعود إلى يوم القيامة».","في عصر الانفجار الرقمي، أصبحت وسائل التواصل تسلب منا ساعات عمرنا دون أن نشعر. نتصفح المقاطع بلا هدف، ونؤجل الأولويات، حتى ينقضي اليوم تلو اليوم ونحن في مكاننا لم نزدد علماً ولا عملاً.","حدد لنفسك ورداً يومياً ثابتاً: حزباً من القرآن، ركعات في الوتر، كتاباً تقرؤه، وعملاً نافعاً تقدمه لأهلك وأمتك. فالبركة تحل حيث وُجد الانضباط والإخلاص."]'::jsonb, 'كلمة قصيرة',
  'tazkiyah', 'تزكية النفس', 'author-otaibi', 'الشيخ فهد العتيبي',
  'الشباب', 5, FALSE, TRUE, 4120, '18 صفر 1448',
  '["الوقت","العمر","التزكية","الإنتاجية","الشباب"]'::jsonb, '["قيمة الزمن عند العلماء، عبد الفتاح أبو غدة","صيد الخاطر، ابن الجوزي"]'::jsonb, '[]'::jsonb, '[{"text":"«نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ»","narrator":"صحيح البخاري، عن عبد الله بن عباس رضي الله عنهما"}]'::jsonb, '["إدراك قيمة اللحظة الحاضرة ومحاسبة النفس على الساعات الضائعة.","وضع حدود صارمة لاستهلاك المحتوى الرقمي المشتت.","تثبيت أوراد يومية صغيرة مستمرة خير من أعمال كبيرة منقطعة."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-07', 'القرآن وصناعة الإنسان', 'al-quran-wa-sinaat-al-insan', 'كيف يعيد القرآن بناء عقل الإنسان، وتطهير وجدانه، وإعادة تشكيل رؤيته للوجود والحياة.', '["إن المعجزة الكبرى للقرآن الكريم تكمن في قدرته الفريدة على تحويل رعاة الشياه إلى قادة الأمم في بضعة عقود. لقد أحدث القرآن انقلاباً مفاهيمياً في نظرة الإنسان لنفسه وللكون وللغاية من وجوده.","حين نقرأ قصص الأنبياء في القرآن، لا نقرأ أحداثاً تاريخية غابرة، بل نكتشف السنن النفسية والاجتماعية التي تحكم المجتمعات وصراع الحق والباطل، وكيف يثبت أصحاب المبادئ في وجه الطغيان.","الصلة الحقيقية بالقرآن تكون بالتدبر والعمل. ليس المراد مجرد سرعة ختام السور، بل الوقوف عند الآية وترديدها في الليل حتى تبكي العين ويخشع القلب وتتحول الآية إلى سلوك يمشي بين الناس."]'::jsonb, 'محاضرة',
  'quran', 'القرآن', 'author-habib', 'د. طارق الحبيب',
  'طلاب العلم', 14, FALSE, TRUE, 3190, '12 صفر 1448',
  '["القرآن","التدبر","بناء الإنسان","الهداية","المقاصد"]'::jsonb, '["مفاتيح تدبر القرآن، د. خالد اللاحم","معالم في الطريق إلى القرآن"]'::jsonb, '[{"text":"كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ","surah":"سورة ص: 29"}]'::jsonb, '[]'::jsonb, '["الانتقال من التلاوة المجردة إلى التلاوة الواعية المقترنة بالتدبر والتطبيق.","استخراج القوانين التربوية من قصص الأنبياء في كتاب الله.","أثر القرآن في تزكية العقل وحمايته من التخبط الفكري والشبهات."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-08', 'الشباب وبناء الشخصية في زمن الاستهلاك', 'ash-shabab-wa-binaa-ash-shakhsiyah', 'كيف يتجاوز الشاب ثقافة السطحية والانبهار بالمظاهر، ليؤسس شخصية متزنة تجمع بين الأصالة والكفاءة.', '["يعيش الشباب اليوم تحت وطأة سيل من المقارنات المستمرة على منصات التواصل؛ حيث يقاس النجاح بعدد المتابعين، ونوع المقتنيات، والأماكن التي يتردد عليها المرء. هذا النمط الاستهلاكي يجوف الروح ويجعل الشاب في قلق دائم.","إن الإسلام يقدم للشاب هوية عميقة قائمة على العطاء لا الاستهلاك، وعلى القيمة الذاتية المشتقة من عبودية الله ونفع الخلق، لا من علامة تجارية يرتديها.","أمام الشباب فرصة تاريخية لاستثمار طاقتهم في مجالات العلم، والتقنية، والعمل التطوعي، والدعوة بالحكمة؛ ليكونوا سفراء حقيقيين لدينهم وبناة لمجتمعاتهم."]'::jsonb, 'مادة تربوية',
  'youth', 'الشباب', 'author-dawsari', 'أ. خالد الدوسري',
  'الشباب', 8, FALSE, TRUE, 2840, '5 صفر 1448',
  '["الشباب","الهوية","التأثير","الاستهلاك","بناء الشخصية"]'::jsonb, '["أزمة الهوية عند الشباب، د. عبد الكريم بكار"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["التوقف عن مقارنة الكواليس الشخصية بما يظهره الآخرون على الشاشات.","بناء مهارات عملية حقيقية ذات أثر نفعي في الواقع.","الاعتزاز بالهوية الإسلامية دون عقدة نقص أو انكفاء."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-09', 'الرحمة المهداة: قبسات من هدي النبي ﷺ في التعامل مع المخطئ', 'ar-rahmah-al-muhdah-fi-hady-an-nabi', 'دراسة تأصيلية لمواقف المصطفى ﷺ مع الزلات البشرية، وكيف حول الخطأ إلى بوابة محبة وهداية.', '["تتجلى عظمة القيادة النبوية في روعة التعامل مع زلات البشر وضعفهم. لم يكن النبي ﷺ ينهر أو يقصي، بل كان يرى في المخطئ مريضاً يحتاج إلى دواء ورفق، لا مذنباً يستحق الإقصاء والتشهير.","حين دخل الأعرابي وبال في طائفة المسجد، ثار الصحابة وزجروه، لكن النبي ﷺ بحكمته العميقة قال: «لا تزرموه، دعوه، ثم أمر بذنوب من ماء فأهريق عليه»، ثم دعاه بكل رفق وقال له: «إن هذه المساجد لا تصلح لشيء من هذا القذر...». خرج الأعرابي بقلب ممتلئ بحب النبي ﷺ وحب الإسلام.","وهكذا في قصة الشاب الذي استأذنه في الزنا، لم ينهره ولم يطرده، بل أدناه منه وسأله بالحوار العقلي الهادئ: «أتحبه لأمك؟ أتحبه لأختك؟»، ثم وضع يده الشريفة على صدره ودعا له: «اللهم اغفر ذنبه وطهر قلبه وحصن فرجه». فما خرج الشاب إلا والزنا أبغض شيء إليه."]'::jsonb, 'درس',
  'seerah', 'السيرة النبوية', 'author-hazmi', 'د. يوسف الحازمي',
  'المعلمون', 11, FALSE, TRUE, 3750, '28 محرم 1448',
  '["السيرة","النبي","الرحمة","التربية","معالجة الزلل"]'::jsonb, '["الرحيق المختوم، صفي الرحمن المباركفوري","فقه السيرة، محمد الغزالي"]'::jsonb, '[]'::jsonb, '[{"text":"«إن الرفق لا يكون في شيء إلا زانه، ولا ينزع من شيء إلا شانه»","narrator":"صحيح مسلم، عن عائشة رضي الله عنها"}]'::jsonb, '["الرفق في معالجة الخطأ أجدى من الغلظة والتعنيف.","استخدام الحوار العقلي والوجداني لإقناع المخطئ بضرر فعله.","الدعاء للمخطئ بالهداية جزء أصيل من منهج الدعوة."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-10', 'غراس رمضان: كيف نبني عادة تدوم؟', 'ghiras-ramadan-kayfa-nabni-adah-tadoom', 'ليس رمضان محطة عابرة نعود بعدها لسابق عهدنا، بل هو دورة تدريبية مكثفة لبناء عادات الإيمان طوال العام.', '["الحمد لله الذي تفضل علينا بمواسم الخيرات، وضاعف فيها الحسنات، وأشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن نبينا محمداً عبده ورسوله، كان أجود الناس، وكان أجود ما يكون في رمضان.","أيها الإخوة الكرام: من علامات قبول العمل الصالح في رمضان أن تتبعه بالطاعة بعده. إن رب رمضان هو رب سائر الشهور؛ فإذا كنا قد تذوقنا حلاوة القرآن في التراويح، فلماذا نهجر المصحف بعد العيد؟ وإذا كنا قد ذقنا لذة مناجاة السحر في القيام، فلماذا نحرم أنفسنا من ركعتين في جوف الليل طوال العام؟","إن سر الاستمرارية يكمن في الاقتصاد في العبادة؛ قال النبي ﷺ: «أحب الأعمال إلى الله أدومها وإن قل». اختر لنفسك بعد رمضان عبادات يسيرة تثبت عليها: صيام ثلاثة أيام من كل شهر، وصفحة يومية من القرآن بتدبر، وركعة وتر لا تنام إلا وقد أديتها."]'::jsonb, 'خطبة جمعة',
  'ramadan', 'رمضان', 'author-subaie', 'الشيخ صالح السبيعي',
  'الخطيب', 9, FALSE, TRUE, 4530, '20 محرم 1448',
  '["رمضان","الاستمرار","العادات","العبادة","الاستقامة"]'::jsonb, '["لطائف المعارف فيما لمواسم العام من الوظائف، ابن رجب"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["علامة قبول الطاعة هي دوام الاستقامة بعدها.","الالتزام بقليل مستمر خير من كثير منقطع.","المحافظة على روح رمضان في سائر شهور العام."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-11', 'حين يتحدث المربي: مهارات التواصل الوجداني مع الطفل', 'heena-yatahaddath-al-murabbi', 'أسرار الحوار الناجح والإنصات القلبي الذي يبني ثقة الصغير ويجعله يفتح قلبه لمربيه بأمان.', '["الإنصات للطفل ليس مجرد الاستماع لكلماته بينما عيوننا معلقة بشاشات الهواتف، بل هو النزول لمستوى نظره جسدياً وعاطفياً، وإشعاره بأن ما يقوله يستحق الاهتمام الكامل.","حين يعبر الطفل عن مخاوفه أو غضبه، لا تبادر بالتقليل من شأن شعوره كأن تقول: «هذا أمر تافه لا يبكي»، بل قل له: «أنا أفهم أنك تشعر بالحزن، أخبرني أكثر عما حدث». هذا الاعتراف بمشاعره يمنحه الأمان النفسي.","استخدم أسلوب القصة التربوية المفتوحة التي تتيح للطفل التفكير واستنباط النتيجة بنفسه، بدلاً من إلقاء الأوامر الجافة المباشرة."]'::jsonb, 'درس للأطفال',
  'kids', 'الأطفال', 'author-sulaiman', 'أ. منيرة السليمان',
  'الآباء والأمهات', 7, FALSE, TRUE, 2210, '15 محرم 1448',
  '["الأطفال","الحوار","التربية","التواصل","الإنصات"]'::jsonb, '["علم نفس الطفل في ضوء الإسلام، د. محمد عثمان نجاتي"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["التواصل البصري والنزول لمستوى الطفل عند الحديث معه.","تفهم مشاعر الطفل وعدم الاستهانة بمخاوفه أو حزنه.","تشجيع الطفل على طرح الأسئلة الفكرية والدينية دون توبيخ."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-12', 'أدب الاختلاف وحفظ القلوب', 'adab-al-ikhtilaf-wa-hifz-al-quloob', 'قواعد ذهبية سطرها سلف الأمة لحماية الأخوة وصيانة النسيج المجتمعي عند تباين الآراء.', '["إن اختلاف العقول والأنظار سنة كونية وطبيعة فطرية خلق الله عليها الناس؛ ﴿وَلَوْ شَاءَ رَبُّكَ لَجَعَلَ النَّاسَ أُمَّةً وَاحِدَةً ۖ وَلَا يَزَالُونَ مُخْتَلِفِينَ﴾. والمذموم في الشريعة ليس مجرد الاختلاف في المسائل السائغة، بل المذموم هو التفرق والبغي والعدوان.","كان الإمام الشافعي رحمه الله يختلف مع يونس بن عبد الأعلى في مسألة فقهية، فلقيه وأخذ بيده وقال: «يا أبا موسى، ألا يستقيم أن نكون إخواناً وإن لم نتفق في مسألة؟». هذه الروح السامية هي التي تحمي قلوب الدعاة والمسلمين من الأحقاد والضغائن.","فلنتعلم التفريق بين الثوابت القطعية التي لا تحتمل الخلاف، وبين المساحات الاجتهادية التي وسع فيها الصحابة والفقهاء بعضهم بعضاً."]'::jsonb, 'محاضرة',
  'ethics', 'الأخلاق', 'author-baz', 'د. وليد الباز',
  'طلاب العلم', 13, FALSE, TRUE, 3340, '10 محرم 1448',
  '["الأخلاق","أدب الاختلاف","الأخوة","المجتمع","التآلف"]'::jsonb, '["أدب الاختلاف في الإسلام، د. طه جابر العلواني","جامع بيان العلم وفضله، ابن عبد البر"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["التفريق الحاسم بين مسائل الإجماع القطعية ومسائل الاجتهاد الظنية.","حفظ مودة الأخوة الإيمانية فوق الخلافات الجزئية.","حسن الظن بالمخالف ما دام متجرداً لطلب الحق ومؤهلاً للنظر."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-13', 'سيناريو مقطع قصير: "أين تجد السكينة؟"', 'scenario-ayna-tajid-as-sakeenah', 'سيناريو بصري مشهدي مكتوب بدقة لصناع المحتوى الدعوي، مدته 60 ثانية، يعالج قلق العصر بذكر الله.', '["[المشهد 1 - بصري: شاشة سوداء تبدأ بلقطات سريعة متوترة: زحام شوارع، إشعارات هواتف تتوالى، شخص يمسك رأسه من الإرهاق. الصوت: همهمات مشوشة وإيقاع سريع].","[الصوت الراوي الهادئ]: «في عالم لا يتوقف عن الصراخ والمطالبة... متى كانت آخر مرة تنفست فيها بعمق؟ متى كانت آخر لحظة شعرت فيها أن قلبك ساكن حقاً؟»","[المشهد 2 - بصري: انتقال سلس إلى مشهد فجر هادئ، نافذة ينفذ منها ضوء الصباح الرقيق، ومصحف مفتوح على طاولة خشبية دافئة. هدوء صوتي تام إلا من ترتيل عذب خافت].","[الصوت الراوي]: «ليست السكينة في اعتزال الحياة، بل في إدخال الله إلى تفاصيلها. ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾».","[المشهد 3 - نص على الشاشة]: توقف الآن لدقيقة واحدة... قل: «سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر» واستشعر السكينة تسري في صدرك."]'::jsonb, 'سيناريو فيديو',
  'dawah', 'الدعوة', 'author-athar-team', 'فريق صناع الأثر',
  'الشباب', 3, FALSE, TRUE, 6120, '4 محرم 1448',
  '["سيناريو","فيديو","صناعة المحتوى","السكينة","الدعوة"]'::jsonb, '["دليل صناعة المحتوى الإيماني المرئي، فريق صناع الأثر"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["البداية بالمشكلة والوجع اليومي الملموس للمشاهد لجذب انتباهه في أول 3 ثوانٍ.","استخدام التباين البصري بين صخب الدنيا وسكون الذكر.","دعوة صريحة ومباشرة للفعل والذكر في نهاية المقطع."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-14', 'منشور دعوي مكثف: "معنى البركة"', 'manshur-dawi-mana-al-barakah', 'ومضة دعوية سريعة توضح أن البركة ليست في كثرة العدد، بل في دوام النفع وراحة البال.', '["ليست البركة أن تملك الكثير، بل أن يكفيك القليل ويفيض.","البركة في الوقت: أن تنجز في ساعة ما يعجز عنه غيرك في أيام.","البركة في الرزق: أن يرزقك الله راحة البال وصحة الجسد وصلاح الولد، حتى لو كان الدخل محدوداً.","البركة في العلم: أن تنفع الناس بما علمت، لا أن تجمع الكتب وتحفظ المسائل دون أثر في واقعك.","ومفتاح البركة كله ملخص في كلمتين: «تقوى الله، والصدق في النية». ﴿وَلَوْ أَنَّ أَهْلَ الْقُرَىٰ آمَنُوا وَاتَّقَوْا لَفَتَحْنَا عَلَيْهِم بَرَكَاتٍ مِّنَ السَّمَاءِ وَالْأَرْضِ﴾."]'::jsonb, 'منشور دعوي',
  'society', 'المجتمع', 'author-radwan', 'أ. أنس رضوان',
  'الجميع', 2, FALSE, TRUE, 5200, '1 محرم 1448',
  '["منشور","البركة","خواطر","المجتمع","التزكية"]'::jsonb, '["البركة في فضل القرآن والسنة، د. عبد الله الخاطر"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["تعريف البركة كأثر نوعي لا كمي.","ربط البركة بالتقوى وصدق التوجه إلى الله."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-15', 'خطبة عيد الفطر: فرح الطاعة وصلة الأرحام', 'khutbat-eid-al-fitr-farah-at-taah', 'خطبة جامعة تجمع بين شكر المنعم على إتمام الصيام، وإفشاء السلام وتفقد المحتاجين والأقارب.', '["الله أكبر، الله أكبر، لا إله إلا الله، والله أكبر، الله أكبر، ولله الحمد. الحمد لله الذي أكمل لنا شهر الصيام، وشرع لنا فيه القيام، وأعاننا على البر والإحسان.","أيها المسلمون: العيد في الإسلام يوم شكر وابتهاج بالفضل؛ ﴿قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا هُوَ خَيْرٌ مِّمَّا يَجْمَعُونَ﴾. ليس العيد لمن لبس الجديد فحسب، بل العيد لمن شكر ربه وأطاع، وخاف يوم الوعيد.","اجعلوا من هذا اليوم المبارك فرصة لتصفية القلوب من الشحناء، وصِلوا أرحامكم، وتفقدوا جيرانكم والفقراء بينكم؛ فإن إدخال السرور على قلب مسلم من أحب الأعمال إلى الله تعالى."]'::jsonb, 'خطبة عيد',
  'occasions', 'المناسبات', 'author-saadi', 'الشيخ إبراهيم السعدي',
  'الخطيب', 8, FALSE, TRUE, 3990, '1 شوال 1447',
  '["خطبة عيد","العيد","الفرح","صلة الرحم","المناسبات"]'::jsonb, '["أحكام العيدين في السنة المطهرة، الشيخ الألباني"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["استشعار شكر الله على نعمة التوفيق للصيام والقيام.","تصفية القلوب والمبادرة بالسلام ونبذ الخصومات.","إدخال الفرحة على الأهل والأيتام والفقراء."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-16', 'أسرار الحج: تجريد القلب لرب العالمين', 'asrar-al-hajj-tajreed-al-qalb', 'تأملات وجدانية في معاني الإحرام والتلبية والوقوف بعرفة وتجريد الروح من علائق الدنيا.', '["الحج ليس مجرد رحلة جغرافية يقطع فيها الإنسان المسافات، بل هو هجرة روحية يخلع فيها العبد ثياب الفخر والرتب، ليلبس إحراماً أبيض يشبه كفن الموت، معلناً مساواته بجموع المؤمنين تحت ظل الربوبية.","حين ترتفع الأصوات بـ «لبيك اللهم لبيك»، فهي إجابة لنداء إبراهيم الخليل عليه السلام، وتجديد للعهد أن السمع والطاعة والمحبة والملك كله لله وحده لا شريك له.","ويوم عرفة هو المشهد المصغر ليوم الحشر الأكبر؛ حيث تجتمع الألسن المختلفة تدعو رباً واحداً، فيفيض الكريم برحماته ومغفرته على عباده الصادقين."]'::jsonb, 'مادة تربوية',
  'hajj', 'الحج والعمرة', 'author-barrak', 'الشيخ عبد الرحمن البراك',
  'عامة المسلمين', 10, FALSE, TRUE, 2900, '8 ذو الحجة 1447',
  '["الحج","العمرة","التلبية","عرفة","التزكية"]'::jsonb, '["أسرار الحج، ابن القيم","مقاصد الحج في الشريعة الإسلامية"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["استحضار المساواة والتواضع عند لبس الإحرام.","تدبر معاني التلبية والتوحيد الخالص في كل منسك.","استغلال يوم عرفة بالدعاء والتضرع والتوبة الصادقة."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-17', 'برنامج إيماني مقترح: "أربعون يوماً لصناعة الفجر"', 'barnamaj-eamani-arbaoon-yawman-fajr', 'دليل عملي وجدول أسبوعي متدرج لمساعدة الشاب والأسرة على ضبط صلاة الفجر في جماعة المسجد.', '["صلاة الفجر هي المعيار الحقيقي لصدق الإيمان وقوة الإرادة. من حافظ عليها فهو في ذمة الله ورعايته طوال يومه. ولكن كيف ننتقل من نية الاستيقاظ إلى انتظام دائم لا ينقطع؟","يقوم هذا البرنامج على قاعدة «التدرج والبيئة المساندة»؛ حيث نقسم الأربعين يوماً إلى 4 مراحل: الأسبوع الأول لضبط مواعيد النوم والابتعاد عن الشاشات قبل ساعة من النوم. الأسبوع الثاني للمساندة الجماعية والاتفاق مع رفيق يوقظك.","الأسبوع الثالث لإحياء سنن ما قبل النوم والوضوء والأذكار واستحضار عظيم الأجر. والأسبوع الرابع لتثبيت الحضور في الصف الأول واستشعار حلاوة برد الفجر وانشراح الصدر."]'::jsonb, 'برنامج إيماني',
  'salah', 'الصلاة', 'author-mansoor', 'د. عبد الله المنصور',
  'الشباب', 8, FALSE, TRUE, 4320, '18 شوال 1447',
  '["الفجر","برنامج إيماني","الصلاة","العادات","الانضباط"]'::jsonb, '["فضل صلاة الفجر في السنة، د. عبد الله المنصور"]'::jsonb, '[]'::jsonb, '[{"text":"«من صلى الصبح فهو في ذمة الله»","narrator":"صحيح مسلم، عن جندب بن عبد الله رضي الله عنه"}]'::jsonb, '["تقديم موعد النوم هو الشرط الفيزيولوجي الأول لسهولة الاستيقاظ.","اختيار رفيق صالح للمساندة في التنبيه والاستيقاظ.","الاستمرار 40 يوماً متتالية يحول الفعل إلى عادة راسخة لا تتكلفها."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-18', 'جلسة أسرية: "من أين تأتي السعادة في بيوتنا؟"', 'jalsah-usariyah-min-ayna-tati-as-saadah', 'مادة أسرية مصممة للقاء الأسبوعي بين الوالدين والأبناء، تدور حول التغافل وكلمات التقدير المتبادلة.', '["ليست السعادة في البيت سعة في الأثاث أو كثرة في الأجهزة، بل السعادة في سكينة النفوس والتراحم بين أهل البيت. بيت صغير عامر بالابتسامة خير من قصر فسيح تمزقه الخلافات والكلمات الجارحة.","في هذه الجلسة، نقترح على الوالدين أن يفسحا المجال لكل فرد في الأسرة ليعبر عن أمر جميل لاحظه في إخوانه خلال الأسبوع المنصرم. هذا التمرين البسيط يكسر روتين النقد اليومي وينمي عدسة تقدير المحاسن.","علموا أبناءكم أدب «التغافل»؛ فليس كل خطأ يستحق الوقوف عنده، والتغافل شيمة الكرام وأحد أهم أسرار استقرار البيوت وسعادتها."]'::jsonb, 'مادة أسرية',
  'family', 'الأسرة والتربية', 'author-tamimi', 'أ. سارة التميمي',
  'الآباء والأمهات', 6, FALSE, TRUE, 2470, '25 رجب 1447',
  '["الأسرة","السعادة","التغافل","البيت","جلسة أسرية"]'::jsonb, '["البيوت المطمئنة، أ. سارة التميمي","معالم الأسرة المسلمة"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["التعبير الصريح عن الامتنان والمحبة بين أفراد الأسرة.","ممارسة التغافل عن الزلات الهينة لتجنب التوتر الدائم.","جعل الجلسة الأسرية الأسبوعية موعداً دافئاً ينتظره الجميع."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-19', 'قصة للأطفال: "عصفور الشكر الصغير"', 'qissah-lil-atfal-usfoor-ash-shukr', 'قصة تعليمية ممتعة تغرس في الطفل شكر نعم الله تعالى على الحواس والطعام والبيت والأهل.', '["كان يا ما كان، في بستان جميل تسكنه طيور ملونة، كان هناك عصفور صغير لطيف اسمه «ريحان». كان ريحان كلما أكل حبة قمح صغيرة، يقف على غصن الشجرة ويقول بصوته العذب: «الحمد لله الذي أطعمني وسقاني».","في يوم من الأيام، سأله صديقه البلبل: «لماذا تشكر في كل مرة حتى لو كانت الحبة صغيرة جداً؟»، فابتسم ريحان وقال: «لأن الله يحب من يشكره، ولأن الحبة الصغيرة تصنع طاقة أطير بها في السماء الجميلة، ولأن بالشكر تدوم النعم!».","تعلمت الطيور من ريحان أن ترى النعم الجميلة في كل مكان: في قطرات الندى، ودفء الشمس، وسلامة الأجنحة. فصارت كلها تردد معاً كل صباح: «الحمد لله رب العالمين»."]'::jsonb, 'درس للأطفال',
  'kids', 'الأطفال', 'author-sulaiman', 'أ. منيرة السليمان',
  'الأطفال', 4, FALSE, TRUE, 3100, '10 جمادى الأولى 1447',
  '["الأطفال","قصة","الشكر","الحمد","التربية"]'::jsonb, '["سلسلة رياض الأطفال الإيمانية، أ. منيرة السليمان"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["تعليم الطفل قول «الحمد لله» بعد الانتهاء من الطعام والشراب.","ملاحظة نعم الله الصغيرة في محيط الطفل وربطه بالخالق الرحيم.","استخدام الأسلوب القصصي الدافئ لغرس القيم الإيمانية."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-20', 'منشور دعوي: "إذا نام الناس وقمت أنت"', 'manshur-dawi-idha-nama-an-nas', 'كلمات مكثفة حول ركعتي الوتر ومناجاة السحر في عالم يغمره النوم والغفلة.', '["ركعتان في جوف الليل تسجد فيهما خاشعاً، خير لك من الدنيا وما فيها.","في ذلك الوقت الهادئ، ينزل ربنا تبارك وتعالى نزولاً يليق بجلاله إلى السماء الدنيا، وينادي: «هل من داعٍ فأستجيب له؟ هل من سائل فأعطيه؟ هل من مستغفر فأغفر له؟».","فلا تكن ممن زهد في لقاء الملك، ولا ترقد حتى تسكب دمعة أو ترفع كفاً تسأل بها خيري الدنيا والآخرة."]'::jsonb, 'منشور دعوي',
  'tazkiyah', 'تزكية النفس', 'author-radwan', 'أ. أنس رضوان',
  'الجميع', 2, FALSE, TRUE, 4890, '2 جمادى الأولى 1447',
  '["قيام الليل","الوتر","الدعاء","التزكية","منشور"]'::jsonb, '["صحيح مسلم، كتاب صلاة المسافرين وقصرها"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["استشعار شرف قيام الليل ولو بركعة وتر واحدة.","اغتنام وقت النزول الإلهي بالدعاء والاستغفار."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-21', 'تزكية النفس: "علاج داء العجب والكبر"', 'tazkiyat-an-nafs-ilaj-al-ujb-wa-al-kibr', 'خطوات عملية لتطهير القلب من رؤية النفس وازدراء الآخرين، واستشعار محض فضل الله تعالى.', '["العجب هو أن يرى العبد عمله الصالح بعين الرضا والتعظيم وينسى منة الله عليه في توفيقه. والكبر هو بطر الحق وغمط الناس. وهذان الداءان من أخطر الآفات التي تحبط الحسنات.","دواء العجب هو أن تتذكر أن أنفاسك ونبضات قلبك وقوتك كلها عارية من الله تعالى، ولولا أن الله شرح صدرك ويسر لك الطاعة لما ركعت ركعة ولا تصدقت بدرهم؛ ﴿وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ مَا زَكَىٰ مِنكُم مِّنْ أَحَدٍ أَبَدًا﴾.","ودواء الكبر هو التواضع للخلق، ومخالطة المساكين، وتذكر أصل خلقة الإنسان من طين، ومصيره إلى التراب، ليبقى القلب منكسراً لربه مشفقاً على عباده."]'::jsonb, 'درس',
  'tazkiyah', 'تزكية النفس', 'author-barrak', 'الشيخ عبد الرحمن البراك',
  'طلاب العلم', 10, FALSE, TRUE, 2780, '20 ربيع الثاني 1447',
  '["تزكية النفس","التواضع","الكبر","العجب","الإخلاص"]'::jsonb, '["مدارج السالكين بين منازل إياك نعبد وإياك نستعين، ابن القيم"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["إرجاع كل فضل وتوفيق إلى الله وحده دون اغترار بالعمل.","التواضع في التعامل مع كل الناس وتجنب احتقار أي مسلم.","مراقبة واردات النفس وخفايا الرياء والعجب وتطهيرها أولاً بأول."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-22', 'خطبة جمعة: "حفظ اللسان وصيانة الأعراض"', 'khutbat-hifz-al-lisan-wa-siyanat-al-arad', 'خطبة تحذر من آفات الغيبة والنميمة والشائعات الرقمية، وتبين كيف ينجو المسلم بحفظ لسانه.', '["الحمد لله الذي جعل اللسان نعمة يبين بها المرء عن مراده، وحجة عليه إن استعمله في معصيته وفجوره. وأشهد أن لا إله إلا الله وحده لا شريك له، أمرنا بالقول السديد، ونهانا عن الفحش والتنابز واللمز.","أيها المسلمون: كم من كلمة ألقت صاحبها في نار جهنم سبعين خريفاً وهو لا يلقي لها بالاً! في عصر الهواتف ومنصات التراسل، صارت الغيبة والنميمة تنشر بضغطة زر واحدة لتصل إلى آلاف البشر في ثوانٍ معدودة.","إن حرمة عرض المسلم عند الله أعظم من حرمة الكعبة المشرفة. فلنتقِ الله في أعراض إخواننا، ولنكف ألسنتنا عما لا يعنينا؛ فإن سلامة الصدر وصمت اللسان هما عنوان الفلاح يوم القيامة."]'::jsonb, 'خطبة جمعة',
  'ethics', 'الأخلاق', 'author-saadi', 'الشيخ إبراهيم السعدي',
  'الخطيب', 11, FALSE, TRUE, 4190, '12 ربيع الثاني 1447',
  '["خطبة جمعة","حفظ اللسان","الغيبة","الأخلاق","المجتمع"]'::jsonb, '["الكبائر، الإمام الذهبي","رياض الصالحين، باب حفظ اللسان"]'::jsonb, '[{"text":"يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا","surah":"سورة الأحزاب: 70"}]'::jsonb, '[{"text":"«من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت»","narrator":"صحيح البخاري ومسلم"}]'::jsonb, '["الحذر من تناقل الشائعات والأحاديث دون تثبت.","تذكر أن كل كلمة مسجلة في صحيفة العمل يقرؤها العبد يوم الحساب.","استبدال الغيبة بالذكر والدعاء للأخ بظهر الغيب."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-23', 'سيناريو فيديو: "أنت لست وحدك"', 'scenario-anta-lasta-wahdak', 'سيناريو ريلز قصير موجه للشباب الذين يشعرون بالوحدة والاغتراب، يذكرهم بمعية الله القريبة.', '["[المشهد 1 - بصري: شاب يمشي وحيداً في شارع ممطر ليلاً، يطأطئ رأسه، وعيون الناس تمر بجانبه دون مبالاة. صوت هادئ ممتزج بصوت المطر].","[الراوي]: «حين تشعر أن العالم كله يتحدث بلغة لا تفهمها، وأن لا أحد يدرك ما في قلبك من ثقل... تذكر أن هناك من يسمع دبيب النملة السوداء على الصخرة الملساء في الليلة الظلماء».","[المشهد 2 - بصري: يد الشاب ترتفع في دعاء خافت تحت ضوء مصباح دافئ، والملامح تتحول تدريجياً إلى سكينة وراحة].","[الراوي]: «﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾... أنت لست وحدك؛ الله معك، يسمعك وينتظرك»."]'::jsonb, 'سيناريو فيديو',
  'faith', 'الإيمان والعقيدة', 'author-athar-team', 'فريق صناع الأثر',
  'الشباب', 2, FALSE, TRUE, 7300, '1 ربيع الثاني 1447',
  '["سيناريو","فيديو","الشباب","الوحدة","معية الله","الدعوة"]'::jsonb, '["دليل الإنتاج الرقمي الدعوي، فريق صناع الأثر"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["ملامسة المشاعر الإنسانية العميقة كالشعور بالاغتراب والوحدة.","تقديم الإيمان كحل نفسي وروحي فوري وملموس."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-24', 'برنامج إيماني: "عشر ذي الحجة... أيام الله العظمى"', 'barnamaj-ashr-dhi-al-hijjah', 'خطة عملية شاملة لاستثمار الأيام العشر الأول من ذي الحجة بالذكر والتكبير والصيام والصدقة.', '["ما من أيام العمل الصالح فيها أحب إلى الله من هذه الأيام العشر. إنها نفحة إلهية كبرى تفتح فيها أبواب الأجور المضاعفة لكل مسلم، حاجاً كان أو مقيماً في بلده.","يتضمن هذا البرنامج ثلاثة مسارات يومية متوازية: مسار الذكر؛ بإحياء سنة التكبير المطلق والمقيد، ومسار القرآن؛ بتخصيص ورد تدبر مضاعف، ومسار الإحسان؛ بتفقد الفقراء والأيتام والصلة.","وذروة هذه الأيام هي يوم عرفة العظيم؛ الذي يكفر صيامه سنة ماضية وسنة باقية، ويستحب فيه الإكثار من دعاء: «لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»."]'::jsonb, 'برنامج إيماني',
  'occasions', 'المناسبات', 'author-subaie', 'الشيخ صالح السبيعي',
  'عامة المسلمين', 8, FALSE, TRUE, 5120, '1 ذو الحجة 1446',
  '["عشر ذي الحجة","برنامج إيماني","التكبير","عرفة","المناسبات"]'::jsonb, '["فضائل عشر ذي الحجة، ابن رجب الحنبلي"]'::jsonb, '[]'::jsonb, '[{"text":"«ما من أيام العمل الصالح فيهن أحب إلى الله من هذه الأيام العشر...»","narrator":"صحيح البخاري، عن عبد الله بن عباس"}]'::jsonb, '["إحياء سنة التكبير في الأسواق والبيوت والمساجد.","المحافظة على صيام ما تيسر من العشر وخصوصاً يوم عرفة.","تنوع العبادات بين صلاة وذكر وصدقة وبر."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-25', 'درس علمي: "أصول الدعوة الفردية وبناء الأثر"', 'dars-usool-ad-dawah-al-fardiyah', 'قواعد منهجية للدعاة والمعلمين في استمالة القلوب بالحكمة وحسن المدخل واختيار اللحظة المناسبة.', '["الدعوة الفردية هي أعمق أشكال العمل الدعوي أثراً وأدومها استقراراً؛ لأنها تبني القناعات من خلال الحوار الثنائي المباشر المبني على الثقة والمحبة.","الخطوة الأولى في نجاح الداعية هي «بناء الجسر الإنساني» قبل إلقاء النصيحة؛ أن يلمس المدعو فيك الصدق والاهتمام بحاله، لا الرغبة في الانتصار عليه أو إثبات خطئه.","تجنب التسرع في حصاد النتائج؛ فالقلوب تتغير على مهل وبحاجة إلى غيث متتابع من الدعاء والرفق وحسن القدوة."]'::jsonb, 'درس',
  'dawah', 'الدعوة', 'author-mansoor', 'د. عبد الله المنصور',
  'الدعاة', 11, FALSE, TRUE, 2980, '15 شوال 1446',
  '["الدعوة","الدعوة الفردية","الرفق","الحكمة","التأثير"]'::jsonb, '["الدعوة الفردية وأثرها في بناء الرجال، د. عبد الله المنصور"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["كسب ثقة الشخص ومحبته قبل تقديم النصح له.","مراعاة الفروق الفردية وظروف كل إنسان وبيئته.","الصبر وعدم استعجال الهداية؛ فإن القلوب بين أصبعين من أصابع الرحمن."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-26', 'محاضرة: "الأسرة المسلمة في مواجهة الطوفان الرقمي"', 'muhadarah-al-usrah-fi-muwajahat-at-toofan', 'معالجة فكرية وتربوية موسعة لكيفية حماية البيت من تفكك العلاقات وإدمان الأجهزة الذكية.', '["لم تعد التحديات التربوية اليوم محصورة في الشارع أو المدرسة، بل اقتحمت الشاشات غرف نوم أطفالنا حاملة قيماً ومفاهيم تناقض فطرتهم ودينهم.","الحل ليس في المنع المطلق؛ فالمنع في عصر الانفتاح مستحيل ويولد العناد والتحايل، بل الحل في «بناء المناعة الذاتية»؛ بربط الطفل بربه وغرس مراقبة الله في سره وعلانيته.","كما ينبغي للأسرة أن توجد «البدائل الحية الممتعة»؛ كالأنشطة الرياضية، والرحلات المشتركة، وجلسات الحوار الدافئة التي تملأ الفراغ العاطفي."]'::jsonb, 'محاضرة',
  'family', 'الأسرة والتربية', 'author-dawsari', 'أ. خالد الدوسري',
  'الآباء والأمهات', 15, FALSE, TRUE, 3880, '8 رجب 1446',
  '["الأسرة","العالم الرقمي","التربية","الشاشات","المناعة الإيمانية"]'::jsonb, '["التربية في عصر الذكاء الاصطناعي، أ. خالد الدوسري"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["التحول من أسلوب المراقبة البوليسية إلى أسلوب بناء المراقبة الذاتية لله.","توفير بدائل حقيقية ممتعة تشغل طاقات الأبناء بعيداً عن الشاشات.","قدوة الوالدين في ترشيد استخدام هواتفهم الخاصة أمام الأبناء."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-27', 'كلمة قصيرة: "صدقة السر وخبيئة العمل"', 'kalimah-qaseerah-sadaqat-as-sirr', 'خواطر سريعة حول لذة الطاعة الخفية التي لا يعلم بها إلا الله، وأثرها في تفريج الكربات.', '["اجعل لنفسك عملاً صالحاً لا يعلم به أحد من خلق الله؛ لا زوجة، ولا والد، ولا صديق مقرب. خبيئة صالحة تدخرها ليوم الفقر والفاقة.","كان علي بن الحسين رضي الله عنهما يحمل جراب الخبز على ظهره بالليل فيتصدق به في ظلام المدينة، فلما مات وغسلوه وجدوا على ظهره سواداً من أثر الجراب، وفطن فقراء المدينة لمن كان يطعمهم.","هذه الخبايا هي التي تثبت القلوب عند الفتن، وتجعل العبد يقدم على ربه مستبشراً برحمته ومغفرته."]'::jsonb, 'كلمة قصيرة',
  'faith', 'الإيمان والعقيدة', 'author-otaibi', 'الشيخ فهد العتيبي',
  'عامة المسلمين', 4, FALSE, TRUE, 3670, '20 جمادى الآخرة 1446',
  '["صدقة السر","الخبيئة","الإخلاص","تزكية النفس"]'::jsonb, '["سير أعلام النبلاء، الإمام الذهبي","صفة الصفوة، ابن الجوزي"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["الحرص على عمل صالح خفي لا يطلع عليه أحد.","أثر الإخلاص وصدقة السر في إطفاء غضب الرب وتفريج الكرب."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-28', 'مادة أسرية: "فن الحوار بين الزوجين عند نشوب الخلاف"', 'fan-al-hiwar-bayna-az-zawjayn', 'دليل عملي لتجاوز النقاشات الحادة وحفظ المودة والرحمة في مواقف الاختلاف اليومية.', '["الخلاف في الحياة الزوجية أمر طبيعي يقع في أفضل البيوت؛ حتى في بيت النبوة الطاهر، ولكن الفارق بين البيت الناجح والبيت المتوتر هو «كيفية إدارة هذا الخلاف».","القاعدة الأولى: تجنب فتح الخلاف في أوقات الإرهاق أو الجوع أو أمام الأبناء؛ بل اختر وقتاً هادئاً تسوده السكينة.","القاعدة الثانية: التركيز على حل المشكلة الحاضرة، وتجنب نبش ملفات الماضي أو استخدام كلمات التعميم مثل «أنتِ دائماً...» أو «أنتَ أبداً...»."]'::jsonb, 'مادة أسرية',
  'family', 'الأسرة والتربية', 'author-tamimi', 'أ. سارة التميمي',
  'الآباء والأمهات', 7, FALSE, TRUE, 3150, '5 جمادى الأولى 1446',
  '["الأسرة","الزواج","الحوار","حل الخلافات","المودة"]'::jsonb, '["فقه الحياة الزوجية، د. عبد الله المنصور"]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["اختيار التوقيت المناسب لمناقشة التباين في وجهات النظر.","تجنب إقحام الأبناء في الخلافات الزوجية لحمايتهم النفسية.","استحضار الفضل والمودة المشتركة عند الغضب."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-29', 'درس علمي: "تدبر سورة الحجرات: دستور الأخلاق الاجتماعية"', 'dars-tadabbur-surat-al-hujurat', 'شرح تحليلي وتطبيقي للآداب والضوابط التي ترسيها سورة الحجرات لبناء مجتمع متماسك ومتحاب.', '["تسمى سورة الحجرات بسورة الأخلاق والآداب؛ حيث افتتحت ببيان الأدب مع الله ورسوله، ثم ثنت بالأدب مع النفس والمجتمع، وختمت ببيان معيار التفاضل الحقيقي عند الله وهو التقوى.","وضعت السورة قواعد حاسمة للأمن النفسي والاجتماعي: التثبت من الأنباء الفاسقة، والإصلاح بين المتخاصمين بالعدل، وتحريم السخرية والتنابز بالألقاب، وتجنب سوء الظن والتجسس والغيبة.","لو أن المجتمعات اليوم طبقت هذه التوجيهات القرآنية الربانية في تعاملاتها اليومية ورسائلها الرقمية، لعاش الناس في أمن نفسي ومودة غامرة."]'::jsonb, 'درس',
  'quran', 'القرآن', 'author-habib', 'د. طارق الحبيب',
  'طلاب العلم', 12, FALSE, TRUE, 3820, '18 ربيع الأول 1446',
  '["القرآن","سورة الحجرات","التدبر","الأخلاق","المجتمع"]'::jsonb, '["تيسير الكريم الرحمن في تفسير كلام المنان، ابن سعدي","في ظلال القرآن، سيد قطب"]'::jsonb, '[{"text":"يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ","surah":"سورة الحجرات: 13"}]'::jsonb, '[]'::jsonb, '["وجوب التثبت من الأخبار قبل نشرها لتفادي ظلم الأبرياء.","حرمة السخرية والتنابز بالألقاب لحفظ كرامة المؤمنين.","التقوى هي المقياس الأوحد للتفاضل في ميزان الإسلام."]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contents (
  id, title, slug, description, content, content_type,
  category_id, category_name, author_id, author_name,
  audience, reading_time, featured, published, views, date_text,
  tags, "references", ayah_quotes, hadith_quotes, key_takeaways
) VALUES (
  'c-30', 'خطبة جمعة: "فقه الأمل وبث التفاؤل في زمن التحديات"', 'khutbat-fiqh-al-amal-wa-at-tafaul', 'دعوة الخطيب لبث روح اليقين والأمل في نفوس المصلين، مقتدين بهدي النبي ﷺ في أحلك الأوقات.', '["الحمد لله الذي جعل مع العسر يسراً، وبشر الصابرين بنصره وفرجه، وأشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن نبينا محمداً عبده ورسوله، كان يحب الفأل الحسن ويكره التشاؤم واليأس.","أيها المسلمون: ليس من منهج المؤمن أن يستسلم لليأس أو يروج للإحباط حين تشتد الأزمات؛ فإن النبي ﷺ كان في أصعب اللحظات -يوم الأحزاب والصحابة محاصرون وتكاد قلوبهم تبلغ الحناجر- يضرب الصخرة ويبشرهم بفتح قصور كسرى وقيصر.","إن الأمل في وعد الله ونصر دينه عبادة قلبية تورث العمل والنهوض، أما اليأس فهو سلاح الشيطان لتعطيل الطاقات ونشر الخمول. فلنتفاءل، ولنبذر الخير في كل ميدان، فإن العاقبة للمتقين."]'::jsonb, 'خطبة جمعة',
  'faith', 'الإيمان والعقيدة', 'author-saadi', 'الشيخ إبراهيم السعدي',
  'الخطيب', 10, FALSE, TRUE, 4610, '1 ربيع الأول 1446',
  '["خطبة جمعة","الأمل","التفاؤل","اليقين","النصر"]'::jsonb, '["زاد المعاد في هدي خير العباد، ابن القيم","صحيح البخاري، باب الفأل"]'::jsonb, '[{"text":"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا","surah":"سورة الشرح: 5-6"}]'::jsonb, '[]'::jsonb, '["التفاؤل واليقين بنصر الله عبادة قلبية حث عليها الإسلام.","الابتعاد عن خطاب التثبيط وبث اليأس في صفوف المجتمع.","العمل الجاد هو ثمرة الأمل الصادق والتوكل على الله."]'::jsonb
) ON CONFLICT (id) DO NOTHING;


-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';
