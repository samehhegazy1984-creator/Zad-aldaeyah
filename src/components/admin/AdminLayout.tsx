import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  Sparkles,
  BarChart3,
  Settings,
  ClipboardList,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  ShieldAlert,
  ChevronLeft,
  UserCheck,
} from 'lucide-react';
import { AdminTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateHome,
  children,
}) => {
  const { user, profile, isAdmin, isEditor, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const navItems: { tab: AdminTab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { tab: 'dashboard', label: 'لوحة المعلومات', icon: LayoutDashboard },
    { tab: 'content', label: 'إدارة المحتوى', icon: FileText },
    { tab: 'categories', label: 'المجالات والتصنيفات', icon: FolderTree },
    { tab: 'users', label: 'المستخدمون والأدوار', icon: Users, adminOnly: true },
    { tab: 'ai-materials', label: 'المواد المولدة بالذكاء', icon: Sparkles },
    { tab: 'analytics', label: 'الإحصائيات والتحليلات', icon: BarChart3 },
    { tab: 'settings', label: 'إعدادات المنصة', icon: Settings, adminOnly: true },
    { tab: 'activity-logs', label: 'سجل العمليات الإدارية', icon: ClipboardList, adminOnly: true },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const getPageTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'dashboard':
        return 'لوحة المعلومات والإحصاءات';
      case 'content':
        return 'إدارة المحتوى والمواد الدعوية';
      case 'content-new':
        return 'إضافة مادة دعوية جديدة';
      case 'content-edit':
        return 'تعديل المادة الدعوية';
      case 'categories':
        return 'إدارة المجالات والتصنيفات';
      case 'users':
        return 'إدارة المستخدمين والأدوار';
      case 'ai-materials':
        return 'المواد الدعوية المولدة بالذكاء الاصطناعي';
      case 'analytics':
        return 'تحليلات المنصة والتفاعل';
      case 'settings':
        return 'إعدادات المنصة العامة';
      case 'activity-logs':
        return 'سجل النشاط والعمليات الإدارية';
      default:
        return 'لوحة التحكم';
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 font-sans selection:bg-[#c8a962]/20" dir="rtl">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Right-aligned in RTL, Drawer on Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white dark:bg-[#0b1624] border-l border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-18 px-6 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c8a962] to-[#94762e] flex items-center justify-center text-white font-bold shadow-sm">
              ز
            </div>
            <div>
              <span className="font-bold text-base block text-[#0b1b2b] dark:text-white leading-tight">
                زاد الداعية
              </span>
              <span className="text-[11px] text-[#94762e] dark:text-[#dfc27e] font-semibold">
                لوحة التحكم الإدارية
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200/70 dark:border-stone-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e] flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate text-[#0b1b2b] dark:text-white">
              {profile?.full_name || 'مسؤول النظام'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                }`}
              >
                {isAdmin ? 'مدير نظام (Admin)' : 'محرر محتوى (Editor)'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive =
              currentTab === item.tab ||
              (item.tab === 'content' && (currentTab === 'content-new' || currentTab === 'content-edit'));

            return (
              <button
                key={item.tab}
                onClick={() => handleSelectTab(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#c8a962] text-white shadow-sm shadow-[#c8a962]/30'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>العودة للمنصة العامة</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72">
        {/* Top Sticky Header */}
        <header className="h-18 bg-white/90 dark:bg-[#0b1624]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#0b1b2b] dark:text-white">
                {getPageTitle(currentTab)}
              </h1>
              <div className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:block">
                لوحة الإدارة والمحتوى &larr; {getPageTitle(currentTab)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="تبديل المظهر"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Public Site Link */}
            <button
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors"
            >
              <span>الموقع العام</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </header>

        {/* Page Inner Canvas */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
