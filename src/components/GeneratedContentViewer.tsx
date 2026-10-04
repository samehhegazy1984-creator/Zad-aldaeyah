import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Printer,
  Share2,
  Bookmark,
  Check,
  Send,
  RotateCcw,
  BookOpen,
  Clock,
  Users,
  Quote,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Lightbulb,
  FileText,
  HelpCircle,
  Scroll,
  HeartHandshake,
} from 'lucide-react';
import { GeneratedContentResult, AIGenerationParams, AIEditActionParams } from '../lib/ai/types';
import { editIslamicContentAPI, saveGeneratedMaterial } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';

interface GeneratedContentViewerProps {
  content: GeneratedContentResult;
  originalParams?: AIGenerationParams;
  onBackToWizard: () => void;
  onOpenMyMaterials: () => void;
  onOpenLogin: () => void;
}

export const GeneratedContentViewer: React.FC<GeneratedContentViewerProps> = ({
  content: initialContent,
  originalParams,
  onBackToWizard,
  onOpenMyMaterials,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState<GeneratedContentResult>(initialContent);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [showTashkeel, setShowTashkeel] = useState(true);
  const [isQualityScoreOpen, setIsQualityScoreOpen] = useState(false);

  const stripTashkeel = (text: string) => {
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

  const renderText = (text?: string) => {
    if (!text) return '';
    return showTashkeel ? text : stripTashkeel(text);
  };

  const calculateWordCount = () => {
    if (content.wordCount) return content.wordCount;
    const allText = `${content.title} ${content.introduction} ${content.sections.map((s) => s.heading + ' ' + s.content).join(' ')} ${content.conclusion} ${content.dua || ''}`;
    return allText.trim().split(/\s+/).filter(Boolean).length;
  };

  const wordCount = calculateWordCount();
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    await saveGeneratedMaterial(
      {
        contentType: content.contentType,
        topic: content.title,
        audience: content.audience,
        length: content.estimatedDuration,
        style: originalParams?.style || 'عربي واضح',
        evidenceLevel: originalParams?.evidenceLevel || 'موثق',
        instructions: originalParams?.additionalInstructions,
        result: content,
      },
      user.id
    );
    setIsSaved(true);
    showToast('تم حفظ المادة في «موادي» بنجاح');
  };

  const handleCopy = (withTashkeel = true) => {
    const formatPiece = (str?: string) => (str ? (withTashkeel ? str : stripTashkeel(str)) : '');

    let fullText = `${formatPiece(content.title)}\n`;
    if (content.subtitle) fullText += `${formatPiece(content.subtitle)}\n`;
    fullText += `نوع المادة: ${content.contentType} | الجمهور: ${content.audience} | المدة: ${content.estimatedDuration} | الكلمات: ~${wordCount}\n\n`;

    if (content.conceptDefinition) {
      fullText += `تحرير المفهوم:\n${formatPiece(content.conceptDefinition)}\n\n`;
    }

    fullText += `المقدمة:\n${formatPiece(content.introduction)}\n\n`;

    content.sections.forEach((sec, idx) => {
      fullText += `${idx + 1}. ${formatPiece(sec.heading)}\n`;
      if (sec.subheading) fullText += `(${formatPiece(sec.subheading)})\n`;
      fullText += `${formatPiece(sec.content)}\n\n`;

      if (sec.ayahs?.length) {
        sec.ayahs.forEach((a) => {
          fullText += `« ﴿ ${formatPiece(a.text)} ﴾ » [سورة ${a.surah}${a.number ? `: ${a.number}` : ''}]\n`;
          if (a.explanation) fullText += `  بيان الدلالة: ${formatPiece(a.explanation)}\n`;
        });
        fullText += '\n';
      }

      if (sec.hadiths?.length) {
        sec.hadiths.forEach((h) => {
          fullText += `حديث: « ${formatPiece(h.text)} » (${h.narrator ? h.narrator + ' - ' : ''}${h.source || ''})\n`;
          if (h.explanation) fullText += `  فقه الحديث: ${formatPiece(h.explanation)}\n`;
        });
        fullText += '\n';
      }

      if (sec.salafQuotes?.length) {
        sec.salafQuotes.forEach((sq) => {
          fullText += `أثر: « ${formatPiece(sq.statement)} » [${sq.scholar}${sq.source ? ` - ${sq.source}` : ''}]\n`;
        });
        fullText += '\n';
      }

      if (sec.propheticEvents?.length) {
        sec.propheticEvents.forEach((pe) => {
          fullText += `من السيرة: ${formatPiece(pe.incident)}\n  العبرة: ${formatPiece(pe.lesson)}\n`;
        });
        fullText += '\n';
      }
    });

    if (content.misconceptions?.length) {
      fullText += `معالجة المفاهيم الشائعة:\n`;
      content.misconceptions.forEach((m) => {
        fullText += `- الخطأ: ${formatPiece(m.claim)}\n  التصحيح: ${formatPiece(m.correction)}\n  الدليل: ${formatPiece(m.evidence || '')}\n\n`;
      });
    }

    if (content.practicalApplications?.length) {
      fullText += `الجانب العملي والتطبيقي:\n${content.practicalApplications.map((app) => `- ${formatPiece(app)}`).join('\n')}\n\n`;
    }

    if (content.reflectionQuestions?.length) {
      fullText += `أسئلة التدبر والنقاش:\n${content.reflectionQuestions.map((q) => `؟ ${formatPiece(q)}`).join('\n')}\n\n`;
    }

    if (content.conclusion) {
      fullText += `الخاتمة:\n${formatPiece(content.conclusion)}\n\n`;
    }

    if (content.dua) {
      fullText += `الدعاء:\n${formatPiece(content.dua)}\n\n`;
    }

    if (content.references?.length) {
      fullText += `المراجع:\n${content.references.join('\n')}\n\n`;
    }

    fullText += `منصة زاد الداعية: من الفكرة إلى الكلمة النافعة`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        showToast(withTashkeel ? 'تم نسخ المادة بالتشكيل التام' : 'تم نسخ المادة بدون تشكيل');
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: content.title,
          text: content.introduction,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopy(showTashkeel);
    }
  };

  const handleApplyAction = async (actionType: AIEditActionParams['actionType'], label: string) => {
    setIsEditing(true);
    setEditingAction(label);

    try {
      const response = await editIslamicContentAPI(
        {
          currentContent: content,
          instruction: '',
          actionType,
        },
        user?.id
      );

      if (response.success && response.data) {
        setContent(response.data);
        showToast(`تم تطبيق «${label}» بنجاح`);
      } else {
        showToast(response.error || 'تعذر تطبيق التعديل');
      }
    } catch (e) {
      showToast('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsEditing(false);
      setEditingAction(null);
    }
  };

  const handleCustomInstructionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isEditing) return;

    const userPrompt = customPrompt.trim();
    setCustomPrompt('');
    setIsEditing(true);
    setEditingAction(userPrompt);

    try {
      const response = await editIslamicContentAPI(
        {
          currentContent: content,
          instruction: userPrompt,
          actionType: 'custom',
        },
        user?.id
      );

      if (response.success && response.data) {
        setContent(response.data);
        showToast('تم تحديث المادة بنجاح');
      } else {
        showToast(response.error || 'تعذر تطبيق التعديل');
      }
    } catch (e) {
      showToast('حدث خطأ أثناء إجراء التعديل');
    } finally {
      setIsEditing(false);
      setEditingAction(null);
    }
  };

  const derivativeActions: { id: AIEditActionParams['actionType']; label: string }[] = [
    { id: 'convert_to_khutbah', label: 'تحويل إلى خطبة جمعة' },
    { id: 'convert_to_lesson', label: 'تحويل إلى درس علمي منهجي' },
    { id: 'convert_to_social_series', label: 'سلسلة منشورات دعوية' },
    { id: 'convert_to_post', label: 'منشور رقمي مكثف' },
    { id: 'convert_to_script', label: 'سيناريو فيديو مرئي' },
    { id: 'convert_to_discussion', label: 'أسئلة نقاش للحلقات' },
    { id: 'convert_to_family_activity', label: 'نشاط أسري تطبيقي' },
    { id: 'convert_to_action_plan', label: 'خطة عمل أسبوعية' },
  ];

  const editorialActions: { id: AIEditActionParams['actionType']; label: string }[] = [
    { id: 'add_ayahs', label: 'إضافة أدلة قرآنية' },
    { id: 'add_hadiths', label: 'إضافة أحاديث محققة' },
    { id: 'add_seerah', label: 'إضافة شواهد السيرة' },
    { id: 'expand_salaf', label: 'إضافة أقوال السلف' },
    { id: 'tashkeel_review', label: 'مراجعة وضبط التشكيل' },
    { id: 'linguistic_review', label: 'تدقيق لغوي ونحوي' },
    { id: 'sharia_review', label: 'مراجعة التوثيق الشرعي' },
    { id: 'expand', label: 'توسيع الشرح والتحليل' },
    { id: 'summarize', label: 'اختصار وتركيز' },
  ];

  const quality = content.qualityScore;

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 right-1/2 translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#dfc27e] dark:text-[#0b1b2b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between gap-4 mb-6 no-print">
          <button
            onClick={onBackToWizard}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-[#0b1b2b] dark:hover:text-white cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لإعداد مادة جديدة</span>
          </button>

          <button
            onClick={onOpenMyMaterials}
            className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer"
          >
            عرض جميع موادي المحفوظة ←
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            المحتوى مولَّد بالذكاء الاصطناعي، ويُنصح بمراجعته علميًّا ولغويًّا قبل النشر، ولا سيما الآيات والأحاديث والنقول.
          </span>
        </div>

        {/* Floating Actions Bar */}
        <div className="sticky top-20 z-30 mb-8 p-3.5 rounded-2xl bg-white/95 dark:bg-[#0c1825]/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] shadow-xs'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaved ? 'محفوظة في موادي' : 'حفظ المادة'}</span>
            </button>

            {/* Tashkeel Toggle Button */}
            <button
              onClick={() => setShowTashkeel(!showTashkeel)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showTashkeel
                  ? 'bg-[#c8a962]/20 border-[#c8a962] text-[#94762e] dark:text-[#dfc27e]'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/40'
              }`}
              title="تبديل إظهار أو إخفاء التشكيل"
            >
              <span>{showTashkeel ? 'التشكيل: مفعّل (مضبوط)' : 'عرض بدون تشكيل'}</span>
            </button>

            {/* Copy with Tashkeel */}
            <button
              onClick={() => handleCopy(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="نسخ مع التشكيل الكامل"
            >
              <Copy className="w-4 h-4" />
              <span>نسخ بالتشكيل</span>
            </button>

            {/* Copy Plain */}
            <button
              onClick={() => handleCopy(false)}
              className="hidden sm:inline-flex p-2 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold items-center gap-1.5 cursor-pointer"
              title="نسخ النص بدون تشكيل"
            >
              <span>نسخ مجرد</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="طباعة للمنبر"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={onBackToWizard}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 px-2 py-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة التوليد</span>
            </button>
          </div>
        </div>

        {/* Loading Overlay during Edit */}
        {isEditing && (
          <div className="mb-6 p-4 rounded-2xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>جارٍ تطبيق التحويل التحريري: «{editingAction}»...</span>
            </div>
          </div>
        )}

        {/* Quality Score Card */}
        {quality && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1825] border border-[#c8a962]/40 shadow-xs text-right">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e]">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base font-['Cairo'] text-[#0b1b2b] dark:text-white">
                      مؤشر الجودة التحريرية لمادة زاد الداعية
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      {quality.overall} / 10
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    تقييم تحريري غير إفتائي يقيس استيفاء الأركان الاثني عشر، الدقة اللغوية، وعمق التأصيل.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQualityScoreOpen(!isQualityScoreOpen)}
                className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{isQualityScoreOpen ? 'إخفاء التفاصيل' : 'عرض معايير التقييم العشرة'}</span>
                {isQualityScoreOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isQualityScoreOpen && (
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-in fade-in duration-200">
                {[
                  { label: 'عمق التناول', val: quality.depth },
                  { label: 'استيفاء الأركان', val: quality.completeness },
                  { label: 'التوثيق القرآني', val: quality.quranEvidence },
                  { label: 'السنة النبوية', val: quality.hadithEvidence },
                  { label: 'آثار السلف', val: quality.salafEvidence },
                  { label: 'التماسك الهيكلي', val: quality.structure },
                  { label: 'الفصاحة اللغوية', val: quality.arabicQuality },
                  { label: 'ضبط التشكيل', val: quality.tashkeelAccuracy },
                  { label: 'القيمة العملية', val: quality.practicalUsefulness },
                  { label: 'المعدل العام', val: quality.overall },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200/70 dark:border-stone-800 text-center"
                  >
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-[#0b1b2b] dark:text-[#dfc27e] font-mono">
                      {item.val} / 10
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated Material Body Card */}
        <article className="p-6 sm:p-10 lg:p-14 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-sm space-y-8">
          {/* Header Metadata */}
          <div className="border-b border-stone-200 dark:border-stone-800 pb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e]">
              <span className="bg-[#c8a962]/15 px-3 py-1 rounded-full border border-[#c8a962]/30">
                {content.contentType}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400 font-normal">
                <Users className="w-3.5 h-3.5" />
                <span>{content.audience}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400 font-normal">
                <Clock className="w-3.5 h-3.5" />
                <span>مدة القراءة: {readingTimeMinutes} دقيقة</span>
              </span>
              <span>·</span>
              <span className="bg-stone-100 dark:bg-stone-800/80 px-2.5 py-0.5 rounded-full text-[11px] text-stone-600 dark:text-stone-300 font-mono">
                ~{wordCount.toLocaleString('ar-SA')} كلمة (مادة متكاملة)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white leading-relaxed">
              {renderText(content.title)}
            </h1>

            {content.subtitle && (
              <p className="text-sm sm:text-base font-semibold text-[#94762e] dark:text-[#dfc27e] leading-normal font-['Cairo']">
                {renderText(content.subtitle)}
              </p>
            )}
          </div>

          {/* 1. Introduction */}
          {content.introduction && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold font-['Cairo'] text-[#94762e] dark:text-[#dfc27e] flex items-center gap-2">
                <Quote className="w-4 h-4" />
                <span>المقدمة والتمهيد</span>
              </h3>
              <p className="text-base sm:text-lg leading-[2.3] text-stone-800 dark:text-stone-200 font-['Tajawal'] text-justify">
                {renderText(content.introduction)}
              </p>
            </div>
          )}

          {/* 2. Concept Definition (تحرير مفهوم الموضوع) */}
          {content.conceptDefinition && (
            <div className="p-6 rounded-2xl bg-[#0b1b2b]/5 dark:bg-[#122438]/40 border-r-4 border-[#c8a962] space-y-2">
              <h3 className="font-bold text-sm sm:text-base font-['Cairo'] text-[#0b1b2b] dark:text-[#dfc27e] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                <span>تحرير مفهوم الموضوع لغةً واصطلاحاً ودفع اللبس:</span>
              </h3>
              <p className="text-base sm:text-lg leading-[2.2] text-stone-800 dark:text-stone-200 font-['Tajawal'] text-justify">
                {renderText(content.conceptDefinition)}
              </p>
            </div>
          )}

          {/* 3. Sections */}
          <div className="space-y-10 pt-4">
            {content.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="w-6 h-6 rounded-lg bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] text-xs font-bold flex items-center justify-center font-['Cairo']">
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                      {renderText(section.heading)}
                    </h2>
                    {section.subheading && (
                      <span className="text-xs text-stone-400 block font-normal">
                        {renderText(section.subheading)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-base sm:text-lg leading-[2.3] text-stone-800 dark:text-stone-200 font-['Tajawal'] text-justify whitespace-pre-line">
                  {renderText(section.content)}
                </p>

                {/* Ayah quotes if present */}
                {section.ayahs && section.ayahs.length > 0 && (
                  <div className="space-y-2">
                    {section.ayahs.map((ayah, aIdx) => (
                      <div
                        key={aIdx}
                        className="my-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-r-4 border-r-[#c8a962] border border-amber-200/50 dark:border-amber-900/40"
                      >
                        <p className="text-base sm:text-lg font-bold text-[#0b1b2b] dark:text-[#dfc27e] leading-relaxed">
                          « ﴿ {renderText(ayah.text)} ﴾ »
                        </p>
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-between">
                          <span>[سُورَةُ {renderText(ayah.surah)}{ayah.number ? `: الآيَةُ ${ayah.number}` : ''}]</span>
                        </div>
                        {ayah.explanation && (
                          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/40">
                            <strong>بيان وجه الدلالة والتفسير:</strong> {renderText(ayah.explanation)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hadith quotes if present */}
                {section.hadiths && section.hadiths.length > 0 && (
                  <div className="space-y-2">
                    {section.hadiths.map((hadith, hIdx) => (
                      <div
                        key={hIdx}
                        className="my-3 p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border-r-4 border-r-sky-600 dark:border-r-sky-500 border border-sky-200/50 dark:border-sky-900/40"
                      >
                        <p className="text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-semibold">
                          « {renderText(hadith.text)} »
                        </p>
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex flex-wrap gap-2">
                          {hadith.narrator && <span>الراوي: {renderText(hadith.narrator)}</span>}
                          {hadith.source && <span>المصدر: {renderText(hadith.source)}</span>}
                          {hadith.grade && <span className="text-sky-700 dark:text-sky-300 font-semibold">({renderText(hadith.grade)})</span>}
                        </div>
                        {hadith.explanation && (
                          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-2 pt-2 border-t border-sky-200/40 dark:border-sky-900/40">
                            <strong>فقه الحديث ومعناه:</strong> {renderText(hadith.explanation)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Salaf Quotes if present */}
                {section.salafQuotes && section.salafQuotes.length > 0 && (
                  <div className="space-y-2">
                    {section.salafQuotes.map((sq, sqIdx) => (
                      <div
                        key={sqIdx}
                        className="my-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border-r-4 border-r-emerald-600 dark:border-r-emerald-500 border border-emerald-200/50 dark:border-emerald-900/40"
                      >
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                          من درر وأقوال السلف والعلماء:
                        </span>
                        <p className="text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-relaxed">
                          « {renderText(sq.statement)} »
                        </p>
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 flex gap-2">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">— {renderText(sq.scholar)}</span>
                          {sq.source && <span>({renderText(sq.source)})</span>}
                          {sq.era && <span className="text-stone-400">[{renderText(sq.era)}]</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prophetic Events if present */}
                {section.propheticEvents && section.propheticEvents.length > 0 && (
                  <div className="space-y-2">
                    {section.propheticEvents.map((pe, peIdx) => (
                      <div
                        key={peIdx}
                        className="my-3 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border-r-4 border-r-purple-600 dark:border-r-purple-500 border border-purple-200/50 dark:border-purple-900/40"
                      >
                        <span className="text-xs font-bold text-purple-800 dark:text-purple-300 block mb-1">
                          شاهد من السيرة النبوية العطرة:
                        </span>
                        <p className="text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-semibold">
                          {renderText(pe.incident)}
                        </p>
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-2 pt-2 border-t border-purple-200/40 dark:border-purple-900/40">
                          <strong>العبرة التربوية والحكمة النبوية:</strong> {renderText(pe.lesson)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* 4. Misconceptions (معالجة الأخطاء والمفاهيم الشائعة) */}
          {content.misconceptions && content.misconceptions.length > 0 && (
            <div className="p-6 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-4">
              <h3 className="font-bold text-base font-['Cairo'] text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>معالجة المفاهيم الخاطئة والشائعة وتصحيحها:</span>
              </h3>
              <div className="space-y-3">
                {content.misconceptions.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#08121d] border border-rose-200/50 dark:border-rose-900/40 text-xs sm:text-sm space-y-1.5"
                  >
                    <div className="text-rose-700 dark:text-rose-300 font-bold">
                      <strong>الوهم الشائع:</strong> {renderText(m.claim)}
                    </div>
                    <div className="text-stone-800 dark:text-stone-200">
                      <strong>التصحيح الشرعي:</strong> {renderText(m.correction)}
                    </div>
                    {m.evidence && (
                      <div className="text-stone-500 dark:text-stone-400 text-xs">
                        <strong>الدليل:</strong> {renderText(m.evidence)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Practical Applications («ماذا أفعل بعد أن فهمت هذا؟») */}
          {content.practicalApplications && content.practicalApplications.length > 0 && (
            <div className="p-6 rounded-2xl bg-stone-100/70 dark:bg-[#08121d] border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>الجانب العملي والتطبيقي: «ماذا أفعل بعد أن فهمت هذا؟»</span>
              </h3>
              <ul className="space-y-2.5 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                {content.practicalApplications.map((app, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#94762e] dark:text-[#dfc27e] font-bold">•</span>
                    <span>{renderText(app)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Reflection Questions (أسئلة التدبر والنقاش) */}
          {content.reflectionQuestions && content.reflectionQuestions.length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-[#122438]/40 border border-amber-200/50 dark:border-amber-900/40 space-y-3">
              <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-[#dfc27e] flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#94762e] dark:text-[#dfc27e]" />
                <span>أسئلة ومحاور للتفكر والمدارسة الأسرية وحلقات العلم:</span>
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-stone-700 dark:text-stone-300">
                {content.reflectionQuestions.map((q, qIdx) => (
                  <li key={qIdx} className="flex items-start gap-2">
                    <span className="text-[#94762e] dark:text-[#dfc27e] font-bold">؟</span>
                    <span>{renderText(q)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7. Conclusion */}
          {content.conclusion && (
            <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-bold font-['Cairo'] text-[#94762e] dark:text-[#dfc27e]">
                الخاتمة وثمرة المادة
              </h3>
              <p className="text-base sm:text-lg leading-[2.3] text-stone-800 dark:text-stone-200 font-['Tajawal'] text-justify">
                {renderText(content.conclusion)}
              </p>
            </div>
          )}

          {/* 8. Dua */}
          {content.dua && (
            <div className="p-5 rounded-2xl bg-[#c8a962]/10 border border-[#c8a962]/30 space-y-2">
              <h3 className="text-xs font-bold font-['Cairo'] text-[#94762e] dark:text-[#dfc27e]">
                دعاء ختامي مأثور:
              </h3>
              <p className="text-base sm:text-lg leading-[2.2] text-[#0b1b2b] dark:text-[#dfc27e] font-bold">
                {renderText(content.dua)}
              </p>
            </div>
          )}

          {/* 9. References & Verification Notes */}
          {(content.references?.length > 0 || content.verificationNotes?.length > 0) && (
            <div className="pt-6 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 space-y-3">
              {content.references?.length > 0 && (
                <div>
                  <span className="font-bold block mb-1 text-stone-700 dark:text-stone-300">المصادر والمراجع:</span>
                  <div className="flex flex-wrap gap-2">
                    {content.references.map((ref, idx) => (
                      <span key={idx} className="bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {content.verificationNotes?.length > 0 && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                    تنبيهات المراجعة والتحقق:
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {content.verificationNotes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </article>

        {/* AI Multi-Product Transformation Actions Panel */}
        <div className="mt-8 p-6 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 no-print text-right">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#94762e] dark:text-[#dfc27e] font-['Cairo'] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>محرك تحويل المادة إلى منتجات دعوية متعددة (Material → Many Products)</span>
            </div>
            <h3 className="font-bold text-lg font-['Cairo'] text-[#0b1b2b] dark:text-white">
              اشتقاق منتجات جديدة وتعميق تحريري
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              انقر على أي خيار لتحويل أفكار هذا المقال إلى خطبة، درس، سيناريو، منشورات، أو خطة عمل، مع الحفاظ على الأمانة العلمية.
            </p>
          </div>

          {/* Group 1: Derivative Products */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              1. تحويل المادة إلى قوالب دعوية مشتقة:
            </span>
            <div className="flex flex-wrap gap-2">
              {derivativeActions.map((action) => (
                <button
                  key={action.id}
                  disabled={isEditing}
                  onClick={() => handleApplyAction(action.id, action.label)}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-[#08121d] hover:bg-[#c8a962]/15 hover:border-[#c8a962] text-xs font-semibold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: Editorial Refinements */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              2. الإثراء والتدقيق التحريري والشرعي:
            </span>
            <div className="flex flex-wrap gap-2">
              {editorialActions.map((action) => (
                <button
                  key={action.id}
                  disabled={isEditing}
                  onClick={() => handleApplyAction(action.id, action.label)}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-[#08121d] hover:bg-[#c8a962]/15 hover:border-[#c8a962] text-xs font-semibold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversational Custom Instruction Input */}
          <form onSubmit={handleCustomInstructionSubmit} className="pt-4 border-t border-stone-100 dark:border-stone-800">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              طلب تعديل أو إضافة مخصصة (مثال: «أضف أثر ابن مسعود في الخشوع»، «ركّز على تحديات الآباء في الهواتف»):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="اكتب التعديل المطلوب هنا..."
                disabled={isEditing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a962]"
              />
              <button
                type="submit"
                disabled={isEditing || !customPrompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <span>تعديل</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
