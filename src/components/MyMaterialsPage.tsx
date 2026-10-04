import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  Trash2,
  Copy,
  ArrowLeft,
  Search,
  Star,
  Plus,
  Bookmark,
} from 'lucide-react';
import { SavedGeneration, GeneratedContentResult } from '../lib/ai/types';
import {
  fetchUserGenerations,
  deleteUserGeneration,
  toggleGenerationFavorite,
  saveGeneratedMaterial,
} from '../services/dataService';
import { useAuth } from '../context/AuthContext';

interface MyMaterialsPageProps {
  onOpenMaterial: (material: GeneratedContentResult) => void;
  onStartNewCreation: () => void;
  onOpenLogin: () => void;
}

export const MyMaterialsPage: React.FC<MyMaterialsPageProps> = ({
  onOpenMaterial,
  onStartNewCreation,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<SavedGeneration[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'latest'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGenerations = async () => {
    setLoading(true);
    const list = await fetchUserGenerations(user?.id);
    setGenerations(list);
    setLoading(false);
  };

  useEffect(() => {
    loadGenerations();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه المادة من موادي؟')) {
      await deleteUserGeneration(id, user?.id);
      setGenerations((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleToggleFav = async (gen: SavedGeneration, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = await toggleGenerationFavorite(gen.id, !!gen.is_favorite, user?.id);
    setGenerations((prev) =>
      prev.map((g) => (g.id === gen.id ? { ...g, is_favorite: newStatus } : g))
    );
  };

  const handleDuplicate = async (gen: SavedGeneration, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicatedResult: GeneratedContentResult = {
      ...gen.result,
      id: `gen-${Date.now()}`,
      title: `${gen.result.title} (نسخة)`,
      createdAt: new Date().toISOString(),
    };

    const newRecord = await saveGeneratedMaterial(
      {
        contentType: gen.content_type,
        topic: duplicatedResult.title,
        audience: gen.audience,
        length: gen.length,
        style: gen.style,
        evidenceLevel: gen.evidence_level,
        instructions: gen.instructions,
        result: duplicatedResult,
      },
      user?.id
    );

    setGenerations((prev) => [newRecord, ...prev]);
  };

  const filteredGenerations = generations.filter((g) => {
    if (activeTab === 'favorites' && !g.is_favorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = g.result.title.toLowerCase().includes(q);
      const matchTopic = g.topic.toLowerCase().includes(q);
      const matchType = g.content_type.toLowerCase().includes(q);
      if (!matchTitle && !matchTopic && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] mb-1 font-['Cairo']">
              <Sparkles className="w-4 h-4" />
              <span>أرشيفك الشخصي المولّد بالذكاء الاصطناعي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
              موادي
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              جميع المواد والخطب والدروس التي أنشأتها عبر مساعد زاد الداعية.
            </p>
          </div>

          <button
            onClick={onStartNewCreation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-transform cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>صناعة مادة جديدة</span>
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#0c1825] p-1 rounded-2xl border border-stone-200 dark:border-stone-800 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#122438] text-[#0b1b2b] dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              الكل ({generations.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-[#122438] text-[#0b1b2b] dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              المفضلة ({generations.filter((g) => g.is_favorite).length})
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'latest'
                  ? 'bg-white dark:bg-[#122438] text-[#0b1b2b] dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              الأحدث
            </button>
          </div>

          {/* Search box */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في موادك..."
              className="w-full py-2 px-3 pr-9 rounded-xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#c8a962]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="py-20 text-center text-stone-500 text-sm">جارٍ تحميل موادك...</div>
        ) : filteredGenerations.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <Sparkles className="w-14 h-14 mx-auto text-stone-300 dark:text-stone-700" />
            <h3 className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
              {searchQuery ? 'لم نجد مواد تطابق بحثك' : 'لم تنشئ أي مادة بعد'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              استخدم مساعد زاد الداعية لتحويل أفكارك إلى خطب ودروس ومواد تربوية محررة وموثقة.
            </p>
            <div className="pt-2">
              <button
                onClick={onStartNewCreation}
                className="px-6 py-2.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs sm:text-sm shadow-md cursor-pointer"
              >
                ابدأ صناعة مادتك الأولى الآن
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGenerations.map((gen) => (
              <div
                key={gen.id}
                onClick={() => onOpenMaterial(gen.result)}
                className="group p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 hover:border-[#c8a962]/70 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/10 px-2.5 py-1 rounded-full border border-[#c8a962]/20 font-['Cairo']">
                      {gen.content_type}
                    </span>

                    <button
                      onClick={(e) => handleToggleFav(gen, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        gen.is_favorite
                          ? 'text-amber-500'
                          : 'text-stone-300 dark:text-stone-600 hover:text-amber-500'
                      }`}
                      title={gen.is_favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      <Star className={`w-4 h-4 ${gen.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white group-hover:text-[#94762e] dark:group-hover:text-[#dfc27e] transition-colors leading-snug line-clamp-2">
                    {gen.result.title}
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {gen.result.introduction || gen.topic}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{gen.length}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicate(gen, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      title="نسخ مادة مطابقة"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(gen.id, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="حذف المادة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
