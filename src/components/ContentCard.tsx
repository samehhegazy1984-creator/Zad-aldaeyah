import React, { useState } from 'react';
import { Heart, Share2, Clock, User, ArrowLeft, Check } from 'lucide-react';
import { Content } from '../types';
import { getHighlightedText } from '../utils/arabic';

interface ContentCardProps {
  item: Content;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelect: (item: Content) => void;
  searchQuery?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  searchQuery = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/content/${item.slug}`;
    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: item.description,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const titleSegments = getHighlightedText(item.title, searchQuery);
  const descSegments = getHighlightedText(item.description, searchQuery);

  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 hover:border-[#c8a962]/70 dark:hover:border-[#c8a962]/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-right"
    >
      <div>
        {/* Top Header: Category label + Content type badge + Actions (Save / Share) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#94762e] dark:text-[#dfc27e] font-semibold">
              {item.category}
            </span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 text-[11px] font-medium">
              {item.contentType}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Share action */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer relative"
              title="مشاركة المادة"
              aria-label="مشاركة المادة"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0b1b2b] text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                  تم النسخ!
                </span>
              )}
            </button>

            {/* Bookmark action (Heart) */}
            <button
              type="button"
              onClick={(e) => onToggleBookmark(item.id, e)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                  : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800/80'
              }`}
              title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
              aria-label={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isBookmarked ? 'fill-current text-rose-500' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title with search query highlighting */}
        <h3 className="text-base sm:text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-2 leading-snug group-hover:text-[#94762e] dark:group-hover:text-[#dfc27e] transition-colors">
          {titleSegments.map((seg, i) =>
            seg.isMatch ? (
              <mark
                key={i}
                className="bg-[#c8a962]/30 text-[#0b1b2b] dark:text-[#dfc27e] rounded-xs px-0.5"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </h3>

        {/* Short Description with search query highlighting */}
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2 mb-4">
          {descSegments.map((seg, i) =>
            seg.isMatch ? (
              <mark
                key={i}
                className="bg-[#c8a962]/30 text-[#0b1b2b] dark:text-[#dfc27e] rounded-xs px-0.5"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </p>
      </div>

      {/* Metadata & Primary CTA */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate max-w-[100px] sm:max-w-[120px]">{item.author.name}</span>
          </span>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{item.readingTime} د</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(item)}
          className="flex items-center gap-1 text-[#94762e] dark:text-[#dfc27e] font-semibold group-hover:translate-x-[-3px] transition-transform cursor-pointer"
        >
          <span>اقرأ المادة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
