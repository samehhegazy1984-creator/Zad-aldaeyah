import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Heart,
  Share2,
  Printer,
  Clock,
  User,
  Calendar,
  Eye,
  Copy,
  Check,
  BookOpen,
  Quote,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Content, ReaderFontSize } from '../types';
import { ContentCard } from './ContentCard';
import { ThemeSwitcher } from './ThemeSwitcher';
import { getRelatedContent } from '../data/content';

interface ArticleReaderProps {
  article: Content;
  allArticles: Content[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
  onSelectArticle: (article: Content) => void;
}

const FONT_SIZE_KEY = 'zad_reader_font_size';

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  bookmarkedIds,
  onToggleBookmark,
  onBack,
  onSelectArticle,
}) => {
  const [fontSize, setFontSize] = useState<ReaderFontSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      if (saved === 'small' || saved === 'medium' || saved === 'large' || saved === 'xlarge') {
        return saved;
      }
    }
    return 'medium';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleFontSizeChange = (size: ReaderFontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem(FONT_SIZE_KEY, size);
    } catch (e) {}
  };

  const fontClasses: Record<ReaderFontSize, string> = {
    small: 'text-base leading-relaxed',
    medium: 'text-lg sm:text-xl leading-[2.1]',
    large: 'text-xl sm:text-2xl leading-[2.3]',
    xlarge: 'text-2xl sm:text-3xl leading-[2.6]',
  };

  const isBookmarked = bookmarkedIds.has(article.id);

  const handleCopyText = () => {
    const fullProse = `${article.title}\n\nبقلم: ${article.author.name}\n\n${article.description}\n\n` +
      article.content.join('\n\n') +
      (article.references ? `\n\nالمراجع:\n${article.references.join('\n')}` : '') +
      `\n\nمنصة زاد الداعية: ${window.location.href}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullProse).then(() => {
        showToast('تم نسخ المادة بنجاح');
      });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `${article.title} | زاد الداعية`,
          text: article.description,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('تم نسخ الرابط للمشاركة');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get 4 related materials
  const relatedMaterials = getRelatedContent(article, 4);

  return (
    <article className="min-h-screen py-8 lg:py-14 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 right-1/2 translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#dfc27e] dark:text-[#0b1b2b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs text-stone-500 dark:text-stone-400 no-print">
          <nav className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="hover:text-[#94762e] dark:hover:text-[#dfc27e] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span aria-hidden="true">/</span>
            <button
              onClick={onBack}
              className="hover:text-[#94762e] dark:hover:text-[#dfc27e] transition-colors cursor-pointer"
            >
              المكتبة
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[#94762e] dark:text-[#dfc27e] font-semibold">{article.category}</span>
          </nav>

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer text-xs font-semibold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للمكتبة</span>
          </button>
        </div>

        {/* Floating / Sticky Reading Toolbar (Desktop & Mobile) */}
        <div className="sticky top-20 z-30 mb-8 p-3 rounded-2xl bg-white/90 dark:bg-[#0c1825]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 ml-1 font-medium hidden sm:inline">حجم الخط:</span>
            <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 rounded-xl p-1 gap-1">
              {(
                [
                  { id: 'small', label: 'صغير' },
                  { id: 'medium', label: 'متوسط' },
                  { id: 'large', label: 'كبير' },
                  { id: 'xlarge', label: 'كبير جدًا' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFontSizeChange(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    fontSize === f.id
                      ? 'bg-white dark:bg-[#122438] text-[#0b1b2b] dark:text-[#dfc27e] font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Integrated Global Theme Switcher */}
            <ThemeSwitcher />

            {/* Copy Article Text */}
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="نسخ المادة كاملة"
              aria-label="نسخ المادة كاملة"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="طباعة المادة للمنبر"
              aria-label="طباعة المادة"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="مشاركة الرابط"
              aria-label="مشاركة الرابط"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Bookmark Heart */}
            <button
              onClick={(e) => onToggleBookmark(article.id, e)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                  : 'text-stone-600 dark:text-stone-300 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
              aria-label={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Article Header Details */}
        <header className="pb-8 mb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] mb-3">
            <span>{article.category}</span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
              {article.contentType}
            </span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-stone-500 dark:text-stone-400">موجه إلى: {article.audience}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-6 font-normal">
            {article.description}
          </p>

          {/* Meta Info Bar: Author, Date, Reading Time, Views */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200/80 dark:border-stone-800 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                <User className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                <span>{article.author.name}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{article.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-400" />
                <span>مدة القراءة: {article.readingTime} دقائق</span>
              </span>
              <span className="flex items-center gap-1.5 tabular-nums">
                <Eye className="w-4 h-4 text-stone-400" />
                <span>{article.views.toLocaleString('ar-EG')} مشاهدة</span>
              </span>
            </div>
          </div>
        </header>

        {/* Quran Verse Callout (if present) */}
        {article.ayahQuotes && article.ayahQuotes.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-[#0b1b2b]/5 dark:bg-[#122438]/40 border-r-4 border-[#c8a962] text-right">
            {article.ayahQuotes.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-[#0b1b2b] dark:text-[#dfc27e] font-serif leading-loose">
                  ﴿ {q.text} ﴾
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {q.surah}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hadith Callout (if present) */}
        {article.hadithQuotes && article.hadithQuotes.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-50/70 dark:bg-[#152332]/60 border border-amber-200/60 dark:border-amber-900/40 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-[#94762e] dark:text-[#dfc27e] mb-2 font-['Cairo']">
              <Quote className="w-4 h-4" />
              <span>من هدي المصطفى ﷺ:</span>
            </div>
            {article.hadithQuotes.map((h, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-base sm:text-lg font-semibold text-stone-800 dark:text-stone-100 leading-relaxed">
                  {h.text}
                </p>
                <span className="block text-xs text-stone-500 dark:text-stone-400">
                  {h.narrator}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Main Article Prose Content */}
        <section
          className={`space-y-6 text-stone-800 dark:text-stone-200 ${fontClasses[fontSize]} print-readable font-sans`}
        >
          {article.content.map((paragraph, index) => (
            <p key={index} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>

        {/* Key Takeaways */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xs text-right">
            <h3 className="text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c8a962]" />
              <span>خلاصات ومعالم تربوية للمربي والخطيب:</span>
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-stone-700 dark:text-stone-300">
              {article.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#94762e] dark:text-[#dfc27e] font-bold text-base mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* References Section */}
        {article.references && article.references.length > 0 && (
          <div className="mt-8 p-5 rounded-2xl bg-stone-100/60 dark:bg-[#091522] border border-stone-200 dark:border-stone-800/80 text-right">
            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 font-['Cairo'] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e]" />
              <span>المصادر والمراجع:</span>
            </h4>
            <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
              {article.references.map((ref, idx) => (
                <li key={idx}>• {ref}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-2 text-xs no-print">
          <span className="text-stone-400">الوسوم:</span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-stone-600 dark:text-stone-300 bg-stone-200/50 dark:bg-stone-800/80 px-2.5 py-1 rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Bio Card */}
        <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 flex items-start gap-4 no-print">
          <div className="w-12 h-12 rounded-2xl bg-[#0b1b2b] dark:bg-[#122438] text-[#dfc27e] flex items-center justify-center font-bold text-lg font-['Cairo'] shrink-0">
            {article.author.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white">
              {article.author.name}
            </h4>
            <div className="text-xs text-[#94762e] dark:text-[#dfc27e] font-semibold mb-1">
              {article.author.title}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {article.author.bio}
            </p>
          </div>
        </div>

        {/* Related Materials Section (4 items) */}
        {relatedMaterials.length > 0 && (
          <section className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800 no-print">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#94762e] dark:text-[#dfc27e]" />
                <span>مواد ذات صلة بالموضوع</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedMaterials.map((rel) => (
                <ContentCard
                  key={rel.id}
                  item={rel}
                  isBookmarked={bookmarkedIds.has(rel.id)}
                  onToggleBookmark={onToggleBookmark}
                  onSelect={onSelectArticle}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
