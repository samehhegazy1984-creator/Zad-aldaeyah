import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import {
  AIGenerationParams,
  AIEditActionParams,
  GeneratedContentResult,
  SavedGeneration,
} from '../lib/ai/types';
import { Content, Category, Author } from '../types';
import { CONTENT_DATABASE } from '../data/content';
import { CATEGORIES_LIST } from '../data/categories';
import { AUTHORS_DATA } from '../data/authors';

export const FREE_DAILY_GENERATIONS = 10;
const LOCAL_GENERATIONS_KEY = 'zad_saved_generations';
const LOCAL_USAGE_KEY = 'zad_daily_usage';

// ==========================================
// 1. FAVORITES SERVICE
// ==========================================

export async function fetchUserFavoriteIds(userId?: string): Promise<Set<string>> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', userId);

      if (!error && data) {
        return new Set(data.map((row) => row.content_id));
      }
    } catch (e) {
      console.warn('Failed to fetch favorites from Supabase', e);
    }
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('zad_bookmarks');
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch (e) {}
  return new Set();
}

export async function toggleFavoriteInDb(
  contentId: string,
  isCurrentlyFavorited: boolean,
  userId?: string
): Promise<{ success: boolean; newStatus: boolean }> {
  const newStatus = !isCurrentlyFavorited;

  if (isSupabaseConfigured && supabase && userId) {
    try {
      if (newStatus) {
        await supabase.from('favorites').insert({ user_id: userId, content_id: contentId });
      } else {
        await supabase.from('favorites').delete().match({ user_id: userId, content_id: contentId });
      }
    } catch (e) {
      console.warn('Failed to update favorite in Supabase', e);
    }
  }

  // Update local storage backup
  try {
    const saved = localStorage.getItem('zad_bookmarks');
    const set = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    if (newStatus) set.add(contentId);
    else set.delete(contentId);
    localStorage.setItem('zad_bookmarks', JSON.stringify(Array.from(set)));
  } catch (e) {}

  return { success: true, newStatus };
}

// ==========================================
// 2. READING HISTORY SERVICE
// ==========================================

export async function recordReadingHistoryInDb(
  contentId: string,
  userId?: string
): Promise<void> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('reading_history').upsert(
        {
          user_id: userId,
          content_id: contentId,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,content_id' }
      );
    } catch (e) {
      console.warn('Failed to record history in Supabase', e);
    }
  }

  // Update localStorage backup
  try {
    const saved = localStorage.getItem('zad_reading_history');
    const list: string[] = saved ? JSON.parse(saved) : [];
    const updated = [contentId, ...list.filter((id) => id !== contentId)].slice(0, 10);
    localStorage.setItem('zad_reading_history', JSON.stringify(updated));
  } catch (e) {}
}

export async function fetchReadingHistoryIds(userId?: string): Promise<string[]> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('reading_history')
        .select('content_id')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        return data.map((row) => row.content_id);
      }
    } catch (e) {
      console.warn('Failed to fetch history from Supabase', e);
    }
  }

  try {
    const saved = localStorage.getItem('zad_reading_history');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

export async function clearReadingHistoryInDb(userId?: string): Promise<void> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('reading_history').delete().eq('user_id', userId);
    } catch (e) {}
  }
  localStorage.setItem('zad_reading_history', JSON.stringify([]));
}

// ==========================================
// 3. USER SETTINGS SERVICE
// ==========================================

export async function syncUserSettings(
  settings: { theme?: string; font_size?: string },
  userId?: string
): Promise<void> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('user_settings').upsert(
        {
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (e) {}
  }
}

// ==========================================
// 4. USAGE TRACKING & LIMITS
// ==========================================

export interface DailyUsageInfo {
  used: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
}

export function getDailyUsage(userId?: string): DailyUsageInfo {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${LOCAL_USAGE_KEY}_${userId || 'guest'}_${today}`;
    const used = parseInt(localStorage.getItem(key) || '0', 10);
    const limit = FREE_DAILY_GENERATIONS;
    const remaining = Math.max(0, limit - used);
    return {
      used,
      limit,
      remaining,
      isLimitReached: used >= limit,
    };
  } catch (e) {
    return { used: 0, limit: FREE_DAILY_GENERATIONS, remaining: FREE_DAILY_GENERATIONS, isLimitReached: false };
  }
}

export function incrementDailyUsage(userId?: string): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${LOCAL_USAGE_KEY}_${userId || 'guest'}_${today}`;
    const used = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (used + 1).toString());
  } catch (e) {}
}

// ==========================================
// 5. AI GENERATION API CALLS (SECURE SERVER-SIDE)
// ==========================================

export async function generateIslamicContentAPI(
  params: AIGenerationParams,
  userId?: string
): Promise<{ success: boolean; data?: GeneratedContentResult; error?: string }> {
  // Check usage limit
  const usage = getDailyUsage(userId);
  if (usage.isLimitReached) {
    return {
      success: false,
      error: `لقد وصلت إلى الحد اليومي (${usage.limit} محاولات). يمكنك المحاولة مجددًا غدًا أو ترقية حسابك.`,
    };
  }

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...params, userId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || 'حدث خطأ أثناء إعداد المادة عبر الذكاء الاصطناعي',
      };
    }

    incrementDailyUsage(userId);
    return { success: true, data: data.data };
  } catch (err: any) {
    console.error('AI Generation Request failed:', err);
    return {
      success: false,
      error: 'تعذر الاتصال بخادم الذكاء الاصطناعي. تأكد من اتصال الإنترنت أو إعدادات المفتاح.',
    };
  }
}

