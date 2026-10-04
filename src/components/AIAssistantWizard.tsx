import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  Users,
  Clock,
  Feather,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  AIGenerationParams,
  AIContentType,
  AIAudience,
  AILength,
  AIStyle,
  AIEvidenceLevel,
  AITashkeel,
  AIDetailLevel,
  GeneratedContentResult,
} from '../lib/ai/types';
import { generateIslamicContentAPI, getDailyUsage } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

interface AIAssistantWizardProps {
  initialTopic?: string;
  onGenerationComplete: (result: GeneratedContentResult, params: AIGenerationParams) => void;
  onNavigateHome: () => void;
  onOpenLogin: () => void;
}

const CONTENT_TYPES: { type: AIContentType; desc: string; icon: string }[] = [
  { type: 'خطبة جمعة', desc: 'هيكل متكامل للخطبتين الأولى والثانية مع الأدلة والأثر', icon: 'Scroll' },
  { type: 'خطبة عيد', desc: 'خطبة مبهجة تجمع معاني الفرح والشكر وصلة الرحم', icon: 'Calendar' },
  { type: 'موعظة', desc: 'كلمة وجدانية ترقق القلوب وتدعو للإنابة والتوبة', icon: 'Heart' },
  { type: 'درس', desc: 'طرح منهجي موثق يشرح مسألة شرعية أو يعلق على باب من العلم', icon: 'BookOpen' },
  { type: 'محاضرة', desc: 'معالجة فكرية أو دعوية موسعة تتناول ظاهرة أو موضوعاً بالتفصيل', icon: 'Layers' },
  { type: 'كلمة قصيرة', desc: 'خاطرة بين الصلوات أو في مجلس لا تتجاوز دقائق معدودة', icon: 'Clock' },
  { type: 'درس للأطفال', desc: 'أسلوب قصصي محبب يغرس القيم بالتشويق والأمثلة البسيطة', icon: 'Smile' },
  { type: 'مادة تربوية', desc: 'توجيه عملي يعالج سلوكيات الأبناء والأسرة بحكمة ورفق', icon: 'Users' },
  { type: 'مادة أسرية', desc: 'أدوات الحوار والتربية الإيجابية وحماية البيت المسلم', icon: 'Home' },
  { type: 'منشور دعوي', desc: 'نص مكثف جذاب بعبارات رصينة يناسب النشر الرقمي', icon: 'Share2' },
  { type: 'سيناريو فيديو', desc: 'سيناريو مرئي يصف المشاهد والتعليق الصوتي واللقطات', icon: 'Video' },
  { type: 'برنامج إيماني', desc: 'خطة متدرجة ومحاور مجدولة لبناء عادة أو موسم طاعة', icon: 'Compass' },
];

const AUDIENCES: { audience: AIAudience; desc: string }[] = [
  { audience: 'عامة المسلمين', desc: 'جمهور المسجد والمجالس العامة من مختلف الأعمار' },
  { audience: 'الشباب', desc: 'معالجة هواجس الهوية والشبهات والطموح بلغة قريبة منهم' },
  { audience: 'الأطفال', desc: 'تبسيط المفاهيم عبر حكايات وعبر مناسبة لسن الطفولة' },
  { audience: 'الآباء والأمهات', desc: 'معالجة التحديات الأسرية وفنون التعامل مع الأبناء' },
  { audience: 'المعلمون', desc: 'ربط المنهاج بالقيم التربوية والقدوة الصالحة داخل الصف' },
  { audience: 'الدعاة', desc: 'فقه البلاغ وفنون التأثير ومخاطبة الناس على قدر عقولهم' },
  { audience: 'طلاب العلم', desc: 'تأصيل شرعي دقيق مع عزو الأدلة وفهم المقاصد وأدب الخلاف' },
];

