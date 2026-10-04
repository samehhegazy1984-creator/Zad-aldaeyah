import React, { useState } from 'react';
import { Sparkles, Copy, Check, BookOpen, Layers, ShieldCheck, Clock, Users, FileText } from 'lucide-react';

interface AIAssistantPreviewProps {
  initialTopic?: string;
  onOpenFullAssistant?: (topic: string) => void;
}

export const AIAssistantPreview: React.FC<AIAssistantPreviewProps> = ({
  initialTopic = 'تربية الأبناء على الصلاة',
  onOpenFullAssistant,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState('الآباء والأمهات');
  const [contentType, setContentType] = useState('مجلس تربوي');
  const [duration, setDuration] = useState('20 دقيقة');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(true);
  const [copied, setCopied] = useState(false);

  // Sync if initialTopic changes
  React.useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 700);
  };

  const handleCopy = () => {
    const textToCopy = `المادة المقترحة: ${topic}
الجمهور: ${audience}
النوع: ${contentType}
المدة: ${duration}

[المقدمة]:
الحمد لله الذي جعل الصلاة صلة بين العبد وربه، وقرة عين للمؤمنين. نبدأ بتأصيل معنى محبة الصلاة قبل فرضيتها في نفوس الناشئة.

[المحور الأول: القدوة الصامتة]:
يرى الطفل صلاة والديه قبل أن يسمع أوامرهما. استحضار الخشوع والبهجة بقدوم وقت الصلاة.

[المحور الثاني: التدرج النبوي]:
«مروهم بالصلاة لسبع» ثلاث سنوات من التدريب باللين والتشجيع وبدون عقاب.

[المحور الثالث: ربط الصلاة بالاستعانة والسكينة]:
تعليم الصغير أن الصلاة ليست عبئاً، بل هي ملاذ إذا حزبه أمر أو رغب في حاجة من ربه.

[الخاتمة والدعاء]:
﴿رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ﴾.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="assistant-section" className="py-16 lg:py-24 bg-gradient-to-b from-stone-100 via-[#f8f5ee] to-stone-100 dark:from-[#070e17] dark:via-[#0b1b2b] dark:to-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/15 dark:bg-[#c8a962]/10 px-3.5 py-1.5 rounded-full border border-[#c8a962]/30 dark:border-[#c8a962]/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>المساعد الذكي لإعداد المادة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white tracking-tight mb-3">
            لا تبدأ من صفحة بيضاء
          </h2>
          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
            أدخل فكرتك، وحدد جمهورك، ودع المساعد يعينك على ترتيب المعنى وبناء المادة.
          </p>
        </div>

        {/* Mock Interface Container */}
        <div className="max-w-4xl mx-auto bg-white/95 dark:bg-[#0c1825]/90 border border-stone-200 dark:border-[#c8a962]/35 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-md transition-colors">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-stone-100/90 dark:bg-[#08121d] border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="mr-2 text-stone-700 dark:text-stone-300 font-medium">محرر صناعة المادة الشرعية والتربوية</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#a98840] dark:text-[#dfc27e] text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>محاكاة المرحلة الأولى</span>
            </div>
          </div>

          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls Column (Form) */}
            <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-4">
              {/* الموضوع */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
                  <span>الموضوع:</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-[#0b1b2b] dark:text-white text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-[#c8a962] dark:focus:border-[#dfc27e] focus:outline-none focus:ring-1 focus:ring-[#c8a962] dark:focus:ring-[#dfc27e] transition-colors"
                  placeholder="الموضوع الرئيسي"
                />
              </div>

              {/* الجمهور */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
                  <span>الجمهور المستهدف:</span>
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-[#0b1b2b] dark:text-white text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-[#c8a962] dark:focus:border-[#dfc27e] focus:outline-none focus:ring-1 focus:ring-[#c8a962] dark:focus:ring-[#dfc27e] transition-colors cursor-pointer"
                >
                  <option value="الآباء والأمهات">الآباء والأمهات</option>
                  <option value="المصلون يوم الجمعة">المصلون يوم الجمعة</option>
                  <option value="الشباب الجامعي">الشباب الجامعي</option>
                  <option value="طلاب الحلقات والمدارس">طلاب الحلقات والمدارس</option>
                  <option value="عامة الناس والمجتمع">عامة الناس والمجتمع</option>
                </select>
              </div>

              {/* نوع المادة */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
                  <span>نوع المادة:</span>
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-[#0b1b2b] dark:text-white text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-[#c8a962] dark:focus:border-[#dfc27e] focus:outline-none focus:ring-1 focus:ring-[#c8a962] dark:focus:ring-[#dfc27e] transition-colors cursor-pointer"
                >
                  <option value="مجلس تربوي">مجلس تربوي</option>
                  <option value="خطبة جمعة">خطبة جمعة</option>
                  <option value="موعظة قلبية">موعظة قلبية</option>
                  <option value="درس علمي">درس علمي</option>
                  <option value="سيناريو مرئي قصير">سيناريو مرئي قصير</option>
                </select>
              </div>

              {/* المدة */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#a98840] dark:text-[#dfc27e]" />
                  <span>المدة المقترحة:</span>
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#122438] text-[#0b1b2b] dark:text-white text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-[#c8a962] dark:focus:border-[#dfc27e] focus:outline-none focus:ring-1 focus:ring-[#c8a962] dark:focus:ring-[#dfc27e] transition-colors cursor-pointer"
                >
                  <option value="20 دقيقة">20 دقيقة</option>
                  <option value="10 دقائق">10 دقائق</option>
                  <option value="15 دقيقة">15 دقيقة</option>
                  <option value="30 دقيقة">30 دقيقة</option>
                  <option value="5 دقائق (كلمة سريعة)">5 دقائق (كلمة سريعة)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-[#0b1b2b] hover:bg-[#152e4a] text-white dark:bg-[#c8a962] dark:hover:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4 hover:scale-[1.01]"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>جاري ترتيب المحاور والأدلة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#dfc27e]" />
                    <span>إنشاء المادة</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated Mock Preview Output Column */}
            <div className="lg:col-span-7 bg-stone-50/80 dark:bg-[#08121d] rounded-xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-1.5 text-[#94762e] dark:text-[#dfc27e] font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>هيكل المادة المقترح: {topic}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer p-1"
                    title="نسخ الهيكل"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>

                {hasGenerated && (
                  <div className="space-y-3.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                    {/* المقدمة */}
                    <div className="p-3 rounded-lg bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 shadow-xs">
                      <span className="font-bold text-[#94762e] dark:text-[#dfc27e] block mb-1 font-['Cairo']">
                        المقدمة والمدخل الوجداني:
                      </span>
                      <p className="text-stone-600 dark:text-stone-300">
                        الحديث عن الصلاة كواحة أمان وحصن نفسي للطفل، وليس مجرد تكليف شاق. أهمية القدوة الصامتة في البيت.
                      </p>
                    </div>

                    {/* الأدلة الموصى بها */}
                    <div className="p-3 rounded-lg bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 shadow-xs">
                      <span className="font-bold text-[#94762e] dark:text-[#dfc27e] block mb-1 font-['Cairo']">
                        الأدلة المقترحة:
                      </span>
                      <p className="text-stone-600 dark:text-stone-300">
                        • ﴿وَأْمُرْ أَهْلَكَ بِالصَّلَاةِ وَاصْطَبِرْ عَلَيْهَا﴾ [طه: 132]
                        <br />
                        • حديث: «مُرُوا أَوْلَادَكُمْ بِالصَّلَاةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ...» [أبو داود]
                      </p>
                    </div>

                    {/* المحاور الثلاثة */}
                    <div className="p-3 rounded-lg bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 shadow-xs">
                      <span className="font-bold text-[#94762e] dark:text-[#dfc27e] block mb-1 font-['Cairo']">
                        محاور الطرح (خلال {duration}):
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-1">
                        <li>مرحلة التحبيب والتشويق (من عمر 4 إلى 7 سنوات).</li>
                        <li>مرحلة التدريب والمواظبة الإيجابية (من 7 إلى 10 سنوات).</li>
                        <li>بناء وازع المراقبة الذاتية والخشوع لدى اليافعين.</li>
                      </ol>
                    </div>

                    {/* الخاتمة والتطبيق */}
                    <div className="p-3 rounded-lg bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 shadow-xs">
                      <span className="font-bold text-[#94762e] dark:text-[#dfc27e] block mb-1 font-['Cairo']">
                        التطبيق العملي للأسرة:
                      </span>
                      <p className="text-stone-600 dark:text-stone-300">
                        تخصيص زاوية صلاة مريحة ومبهجة في البيت، وجعل صلاة المغرب أو العشاء جماعة أسرية تجمع القلوب.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>* نموذج أولي يوضح تسلسل توليد المادة للمرحلة الحالية.</span>
                {onOpenFullAssistant && (
                  <button
                    type="button"
                    onClick={() => onOpenFullAssistant(topic)}
                    className="font-bold text-xs text-[#94762e] dark:text-[#dfc27e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>فتح معالج المساعد الذكي الكامل (الخطوات الـ 7)</span>
                    <span>←</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
