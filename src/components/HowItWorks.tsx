import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works-section" className="py-16 lg:py-24 bg-stone-100/60 dark:bg-[#09131e] border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#a98840] dark:text-[#dfc27e] tracking-wider uppercase font-['Cairo']">
            منهجية المنصة
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mt-2 mb-3">
            كيف تصنع مادتك في زاد الداعية؟
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            خطوات ميسرة تأخذك من مجرد فكرة تخطر في البال إلى مادة متكاملة تلامس العقول والقلوب.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div
              key={step.number}
              className={`p-6 rounded-2xl bg-white dark:bg-[#0c1825] border transition-all duration-200 relative flex flex-col justify-between ${
                step.isFuture
                  ? 'border-dashed border-[#c8a962]/40 bg-[#c8a962]/5 dark:bg-[#c8a962]/5'
                  : 'border-stone-200/90 dark:border-stone-800/90 shadow-xs hover:border-[#c8a962]/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl lg:text-3xl font-bold font-['Cairo'] text-[#a98840] dark:text-[#dfc27e] tabular-nums">
                    {step.number}
                  </span>
                  {step.isFuture && (
                    <span className="text-[10px] font-semibold text-[#a98840] dark:text-[#dfc27e] bg-[#c8a962]/10 px-2 py-0.5 rounded-full border border-[#c8a962]/20">
                      قريباً
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-400">
                <span>المرحلة {step.number}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
