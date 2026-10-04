import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Bookmark,
  History,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Check,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';
import { ActivePage } from '../types';

interface AccountPageProps {
  onNavigate: (page: ActivePage) => void;
  savedCount: number;
  historyCount: number;
  generationsCount: number;
  onOpenMyMaterials: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigate,
  savedCount,
  historyCount,
  generationsCount,
  onOpenMyMaterials,
}) => {
  const { user, profile, signOut, updateProfile, canAccessAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    await updateProfile({ full_name: nameInput.trim() });
    setIsEditingName(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen py-10 lg:py-16 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-[#0b1b2b] text-[#c8a962] dark:bg-[#122438] border-2 border-[#c8a962]/40 flex items-center justify-center text-3xl font-bold font-['Cairo'] shadow-md">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'ز'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                  {profile?.full_name || 'مستخدم زاد'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] border border-[#c8a962]/30">
                  {profile?.role === 'admin' ? 'مشرف المنصة' : 'داعية'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center sm:justify-start gap-1.5" dir="ltr">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'guest@zadaldaia.com'}</span>
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-stone-600 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Admin Dashboard Entry Card if permitted */}
        {canAccessAdmin && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#c8a962]/15 via-[#c8a962]/5 to-transparent border border-[#c8a962]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-right shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c8a962] to-[#94762e] text-white flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
                  لوحة التحكم الإدارية (Admin Dashboard)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  أنت مسجل بصلاحية ({profile?.role === 'admin' ? 'مدير نظام كامل' : 'محرر محتوى'}). يمكنك إدارة المواد والمجالات.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="px-5 py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              دخول لوحة التحكم
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={onOpenMyMaterials}
            className="p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 hover:border-[#c8a962]/60 text-right cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-xl bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                {generationsCount}
              </span>
            </div>
            <span className="font-bold text-sm block font-['Cairo'] text-stone-800 dark:text-stone-200 group-hover:text-[#94762e] dark:group-hover:text-[#dfc27e]">
              موادي المولّدة
            </span>
            <span className="text-[11px] text-stone-400">إدارة الخطب والدروس الخاصة بي</span>
          </button>

          <button
            onClick={() => onNavigate('favorites')}
            className="p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 hover:border-[#c8a962]/60 text-right cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </span>
              <span className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                {savedCount}
              </span>
            </div>
            <span className="font-bold text-sm block font-['Cairo'] text-stone-800 dark:text-stone-200 group-hover:text-[#94762e] dark:group-hover:text-[#dfc27e]">
              المواد المحفوظة
            </span>
            <span className="text-[11px] text-stone-400">المواد التي حفظتها في مفضلتي</span>
          </button>

          <button
            onClick={() => onNavigate('library')}
            className="p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 hover:border-[#c8a962]/60 text-right cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </span>
              <span className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                {historyCount}
              </span>
            </div>
            <span className="font-bold text-sm block font-['Cairo'] text-stone-800 dark:text-stone-200 group-hover:text-[#94762e] dark:group-hover:text-[#dfc27e]">
              سجل القراءة
            </span>
            <span className="text-[11px] text-stone-400">آخر المواد التي طالعتها</span>
          </button>
        </div>

        {/* Account Details & Profile Edit */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 text-right">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                إعدادات الملف الشخصي
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                تعديل اسم العرض والبيانات المسجلة.
              </p>
            </div>

            {saveSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>تم الحفظ</span>
              </span>
            )}
          </div>

          {isEditingName ? (
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a962]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs shadow-sm cursor-pointer"
                >
                  حفظ التعديل
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-[#08121d] border border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-xs text-stone-400 block mb-0.5">اسم العرض:</span>
                <span className="font-bold text-sm text-[#0b1b2b] dark:text-stone-100">
                  {profile?.full_name || 'مستخدم زاد'}
                </span>
              </div>

              <button
                onClick={() => {
                  setNameInput(profile?.full_name || '');
                  setIsEditingName(true);
                }}
                className="flex items-center gap-1 text-xs text-[#94762e] dark:text-[#dfc27e] font-semibold hover:underline cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل الاسم</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Settings Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 text-right">
          <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
              المظهر وتفضيلات القراءة
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              اختر الوضع اللوني الأنسب لراحتك البصرية أثناء مطالعة المواد.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-[#08121d] border border-stone-100 dark:border-stone-800">
            <div>
              <span className="font-bold text-sm text-stone-800 dark:text-stone-200 block mb-1">
                النمط اللوني المفضل:
              </span>
              <span className="text-xs text-stone-500">
                {theme === 'light' ? 'الوضع الفاتح' : theme === 'dark' ? 'الوضع الليلي' : 'حسب إعداد الجهاز'}
              </span>
            </div>

            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};
