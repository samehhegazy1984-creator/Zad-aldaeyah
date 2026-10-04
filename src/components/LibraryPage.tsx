import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  RefreshCw,
  Tag,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Content, SortOption, CategoryEnum } from '../types';
import { ContentCard } from './ContentCard';
import { SkeletonCard } from './SkeletonCard';
import { RecentlyViewedSection } from './RecentlyViewedSection';
import { CATEGORIES_LIST } from '../data/categories';
import { CONTENT_TYPES_DATA, AUDIENCES_DATA } from '../data/mockData';
import { matchesArabicSearch } from '../utils/arabic';

interface LibraryPageProps {
  items: Content[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectItem: (item: Content) => void;
  initialQuery?: string;
  initialCategory?: string;
  initialType?: string;
  onSelectCategoryPage?: (catSlug: string) => void;
  recentlyViewedItems?: Content[];
  onClearHistory?: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  items,
  bookmarkedIds,
  onToggleBookmark,
  onSelectItem,
  initialQuery = '',
  initialCategory,
  initialType,
  onSelectCategoryPage,
  recentlyViewedItems = [],
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>(initialType || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(9);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial query/category if passed from URL or navigation
  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialType) setSelectedType(initialType);
  }, [initialType]);

  // Simulate smooth skeleton transition on filter change
  const handleFilterChange = (setter: () => void) => {
    setIsLoading(true);
    setter();
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    items.forEach((item) => {
      item.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [items]);

  // Quick filter chips for top bar
  const quickTypeChips = [
    { id: 'all', label: 'الكل' },
    { id: 'خطبة جمعة', label: 'خطبة' },
    { id: 'موعظة', label: 'موعظة' },
    { id: 'درس', label: 'درس' },
    { id: 'محاضرة', label: 'محاضرة' },
    { id: 'مادة تربوية', label: 'تربية' },
    { id: 'مادة أسرية', label: 'أسرة' },
    { id: 'درس للأطفال', label: 'أطفال' },
    { id: 'منشور دعوي', label: 'منشور' },
    { id: 'سيناريو فيديو', label: 'فيديو' },
    { id: 'برنامج إيماني', label: 'برنامج إيماني' },
  ];

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedAudience('all');
    setSelectedDuration('all');
    setSelectedTag('all');
    setSortBy('latest');
    setVisibleCount(9);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedAudience !== 'all' ||
    selectedDuration !== 'all' ||
    selectedTag !== 'all' ||
    sortBy !== 'latest';

  // Filter items using normalized Arabic search
  const filteredItems = useMemo(() => {
    const results = items.filter((item) => {
      // 1. Intelligent Arabic search check across title, description, content, category, tags, author
      if (searchQuery.trim()) {
        const matchesTitle = matchesArabicSearch(item.title, searchQuery);
        const matchesDesc = matchesArabicSearch(item.description, searchQuery);
        const matchesContent = item.content.some((p) => matchesArabicSearch(p, searchQuery));
        const matchesCat = matchesArabicSearch(item.category, searchQuery);
        const matchesTags = item.tags.some((t) => matchesArabicSearch(t, searchQuery));
        const matchesAuthor = matchesArabicSearch(item.author.name, searchQuery);

        if (
          !matchesTitle &&
          !matchesDesc &&
          !matchesContent &&
          !matchesCat &&
          !matchesTags &&
          !matchesAuthor
        ) {
          return false;
        }
      }

      // 2. Content Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'خطبة' && !item.contentType.includes('خطبة')) return false;
        else if (selectedType !== 'خطبة' && item.contentType !== selectedType) return false;
      }

      // 3. Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 4. Audience filter
      if (selectedAudience !== 'all' && item.audience !== selectedAudience) {
        return false;
      }

      // 5. Reading duration filter
      if (selectedDuration === 'under5' && item.readingTime >= 5) return false;
      if (selectedDuration === '5to10' && (item.readingTime < 5 || item.readingTime > 10)) return false;
      if (selectedDuration === '10to20' && (item.readingTime <= 10 || item.readingTime > 20)) return false;
      if (selectedDuration === 'over20' && item.readingTime <= 20) return false;

      // 6. Tag filter
      if (selectedTag !== 'all' && !item.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    });

    // 7. Sorting
    if (sortBy === 'popular') {
      results.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'bookmarked') {
      results.sort((a, b) => {
        const aBookmarked = bookmarkedIds.has(a.id) ? 1 : 0;
        const bBookmarked = bookmarkedIds.has(b.id) ? 1 : 0;
        return bBookmarked - aBookmarked;
      });
    } else if (sortBy === 'alphabetical') {
      results.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    } else {
      // Default: latest
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results;
  }, [
    items,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedAudience,
    selectedDuration,
    selectedTag,
    sortBy,
    bookmarkedIds,
  ]);

  const pagedItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/10 px-3.5 py-1.5 rounded-full border border-[#c8a962]/25 font-['Cairo']">
            <BookOpen className="w-4 h-4" />
            <span>مستودع المعرفة والخطابة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-3">
            مكتبة زاد الداعية
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
            مواد دعوية وتربوية تساعدك على الوصول إلى المعنى وصياغة الأثر.
          </p>

          {/* Prominent Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الخطب والدروس والمواعظ..."
              className="w-full bg-white dark:bg-[#0c1825] text-[#0b1b2b] dark:text-white text-base px-5 py-4 pr-12 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md focus:outline-none focus:ring-2 focus:ring-[#c8a962] transition-all"
            />
            <Search className="w-5 h-5 text-[#94762e] dark:text-[#dfc27e] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white p-1 rounded-md"
                aria-label="مسح نص البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 shrink-0">
            {quickTypeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleFilterChange(() => setSelectedType(chip.id))}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedType === chip.id
                    ? 'bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] shadow-xs'
                    : 'bg-white dark:bg-[#0c1825] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200/80 dark:border-stone-800'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#0c1825] border border-stone-300 dark:border-stone-700 rounded-xl cursor-pointer shrink-0 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e]" />
            <span>التصفية المتقدمة</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#c8a962]" />
            )}
          </button>
        </div>

        {/* Main Grid & Desktop Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 space-y-6 sticky top-24 shadow-xs text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-sm font-['Cairo'] text-[#0b1b2b] dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                <span>تصفية المواد</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>

            {/* المجال */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                المجال:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(() => setSelectedCategory(e.target.value))}
                className="w-full bg-stone-50 dark:bg-[#122438] text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c8a962]"
              >
                <option value="all">كافة المجالات (15 مجال)</option>
                {CATEGORIES_LIST.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* الجمهور المستهدف */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                الجمهور:
              </label>
              <select
                value={selectedAudience}
                onChange={(e) => handleFilterChange(() => setSelectedAudience(e.target.value))}
                className="w-full bg-stone-50 dark:bg-[#122438] text-xs sm:text-sm p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c8a962]"
              >
                <option value="all">كافة الفئات</option>
                {AUDIENCES_DATA.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            {/* المدة */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                مدة القراءة:
              </label>
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration-filter"
                    checked={selectedDuration === 'all'}
                    onChange={() => handleFilterChange(() => setSelectedDuration('all'))}
                    className="accent-[#c8a962]"
                  />
                  <span>الكل</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration-filter"
                    checked={selectedDuration === 'under5'}
                    onChange={() => handleFilterChange(() => setSelectedDuration('under5'))}
                    className="accent-[#c8a962]"
                  />
                  <span>أقل من 5 دقائق</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration-filter"
                    checked={selectedDuration === '5to10'}
                    onChange={() => handleFilterChange(() => setSelectedDuration('5to10'))}
                    className="accent-[#c8a962]"
                  />
                  <span>5–10 دقائق</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration-filter"
                    checked={selectedDuration === '10to20'}
                    onChange={() => handleFilterChange(() => setSelectedDuration('10to20'))}
                    className="accent-[#c8a962]"
                  />
                  <span>10–20 دقيقة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration-filter"
                    checked={selectedDuration === 'over20'}
                    onChange={() => handleFilterChange(() => setSelectedDuration('over20'))}
                    className="accent-[#c8a962]"
                  />
                  <span>أكثر من 20 دقيقة</span>
                </label>
              </div>
            </div>

            {/* الوسوم */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                الوسوم الرائجة:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => handleFilterChange(() => setSelectedTag('all'))}
                  className={`px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                    selectedTag === 'all'
                      ? 'bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  الكل
                </button>
                {allTags.slice(0, 16).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleFilterChange(() => setSelectedTag(tag))}
                    className={`px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header info bar: Count and Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-stone-500 dark:text-stone-400 pb-2 border-b border-stone-200/80 dark:border-stone-800">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                وجدنا <strong className="text-[#94762e] dark:text-[#dfc27e]">{filteredItems.length}</strong> مواد
                {searchQuery && <span> لكلمة «{searchQuery}»</span>}
              </span>

              <div className="flex items-center gap-2">
                <span>الترتيب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white dark:bg-[#0c1825] px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="latest">الأحدث (افتراضي)</option>
                  <option value="popular">الأكثر قراءة</option>
                  <option value="bookmarked">الأكثر حفظًا</option>
                  <option value="alphabetical">الأبجدي</option>
                </select>
              </div>
            </div>

            {/* Skeleton Loading State or Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              /* No Results Empty State */
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <BookOpen className="w-14 h-14 mx-auto text-stone-300 dark:text-stone-700" />
                <h3 className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                  لم نجد مادة تطابق بحثك
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                  جرّب كلمات مختلفة أو تصفح المجالات الموضوعية لتجد المواد المناسبة.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={resetAllFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    عرض جميع المواد
                  </button>
                  <button
                    onClick={() => {
                      if (onSelectCategoryPage) onSelectCategoryPage('faith');
                      else resetAllFilters();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    تصفح المجالات
                  </button>
                </div>
              </div>
            ) : (
              /* Results Cards Grid */
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

                {/* Pagination / Load More */}
                {visibleCount < filteredItems.length && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 9)}
                      className="px-8 py-3.5 rounded-xl bg-white dark:bg-[#0c1825] hover:bg-stone-100 dark:hover:bg-[#122438] text-[#0b1b2b] dark:text-stone-100 border border-stone-300 dark:border-stone-700 font-semibold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:border-[#c8a962]"
                    >
                      تحميل المزيد من المواد (+{Math.min(9, filteredItems.length - visibleCount)})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Materials Section */}
        {recentlyViewedItems.length > 0 && (
          <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
            <RecentlyViewedSection
              items={recentlyViewedItems}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={onToggleBookmark}
              onSelectItem={onSelectItem}
              onClearHistory={onClearHistory || (() => {})}
            />
          </div>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet / Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1825] h-full p-6 overflow-y-auto text-right flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                  <span>تصفية المواد المتقدمة</span>
                </h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* نوع المحتوى */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  نوع المحتوى:
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  <option value="all">كافة الأنواع</option>
                  {CONTENT_TYPES_DATA.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* المجال */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  المجال:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  <option value="all">كافة المجالات</option>
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* الجمهور */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  الجمهور:
                </label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  <option value="all">كافة الفئات</option>
                  {AUDIENCES_DATA.map((a) => (
                    <option key={a.id} value={a.title}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* المدة */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  المدة:
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  <option value="all">كل الأوقات</option>
                  <option value="under5">أقل من 5 دقائق</option>
                  <option value="5to10">5–10 دقائق</option>
                  <option value="10to20">10–20 دقيقة</option>
                  <option value="over20">أكثر من 20 دقيقة</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 bg-[#0b1b2b] dark:bg-[#dfc27e] text-white dark:text-[#0b1b2b] font-bold text-xs rounded-xl shadow-md"
              >
                تطبيق التصفية
              </button>
              <button
                onClick={() => {
                  resetAllFilters();
                  setMobileDrawerOpen(false);
                }}
                className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
