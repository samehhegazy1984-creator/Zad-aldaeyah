import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import {
  Content,
  Category,
  AdminActivityLog,
  PlatformSettings,
  UserRole,
} from '../types';
import { CONTENT_DATABASE } from '../data/content';
import { CATEGORIES_LIST } from '../data/categories';
import { SavedGeneration } from '../lib/ai/types';

const LOCAL_LOGS_KEY = 'zad_admin_activity_logs';
const LOCAL_SETTINGS_KEY = 'zad_platform_settings';

// ==========================================
// 1. ACTIVITY LOGGING SERVICE
// ==========================================

export async function logAdminActivity(
  log: Omit<AdminActivityLog, 'id' | 'created_at'>
): Promise<void> {
  const newLog: AdminActivityLog = {
    ...log,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('admin_activity_logs').insert({
        id: newLog.id,
        user_id: newLog.user_id,
        user_name: newLog.user_name,
        user_role: newLog.user_role,
        action: newLog.action,
        entity_type: newLog.entity_type,
        entity_id: newLog.entity_id,
        details: newLog.details,
        metadata: newLog.metadata || {},
        created_at: newLog.created_at,
      });
    } catch (e) {
      console.warn('Failed to insert admin log to Supabase', e);
    }
  }

  // Backup to localStorage
  try {
    const saved = localStorage.getItem(LOCAL_LOGS_KEY);
    const list: AdminActivityLog[] = saved ? JSON.parse(saved) : [];
    const updated = [newLog, ...list].slice(0, 100);
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export async function fetchAdminLogs(limit = 50): Promise<AdminActivityLog[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data as AdminActivityLog[];
      }
    } catch (e) {
      console.warn('Failed to fetch admin logs from Supabase', e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_LOGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  // Initial default logs if empty
  return [
    {
      id: 'init-1',
      user_name: 'مدير المنصة',
      user_role: 'admin',
      action: 'LOGIN',
      entity_type: 'user',
      details: 'تسجيل دخول ناجح إلى لوحة التحكم',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'init-2',
      user_name: 'مدير المنصة',
      user_role: 'admin',
      action: 'SETTINGS_UPDATE',
      entity_type: 'settings',
      details: 'تهيئة وتأكيد إعدادات زاد الداعية (المرحلة 4)',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

// ==========================================
// 2. CONTENT MANAGEMENT SERVICE
// ==========================================

export interface AdminContentFilter {
  status?: string;
  category?: string;
  contentType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchAllAdminContents(
  filters: AdminContentFilter = {}
): Promise<{ items: Content[]; total: number; page: number; totalPages: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('contents').select('*', { count: 'exact' });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category_name', filters.category);
      }
      if (filters.contentType && filters.contentType !== 'all') {
        query = query.eq('content_type', filters.contentType);
      }
      if (filters.search && filters.search.trim()) {
        const s = filters.search.trim();
        query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        const total = count || data.length;
        const items: Content[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description || '',
          content: Array.isArray(row.content) ? row.content : [],
          contentType: row.content_type,
          category: row.category_name || 'الإيمان والعقيدة',
          audience: row.audience || 'الجميع',
          author: {
            id: row.author_id || 'author-mansoor',
            name: row.author_name || 'د. عبد الله المنصور',
            title: '',
            bio: '',
          },
          readingTime: row.reading_time || 5,
          tags: Array.isArray(row.tags) ? row.tags : [],
          featured: Boolean(row.featured),
          date: row.date_text || '',
          views: row.views || 0,
          createdAt: row.created_at || new Date().toISOString(),
          status: row.status || (row.published ? 'published' : 'draft'),
          seoTitle: row.seo_title || '',
          seoDescription: row.seo_description || '',
          canonicalUrl: row.canonical_url || '',
          ogTitle: row.og_title || '',
          ogDescription: row.og_description || '',
          ogImage: row.og_image || '',
        }));

        return {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        };
      }
    } catch (e) {
      console.warn('Failed to fetch admin contents from Supabase', e);
    }
  }

  // Fallback to local catalog
  let all = [...CONTENT_DATABASE];
  if (filters.status && filters.status !== 'all') {
    all = all.filter((c) => (c.status || 'published') === filters.status);
  }
  if (filters.category && filters.category !== 'all') {
    all = all.filter((c) => c.category === filters.category);
  }
  if (filters.contentType && filters.contentType !== 'all') {
    all = all.filter((c) => c.contentType === filters.contentType);
  }
  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase();
    all = all.filter((c) => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
  }

  const total = all.length;
  const items = all.slice(offset, offset + limit);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function fetchAdminContentById(id: string): Promise<Content | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('contents').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          content: Array.isArray(data.content) ? data.content : [],
          contentType: data.content_type,
          category: data.category_name || 'الإيمان والعقيدة',
          audience: data.audience || 'الجميع',
          author: {
            id: data.author_id || 'author-mansoor',
            name: data.author_name || 'د. عبد الله المنصور',
            title: '',
            bio: '',
          },
          readingTime: data.reading_time || 5,
          tags: Array.isArray(data.tags) ? data.tags : [],
          featured: Boolean(data.featured),
          date: data.date_text || '',
          views: data.views || 0,
          createdAt: data.created_at || new Date().toISOString(),
          status: data.status || (data.published ? 'published' : 'draft'),
          seoTitle: data.seo_title || '',
          seoDescription: data.seo_description || '',
          canonicalUrl: data.canonical_url || '',
          ogTitle: data.og_title || '',
          ogDescription: data.og_description || '',
          ogImage: data.og_image || '',
        };
      }
    } catch (e) {}
  }

  const found = CONTENT_DATABASE.find((c) => c.id === id || c.slug === id);
  return found || null;
}

