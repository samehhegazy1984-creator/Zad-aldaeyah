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
  Layers,
  Feather,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Compass,
  FileText,
  Scroll,
  HeartHandshake,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { Content, ReaderFontSize } from '../types';
import { ContentCard } from './ContentCard';
import { ThemeSwitcher } from './ThemeSwitcher';
import { getRelatedContent } from '../data/content';
import { EnhanceArticleModal } from './EnhanceArticleModal';
import { GeneratedContentResult } from '../lib/ai/types';

interface ArticleReaderProps {
  article: Content;
  allArticles: Content[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
  onSelectArticle: (article: Content) => void;
  onOpenEnhancedResult?: (result: GeneratedContentResult) => void;
}

const FONT_SIZE_KEY = 'zad_reader_font_size';

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  bookmarkedIds,
  onToggleBookmark,
  onBack,
  onSelectArticle,
  onOpenEnhancedResult,
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
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhancedEdition, setEnhancedEdition] = useState<GeneratedContentResult | null>(null);
  const [showTashkeel, setShowTashkeel] = useState(true);
  const [isQualityScoreOpen, setIsQualityScoreOpen] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  const stripTashkeel = (text: string) => {
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

  const renderText = (text?: string) => {
    if (!text) return '';
    return showTashkeel ? text : stripTashkeel(text);
  };

  const calculateWordCount = () => {
    if (article.wordCount) return article.wordCount;
    let full = `${article.title} ${article.description || ''} ${article.conceptDefinition || ''} ${article.content.join(' ')}`;
    if (article.sections) {
      full += ' ' + article.sections.map((s) => `${s.heading} ${s.subheading || ''} ${s.content}`).join(' ');
    }
    if (article.conclusion) full += ' ' + article.conclusion;
    if (article.dua) full += ' ' + article.dua;
    return full.trim().split(/\s+/).filter(Boolean).length;
  };

  const wordCount = calculateWordCount();
  const estimatedReadingMinutes = Math.max(article.readingTime || 1, Math.ceil(wordCount / 200));

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

  const assembleFullText = (withTashkeel: boolean) => {
    const transform = (t?: string) => {
      if (!t) return '';
      return withTashkeel ? t : stripTashkeel(t);
    };

    let result = `${transform(article.title)}\n`;
    if (article.subtitle) result += `${transform(article.subtitle)}\n`;
    result += `بقلم: ${article.author.name}\n\n`;
    if (article.description) result += `${transform(article.description)}\n\n`;

    if (article.conceptDefinition) {
      result += `تحرير المفهوم والأصل الدلالي:\n${transform(article.conceptDefinition)}\n\n`;
    }

    if (article.sections && article.sections.length > 0) {
      article.sections.forEach((sec, idx) => {
        result += `--- ${idx + 1}. ${transform(sec.heading)} ---\n`;
        if (sec.subheading) result += `${transform(sec.subheading)}\n`;
        result += `${transform(sec.content)}\n\n`;

        if (sec.ayahs && sec.ayahs.length > 0) {
          result += `الآيات:\n` + sec.ayahs.map((a) => `﴿ ${transform(a.text)} ﴾ [${a.surah}]`).join('\n') + `\n\n`;
        }
        if (sec.hadiths && sec.hadiths.length > 0) {
          result += `الأحاديث النبوية:\n` + sec.hadiths.map((h) => `«${transform(h.text)}» (${h.narrator} - ${h.source || ''})`).join('\n') + `\n\n`;
        }
        if (sec.salafQuotes && sec.salafQuotes.length > 0) {
          result += `من آثار السلف:\n` + sec.salafQuotes.map((q) => `قال ${q.scholar}: "${transform(q.statement)}" [${q.source || ''}]`).join('\n') + `\n\n`;
        }
      });
    } else {
      result += article.content.map((p) => transform(p)).join('\n\n') + '\n\n';
    }

    if (article.misconceptions && article.misconceptions.length > 0) {
      result += `معالجة المفاهيم الخاطئة:\n`;
      article.misconceptions.forEach((m) => {
        result += `• المفهوم الخاطئ: ${transform(m.claim)}\n  التصحيح الشرعي: ${transform(m.correction)}\n`;
      });
      result += '\n';
    }

    if (article.practicalApplications && article.practicalApplications.length > 0) {
      result += `الجانب العملي والسلوكي (ماذا أفعل بعد أن فهمت هذا؟):\n`;
      article.practicalApplications.forEach((app, i) => {
        result += `${i + 1}. ${transform(app)}\n`;
      });
      result += '\n';
    }

    if (article.conclusion) {
      result += `الخاتمة:\n${transform(article.conclusion)}\n\n`;
    }

    if (article.dua) {
      result += `الدعاء المأثور:\n${transform(article.dua)}\n\n`;
    }

    if (article.references && article.references.length > 0) {
      result += `المصادر والمراجع:\n` + article.references.join('\n') + '\n\n';
    }

    result += `منصة زاد الداعية: ${window.location.href}`;
    return result;
  };

  const handleCopy = (withTashkeel: boolean) => {
    const text = assembleFullText(withTashkeel);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(withTashkeel ? 'تم نسخ المادة بالتشكيل الكامل' : 'تم نسخ المادة بدون تشكيل');
        setShowCopyMenu(false);
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
        <div className="sticky top-20 z-30 mb-8 p-3 rounded-2xl bg-white/95 dark:bg-[#0c1825]/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-stone-400 ml-1 font-medium hidden sm:inline">الخط:</span>
            <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 rounded-xl p-1 gap-1">
              {(
                [
                  { id: 'small', label: 'صغير' },
                  { id: 'medium', label: 'متوسط' },
                  { id: 'large', label: 'كبير' },
                  { id: 'xlarge', label: 'كبير جداً' },
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

            {/* Tashkeel Toggle Switch */}
            <button
              onClick={() => setShowTashkeel(!showTashkeel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showTashkeel
                  ? 'bg-amber-100/70 dark:bg-amber-950/60 text-[#94762e] dark:text-[#dfc27e] border-amber-300 dark:border-amber-800'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
              }`}
              title="التبديل بين إظهار وإخفاء التشكيل والحركات الإعرابية"
            >
              <Feather className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e]" />
              <span>{showTashkeel ? 'التشكيل: مُفعَّل' : 'بدون تشكيل'}</span>
            </button>

            {/* Quality Score Trigger Badge */}
            {article.qualityScore && (
              <button
                onClick={() => setIsQualityScoreOpen(!isQualityScoreOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-transform hover:scale-105 cursor-pointer"
                title="عرض بطاقة التقييم التحريري للمادة"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>جودة {article.qualityScore.overall.toFixed(1)}/10</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 relative">
            {/* Integrated Global Theme Switcher */}
            <ThemeSwitcher />

            {/* Copy Button with Tashkeel Choice Popover */}
            <div className="relative">
              <button
                onClick={() => setShowCopyMenu(!showCopyMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-700 dark:text-stone-200 hover:text-[#0b1b2b] dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer text-xs font-semibold"
                title="خيارات نسخ المادة"
              >
                <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span>نسخ المادة</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showCopyMenu && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xl p-1.5 z-40 space-y-1">
                  <button
                    onClick={() => handleCopy(true)}
                    className="w-full text-right px-3 py-2 rounded-lg text-xs font-bold text-stone-800 dark:text-stone-100 hover:bg-[#c8a962]/15 hover:text-[#94762e] dark:hover:text-[#dfc27e] transition-colors flex items-center justify-between"
                  >
                    <span>نسخ بالتشكيل التام</span>
                    <Feather className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e]" />
                  </button>
                  <button
                    onClick={() => handleCopy(false)}
                    className="w-full text-right px-3 py-2 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-between"
                  >
                    <span>نسخ بدون تشكيل</span>
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

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

            {/* AI Enhance Button */}
            <button
              onClick={() => setIsEnhanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] text-xs font-bold shadow-xs hover:scale-[1.02] transition-transform cursor-pointer"
              title="تطوير وتوسيع المقال بالذكاء الاصطناعي"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#dfc27e] dark:text-[#0b1b2b]" />
              <span className="hidden sm:inline">تطوير المقال</span>
            </button>
          </div>
        </div>

        {/* Quality Score Dropdown / Panel */}
        {article.qualityScore && isQualityScoreOpen && (
          <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-emerald-300 dark:border-emerald-800/80 shadow-md animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white">
                    بطاقة مؤشر الجودة التحريرية والتأصيلية
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    تقييم تحريري شامل مستند إلى معايير زاد الداعية للأركان الاثني عشر
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Cairo']">
                  {article.qualityScore.overall.toFixed(1)}
                </span>
                <span className="text-xs text-stone-400 mr-1">/ 10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">عمق التناول</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.depth.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">الاستدلال القرآني</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.quranEvidence.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">توثيق السنة النبوية</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.hadithEvidence.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">شواهد وآثار السلف</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.salafEvidence.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">فصاحة البيان</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.arabicQuality.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">دقة التشكيل الإعرابي</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.tashkeelAccuracy.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">التماسك الهيكلي</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.structure.toFixed(1)} / 10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <div className="text-stone-500 dark:text-stone-400 mb-1">القيمة السلوكية</div>
                <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {article.qualityScore.practicalUsefulness.toFixed(1)} / 10
                </div>
              </div>
            </div>

            {article.qualityScore.summaryNotes && (
              <p className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">ملاحظات التحرير: </span>
                {article.qualityScore.summaryNotes}
              </p>
            )}
          </div>
        )}

        {/* Enhanced Edition Banner (if previously enhanced) */}
        {enhancedEdition && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-right">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                <Check className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 font-['Cairo']">
                  تم إعداد النسخة الموسوعية المطورة بنجاح ({enhancedEdition.qualityScore?.overall || 9.4} / 10)
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  مادة مستوفية للأركان الاثني عشر مع التشكيل الكامل والتأصيل بالأدلة والتطبيقات السلوكية.
                </p>
              </div>
            </div>
            {onOpenEnhancedResult && (
              <button
                type="button"
                onClick={() => onOpenEnhancedResult(enhancedEdition)}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white dark:bg-emerald-400 dark:text-emerald-950 text-xs font-bold hover:scale-[1.02] transition-transform cursor-pointer"
              >
                فتح النسخة الموسوعية في استوديو زاد ←
              </button>
            )}
          </div>
        )}

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
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="px-2 py-0.5 rounded-md bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] font-bold">
              مادة شاملة وموسوعية ({wordCount.toLocaleString('ar-EG')} كلمة)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-4 leading-tight">
            {renderText(article.title)}
          </h1>

          {article.subtitle && (
            <h2 className="text-lg sm:text-xl text-[#94762e] dark:text-[#dfc27e] font-['Cairo'] font-semibold mb-4 leading-relaxed">
              {renderText(article.subtitle)}
            </h2>
          )}

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-6 font-normal">
            {renderText(article.description)}
          </p>

          {/* AI Enhancement Invitation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-l from-[#c8a962]/15 via-[#c8a962]/5 to-transparent border border-[#c8a962]/30 flex flex-wrap items-center justify-between gap-3 mb-6 text-right">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm font-['Cairo'] text-[#0b1b2b] dark:text-white">
                  هل ترغب في توسيع وتعميق هذا المقال إلى مادة موسوعية؟
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  تأصيل قرآني ونبوي موسع، شواهد السيرة، درر السلف، ودحض المفاهيم الشائعة مع الضبط بالتشكيل الكامل.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEnhanceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#dfc27e] dark:text-[#0b1b2b]" />
              <span>تطوير وتوسيع المقال</span>
            </button>
          </div>

          {/* Meta Info Bar: Author, Date, Reading Time, Word Count, Views */}
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
                <span>مدة القراءة: {estimatedReadingMinutes} دقائق</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-stone-400" />
                <span>{wordCount.toLocaleString('ar-EG')} كلمة</span>
              </span>
              <span className="flex items-center gap-1.5 tabular-nums">
                <Eye className="w-4 h-4 text-stone-400" />
                <span>{article.views.toLocaleString('ar-EG')} مشاهدة</span>
              </span>
            </div>
          </div>
        </header>

        {/* Conceptual Definition (Pillar 3: تحرير مفهوم الموضوع) */}
        {article.conceptDefinition && (
          <div className="mb-10 p-6 rounded-2xl bg-amber-50/70 dark:bg-[#152332]/60 border border-amber-200/70 dark:border-amber-900/40 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-[#94762e] dark:text-[#dfc27e] mb-2 font-['Cairo']">
              <Compass className="w-4 h-4" />
              <span>تحرير مفهوم الموضوع والأصل الدلالي:</span>
            </div>
            <p className="text-base sm:text-lg text-stone-800 dark:text-stone-100 font-serif leading-loose">
              {renderText(article.conceptDefinition)}
            </p>
          </div>
        )}

        {/* Global Quran Verse Callout (if present) */}
        {article.ayahQuotes && article.ayahQuotes.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-[#0b1b2b]/5 dark:bg-[#122438]/40 border-r-4 border-[#c8a962] text-right">
            {article.ayahQuotes.map((q, idx) => (
              <div key={idx} className="space-y-2 mb-4 last:mb-0">
                <div className="text-xl sm:text-2xl font-bold text-[#0b1b2b] dark:text-[#dfc27e] font-serif leading-loose">
                  ﴿ {renderText(q.text)} ﴾
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
                  <span>{q.surah}</span>
                  {q.explanation && <span className="text-stone-600 dark:text-stone-300 mr-2">{renderText(q.explanation)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Hadith Callout (if present) */}
        {article.hadithQuotes && article.hadithQuotes.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-50/70 dark:bg-[#152332]/60 border border-amber-200/60 dark:border-amber-900/40 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-[#94762e] dark:text-[#dfc27e] mb-2 font-['Cairo']">
              <Quote className="w-4 h-4" />
              <span>من هدي المصطفى ﷺ:</span>
            </div>
            {article.hadithQuotes.map((h, idx) => (
              <div key={idx} className="space-y-1 mb-3 last:mb-0">
                <p className="text-base sm:text-lg font-semibold text-stone-800 dark:text-stone-100 leading-relaxed font-serif">
                  «{renderText(h.text)}»
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span>{h.narrator}</span>
                  {h.source && <span>• {h.source}</span>}
                  {h.explanation && <span className="mr-2 text-stone-600 dark:text-stone-300">— {renderText(h.explanation)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Structured Sections (Pillar 8: Multidimensional Sections) */}
        {article.sections && article.sections.length > 0 ? (
          <div className="space-y-10 my-10">
            {article.sections.map((section, sIndex) => (
              <section
                key={sIndex}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xs text-right space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] font-black font-['Cairo'] flex items-center justify-center text-sm">
                      {(sIndex + 1).toLocaleString('ar-EG')}
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                        {renderText(section.heading)}
                      </h3>
                      {section.subheading && (
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                          {renderText(section.subheading)}
                        </p>
                      )}
                    </div>
                  </div>
                  {section.dimension && (
                    <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                      البُعد {section.dimension}
                    </span>
                  )}
                </div>

                {/* Section Narrative Prose */}
                <div
                  className={`text-stone-800 dark:text-stone-200 ${fontClasses[fontSize]} font-sans whitespace-pre-line leading-loose`}
                >
                  {renderText(section.content)}
                </div>

                {/* Section Specific Quran Ayahs */}
                {section.ayahs && section.ayahs.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#0b1b2b]/5 dark:bg-[#122438]/50 border-r-4 border-[#c8a962] space-y-2">
                    {section.ayahs.map((a, i) => (
                      <div key={i}>
                        <p className="text-lg font-bold text-[#0b1b2b] dark:text-[#dfc27e] font-serif leading-loose">
                          ﴿ {renderText(a.text)} ﴾
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {a.surah} {a.number ? `: الآية ${a.number}` : ''}
                          {a.explanation && ` — ${renderText(a.explanation)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section Specific Hadiths */}
                {section.hadiths && section.hadiths.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 space-y-2">
                    {section.hadiths.map((h, i) => (
                      <div key={i}>
                        <p className="text-base font-semibold text-stone-800 dark:text-stone-100 font-serif leading-relaxed">
                          «{renderText(h.text)}»
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {h.narrator} {h.source ? `• ${h.source}` : ''} {h.grade ? `[${h.grade}]` : ''}
                          {h.explanation && ` — ${renderText(h.explanation)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section Specific Salaf Quotes */}
                {section.salafQuotes && section.salafQuotes.length > 0 && (
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
                    {section.salafQuotes.map((q, i) => (
                      <div key={i} className="text-xs sm:text-sm">
                        <span className="font-bold text-[#94762e] dark:text-[#dfc27e] ml-1">
                          قال {q.scholar}:
                        </span>
                        <span className="text-stone-700 dark:text-stone-300 font-serif italic">
                          "{renderText(q.statement)}"
                        </span>
                        {q.source && (
                          <span className="block text-[11px] text-stone-400 mt-0.5">[{q.source}]</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Section Specific Prophetic Events */}
                {section.propheticEvents && section.propheticEvents.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    {section.propheticEvents.map((evt, i) => (
                      <div key={i} className="text-xs sm:text-sm">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 ml-1">
                          من مشكاة السيرة:
                        </span>
                        <span className="text-stone-800 dark:text-stone-200 font-serif">
                          {renderText(evt.incident)}
                        </span>
                        {evt.lesson && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                            العبرة: {renderText(evt.lesson)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          /* Fallback Main Article Prose Content */
          <section
            className={`space-y-6 text-stone-800 dark:text-stone-200 ${fontClasses[fontSize]} print-readable font-sans`}
          >
            {article.content.map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {renderText(paragraph)}
              </p>
            ))}
          </section>
        )}

        {/* Global Prophetic Events (Pillar 6) */}
        {article.propheticEvents && article.propheticEvents.length > 0 && (
          <div className="my-10 p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-right space-y-4">
            <h3 className="text-lg font-bold font-['Cairo'] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Scroll className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>مواقف وعِبَر من السيرة النبوية العطرة</span>
            </h3>
            <div className="space-y-4">
              {article.propheticEvents.map((pe, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c1825]/70 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-100 mb-1.5 font-serif leading-relaxed">
                    {renderText(pe.incident)}
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <span className="font-bold">العبرة النبوية: </span>
                    {renderText(pe.lesson)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Sayings of the Salaf (Pillar 7) */}
        {article.salafQuotes && article.salafQuotes.length > 0 && (
          <div className="my-10 p-6 rounded-3xl bg-stone-100/70 dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 text-right space-y-4">
            <h3 className="text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#94762e] dark:text-[#dfc27e]" />
              <span>درر وأقوال من مشكاة السلف والعلماء</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {article.salafQuotes.map((sq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
                >
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-serif leading-loose mb-3">
                    "{renderText(sq.statement)}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#94762e] dark:text-[#dfc27e] font-bold border-t border-stone-100 dark:border-stone-800 pt-2">
                    <span>{sq.scholar}</span>
                    {sq.source && <span className="text-stone-400 font-normal">{sq.source}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Misconceptions & Clarifications (Pillar 9) */}
        {article.misconceptions && article.misconceptions.length > 0 && (
          <div className="my-10 p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-right space-y-4">
            <h3 className="text-lg font-bold font-['Cairo'] text-rose-950 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>معالجة المفاهيم الخاطئة وتصويب الأفهام</span>
            </h3>
            <div className="space-y-4">
              {article.misconceptions.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-[#0c1825]/80 border border-rose-100 dark:border-rose-900/30 space-y-2"
                >
                  <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold">
                    <span className="shrink-0 text-base">✕</span>
                    <span>المفهوم الخاطئ: {renderText(m.claim)}</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold pr-4">
                    <span className="shrink-0 text-base">✓</span>
                    <span>التصحيح الشرعي: {renderText(m.correction)}</span>
                  </div>
                  {m.evidence && (
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 pr-8">
                      الدليل: {renderText(m.evidence)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="mt-12 p-6 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xs text-right">
            <h3 className="text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c8a962]" />
              <span>خلاصات ومعالم تربوية للمربي والخطيب:</span>
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-stone-700 dark:text-stone-300">
              {article.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#94762e] dark:text-[#dfc27e] font-bold text-base mt-0.5">•</span>
                  <span>{renderText(point)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Practical Applications (Pillar 11: ماذا أفعل بعد أن فهمت هذا؟) */}
        {article.practicalApplications && article.practicalApplications.length > 0 && (
          <div className="my-10 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#c8a962]/5 to-transparent border-2 border-[#c8a962]/40 text-right space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
              <HeartHandshake className="w-5 h-5 text-[#94762e] dark:text-[#dfc27e]" />
              <span>الجانب العملي والسلوكي: ماذا أفعل بعد أن فهمت هذا؟</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              خطوات والتزامات عملية يومية وأسرية قابلة للتطبيق الفوري
            </p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              {article.practicalApplications.map((app, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {(idx + 1).toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                    {renderText(app)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reflection & Discussion Questions */}
        {article.reflectionQuestions && article.reflectionQuestions.length > 0 && (
          <div className="my-10 p-6 rounded-3xl bg-stone-100/70 dark:bg-[#091522] border border-stone-200 dark:border-stone-800/80 text-right space-y-3">
            <h4 className="text-sm font-bold text-[#0b1b2b] dark:text-stone-200 font-['Cairo'] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
              <span>محاور تدبر وأسئلة للحوار الأسري والمدرسي:</span>
            </h4>
            <div className="space-y-2">
              {article.reflectionQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                  <span className="text-[#94762e] dark:text-[#dfc27e] font-bold">؟</span>
                  <span>{renderText(q)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concluding Du'a (Pillar 12) */}
        {article.dua && (
          <div className="my-10 p-6 rounded-3xl bg-amber-500/10 dark:bg-[#122438] border border-[#c8a962]/40 text-center space-y-3">
            <span className="text-xs font-bold text-[#94762e] dark:text-[#dfc27e] tracking-wider uppercase">
              دعاء ختامي مأثور
            </span>
            <p className="text-lg sm:text-xl font-serif text-[#0b1b2b] dark:text-[#dfc27e] leading-loose max-w-2xl mx-auto">
              « {renderText(article.dua)} »
            </p>
          </div>
        )}

        {/* References Section */}
        {article.references && article.references.length > 0 && (
          <div className="mt-8 p-5 rounded-2xl bg-stone-100/60 dark:bg-[#091522] border border-stone-200 dark:border-stone-800/80 text-right">
            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 font-['Cairo'] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e]" />
              <span>المصادر والمراجع المعتمدة:</span>
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
