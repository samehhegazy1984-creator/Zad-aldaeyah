import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_DATA } from '../data/mockData';

export const FAQAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0].id);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-16 lg:py-24 bg-stone-100/50 dark:bg-[#09131e] border-y border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold text-[#a98840] dark:text-[#dfc27e] font-['Cairo']">
            <HelpCircle className="w-4 h-4" />
            <span>إجابات واضحة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-3">
            الأسئلة الشائعة
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            كل ما يهمك معرفته حول رسالة منصة زاد الداعية وكيفية الاستفادة من محتواها وأدواتها.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full text-right px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a962]"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100">
                    {item.question}
                  </span>
                  <div
                    className={`p-1 rounded-md text-stone-400 dark:text-stone-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#c8a962]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