export async function createAdminContent(
  contentData: Partial<Content>,
  user: { id?: string; name: string; role: string }
): Promise<{ success: boolean; data?: Content; error?: string }> {
  const id = contentData.id || `c-${Date.now()}`;
  const now = new Date().toISOString();
  const status = contentData.status || 'published';
  const isPublished = status === 'published';

  const fullContent: Content = {
    id,
    title: contentData.title || 'مادة جديدة',
    slug: contentData.slug || `article-${Date.now()}`,
    description: contentData.description || '',
    content: contentData.content || [],
    contentType: contentData.contentType || 'مادة تربوية',
    category: contentData.category || 'الإيمان والعقيدة',
    audience: contentData.audience || 'الجميع',
    author: contentData.author || {
      id: 'author-mansoor',
      name: user.name || 'د. عبد الله المنصور',
      title: '',
      bio: '',
    },
    readingTime: contentData.readingTime || 5,
    tags: contentData.tags || [],
    featured: Boolean(contentData.featured),
    date: new Date().toLocaleDateString('ar-SA'),
    views: 0,
    createdAt: now,
    status,
    seoTitle: contentData.seoTitle,
    seoDescription: contentData.seoDescription,
    canonicalUrl: contentData.canonicalUrl,
    ogTitle: contentData.ogTitle,
    ogDescription: contentData.ogDescription,
    ogImage: contentData.ogImage,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('contents').insert({
        id: fullContent.id,
        title: fullContent.title,
        slug: fullContent.slug,
        description: fullContent.description,
        content: fullContent.content,
        content_type: fullContent.contentType,
        category_name: fullContent.category,
        author_id: fullContent.author.id,
        author_name: fullContent.author.name,
        audience: fullContent.audience,
        reading_time: fullContent.readingTime,
        tags: fullContent.tags,
        featured: fullContent.featured,
        published: isPublished,
        status: fullContent.status,
        date_text: fullContent.date,
        views: 0,
        seo_title: fullContent.seoTitle,
        seo_description: fullContent.seoDescription,
        canonical_url: fullContent.canonicalUrl,
        og_title: fullContent.ogTitle,
        og_description: fullContent.ogDescription,
        og_image: fullContent.ogImage,
        created_at: now,
        updated_at: now,
      });

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل الحفظ في قاعدة البيانات' };
    }
  }

  // Log activity
  await logAdminActivity({
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    action: isPublished ? 'PUBLISH' : 'CREATE',
    entity_type: 'content',
    entity_id: id,
    details: `تم إنشاء مادة جديدة: "${fullContent.title}" بحالة (${status})`,
  });

  return { success: true, data: fullContent };
}

