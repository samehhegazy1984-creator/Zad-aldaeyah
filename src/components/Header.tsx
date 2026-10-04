import React, { useState } from 'react';
import { Search, Bookmark, Menu, X, User as UserIcon, Sparkles, Shield } from 'lucide-react';
import { ActivePage } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, sectionId?: string) => void;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenSearch,
  onOpenLogin,
  savedCount,
}) => {
  const { user, profile, canAccessAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: ActivePage, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(page, sectionId);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#faf8f5]/90 dark:bg-[#070e17]/90 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Brand & Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-right group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a962]"
            aria-label="زاد الداعية - الصفحة الرئيسية"
          >
            {/* Islamic geometric inspired icon mark */}
            <div className="relative w-10 h-10 rounded-xl bg-[#0b1b2b] dark:bg-[#122438] border border-[#c8a962]/40 flex items-center justify-center text-[#c8a962] shadow-sm transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" transform="rotate(45 12 12)" stroke="currentColor" fill="rgba(200, 169, 98, 0.15)" />
                <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-xl lg:text-2xl text-[#0b1b2b] dark:text-[#f5f1ea] font-['Cairo'] tracking-tight">
                  زاد
                </span>
                <span className="text-sm font-semibold text-[#a98840] dark:text-[#dfc27e] font-['Cairo']">
                  الداعية
                </span>
              </div>
              <span className="hidden sm:inline-block text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                من الفكرة إلى الكلمة النافعة
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium mr-4">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] cursor-pointer ${
                activePage === 'home'
                  ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold border-b-2 border-[#c8a962] pb-0.5'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => handleNavClick('library')}
              className={`transition-colors hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] cursor-pointer ${
                activePage === 'library'
                  ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold border-b-2 border-[#c8a962] pb-0.5'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              المكتبة
            </button>
            <button
              onClick={() => handleNavClick('assistant')}
              className={`transition-colors hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] cursor-pointer flex items-center gap-1 ${
                activePage === 'assistant'
                  ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold border-b-2 border-[#c8a962] pb-0.5'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
              <span>المساعد الذكي</span>
            </button>
            <button
              onClick={() => handleNavClick('home', 'categories-section')}
              className="text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] transition-colors cursor-pointer"
            >
              المجالات
            </button>
            <button
              onClick={() => handleNavClick('home', 'how-it-works-section')}
              className="text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] transition-colors cursor-pointer"
            >
              كيف تعمل المنصة؟
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`transition-colors hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] cursor-pointer ${
                activePage === 'about'
                  ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold border-b-2 border-[#c8a962] pb-0.5'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              من نحن
            </button>
          </nav>
        </div>

        {/* Zone 3: Actions (Search, Bookmark, Theme Switcher, Login/Account, Menu) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-white bg-stone-200/50 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a962]"
            aria-label="فتح البحث في المحتوى"
          >
            <Search className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span className="hidden sm:inline">بحث</span>
          </button>

          {/* Favorites Button */}
          <button
            onClick={() => handleNavClick('favorites')}
            className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
              activePage === 'favorites'
                ? 'bg-[#c8a962]/20 text-[#0b1b2b] dark:text-[#dfc27e]'
                : 'text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] hover:bg-stone-200/50 dark:hover:bg-stone-800'
            }`}
            title="المواد المحفوظة"
            aria-label="المواد المحفوظة"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#c8a962] text-[#0b1b2b] font-bold text-[10px] rounded-full flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          {/* Theme Switcher Dropdown */}
          <ThemeSwitcher align="left" />

          {/* Admin Dashboard Link */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePage === 'admin'
                ? 'bg-[#c8a962] text-white shadow-xs'
                : 'bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] hover:bg-[#c8a962]/25 border border-[#c8a962]/30'
            }`}
            title="لوحة التحكم الإدارية"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>لوحة التحكم</span>
          </button>

          {/* Login or Account Button */}
          {user ? (
            <button
              onClick={() => handleNavClick('account')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${
                activePage === 'account'
                  ? 'border-[#c8a962] bg-[#c8a962]/15 text-[#0b1b2b] dark:text-[#dfc27e]'
                  : 'border-stone-200 dark:border-stone-700 hover:border-[#c8a962] bg-white dark:bg-[#0c1825] text-stone-800 dark:text-stone-200'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-[#0b1b2b] dark:bg-[#122438] text-[#c8a962] flex items-center justify-center text-xs font-bold font-['Cairo']">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'ز'}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">
                {profile?.full_name || 'حسابي'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0b1b2b] hover:bg-[#152e4a] dark:bg-[#1a3350] dark:hover:bg-[#234266] border border-[#c8a962]/40 rounded-xl transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              دخول
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
            aria-label="فتح القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-[#faf8f5] dark:bg-[#070e17] px-4 pt-3 pb-6 space-y-1">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            الرئيسية
          </button>
          <button
            onClick={() => handleNavClick('library')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            المكتبة المعرفية
          </button>
          <button
            onClick={() => handleNavClick('assistant')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-[#94762e] dark:text-[#dfc27e] font-bold hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors flex items-center justify-between"
          >
            <span>المساعد الذكي</span>
            <Sparkles className="w-4 h-4" />
          </button>
          {user && (
            <button
              onClick={() => handleNavClick('my-materials')}
              className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              موادي المولّدة
            </button>
          )}
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-bold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/10 hover:bg-[#c8a962]/20 transition-colors flex items-center justify-between"
          >
            <span>لوحة التحكم الإدارية</span>
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavClick('home', 'categories-section')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            المجالات الموضوعية
          </button>
          <button
            onClick={() => handleNavClick('home', 'how-it-works-section')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            كيف تعمل المنصة؟
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            عن زاد الداعية
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick('account')}
              className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors border-t border-stone-200 dark:border-stone-800 mt-2 pt-3"
            >
              حسابي ({profile?.full_name || user.email})
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="w-full text-right py-2.5 px-3 rounded-xl text-sm font-bold text-[#94762e] dark:text-[#dfc27e] hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors border-t border-stone-200 dark:border-stone-800 mt-2 pt-3"
            >
              تسجيل الدخول / إنشاء حساب
            </button>
          )}
        </div>
      )}
    </header>
  );
};
