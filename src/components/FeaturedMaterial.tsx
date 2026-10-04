import React from 'react';
import { Clock, ArrowLeft, Bookmark, Sparkles } from 'lucide-react';
import { ContentItem } from '../types';

interface FeaturedMaterialProps {
  item: ContentItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onRead: (item: ContentItem) => void;
}

export const FeaturedMaterial: React.FC<FeaturedMaterialProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onRead,
}) => {
  return (
    <section className="py-12 lg:py-16 bg-stone-100/60 dark:bg-[#09131e] border-y border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-white via-[#fbf8f2] to-[#f4eee4] dark:from-[#0b1b2b] dark:via-[#122438] dark:to-[#0b1b2b] text-[#0b1b2b] dark:text-white p-6 sm:p-10 lg:p-14 border border-stone-200/90 dark:border-[#c8a962]/40 shadow-xl transition-colors duration-200">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-islamic-pattern opacity-30 pointer-events-none" />

          <div className="relative max-w-3xl">
            {/* Top metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-stone-600 dark:text-stone-300">
              <span className="inline-flex items-center gap-1.5 text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/15 px-2.5 py-1 rounded-full border border-[#c8a962]/30 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مادة مميزة للأسبوع</span>
              </span>
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              <span className="text-stone-600 dark:text-stone-300">{item.category}</span>
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                <Clock className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
                <span>قراءة في {item.readingTime} دقائق</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-5 leading-tight">
              {item.title}
            </h2>

            {/* Short Introduction */}
            <p className="text-sm sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-8 max-w-2xl">
              {item.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onRead(item)}
                className="px-6 py-3 bg-[#0b1b2b] hover:bg-[#152e4a] text-white dark:bg-[#dfc27e] dark:hover:bg-[#edd497] dark:text-[#0b1b2b] font-bold text-sm sm:text-base rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
              >
                <span>اقرأ المادة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => onToggleBookmark(item.id, e)}
                className={`px-4 py-3 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 text-sm font-medium ${
                  isBookmarked
                    ? 'bg-[#c8a962]/20 border-[#c8a962] text-[#94762e] dark:text-[#dfc27e]'
                    : 'bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-white/15 text-stone-700 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'محفوظة في المفضلة' : 'حفظ المادة'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