export async function updateAdminContent(
  id: string,
  updates: Partial<Content>,
  user: { id?: string; name: string; role: string }
): Promise<{ success: boolean; data?: Content; error?: string }> {
  const now = new Date().toISOString();
  const isPublished = updates.status ? updates.status === 'published' : undefined;

  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: any = {
        updated_at: now,
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
      if (updates.category !== undefined) dbUpdates.category_name = updates.category;
      if (updates.audience !== undefined) dbUpdates.audience = updates.audience;
      if (updates.readingTime !== undefined) dbUpdates.reading_time = updates.readingTime;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        dbUpdates.published = isPublished;
      }
      if (updates.seoTitle !== undefined) dbUpdates.seo_title = updates.seoTitle;
      if (updates.seoDescription !== undefined) dbUpdates.seo_description = updates.seoDescription;
      if (updates.canonicalUrl !== undefined) dbUpdates.canonical_url = updates.canonicalUrl;
      if (updates.ogTitle !== undefined) dbUpdates.og_title = updates.ogTitle;
      if (updates.ogDescription !== undefined) dbUpdates.og_description = updates.ogDescription;
      if (updates.ogImage !== undefined) dbUpdates.og_image = updates.ogImage;

      const { error } = await supabase.from('contents').update(dbUpdates).eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل التحديث في قاعدة البيانات' };
    }
  }

  await logAdminActivity({
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    action: updates.status === 'published' ? 'PUBLISH' : updates.status === 'archived' ? 'ARCHIVE' : 'UPDATE',
    entity_type: 'content',
    entity_id: id,
    details: `تم تحديث المادة (${id}): "${updates.title || 'بدون تغيير العنوان'}"`,
  });

  return { success: true };
}

export async function deleteAdminContent(
  id: string,
  softDelete = true,
  user?: { id?: string; name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  if (softDelete) {
    // Soft delete: set status to archived and published to false
    return updateAdminContent(id, { status: 'archived' }, user || { name: 'المسؤول', role: 'admin' });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('contents').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل الحذف' };
    }
  }

  if (user) {
    await logAdminActivity({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action: 'DELETE',
      entity_type: 'content',
      entity_id: id,
      details: `تم حذف المادة ذات المعرّف (${id}) نهائياً`,
    });
  }

  return { success: true };
}

// ==========================================
// 3. CATEGORY MANAGEMENT SERVICE
// ==========================================

export async function fetchAllAdminCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('content_count', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description || '',
          icon: row.icon || 'BookOpen',
          contentCount: row.content_count || 0,
          status: row.status || 'active',
          sortOrder: row.sort_order || 0,
        }));
      }
    } catch (e) {}
  }

  return CATEGORIES_LIST.map((c, i) => ({ ...c, status: 'active', sortOrder: i }));
}

