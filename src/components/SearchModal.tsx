import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, BookOpen, Clock, User, ArrowLeft } from 'lucide-react';
import { ContentItem } from '../types';
import { matchesArabicSearch } from '../utils/arabic';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  onSelectItem: (item: ContentItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'duration'>('latest');

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category)));
  }, [items]);

  const contentTypes = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.contentType)));
  }, [items]);

  const audiences = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.audience)));
  }, [items]);

  const filteredResults = useMemo(() => {
    let result = items.filter((item) => {
      // Query filter with Arabic normalization
      if (query.trim()) {
        const matchesTitle = matchesArabicSearch(item.title, query);
        const matchesDesc = matchesArabicSearch(item.description, query);
        const matchesTags = item.tags.some((t) => matchesArabicSearch(t, query));
        const matchesAuthor = matchesArabicSearch(item.author.name, query);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesAuthor) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Content Type filter
      if (selectedType !== 'all' && item.contentType !== selectedType) {
        return false;
      }

      // Audience filter
      if (selectedAudience !== 'all' && item.audience !== selectedAudience) {
        return false;
      }

      // Duration filter
      if (selectedDuration === 'short' && item.readingTime > 5) return false;
      if (selectedDuration === 'medium' && (item.readingTime <= 5 || item.readingTime > 10)) return false;
      if (selectedDuration === 'long' && item.readingTime <= 10) return false;

      return true;
    });

    // Sorting
    if (sortBy === 'duration') {
      result.sort((a, b) => a.readingTime - b.readingTime);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.views - a.views);
    }

    return result;
  }, [items, query, selectedCategory, selectedType, selectedAudience, selectedDuration, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-stone-50 dark:bg-[#0c1825] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto text-right">
        {/* Top Header: Input */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#08121d] border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#a98840] dark:text-[#dfc27e] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الخطب والدروس والمواعظ والمفاهيم التربوية..."
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 text-base sm:text-lg focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white bg-stone-100 dark:bg-stone-800 transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-stone-100/70 dark:bg-[#091522] border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 font-semibold ml-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
            <span>التصفية:</span>
          </div>

          {/* نوع المحتوى */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0f243a] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none"
          >
            <option value="all">كل أنواع المحتوى</option>
            {contentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* المجال */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0f243a] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none"
          >
            <option value="all">كل المجالات</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* الجمهور */}
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0f243a] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none"
          >
            <option value="all">كل الفئات</option>
            {audiences.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* مدة القراءة */}
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0f243a] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none"
          >
            <option value="all">كل الأوقات</option>
            <option value="short">سريعة (أقل من 5 د)</option>
            <option value="medium">متوسطة (5-10 د)</option>
            <option value="long">مفصلة (أكثر من 10 د)</option>
          </select>

          {/* الترتيب */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0f243a] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none mr-auto"
          >
            <option value="latest">الأحدث</option>
            <option value="popular">الأكثر قراءة ومطالعة</option>
            <option value="duration">حسب مدة القراءة</option>
          </select>

          {(query || selectedCategory !== 'all' || selectedType !== 'all' || selectedAudience !== 'all' || selectedDuration !== 'all') && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
                setSelectedAudience('all');
                setSelectedDuration('all');
              }}
              className="text-[#a98840] dark:text-[#dfc27e] font-medium hover:underline px-2 py-1"
            >
              إعادة تعيين
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 flex items-center justify-between">
            <span>تم العثور على {filteredResults.length} مادة</span>
            {query && <span>نتائج البحث عن: «{query}»</span>}
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-stone-700" />
              <p className="text-base font-semibold font-['Cairo']">لم نجد مادة مطابقة لمعايير البحث</p>
              <p className="text-xs mt-1">جرّب تقليل محددات التصفية أو البحث عن كلمة أعم كـ "الصلاة" أو "التربية"</p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-4 rounded-xl bg-white dark:bg-[#08121d] border border-stone-200 dark:border-stone-800/80 hover:border-[#c8a962]/60 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="text-[#a98840] dark:text-[#dfc27e] font-semibold">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.contentType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.audience}</span>
                  </div>
                  <h4 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white group-hover:text-[#a98840] dark:group-hover:text-[#dfc27e] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 max-w-xl">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.readingTime} د</span>
                  </span>
                  <div className="flex items-center gap-1 text-[#a98840] dark:text-[#dfc27e] font-medium group-hover:translate-x-[-2px] transition-transform">
                    <span>قراءة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
