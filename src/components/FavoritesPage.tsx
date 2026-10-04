import React from 'react';
import { Heart, ArrowLeft, BookOpen, Trash2 } from 'lucide-react';
import { Content } from '../types';
import { ContentCard } from './ContentCard';

interface FavoritesPageProps {
  savedItems: Content[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectItem: (item: Content) => void;
  onBrowseLibrary: () => void;
  onClearAll: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  savedItems,
  bookmarkedIds,
  onToggleBookmark,
  onSelectItem,
  onBrowseLibrary,
  onClearAll,
}) => {
  return (
    <div className="min-h-screen py-10 lg:py-16 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] mb-1 font-['Cairo']">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>مادتك المحفوظة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
              المفضلة
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              المواد التي اخترت الاحتفاظ بها.
            </p>
          </div>

          {savedItems.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500 tabular-nums">
                {savedItems.length} مادة محفوظة
              </span>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إفراغ المفضلة</span>
              </button>
            </div>
          )}
        </div>

        {/* Content or Empty State */}
        {savedItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-[#122438] text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>

            <h3 className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-2">
              لم تحفظ أي مادة بعد
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              استكشف مكتبة زاد الداعية وانقر على أيقونة الإعجاب والحفظ على أي مادة أو خطبة لتصل إليها بسهولة وسرعة هنا.
            </p>

            <button
              onClick={onBrowseLibrary}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0b1b2b] text-white hover:bg-[#152e4a] dark:bg-[#dfc27e] dark:text-[#0b1b2b] dark:hover:bg-[#edd497] font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>تصفح المكتبة</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                isBookmarked={bookmarkedIds.has(item.id)}
                onToggleBookmark={onToggleBookmark}
                onSelect={onSelectItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
