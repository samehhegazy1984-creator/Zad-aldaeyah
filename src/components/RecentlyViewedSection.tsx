import React from 'react';
import { History, ArrowLeft, Trash2 } from 'lucide-react';
import { Content } from '../types';
import { ContentCard } from './ContentCard';

interface RecentlyViewedSectionProps {
  items: Content[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectItem: (item: Content) => void;
  onClearHistory: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  items,
  bookmarkedIds,
  onToggleBookmark,
  onSelectItem,
  onClearHistory,
}) => {
  if (items.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 bg-stone-100/40 dark:bg-[#08121d] border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] mb-1 font-['Cairo']">
              <History className="w-4 h-4" />
              <span>سجل المطالعة الشخصي</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
              تابع قراءتك
            </h2>
          </div>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/60"
            title="مسح سجل القراءة"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مسح السجل</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isBookmarked={bookmarkedIds.has(item.id)}
              onToggleBookmark={onToggleBookmark}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
