import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Eye,
  FolderTree,
  Sparkles,
  Calendar,
  Loader2,
} from 'lucide-react';
import { fetchAdminAnalytics, fetchAllAdminCategories } from '../../services/adminService';
import { Category } from '../../types';

export const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    totalContent: number;
    publishedContent: number;
    draftContent: number;
    archivedContent: number;
    categoriesCount: number;
    usersCount: number;
    aiGenerationsCount: number;
    contentThisMonth: number;
    popularContent: { title: string; views: number; slug: string }[];
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [aData, cData] = await Promise.all([
          fetchAdminAnalytics(),
          fetchAllAdminCategories(),
        ]);
        setAnalytics(aData);
        setCategories(cData);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
        <span className="text-xs">جاري تجميع إحصائيات المنصة...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
          الإحصائيات والتحليلات الرقمية
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          بيانات حقيقية من قاعدة بيانات Supabase لقياس أداء المحتوى وتفاعل المستخدمين
        </p>
      </div>

      {/* Overview Metric Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">المواد المنشورة</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {analytics?.publishedContent || 0}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            من إجمالي {analytics?.totalContent || 0} مادة
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">المسودات المؤجلة</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {analytics?.draftContent || 0}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">قيد الإعداد والتدقيق</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">المستخدمون المسجلون</span>
          <div className="text-2xl font-extrabold text-[#94762e] dark:text-[#dfc27e]">
            {analytics?.usersCount || 1}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">حسابات نشطة في المنصة</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">المواد المولدة ذكياً</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {analytics?.aiGenerationsCount || 0}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">عبر مساعد الصياغة</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Read Leaderboard */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
              قائمة المواد الأكثر تفاعلاً وقراءة
            </h3>
          </div>

          <div className="space-y-3">
            {analytics?.popularContent && analytics.popularContent.length > 0 ? (
              analytics.popularContent.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#c8a962]/20 text-[#94762e] font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold truncate text-[#0b1b2b] dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-bold text-stone-600 dark:text-stone-300 shrink-0">
                    {item.views} قراءة
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-stone-400">
                لا توجد قراءات مسجلة بعد
              </div>
            )}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <FolderTree className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
            <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
              توزيع المواد حسب المجالات الدعوية
            </h3>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {categories.map((c) => {
              const count = c.contentCount || 0;
              const max = Math.max(...categories.map((x) => x.contentCount || 1), 10);
              const percent = Math.min(100, Math.round((count / max) * 100));

              return (
                <div key={c.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#0b1b2b] dark:text-stone-200">{c.name}</span>
                    <span className="text-stone-400">{count} مادة</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-[#c8a962] to-[#94762e]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