export async function createAdminCategory(
  category: Partial<Category>,
  user?: { id?: string; name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  const id = category.id || category.slug || `cat-${Date.now()}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('categories').insert({
        id,
        name: category.name,
        slug: category.slug || id,
        description: category.description || '',
        icon: category.icon || 'BookOpen',
        content_count: 0,
        status: category.status || 'active',
        sort_order: category.sortOrder || 0,
      });

      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل إضافة المجال' };
    }
  }

  if (user) {
    await logAdminActivity({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action: 'CREATE',
      entity_type: 'category',
      entity_id: id,
      details: `تم إنشاء مجال جديد: "${category.name}"`,
    });
  }

  return { success: true };
}

export async function updateAdminCategory(
  id: string,
  updates: Partial<Category>,
  user?: { id?: string; name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

      const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل تحديث المجال' };
    }
  }

  if (user) {
    await logAdminActivity({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action: 'UPDATE',
      entity_type: 'category',
      entity_id: id,
      details: `تم تحديث بيانات المجال (${id})`,
    });
  }

  return { success: true };
}

export async function deleteAdminCategory(
  id: string,
  user?: { id?: string; name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  // Safety check: ensure category is not referenced by existing content
  if (isSupabaseConfigured && supabase) {
    try {
      const { count } = await supabase
        .from('contents')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

      if (count && count > 0) {
        return {
          success: false,
          error: `لا يمكن حذف هذا المجال لوجود (${count}) مادة دعوية مرتبطة به. يرجى نقل المواد لمجال آخر أو تعطيل المجال بدلاً من حذفه.`,
        };
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل حذف المجال' };
    }
  }

  if (user) {
    await logAdminActivity({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action: 'DELETE',
      entity_type: 'category',
      entity_id: id,
      details: `تم حذف المجال (${id})`,
    });
  }

  return { success: true };
}

// ==========================================
// 4. PLATFORM SETTINGS SERVICE
// ==========================================

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'general')
        .single();

      if (!error && data) {
        return data as PlatformSettings;
      }
    } catch (e) {}
  }

  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return {
    id: 'general',
    site_name: 'زاد الداعية',
    tagline: 'من الفكرة إلى الكلمة النافعة',
    site_description:
      'منصة رقمية متخصصة وموسوعة دعوية وتربوية شاملة لإعداد وتطوير المحتوى الإسلامي والخطب والمواعظ',
    admin_email: 'admin@zad-aldaiah.org',
    allow_registration: true,
    enable_ai_generation: true,
    ai_daily_limit: 10,
    updated_at: new Date().toISOString(),
  };
}

export async function updatePlatformSettings(
  settings: Partial<PlatformSettings>,
  user?: { id?: string; name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  const current = await fetchPlatformSettings();
  const updated: PlatformSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('platform_settings').upsert({
        id: 'general',
        site_name: updated.site_name,
        tagline: updated.tagline,
        site_description: updated.site_description,
        admin_email: updated.admin_email,
        allow_registration: updated.allow_registration,
        enable_ai_generation: updated.enable_ai_generation,
        ai_daily_limit: updated.ai_daily_limit,
        settings: updated.settings || {},
        updated_at: updated.updated_at,
      });

      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message || 'فشل حفظ الإعدادات' };
    }
  }

  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));

  if (user) {
    await logAdminActivity({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action: 'SETTINGS_UPDATE',
      entity_type: 'settings',
      entity_id: 'general',
      details: 'تم تحديث الإعدادات العامة للمنصة',
    });
  }

  return { success: true };
}

// ==========================================
// 5. ANALYTICS SERVICE
// ==========================================

export async function fetchAdminAnalytics() {
  let totalContent = 0;
  let publishedContent = 0;
  let draftContent = 0;
  let archivedContent = 0;
  let categoriesCount = 0;
  let usersCount = 0;
  let aiGenerationsCount = 0;
  let contentThisMonth = 0;
  let popularContent: { title: string; views: number; slug: string }[] = [];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Total Content & Statuses
      const { data: contents } = await supabase.from('contents').select('id, title, views, status, published, created_at, slug');
      if (contents) {
        totalContent = contents.length;
        publishedContent = contents.filter((c) => c.status === 'published' || (c.published && !c.status)).length;
        draftContent = contents.filter((c) => c.status === 'draft').length;
        archivedContent = contents.filter((c) => c.status === 'archived').length;
        contentThisMonth = contents.filter((c) => new Date(c.created_at) >= startOfMonth).length;

        popularContent = contents
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map((c) => ({ title: c.title, views: c.views || 0, slug: c.slug }));
      }

      // 2. Categories Count
      const { count: catCount } = await supabase.from('categories').select('id', { count: 'exact', head: true });
      categoriesCount = catCount || CATEGORIES_LIST.length;

      // 3. Users Count
      const { count: uCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      usersCount = uCount || 1;

      // 4. AI Generations
      const { count: genCount } = await supabase.from('generations').select('id', { count: 'exact', head: true });
      aiGenerationsCount = genCount || 0;
    } catch (e) {
      console.warn('Analytics query error:', e);
    }
  } else {
    // Fallback based on real local data
    totalContent = CONTENT_DATABASE.length;
    publishedContent = CONTENT_DATABASE.length;
    categoriesCount = CATEGORIES_LIST.length;
    usersCount = 1;
    popularContent = CONTENT_DATABASE.slice(0, 5).map((c) => ({ title: c.title, views: c.views, slug: c.slug }));
  }

  return {
    totalContent,
    publishedContent,
    draftContent,
    archivedContent,
    categoriesCount,
    usersCount,
    aiGenerationsCount,
    contentThisMonth,
    popularContent,
  };
}

// ==========================================
// 6. AI ASSISTANT FOR EDITORS
// ==========================================

export async function requestAdminAIAssist(
  action: 'improve_wording' | 'suggest_title' | 'suggest_intro' | 'suggest_conclusion' | 'expand' | 'shorten',
  currentText: string,
  topic?: string
): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text: currentText, topic }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'تعذر التواصل مع المساعد الذكي' };
    }

    return { success: true, result: data.result };
  } catch (e: any) {
    return { success: false, error: e?.message || 'خطأ في الاتصال بالخادم' };
  }
}
