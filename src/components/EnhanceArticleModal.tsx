import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Check,
  Layers,
  Feather,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Compass,
  FileText,
} from 'lucide-react';
import { Content } from '../types';
import {
  AIEnhanceArticleParams,
  GeneratedContentResult,
  AILength,
  AIDetailLevel,
  AITashkeel,
  AIEvidenceLevel,
  AIAudience,
} from '../lib/ai/types';
import { enhanceArticleAPI } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

interface EnhanceArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Content;
  onEnhanceComplete: (result: GeneratedContentResult) => void;
}

export const EnhanceArticleModal: React.FC<EnhanceArticleModalProps> = ({
  isOpen,
  onClose,
  article,
  onEnhanceComplete,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'expand_enrich' | 'rewrite_deepen'>('expand_enrich');
  const [length, setLength] = useState<AILength>('شاملة');
  const [tashkeel, setTashkeel] = useState<AITashkeel>('تشكيل كامل');
  const [evidenceLevel, setEvidenceLevel] = useState<AIEvidenceLevel>('توثيق موسع');
  const [targetAudience, setTargetAudience] = useState<AIAudience>('عامة المسلمين');
  const [customInstructions, setCustomInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<
    'analyzing' | 'evidence_map' | 'seerah_salaf' | 'deep_writing' | 'linguistic_review'
  >('analyzing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cycling stages animation during AI generation
  useEffect(() => {
    if (!isLoading) return;
    const t1 = setTimeout(() => setStage('evidence_map'), 2400);
    const t2 = setTimeout(() => setStage('seerah_salaf'), 5200);
    const t3 = setTimeout(() => setStage('deep_writing'), 8400);
    const t4 = setTimeout(() => setStage('linguistic_review'), 12000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isLoading]);

  if (!isOpen) return null;

  const handleStartEnhance = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setStage('analyzing');

    try {
      const params: AIEnhanceArticleParams = {
        originalArticle: {
          id: article.id,
          title: article.title,
          category: article.category,
          contentType: article.contentType,
          audience: article.audience,
          description: article.description,
          content: article.content,
          references: article.references,
          ayahQuotes: article.ayahQuotes,
          hadithQuotes: article.hadithQuotes,
        },
        mode,
        length,
        detailLevel: 'شامل',
        tashkeel,
        evidenceLevel,
        targetAudience,
        customInstructions: customInstructions.trim() || undefined,
      };

      const response = await enhanceArticleAPI(params, user?.id);

      if (response.success && response.data) {
        onClose();
        onEnhanceComplete(response.data);
      } else {
        setErrorMessage(response.error || 'حدث خطأ أثناء تطوير المقال. يرجى المحاولة ثانية.');
      }
    } catch (err: any) {
      setErrorMessage('تعذر الاتصال بخادم الذكاء الاصطناعي. يرجى التحقق من الاتصال.');
    } finally {
      setIsLoading(false);
    }
  };

  const stageMessages = {
    analyzing: 'تحليل متن المقال الأصلي وتحديد الأبعاد المعرفية المفقودة...',
    evidence_map: 'رسم خريطة التأصيل القرآني والأحاديث النبوية المحققة...',
    seerah_salaf: 'إثراء المحتوى بشواهد السيرة النبوية العطرة ومواقف السلف الصالح...',
    deep_writing: 'صياغة الشروح المتعمقة ومعالجة المفاهيم والجانب العملي السلوكي...',
    linguistic_review: 'المراجعة اللغوية النحوية، وضبط التشكيل الكامل، وحساب مؤشر الجودة...',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c1825] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden transition-all text-right">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                تطوير وتوسيع المقال بالذكاء الاصطناعي
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              ترقية المقال الحالي إلى المعيار الموسوعي والتأصيلي لمنصة زاد الداعية (الأركان الـ 12 والتشكيل الكامل).
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Article Under Development Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#08121d] border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-bold text-[#94762e] dark:text-[#dfc27e] block mb-1">
              المقال الأصلي المراد تطويره:
            </span>
            <h3 className="font-bold text-base text-[#0b1b2b] dark:text-white mb-1 font-['Cairo']">
              {article.title}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>التصنيف: {article.category}</span>
              <span>·</span>
              <span>الجمهور الحالي: {article.audience}</span>
              <span>·</span>
              <span>الحجم الحالي: ~{article.content.join(' ').split(/\s+/).length} كلمة</span>
            </div>
          </div>

          {/* Loading Animation Overlay */}
          {isLoading ? (
            <div className="py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-stone-200 dark:border-stone-800 border-t-[#c8a962] animate-spin" />
                <Sparkles className="w-8 h-8 text-[#94762e] dark:text-[#dfc27e] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                  جارٍ تطوير وتعميق المقال وفق الأركان الاثني عشر...
                </h4>
                <p className="text-xs sm:text-sm text-[#94762e] dark:text-[#dfc27e] font-semibold min-h-[24px]">
                  {stageMessages[stage]}
                </p>
                <p className="text-xs text-stone-400">
                  قد يستغرق إعداد المادة الموسوعية وضبط التشكيل الكامل بضع ثوانٍ.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Development Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white font-['Cairo']">
                  نمط التطوير التحريري:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('expand_enrich')}
                    className={`p-4 rounded-2xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                      mode === 'expand_enrich'
                        ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#08121d]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs sm:text-sm font-['Cairo']">
                        توسيع المقال وإثراؤه بالأدلة
                      </span>
                      {mode === 'expand_enrich' && (
                        <Check className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e] shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      الحفاظ على نسق المقال الأصلي وتوسيعه بأضعاف حجمه عبر إضافة الآيات والحديث ومواقف السيرة وتطبيقات السلوك.
                    </span>
                    <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e] self-start">
                      الخيار الأنسب للمقالات الحالية
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('rewrite_deepen')}
                    className={`p-4 rounded-2xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                      mode === 'rewrite_deepen'
                        ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#08121d]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs sm:text-sm font-['Cairo']">
                        إعادة صياغة وتعميق شامل
                      </span>
                      {mode === 'rewrite_deepen' && (
                        <Check className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e] shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      إعادة بناء المادة بالكامل من الأساس لتكون دراسة موسوعية مستوفية للأركان الاثني عشر مع التشكيل التام.
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Target Length */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white font-['Cairo']">
                  الحجم والعمق المستهدف:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { val: 'شاملة' as const, label: 'شاملة وموسوعية', words: '٣٥٠٠ - ٥٠٠٠ كلمة', badge: 'الموصى به' },
                    { val: 'بحثية' as const, label: 'بحثية موسعة', words: '٥٠٠٠ - ٨٠٠٠+ كلمة' },
                    { val: 'متعمقة' as const, label: 'متعمقة ومفصلة', words: '٢٥٠٠ - ٣٥٠٠ كلمة' },
                    { val: 'معيارية' as const, label: 'معيارية متوازنة', words: '١٥٠٠ - ٢٢٠٠ كلمة' },
                    { val: 'موجزة' as const, label: 'موجزة ومركزة', words: '٨٠٠ - ١٢٠٠ كلمة' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setLength(item.val)}
                      className={`p-3 rounded-2xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                        length === item.val
                          ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#08121d]'
                      }`}
                    >
                      <span className="font-bold text-xs font-['Cairo']">{item.label}</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">{item.words}</span>
                      {item.badge && (
                        <span className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e] self-start">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tashkeel & Evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                    الضبط بالشكل والتشكيل:
                  </label>
                  <select
                    value={tashkeel}
                    onChange={(e) => setTashkeel(e.target.value as AITashkeel)}
                    className="w-full p-3 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:ring-2 focus:ring-[#c8a962]"
                  >
                    <option value="تشكيل كامل">تشكيل كامل (مضبوط بالشكل تاماً - الافتراضي)</option>
                    <option value="تشكيل جزئي">تشكيل جزئي (أواخر الكلمات والأدلة)</option>
                    <option value="بدون تشكيل">بدون تشكيل (نص فصيح غير مشكول)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                    مستوى التوثيق الشرعي:
                  </label>
                  <select
                    value={evidenceLevel}
                    onChange={(e) => setEvidenceLevel(e.target.value as AIEvidenceLevel)}
                    className="w-full p-3 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:ring-2 focus:ring-[#c8a962]"
                  >
                    <option value="توثيق موسع">توثيق موسع (قرآن بالسورة والرقم + حديث بالتخريج + سلف وسيرة)</option>
                    <option value="توثيق قوي">توثيق قوي (قرآن وأحاديث صحيحة)</option>
                    <option value="توثيق أساسي">توثيق أساسي</option>
                  </select>
                </div>
              </div>

              {/* 4. Target Audience */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                  الجمهور المستهدف:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'عامة المسلمين',
                    'الآباء والأمهات',
                    'المعلمون والمربون',
                    'الشباب',
                    'طلاب العلم',
                    'الدعاة',
                    'الباحثون',
                  ].map((aud) => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => setTargetAudience(aud as AIAudience)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        targetAudience === aud
                          ? 'border-[#c8a962] bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e]'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Custom Instructions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                  توجيهات خاصة للتطوير (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="مثال: ركّز على الأثر في الأسرة المعاصرة، وأبرز قول ابن القيم في الصبر..."
                  className="w-full p-3 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-xs focus:ring-2 focus:ring-[#c8a962]"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isLoading && (
          <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-[#08121d]/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleStartEnhance}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#dfc27e] dark:text-[#0b1b2b]" />
              <span>بدء تطوير المقال الآن</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
