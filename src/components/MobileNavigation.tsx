import React from 'react';
import { Home, BookOpen, Sparkles, Bookmark, User } from 'lucide-react';
import { ActivePage } from '../types';
import { useAuth } from '../context/AuthContext';

interface MobileNavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, sectionId?: string) => void;
  onOpenLogin: () => void;
  savedCount: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activePage,
  onNavigate,
  onOpenLogin,
  savedCount,
}) => {
  const { user } = useAuth();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070e17]/95 backdrop-blur-md border-t border-stone-200/90 dark:border-stone-800/90 shadow-lg safe-area-pb transition-colors duration-200 no-print">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
        {/* الرئيسية */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer py-1 relative ${
            activePage === 'home'
              ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          {activePage === 'home' && (
            <span className="absolute top-1.5 w-6 h-0.5 rounded-full bg-[#c8a962]" />
          )}
          <Home className="w-5 h-5" />
          <span className="text-[11px] leading-tight font-['Cairo']">الرئيسية</span>
        </button>

        {/* المكتبة */}
        <button
          onClick={() => onNavigate('library')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer py-1 relative ${
            activePage === 'library'
              ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          {activePage === 'library' && (
            <span className="absolute top-1.5 w-6 h-0.5 rounded-full bg-[#c8a962]" />
          )}
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] leading-tight font-['Cairo']">المكتبة</span>
        </button>

        {/* المساعد */}
        <button
          onClick={() => onNavigate('assistant')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer py-1 relative ${
            activePage === 'assistant'
              ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-[#0b1b2b] dark:hover:text-[#dfc27e]'
          }`}
        >
          {activePage === 'assistant' && (
            <span className="absolute top-1.5 w-6 h-0.5 rounded-full bg-[#c8a962]" />
          )}
          <div className="p-1 rounded-full bg-[#c8a962]/15 text-[#a98840] dark:text-[#dfc27e]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] leading-tight font-['Cairo']">المساعد</span>
        </button>

        {/* المفضلة */}
        <button
          onClick={() => onNavigate('favorites')}
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer py-1 ${
            activePage === 'favorites'
              ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          {activePage === 'favorites' && (
            <span className="absolute top-1.5 w-6 h-0.5 rounded-full bg-[#c8a962]" />
          )}
          <Bookmark className="w-5 h-5" />
          {savedCount > 0 && (
            <span className="absolute top-1.5 right-4 min-w-[15px] h-[15px] px-0.5 bg-[#c8a962] text-[#0b1b2b] font-bold text-[9px] rounded-full flex items-center justify-center tabular-nums">
              {savedCount}
            </span>
          )}
          <span className="text-[11px] leading-tight font-['Cairo']">المفضلة</span>
        </button>

        {/* حسابي */}
        <button
          onClick={() => (user ? onNavigate('account') : onOpenLogin())}
          className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer py-1 relative ${
            activePage === 'account' || activePage === 'login' || activePage === 'register'
              ? 'text-[#0b1b2b] dark:text-[#dfc27e] font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          {(activePage === 'account' || activePage === 'login' || activePage === 'register') && (
            <span className="absolute top-1.5 w-6 h-0.5 rounded-full bg-[#c8a962]" />
          )}
          <User className="w-5 h-5" />
          <span className="text-[11px] leading-tight font-['Cairo']">حسابي</span>
        </button>
      </div>
    </nav>
  );
};