const LENGTHS: { length: AILength; label: string; desc: string; badge?: string }[] = [
  { length: 'شاملة', label: 'مادة شاملة وموسوعية', desc: 'استقصاء تام لأركان الموضوع وتطبيقاته (٣٥٠٠ - ٥٠٠٠ كلمة)', badge: 'الافتراضي والموصى به' },
  { length: 'متعمقة', label: 'مادة متعمقة ومستفيضة', desc: 'طرح مفصل وافٍ ومستقصٍ للأبعاد والأدلة (٢٥٠٠ - ٣٥٠٠ كلمة)' },
  { length: 'معيارية', label: 'مادة معيارية متوازنة', desc: 'طرح متماسك يجمع بين البيان والإيجاز الوافي (١٥٠٠ - ٢٢٠٠ كلمة)' },
  { length: 'موجزة', label: 'مادة موجزة ومركزة', desc: 'تركيز دقيق على لب الموضوع وجوهره (٨٠٠ - ١٢٠٠ كلمة)' },
  { length: 'بحثية', label: 'دراسة بحثية تأصيلية', desc: 'أوراق علمية وتأصيل مقارن وعزو موسع (٥٠٠٠ - ٨٠٠٠+ كلمة)' },
];

const TASHKEEL_OPTIONS: { value: AITashkeel; label: string; desc: string; badge?: string }[] = [
  { value: 'تشكيل كامل', label: 'تشكيل كامل (مضبوط بالشكل تاماً)', desc: 'ضبط إعرابي وصرفي دقيق للعناوين والفقرات والأدلة والخاتمة', badge: 'الافتراضي والموصى به' },
  { value: 'تشكيل جزئي', label: 'تشكيل جزئي', desc: 'ضبط أواخر الكلمات والآيات القرآنية والأحاديث والمواضع الدقيقة' },
  { value: 'بدون تشكيل', label: 'بدون تشكيل', desc: 'نصوص عربية فصيحة مجردة من علامات التشكيل' },
];

const DETAIL_LEVELS: { value: AIDetailLevel; label: string; desc: string; badge?: string }[] = [
  { value: 'متعمق', label: 'متعمق وشامل', desc: 'شرح مستفيض للأسباب، الآثار، وكيفية التطبيق في الواقع والسلوك', badge: 'الموصى به' },
  { value: 'بحثي', label: 'تأصيل بحثي محقق', desc: 'تأصيل شرعي ومقاصدي موسع مع عزو الأدلة وأقوال الأئمة المعتمدة' },
  { value: 'متوسط', label: 'طرح معتدل', desc: 'بيان متوازن ومباشر يجمع بين الدليل والشرح والتطبيق' },
  { value: 'مختصر', label: 'تركيز على الجوهر', desc: 'عرض سريع ومباشر للأفكار الرئيسية دون استطراد' },
];

const STYLES: { style: AIStyle; desc: string }[] = [
  { style: 'عربي واضح', desc: 'فصيح ميسر، بعيد عن التكلف ومناسب للجميع' },
  { style: 'عربي جزيل', desc: 'بلاغة عالية وألفاظ منتقاة للمنابر الكبرى' },
  { style: 'تربوي', desc: 'يركز على السلوك العملي وعلاج النفوس بالرفق' },
  { style: 'مؤثر', desc: 'يعتمد النبرة الوجدانية واستحضار عظمة الله والآخرة' },
  { style: 'قصصي', desc: 'يسرد العبر والمواقف الواقعية بأسلوب مشوق' },
  { style: 'أكاديمي', desc: 'منهجي مدقق بالتقسيمات والتعريفات والمراجع' },
  { style: 'مبسط', desc: 'سهل التناول للمبتدئين والناشئة' },
  { style: 'حواري', desc: 'يطرح التساؤلات ويجيب عنها بروح تشاركية' },
];

const TOPIC_SUGGESTIONS = [
  'تربية الأبناء على الصلاة ومحبة المسجد',
  'أثر الخشوع في الصلاة على سكينة النفس',
  'بر الوالدين عند الكبر وصور البر الخفية',
  'حفظ اللسان والابتعاد عن الغيبة في زمن وسائل التواصل',
  'فقه الرفق في التعامل النبوي مع المخطئين',
  'اليقين بالله وتفريج الكرب في أوقات الشدة',
];

