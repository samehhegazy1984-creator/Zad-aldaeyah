import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onStartNow: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartNow }) => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-r from-[#f2ece2] via-[#faf7f0] to-[#ece5d8] dark:from-[#0b1b2b] dark:via-[#12283e] dark:to-[#070e17] text-[#0b1b2b] dark:text-white transition-colors duration-200 border-t border-stone-200/80 dark:border-transparent">
      {/* Subtle Islamic pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-25 pointer-events-none" />

      {/* Warm Gold Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#c8a962]/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] bg-[#c8a962]/20 dark:bg-[#c8a962]/15 px-3.5 py-1.5 rounded-full border border-[#c8a962]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>زادك للمعنى والأثر</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mb-4 tracking-tight">
          فكرة في ذهنك؟
        </h2>

        <p className="text-base sm:text-lg lg:text-xl text-stone-600 dark:text-stone-300 mb-8 max-w-xl mx-auto leading-relaxed">
          ابدأ بها اليوم، وحوّلها إلى كلمة نافعة.
        </p>

        <button
          onClick={onStartNow}
          className="px-8 py-3.5 text-base font-bold text-white bg-[#0b1b2b] hover:bg-[#152e4a] dark:text-[#0b1b2b] dark:bg-[#dfc27e] dark:hover:bg-[#edd497] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02]"
        >
          <span>ابدأ الآن</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