export async function editIslamicContentAPI(
  params: AIEditActionParams,
  userId?: string
): Promise<{ success: boolean; data?: GeneratedContentResult; error?: string }> {
  try {
    const res = await fetch('/api/ai/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...params, userId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || 'حدث خطأ أثناء تعديل المادة',
      };
    }

    return { success: true, data: data.data };
  } catch (err: any) {
    return {
      success: false,
      error: 'تعذر إجراء التعديل على المادة. يرجى المحاولة مرة أخرى.',
    };
  }
}

// ==========================================
// 6. SAVED GENERATIONS ("موادي")
// ==========================================

export async function fetchUserGenerations(userId?: string): Promise<SavedGeneration[]> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as SavedGeneration[];
      }
    } catch (e) {
      console.warn('Failed to fetch generations from Supabase', e);
    }
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(LOCAL_GENERATIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

export async function saveGeneratedMaterial(
  gen: {
    contentType: string;
    topic: string;
    audience: string;
    length: string;
    style: string;
    evidenceLevel: string;
    instructions?: string;
    result: GeneratedContentResult;
  },
  userId?: string
): Promise<SavedGeneration> {
  const id = gen.result.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `gen-${Date.now()}`);
  const now = new Date().toISOString();

  const record: SavedGeneration = {
    id,
    user_id: userId,
    content_type: gen.contentType,
    topic: gen.topic,
    audience: gen.audience,
    length: gen.length,
    style: gen.style,
    evidence_level: gen.evidenceLevel,
    instructions: gen.instructions,
    result: { ...gen.result, id },
    is_favorite: false,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('generations').insert({
        id: record.id,
        user_id: userId,
        content_type: record.content_type,
        topic: record.topic,
        audience: record.audience,
        length: record.length,
        style: record.style,
        evidence_level: record.evidence_level,
        instructions: record.instructions,
        result: record.result,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {
      console.warn('Failed to insert generation in Supabase', e);
    }
  }

  // Backup to localStorage
  try {
    const current = await fetchUserGenerations();
    const updated = [record, ...current.filter((g) => g.id !== record.id)];
    localStorage.setItem(LOCAL_GENERATIONS_KEY, JSON.stringify(updated));
  } catch (e) {}

  return record;
}

export async function deleteUserGeneration(id: string, userId?: string): Promise<void> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('generations').delete().match({ id, user_id: userId });
    } catch (e) {}
  }

  try {
    const saved = localStorage.getItem(LOCAL_GENERATIONS_KEY);
    if (saved) {
      const list: SavedGeneration[] = JSON.parse(saved);
      const filtered = list.filter((g) => g.id !== id);
      localStorage.setItem(LOCAL_GENERATIONS_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}
}

export async function toggleGenerationFavorite(id: string, currentFav: boolean, userId?: string): Promise<boolean> {
  const newFav = !currentFav;
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('generations').update({ is_favorite: newFav }).eq('id', id);
    } catch (e) {}
  }

  try {
    const saved = localStorage.getItem(LOCAL_GENERATIONS_KEY);
    if (saved) {
      const list: SavedGeneration[] = JSON.parse(saved);
      const updated = list.map((g) => (g.id === id ? { ...g, is_favorite: newFav } : g));
      localStorage.setItem(LOCAL_GENERATIONS_KEY, JSON.stringify(updated));
    }
  } catch (e) {}

  return newFav;
}

// ==========================================
// 7. PUBLIC DATABASE CONTENT, CATEGORIES & AUTHORS
// ==========================================

export async function fetchContentsFromDb(): Promise<Content[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database records into typed Content objects
        return data.map((row: any) => ({
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
          references: Array.isArray(row.references) ? row.references : [],
          ayahQuotes: Array.isArray(row.ayah_quotes) ? row.ayah_quotes : [],
          hadithQuotes: Array.isArray(row.hadith_quotes) ? row.hadith_quotes : [],
          keyTakeaways: Array.isArray(row.key_takeaways) ? row.key_takeaways : [],
        }));
      }
      if (error) {
        console.warn('Supabase fetchContents error (falling back to local catalog):', error.message);
      }
    } catch (e) {
      console.warn('Failed to fetch contents from Supabase:', e);
    }
  }

  // Fallback to built-in authentic 30 materials
  return CONTENT_DATABASE;
}

export async function fetchCategoriesFromDb(): Promise<Category[]> {
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
        }));
      }
      if (error) {
        console.warn('Supabase fetchCategories error (falling back to local list):', error.message);
      }
    } catch (e) {
      console.warn('Failed to fetch categories from Supabase:', e);
    }
  }

  return CATEGORIES_LIST;
}

export async function fetchAuthorsFromDb(): Promise<Author[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('authors').select('*');

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          title: row.title || '',
          bio: row.bio || '',
          avatar: row.avatar || undefined,
        }));
      }
      if (error) {
        console.warn('Supabase fetchAuthors error (falling back to local list):', error.message);
      }
    } catch (e) {
      console.warn('Failed to fetch authors from Supabase:', e);
    }
  }

  return AUTHORS_DATA;
}
