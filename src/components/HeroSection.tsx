import React, { useState } from 'react';
import { ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

interface HeroSectionProps {
  onStartCreation: (topic: string) => void;
  onBrowseLibrary: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartCreation,
  onBrowseLibrary,
}) => {
  const [promptText, setPromptText] = useState('');

  const suggestionChips = [
    'الصبر',
    'الصلاة',
    'تربية الأبناء',
    'بر الوالدين',
    'تزكية النفس',
    'الشباب',
    'الأسرة',
    'رمضان',
  ];

  const handleChipClick = (chip: string) => {
    const fullTopic = `أريد مادة تربوية وعلمية عن ${chip}`;
    setPromptText(fullTopic);
    onStartCreation(fullTopic);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      onStartCreation(promptText.trim());
    } else {
      onStartCreation('تربية الأبناء على الصلاة');
    }
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#f6f1e8] via-[#faf7f2] to-stone-50 dark:from-[#0b1b2b] dark:via-[#0f243a] dark:to-[#070e17] text-[#0b1b2b] dark:text-stone-100 transition-colors duration-200">
      {/* Decorative Islamic geometric lattice background overlay */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-40 pointer-events-none" />

      {/* Atmospheric lighting glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c8a962]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Subtle Islamic platform kicker */}
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold tracking-wide text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/15 dark:bg-[#c8a962]/10 px-3.5 py-1.5 rounded-full border border-[#c8a962]/30 dark:border-[#c8a962]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8a962] dark:bg-[#dfc27e] animate-pulse" />
            <span>من الفكرة إلى الكلمة النافعة</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-[#0b1b2b] dark:text-white mb-6 leading-[1.25]">
            كلمتك النافعة <span className="text-[#a98840] dark:text-[#dfc27e]">تبدأ من هنا</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-stone-600 dark:text-stone-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            أفكار، خطب، دروس، مواعظ، ومواد تربوية... منصة واحدة تساعدك على الوصول إلى المعنى وصياغة الأثر.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => onStartCreation(promptText || 'تربية الأبناء على الصلاة')}
              className="px-6 py-3 text-sm sm:text-base font-semibold text-[#0b1b2b] bg-[#dfc27e] hover:bg-[#edd497] dark:bg-[#dfc27e] dark:hover:bg-[#edd497] rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>ابدأ الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onBrowseLibrary}
              className="px-6 py-3 text-sm sm:text-base font-medium text-[#0b1b2b] dark:text-stone-200 hover:text-black dark:hover:text-white bg-white hover:bg-stone-100 dark:bg-white/5 dark:hover:bg-white/10 border border-stone-300 dark:border-white/15 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-[#a98840] dark:text-[#dfc27e]" />
              <span>تصفح المكتبة</span>
            </button>
          </div>

          {/* AI-Style Prompt Box */}
          <div className="bg-white/95 dark:bg-[#0b1b2b]/90 backdrop-blur-xl border border-stone-200 dark:border-[#c8a962]/30 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl max-w-2xl mx-auto text-right text-stone-800 dark:text-stone-200 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-3">
              <label
                htmlFor="hero-prompt-input"
                className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#a98840] dark:text-[#dfc27e]" />
                  <span>ما الذي تريد أن تصنع اليوم؟</span>
                </span>
                <span className="text-[11px] text-[#a98840] dark:text-[#dfc27e]/80">مساعد إعداد المادة</span>
              </label>

              <div className="relative flex flex-col sm:flex-row items-center gap-2">
                <input
                  id="hero-prompt-input"
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="مثال: أريد خطبة عن تربية الأبناء في زمن الفتن"
                  className="w-full bg-stone-50 dark:bg-[#122438]/80 text-[#0b1b2b] dark:text-white placeholder-stone-400 text-sm sm:text-base px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700/80 focus:border-[#c8a962] dark:focus:border-[#dfc27e] focus:outline-none focus:ring-1 focus:ring-[#c8a962] dark:focus:ring-[#dfc27e] transition-colors"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#0b1b2b] text-white hover:bg-[#152e4a] dark:bg-[#c8a962] dark:hover:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                >
                  ابدأ
                </button>
              </div>
            </form>

            {/* Suggestion Chips */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800/80 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-stone-500 dark:text-stone-400 ml-1">مقترحات:</span>
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#c8a962]/15 text-stone-700 hover:text-[#0b1b2b] border border-stone-200 hover:border-[#c8a962]/40 dark:bg-stone-800/70 dark:hover:bg-[#c8a962]/20 dark:text-stone-300 dark:hover:text-[#dfc27e] dark:border-stone-700/50 dark:hover:border-[#c8a962]/40 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Abstract Visual Representation: "الفكرة → العلم → الكلمة → الأثر" */}
        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-stone-800/60 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs tracking-wider uppercase text-[#a98840] dark:text-[#dfc27e]/90 font-semibold font-['Cairo']">
              مسار صناعة الكلمة في المنصة
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            {/* 1. الفكرة */}
            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-stone-200/90 dark:border-white/10 backdrop-blur-sm flex flex-col items-center group hover:border-[#c8a962]/40 shadow-xs transition-all">
              <div className="w-10 h-10 rounded-full bg-[#c8a962]/15 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-2.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#0b1b2b] dark:text-white text-sm mb-1 font-['Cairo']">الفكرة</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                خاطرة في الصدر تلامس حاجة الواقع
              </p>
            </div>

            {/* 2. العلم */}
            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-stone-200/90 dark:border-white/10 backdrop-blur-sm flex flex-col items-center group hover:border-[#c8a962]/40 shadow-xs transition-all">
              <div className="w-10 h-10 rounded-full bg-[#c8a962]/15 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-2.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#0b1b2b] dark:text-white text-sm mb-1 font-['Cairo']">العلم</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                تأصيل الآيات والأحاديث وفقه المقاصد
              </p>
            </div>

            {/* 3. الكلمة */}
            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-stone-200/90 dark:border-white/10 backdrop-blur-sm flex flex-col items-center group hover:border-[#c8a962]/40 shadow-xs transition-all">
              <div className="w-10 h-10 rounded-full bg-[#c8a962]/15 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-2.5">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#0b1b2b] dark:text-white text-sm mb-1 font-['Cairo']">الكلمة</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                صياغة رصينة ومؤثرة تناسب المقام
              </p>
            </div>

            {/* 4. الأثر */}
            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-stone-200/90 dark:border-white/10 backdrop-blur-sm flex flex-col items-center group hover:border-[#c8a962]/40 shadow-xs transition-all">
              <div className="w-10 h-10 rounded-full bg-[#c8a962]/15 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-2.5">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#0b1b2b] dark:text-white text-sm mb-1 font-['Cairo']">الأثر</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                سكينة في القلوب وصلاح في الأفعال
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
