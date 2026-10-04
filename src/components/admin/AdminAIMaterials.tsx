import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Eye,
  Trash2,
  Calendar,
  Clock,
  User,
  Loader2,
  X,
  BookOpen,
} from 'lucide-react';
import { SavedGeneration } from '../../lib/ai/types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';
import { logAdminActivity } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const AdminAIMaterials: React.FC = () => {
  const { profile } = useAuth();
  const [generations, setGenerations] = useState<SavedGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<SavedGeneration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadGenerations = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setGenerations(data as SavedGeneration[]);
        }
      } catch (e) {
        console.warn('Failed to load generations:', e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGenerations();
  }, []);

  const handleDelete = async (id: string, topic: string) => {
    if (!confirm(`هل أنت متأكد من حذف المادة المولدة: "${topic}"؟`)) return;

    setDeletingId(id);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('generations').delete().eq('id', id);
        await logAdminActivity({
          user_id: profile?.id,
          user_name: profile?.full_name || 'المدير',
          user_role: profile?.role || 'admin',
          action: 'DELETE',
          entity_type: 'ai_material',
          entity_id: id,
          details: `تم حذف المادة المولدة بالذكاء الاصطناعي: "${topic}"`,
        });
        setGenerations((prev) => prev.filter((g) => g.id !== id));
      } catch (e) {
        console.error('Delete error:', e);
      }
    }
    setDeletingId(null);
  };

  const filtered = generations.filter((g) =>
    g.topic.toLowerCase().includes(search.toLowerCase()) ||
    g.content_type.toLowerCase().includes(search.toLowerCase()) ||
    (g.result?.title && g.result.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
          المواد الدعوية المولدة بالذكاء الاصطناعي ({generations.length})
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          مراقبة ومراجعة المواد التي تم توليدها وتخصيصها عبر مساعد زاد الذكي
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في موضوع المادة أو عنوانها..."
            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
          />
        </div>
      </div>

      {/* Grid of Materials */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
          <span className="text-xs">جاري تحميل المواد المولدة...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2 text-stone-400 text-xs">
          <Sparkles className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
          <span>لا توجد مواد مولدة مسجلة في قاعدة البيانات حالياً</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e]">
                    {item.content_type}
                  </span>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white line-clamp-1">
                  {item.result?.title || item.topic}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                  الموضوع: {item.topic}
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-stone-400 pt-1">
                  <span>المستهدف: {item.audience}</span>
                  <span>&bull;</span>
                  <span>الأسلوب: {item.style}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedMaterial(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة المادة كاملة</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.topic)}
                  disabled={deletingId === item.id}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="حذف"
                >
                  {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Material View Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-xl text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#0b1b2b] dark:text-white">
                  {selectedMaterial.result?.title || selectedMaterial.topic}
                </h3>
                <span className="text-xs text-stone-400">
                  {selectedMaterial.content_type} &bull; {selectedMaterial.audience}
                </span>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
              {selectedMaterial.result?.introduction && (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-100 dark:border-stone-800">
                  <h4 className="font-bold text-[#94762e] dark:text-[#dfc27e] mb-1">المقدمة:</h4>
                  <p>{selectedMaterial.result.introduction}</p>
                </div>
              )}

              {selectedMaterial.result?.sections && selectedMaterial.result.sections.map((sec, i) => (
                <div key={i} className="space-y-1.5">
                  <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
                    {sec.heading}
                  </h4>
                  <p className="whitespace-pre-wrap">{sec.content}</p>
                </div>
              ))}

              {selectedMaterial.result?.conclusion && (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-100 dark:border-stone-800">
                  <h4 className="font-bold text-[#94762e] dark:text-[#dfc27e] mb-1">الخاتمة:</h4>
                  <p>{selectedMaterial.result.conclusion}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
