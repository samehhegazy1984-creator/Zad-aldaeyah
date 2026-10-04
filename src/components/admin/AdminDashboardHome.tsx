import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle,
  FileEdit,
  FolderTree,
  Users,
  Sparkles,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PlusCircle,
  FolderPlus,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { AdminTab, AdminActivityLog } from '../../types';
import { fetchAdminAnalytics, fetchAdminLogs } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardHomeProps {
  onTabChange: (tab: AdminTab) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ onTabChange }) => {
  const { profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
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

  const [recentLogs, setRecentLogs] = useState<AdminActivityLog[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [analyticsData, logsData] = await Promise.all([
          fetchAdminAnalytics(),
          fetchAdminLogs(6),
        ]);
        setStats(analyticsData);
        setRecentLogs(logsData);
      } catch (e) {
        console.error('Error loading admin dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = [
    {
      title: 'إجمالي المحتوى',
      value: stats?.totalContent ?? 0,
      icon: FileText,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-900/40',
    },
    {
      title: 'المواد المنشورة',
      value: stats?.publishedContent ?? 0,
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-900/40',
    },
    {
      title: 'المسودات والمراجعة',
      value: stats?.draftContent ?? 0,
      icon: FileEdit,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-900/40',
    },
    {
      title: 'المجالات والتصنيفات',
      value: stats?.categoriesCount ?? 0,
      icon: FolderTree,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-900/40',
    },
    {
      title: 'المستخدمون المسجلون',
      value: stats?.usersCount ?? 0,
      icon: Users,
      color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-900/40',
    },
    {
      title: 'مواد الذكاء الاصطناعي',
      value: stats?.aiGenerationsCount ?? 0,
      icon: Sparkles,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-900/40',
    },
    {
      title: 'محتوى هذا الشهر',
      value: stats?.contentThisMonth ?? 0,
      icon: Calendar,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-900/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1b2b] via-[#11263c] to-[#1b3a5c] text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8a962]/20 border border-[#c8a962]/30 text-[#dfc27e] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>زاد الداعية &mdash; المرحلة 4: لوحة الإدارة المتكاملة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            أهلاً بك في لوحة تحكم زاد الداعية، {profile?.full_name || 'يا أخي الفاضل'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            المركز الإداري الشامل لإدارة المحتوى الدعوي، وتصنيف المواد، ومتابعة المستخدمين، والإشراف على التوليد الذكي وفق الضوابط الشرعية المعتمدة.
          </p>

          <div className="pt-3 flex flex-wrap gap-2.5">
            <button
              onClick={() => onTabChange('content-new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold text-xs transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة مادة دعوية جديدة</span>
            </button>
            <button
              onClick={() => onTabChange('categories')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>إدارة المجالات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Islamic Review Disclaimer Notice */}
      <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-4 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold">ميثاق الأمانة العلمية والشرعية للمحتوى:</p>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            تستوجب كافة المواد المولدة أو المنشورة مراجعة وتدقيقاً من محرر مؤهل قبل نشرها للعموم، خاصة ما يتصل بالآيات القرآنية، والأحاديث النبوية، وفتاوى العلماء لضمان سلامة النقل ودقة التوثيق.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-stone-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs">جاري تحميل بيانات وإحصائيات لوحة التحكم...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b1624] border ${card.border} shadow-xs flex flex-col justify-between transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0b1b2b] dark:text-white">
                    {card.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Logs & Popular Content 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b1624] rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
              <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
                أحدث العمليات الإدارية (Recent Activity)
              </h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => onTabChange('activity-logs')}
                className="text-xs font-bold text-[#94762e] dark:text-[#dfc27e] hover:underline"
              >
                عرض كل السجل
              </button>
            )}
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400">
              لا توجد عمليات مسجلة حديثاً
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0b1b2b] dark:text-white">
                        {log.user_name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300">
                      {log.details || log.entity_type}
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Read Content Leaderboard (1 Col) */}
        <div className="bg-white dark:bg-[#0b1624] rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
              المواد الأكثر قراءة
            </h3>
          </div>

          {stats?.popularContent && stats.popularContent.length > 0 ? (
            <div className="space-y-2.5">
              {stats.popularContent.map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold truncate text-[#0b1b2b] dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 shrink-0">
                    {item.views} قراءة
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-stone-400">
              لا توجد بيانات قراءة متوفرة حالياً
            </div>
          )}

          <button
            onClick={() => onTabChange('content')}
            className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/10 hover:bg-[#c8a962]/20 transition-colors"
          >
            الانتقال لإدارة كافة المواد
          </button>
        </div>
      </div>
    </div>
  );
};
