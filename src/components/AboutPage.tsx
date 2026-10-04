import React from 'react';
import { BookOpen, Shield, Heart, Sparkles, Compass, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  onBrowseLibrary: () => void;
  onStartAssistant: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBrowseLibrary,
  onStartAssistant,
}) => {
  return (
    <div className="min-h-screen py-10 lg:py-16 bg-stone-50 dark:bg-[#070e17] text-stone-900 dark:text-stone-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3 text-xs font-semibold text-[#a98840] dark:text-[#dfc27e] bg-[#c8a962]/10 px-3.5 py-1.5 rounded-full border border-[#c8a962]/25 font-['Cairo']">
            <Compass className="w-3.5 h-3.5" />
            <span>الرسالة والرؤية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-4">
            عن زاد الداعية
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
            من الفكرة إلى الكلمة النافعة... منصة تعين كل صاحب رسالة على بلورة فكرته وترتيب دليله وصياغة أثره.
          </p>
        </div>

        {/* Narrative & Purpose */}
        <div className="space-y-8 text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c8a962]" />
              <span>لماذا زاد الداعية؟</span>
            </h2>
            <p>
              يواجه الخطيب والداعية والمعلم والمربي اليوم تحدياً متصاعداً: تسارع وتيرة الحياة، تشتت الانتباه، وتنوع المنصات وتغير لغة الجيل الجديد. لم تعد المشكلة في ندرة المعلومة؛ فالمكتبات الإسلامية عامرة بنفائس التراث، وإنما التحدي الحقيقي في: <strong>كيف نحول هذه المعرفة الأصيلة إلى كلمة نافعة مؤصلة ومرتبة تناسب المقام والجمهور والوقت المتاح؟</strong>
            </p>
            <p>
              انطلقت فكرة «زاد الداعية» لتكون رفيقاً ذكياً ومعيناً منهجياً يزيل رهبة «الصفحة البيضاء»، ويقترح الهياكل العلمية والتربوية المتقنة، ويوثق الأدلة، ليتفرغ الداعية للإلقاء المؤثر وحضور القلب وبث الروح في كلمته.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-[#c8a962]/10 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-1.5">
                الأصالة المنهجية
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                الاعتماد على مصادر أهل السنة والجماعة، والقرآن وتفاسيره المعتبرة، والأحاديث الصحيحة والحسنة المحررة.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-[#c8a962]/10 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-1.5">
                الرفق والتربية
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                تقديم البشارة قبل النذارة، والتحبيب بالدين والرحمة بالخلق، ومعالجة قضايا الأسرة بروح المودة والإصلاح.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-[#c8a962]/10 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-1.5">
                العصرية والابتكار
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                توظيف أدوات العصر الحديث لتسهيل الإعداد والبحث والتصنيف، دون إخلال بجلال المعنى وقداسة النص.
              </p>
            </div>
          </div>

          {/* Legal / Authority Disclaimer */}
          <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-[#182330] border border-amber-200/80 dark:border-amber-900/40 text-stone-800 dark:text-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm sm:text-base font-['Cairo']">
              <AlertTriangle className="w-5 h-5" />
              <span>تنويه شرعي وقانوني هام:</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              منصة «زاد الداعية» هي منصة مساندة للإعداد المعرفي وصياغة المواد التربوية والمجتمعية، وليست دار إفتاء رسمية ولا تصدر فتاوى شرعية ملزمة في النوازل الفردية أو القضايا السياسية والقضائية. للمسائل الفقهية الخاصة والفتاوى يُرجى الرجوع للجهات الإفتائية المعتمدة في بلادكم.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onBrowseLibrary}
              className="px-6 py-3 rounded-xl bg-[#0b1b2b] text-white hover:bg-[#152e4a] dark:bg-[#dfc27e] dark:text-[#0b1b2b] dark:hover:bg-[#edd497] font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>استكشف مكتبة المعرفة</span>
            </button>
            <button
              onClick={onStartAssistant}
              className="px-6 py-3 rounded-xl bg-white dark:bg-[#0c1825] border border-stone-300 dark:border-stone-700 hover:border-[#c8a962] text-stone-800 dark:text-stone-200 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#a98840] dark:text-[#dfc27e]" />
              <span>جرّب المساعد الذكي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
