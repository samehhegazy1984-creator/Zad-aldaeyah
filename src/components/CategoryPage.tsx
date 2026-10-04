import React, { useState, useMemo } from 'react';
import { ArrowRight, Search, SlidersHorizontal, BookOpen, X, RefreshCw } from 'lucide-react';
import { Category, Content, SortOption } from '../types';
import { ContentCard } from './ContentCard';
import { IconRenderer } from './IconRenderer';
import { matchesArabicSearch } from '../utils/arabic';

interface CategoryPageProps {
  category: Category;
  items: Content[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectItem: (item: Content) => void;
  onBackToLibrary: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  items,
  bookmarkedIds,
  onToggleBookmark,
  onSelectItem,
  onBackToLibrary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(12);

  const categoryItems = useMemo(() => {
    return items.filter((item) => item.category === category.name);
  }, [items, category.name]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(categoryItems.map((i) => i.contentType)));
  }, [categoryItems]);

  const filteredItems = useMemo(() => {
    let result = categoryItems.filter((item) => {
      // Query search
      if (searchQuery.trim()) {
        const matchesTitle = matchesArabicSearch(item.title, searchQuery);
        const matchesDesc = matchesArabicSearch(item.description, searchQuery);
        const matchesTags = item.tags.some((t) => matchesArabicSearch(t, searchQuery));
        const matchesAuthor = matchesArabicSearch(item.author.name, searchQuery);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesAuthor) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && item.contentType !== selectedType) {
        return false;
      }

      // Duration filter
      if (selectedDuration === 'short' && item.readingTime > 5) return false;
      if (selectedDuration === 'medium' && (item.readingTime <= 5 || item.readingTime > 10)) return false;
      if (selectedDuration === 'long' && item.readingTime <= 10) return false;

      return true;
    });

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'bookmarked') {
      result.sort((a, b) => {
        const aBookmarked = bookmarkedIds.has(a.id) ? 1 : 0;
        const bBookmarked = bookmarkedIds.has(b.id) ? 1 : 0;
        return bBookmarked - aBookmarked;
      });
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    } else {
      // latest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [categoryItems, searchQuery, selectedType, selectedDuration, sortBy, bookmarkedIds]);

  const pagedItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-xs text-stone-500 dark:text-stone-400">
          <button
            onClick={onBackToLibrary}
            className="hover:text-[#94762e] dark:hover:text-[#dfc27e] transition-colors cursor-pointer"
          >
            المكتبة
          </button>
          <span aria-hidden="true">/</span>
          <span>المجالات</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#94762e] dark:text-[#dfc27e] font-semibold">{category.name}</span>
        </nav>

        {/* Category Header Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0b1b2b] dark:bg-[#122438] text-[#dfc27e] flex items-center justify-center shrink-0 shadow-sm">
              <IconRenderer name={category.icon} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e]">
                  مجال تخصصي
                </span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-xs text-stone-500 tabular-nums">
                  {categoryItems.length} مادة علمية متوفرة
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-2">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          <button
            onClick={onBackToLibrary}
            className="self-start md:self-center px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>كافة المجالات</span>
          </button>
        </div>

        {/* Search & Filters Controls Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800/90 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search within category */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`ابحث داخل مواد ${category.name}...`}
                className="w-full bg-stone-50 dark:bg-[#122438] text-sm px-4 py-2.5 pr-10 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c8a962]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Type */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#122438] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              >
                <option value="all">كافة القوالب</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Duration */}
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#122438] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              >
                <option value="all">كل الأوقات</option>
                <option value="short">أقل من 5 دقائق</option>
                <option value="medium">5 إلى 10 دقائق</option>
                <option value="long">أكثر من 10 دقائق</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#122438] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-semibold"
              >
                <option value="latest">الأحدث نشرًا</option>
                <option value="popular">الأكثر قراءة</option>
                <option value="bookmarked">المحفوظة أولاً</option>
                <option value="alphabetical">أبجدياً</option>
              </select>
            </div>
          </div>

          {/* Results count info */}
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>
              وجدنا <strong>{filteredItems.length}</strong> مادة في هذا المجال
            </span>
            {(searchQuery || selectedType !== 'all' || selectedDuration !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedDuration('all');
                }}
                className="text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة ضبط التصفية</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800">
            <BookOpen className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
            <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white mb-1">
              لم نجد مادة تطابق بحثك في هذا المجال
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-4">
              جرّب كلمات بحث أخرى أو تصفح القوالب المختلفة.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedDuration('all');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#0b1b2b] dark:bg-[#dfc27e] text-white dark:text-[#0b1b2b] rounded-xl"
            >
              عرض جميع مواد المجال
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedItems.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  isBookmarked={bookmarkedIds.has(item.id)}
                  onToggleBookmark={onToggleBookmark}
                  onSelect={onSelectItem}
                  searchQuery={searchQuery}
                />
              ))}
            </div>

            {/* Load More Pagination */}
            {visibleCount < filteredItems.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-[#0c1825] border border-stone-300 dark:border-stone-700 hover:border-[#c8a962] text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 shadow-xs cursor-pointer transition-all"
                >
                  تحميل المزيد من المواد (+{Math.min(9, filteredItems.length - visibleCount)})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