export const AIAssistantWizard: React.FC<AIAssistantWizardProps> = ({
  initialTopic = '',
  onGenerationComplete,
  onNavigateHome,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [contentType, setContentType] = useState<AIContentType>('خطبة جمعة');
  const [audience, setAudience] = useState<AIAudience>('عامة المسلمين');
  const [topic, setTopic] = useState<string>(initialTopic || 'تربية الأبناء على الصلاة');
  const [length, setLength] = useState<AILength>('شاملة');
  const [tashkeel, setTashkeel] = useState<AITashkeel>('تشكيل كامل');
  const [detailLevel, setDetailLevel] = useState<AIDetailLevel>('متعمق');
  const [style, setStyle] = useState<AIStyle>('عربي واضح');
  const [evidenceLevel, setEvidenceLevel] = useState<AIEvidenceLevel>('موثق');
  const [includeReferences, setIncludeReferences] = useState(true);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Generation Loading State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState<'arranging' | 'building' | 'reviewing'>('arranging');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const usageInfo = getDailyUsage(user?.id);

  // Sync initial topic
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  // Stage animation during generation
  useEffect(() => {
    if (!isGenerating) return;
    const t1 = setTimeout(() => setProgressStage('building'), 2200);
    const t2 = setTimeout(() => setProgressStage('reviewing'), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isGenerating]);

  const handleStartGeneration = async () => {
    setErrorMessage(null);

    if (!topic.trim()) {
      setErrorMessage('يرجى تحديد موضوع المادة المراد إعدادها.');
      setCurrentStep(3);
      return;
    }

    const params: AIGenerationParams = {
      contentType,
      audience,
      topic: topic.trim(),
      length,
      style,
      evidenceLevel,
      tashkeel,
      detailLevel,
      includeReferences,
      additionalInstructions: additionalInstructions.trim() || undefined,
    };

    setIsGenerating(true);
    setProgressStage('arranging');

    try {
      const response = await generateIslamicContentAPI(params, user?.id);

      if (response.success && response.data) {
        onGenerationComplete(response.data, params);
      } else {
        setErrorMessage(response.error || 'حدث خطأ غير متوقع أثناء إعداد المادة. يرجى المحاولة ثانية.');
      }
    } catch (err: any) {
      setErrorMessage('تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
    } finally {
      setIsGenerating(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'النوع' },
    { num: 2, title: 'الجمهور' },
    { num: 3, title: 'الموضوع' },
    { num: 4, title: 'المدة' },
    { num: 5, title: 'الأسلوب' },
    { num: 6, title: 'التوثيق' },
    { num: 7, title: 'توجيهات' },
  ];

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/10 px-3.5 py-1.5 rounded-full border border-[#c8a962]/25 font-['Cairo']">
            <Sparkles className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
            <span>مساعد التحرير الذكي بالمنهج الشرعي</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-2">
            مساعد زاد الداعية
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400">
            حوّل فكرتك إلى مادة دعوية أو تربوية منظمة ومحررة بعناية.
          </p>

          {/* Usage Badge */}
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
            <span>استخدمت</span>
            <strong className="text-[#94762e] dark:text-[#dfc27e] font-bold">{usageInfo.used}</strong>
            <span>من</span>
            <strong>{usageInfo.limit}</strong>
            <span>محاولات اليوم</span>
          </div>
        </div>

        {/* Step Progress Indicator (Mobile & Desktop) */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
            {stepsList.map((s) => (
              <button
                key={s.num}
                onClick={() => !isGenerating && setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  currentStep === s.num
                    ? 'bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] shadow-xs'
                    : currentStep > s.num
                    ? 'bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e]'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-current font-bold">
                  {currentStep > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">تنبيه:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Form & Side Summary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
          {/* Main Wizard Form (2 Cols on Desktop) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0c1825] p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm min-h-[420px] flex flex-col justify-between">
            {/* Loading State Overlay */}
            {isGenerating ? (
              <div className="py-16 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full border-4 border-stone-200 dark:border-stone-800 border-t-[#c8a962] animate-spin" />
                  <Sparkles className="w-8 h-8 text-[#94762e] dark:text-[#dfc27e] absolute inset-0 m-auto animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white">
                    {progressStage === 'arranging' && 'نرتب الفكرة...'}
                    {progressStage === 'building' && 'نبني الهيكل والمحاور...'}
                    {progressStage === 'reviewing' && 'نراجع المادة ونستحضر الشواهد...'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                    نقوم بصياغة مادة «{contentType}» بأسلوب «{style}» موجهة لـ «{audience}»...
                  </p>
                </div>

                <div className="text-[11px] text-stone-400 bg-stone-50 dark:bg-[#08121d] py-2 px-4 rounded-xl max-w-sm mx-auto border border-stone-200 dark:border-stone-800">
                  يرجى الانتظار بضع ثوانٍ بينما يحرر النموذج المادة وفق المنهج الشرعي الرصين.
                </div>
              </div>
            ) : (
              <div>
                {/* STEP 1: CONTENT TYPE */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 1 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        ماذا تريد أن تصنع؟
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        اختر القالب الأنسب للمقام والمنبر الذي سيلقى فيه المحتوى.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {CONTENT_TYPES.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setContentType(item.type)}
                          className={`p-3.5 rounded-2xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                            contentType === item.type
                              ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#08121d]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm font-['Cairo']">{item.type}</span>
                            {contentType === item.type && (
                              <Check className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: AUDIENCE */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 2 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        لمن هذه المادة؟
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        تحديد الفئة المستهدفة يساعد في اختيار الألفاظ وضرب الأمثلة الملائمة لواقعهم.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {AUDIENCES.map((item) => (
                        <button
                          key={item.audience}
                          type="button"
                          onClick={() => setAudience(item.audience)}
                          className={`p-4 rounded-2xl text-right border transition-all cursor-pointer ${
                            audience === item.audience
                              ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#08121d]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm font-['Cairo']">{item.audience}</span>
                            {audience === item.audience && (
                              <Check className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                            )}
                          </div>
                          <span className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: TOPIC */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 3 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        ما الموضوع؟
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        اكتب القضية أو الفكرة التي تريد معالجتها بكلماتك التلقائية.
                      </p>
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="مثال: تربية الأبناء على الصلاة ومحبة بيوت الله في زمن الشاشات والمشتتات..."
                        className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-sm sm:text-base focus:ring-2 focus:ring-[#c8a962] focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-stone-500 block mb-2">أفكار ومواضيع مقترحة:</span>
                      <div className="flex flex-wrap gap-2">
                        {TOPIC_SUGGESTIONS.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTopic(sug)}
                            className="text-xs px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-[#c8a962] border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: LENGTH, TASHKEEL, & DETAIL */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 4 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        الحجم والتشكيل ومستوى التفصيل
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        الافتراضي هو مادة شاملة وموسوعية، مشكولة بالكامل بالحركات الإعرابية السليمة.
                      </p>
                    </div>

                    {/* 1. Length Selector */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                        حجم وطول المادة:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {LENGTHS.map((item) => (
                          <button
                            key={item.length}
                            type="button"
                            onClick={() => setLength(item.length)}
                            className={`p-4 rounded-2xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                              length === item.length
                                ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#08121d]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-bold text-sm font-['Cairo']">{item.label}</span>
                              {length === item.length && (
                                <Check className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e] shrink-0" />
                              )}
                            </div>
                            <span className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                              {item.desc}
                            </span>
                            {item.badge && (
                              <span className="mt-2 self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c8a962]/20 text-[#94762e] dark:text-[#dfc27e]">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Tashkeel Selector */}
                    <div className="space-y-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                      <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                        الضبط بالشكل والتشكيل اللغوي (Tashkeel):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {TASHKEEL_OPTIONS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setTashkeel(item.value)}
                            className={`p-3 rounded-xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                              tashkeel === item.value
                                ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#08121d]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-0.5">
                              <span className="font-bold text-xs font-['Cairo']">{item.label}</span>
                              {tashkeel === item.value && (
                                <Check className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e] shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 leading-normal">
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Detail Level Selector */}
                    <div className="space-y-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                      <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white">
                        مستوى التفصيل والعمق (Detail Level):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {DETAIL_LEVELS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setDetailLevel(item.value)}
                            className={`p-3 rounded-xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                              detailLevel === item.value
                                ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#08121d]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-0.5">
                              <span className="font-bold text-xs font-['Cairo']">{item.label}</span>
                              {detailLevel === item.value && (
                                <Check className="w-3.5 h-3.5 text-[#94762e] dark:text-[#dfc27e] shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 line-clamp-2">
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: STYLE */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 5 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        ما النمط والأسلوب المطلوب؟
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        درجة الفصاحة ونبرة الخطاب بحسب الموقف وروح المجلس.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {STYLES.map((item) => (
                        <button
                          key={item.style}
                          type="button"
                          onClick={() => setStyle(item.style)}
                          className={`p-4 rounded-2xl text-right border transition-all cursor-pointer ${
                            style === item.style
                              ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#08121d]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm font-['Cairo']">{item.style}</span>
                            {style === item.style && (
                              <Check className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                            )}
                          </div>
                          <span className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 6: EVIDENCE & CITATION */}
                {currentStep === 6 && (
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 6 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        ما مستوى التوثيق المطلوب؟
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        كثافة إيراد الآيات والأحاديث النبوية وعزوها المباشر.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(
                        [
                          { level: 'مختصر', desc: 'أدلة مركزة ومباشرة للخطب السريعة' },
                          { level: 'متوسط', desc: 'توازن بين الأدلة والشرح التربوي' },
                          { level: 'موثق', desc: 'استيفاء الشواهد مع ذكر السور والمصادر' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setEvidenceLevel(item.level)}
                          className={`p-4 rounded-2xl text-right border transition-all cursor-pointer ${
                            evidenceLevel === item.level
                              ? 'border-[#c8a962] bg-[#c8a962]/10 text-[#0b1b2b] dark:text-white ring-1 ring-[#c8a962]'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#08121d]'
                          }`}
                        >
                          <span className="font-bold text-sm block mb-1 font-['Cairo']">{item.level}</span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">{item.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeReferences}
                          onChange={(e) => setIncludeReferences(e.target.checked)}
                          className="w-4 h-4 rounded text-[#c8a962] accent-[#c8a962] focus:ring-0"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                          أريد قائمة المراجع والمصادر في نهاية المادة
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 7: ADDITIONAL INSTRUCTIONS */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] font-['Cairo']">
                        الخطوة 7 من 7
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-1">
                        هل لديك توجيهات إضافية؟ (اختياري)
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        اكتب أي ملاحظة خاصة تريد أن يراعيها المساعد الذكي أثناء التحرير.
                      </p>
                    </div>

                    <textarea
                      rows={5}
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="مثال: ركّز على التطبيقات الواقعية للأسر المعاصرة، واجعل المقدمة مؤثرة وانهِ المادة بدعاء جامع..."
                      className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-sm focus:ring-2 focus:ring-[#c8a962] focus:outline-none"
                    />

                    <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-[#08121d] border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e] shrink-0 mt-0.5" />
                      <span>
                        المساعد الذكي مدرب على المنهج الإسلامي الموثق، وسيقوم بوضع علامات تنبيه واضحة على أي نقل يتطلب مراجعة من الداعية.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Wizard Actions */}
            {!isGenerating && (
              <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs sm:text-sm cursor-pointer hover:bg-stone-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white"
                  >
                    إلغاء والعودة
                  </button>
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs sm:text-sm cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
                  >
                    <span>التالي</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartGeneration}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-sm cursor-pointer shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    <Sparkles className="w-4 h-4 text-[#dfc27e] dark:text-[#0b1b2b]" />
                    <span>إنشاء المادة الآن</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Live Summary Panel (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 space-y-5 text-right sticky top-24 shadow-xs">
            <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-[#94762e] dark:text-[#dfc27e] font-['Cairo'] block mb-1">
                ملخص إعدادات المادة
              </span>
              <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-white">
                المعالم المختارة
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block mb-0.5">نوع المادة:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{contentType}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">الجمهور:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{audience}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">الموضوع:</span>
                <span className="font-medium text-stone-800 dark:text-stone-200 line-clamp-2">
                  {topic || 'لم يُحدد بعد'}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">الحجم والطول:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{length}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">التشكيل والضبط:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{tashkeel}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">مستوى التفصيل:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{detailLevel}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">الأسلوب:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{style}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">مستوى التوثيق:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {evidenceLevel} {includeReferences ? '(مع قائمة المراجع)' : ''}
                </span>
              </div>
            </div>

            {/* Quick Action Button in Side Summary */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-3 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-transform disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#dfc27e] dark:text-[#0b1b2b]" />
                <span>توليد المادة الآن</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
