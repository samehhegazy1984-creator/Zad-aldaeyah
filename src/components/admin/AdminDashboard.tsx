import React, { useState, useEffect } from 'react';
import { ShieldX, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { AdminTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardHome } from './AdminDashboardHome';
import { AdminContentList } from './AdminContentList';
import { AdminContentEditor } from './AdminContentEditor';
import { AdminCategories } from './AdminCategories';
import { AdminUsers } from './AdminUsers';
import { AdminAIMaterials } from './AdminAIMaterials';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettings } from './AdminSettings';
import { AdminActivityLogs } from './AdminActivityLogs';

interface AdminDashboardProps {
  initialSubTab?: AdminTab;
  initialContentId?: string;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'dashboard',
  initialContentId,
  onNavigateHome,
  onNavigateLogin,
}) => {
  const { user, profile, loading, isAdmin, isEditor, canAccessAdmin, enablePreviewAdminRole } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialSubTab);
  const [editingContentId, setEditingContentId] = useState<string | undefined>(initialContentId);

  // Sync when initialSubTab changes
  useEffect(() => {
    if (initialSubTab) {
      setCurrentTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (initialContentId) {
      setEditingContentId(initialContentId);
    }
  }, [initialContentId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#070e17] flex flex-col items-center justify-center p-4 gap-3 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8a962]" />
        <span className="text-xs font-bold">جاري التحقق من صلاحيات الدخول...</span>
      </div>
    );
  }

  // 1. Unauthenticated User -> Prompt Login
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#070e17] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
            تسجيل الدخول مطلوب
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            للوصول إلى لوحة تحكم وإدارة "زاد الداعية"، يرجى تسجيل الدخول بحساب مسؤول أو محرر معتمد.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => enablePreviewAdminRole()}
              className="w-full py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>دخول فوري كمسؤول للتجربة في المعاينة (Demo Admin)</span>
            </button>
            <button
              onClick={onNavigateLogin}
              className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              تسجيل الدخول بحسابك
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Normal User -> Access Denied
  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#070e17] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldX className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
            غير مصرح بالدخول (Access Denied)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            عذراً، حسابك الحالي مسجل كـ ({profile?.role === 'user' ? 'مستخدم عادي' : profile?.role || 'مستخدم'}) ولا يملك صلاحيات الوصول إلى لوحة تحكم المنصة.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => enablePreviewAdminRole()}
              className="w-full py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>ترقية حسابك الحالي إلى مدير لتجربة اللوحة فوراً (Preview)</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              العودة للمنصة العامة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Editor or Admin -> Render Admin Layout
  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={(tab) => {
        setCurrentTab(tab);
        if (tab !== 'content-edit') setEditingContentId(undefined);
      }}
      onNavigateHome={onNavigateHome}
    >
      {currentTab === 'dashboard' && <AdminDashboardHome onTabChange={setCurrentTab} />}

      {currentTab === 'content' && (
        <AdminContentList
          onTabChange={setCurrentTab}
          onEditContent={(id) => {
            setEditingContentId(id);
            setCurrentTab('content-edit');
          }}
        />
      )}

      {currentTab === 'content-new' && (
        <AdminContentEditor
          onBack={() => setCurrentTab('content')}
          onSaveSuccess={() => setCurrentTab('content')}
        />
      )}

      {currentTab === 'content-edit' && (
        <AdminContentEditor
          contentId={editingContentId}
          onBack={() => setCurrentTab('content')}
          onSaveSuccess={() => setCurrentTab('content')}
        />
      )}

      {currentTab === 'categories' && <AdminCategories />}

      {currentTab === 'users' && <AdminUsers />}

      {currentTab === 'ai-materials' && <AdminAIMaterials />}

      {currentTab === 'analytics' && <AdminAnalytics />}

      {currentTab === 'settings' && <AdminSettings />}

      {currentTab === 'activity-logs' && <AdminActivityLogs />}
    </AdminLayout>
  );
};
