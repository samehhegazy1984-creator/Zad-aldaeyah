import React, { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ContentItem } from '../types';
import { ContentCard } from './ContentCard';

interface LibrarySectionProps {
  items: ContentItem[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectItem: (item: ContentItem) => void;
  onViewAll: () => void;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  items,
  bookmarkedIds,
  onToggleBookmark,
  onSelectItem,
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'khutbah' | 'lesson' | 'mawiza' | 'tarbiyah'>('all');

  const filterTabs = [
    { id: 'all', label: 'المختارات' },
    { id: 'khutbah', label: 'خطب الجمعة' },
    { id: 'mawiza', label: 'مواعظ ورقائق' },
    { id: 'lesson', label: 'دروس علمية' },
    { id: 'tarbiyah', label: 'مواد تربوية' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'khutbah') return item.contentType === 'خطبة جمعة';
    if (activeTab === 'mawiza') return item.contentType === 'موعظة';
    if (activeTab === 'lesson') return item.contentType === 'درس' || item.contentType === 'محاضرة';
    if (activeTab === 'tarbiyah') return item.contentType === 'مادة تربوية' || item.contentType === 'درس للأطفال';
    return true;
  }).slice(0, 6);

  return (
    <section className="py-16 lg:py-24 bg-stone-50 dark:bg-[#070e17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#a98840] dark:text-[#dfc27e] mb-2 font-['Cairo']">
              <BookOpen className="w-4 h-4" />
              <span>مختارات تحريرية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 tracking-tight">
              مكتبة المعرفة
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base mt-2 max-w-xl">
              محتوى مختار يساعدك على بناء كلمة نافعة، مستنبط من هدي الكتاب والسنة ومحرر بأسلوب تربوي أصيل.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#0c1825] text-[#0b1b2b] dark:text-[#dfc27e] shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isBookmarked={bookmarkedIds.has(item.id)}
              onToggleBookmark={onToggleBookmark}
              onSelect={onSelectItem}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white dark:bg-[#0c1825] hover:bg-stone-100 dark:hover:bg-[#122438] text-[#0b1b2b] dark:text-stone-100 border border-stone-300 dark:border-stone-700 font-semibold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:border-[#c8a962]"
          >
            <span>عرض جميع المواد</span>
            <ArrowLeft className="w-4 h-4 text-[#a98840] dark:text-[#dfc27e]" />
          </button>
        </div>
      </div>
    </section>
  );
};
