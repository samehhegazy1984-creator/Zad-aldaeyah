import React from 'react';
import { AUDIENCES_DATA } from '../data/mockData';
import { IconRenderer } from './IconRenderer';
import { TargetAudienceType } from '../types';

interface AudiencesSectionProps {
  onSelectAudience: (audience: TargetAudienceType) => void;
}

export const AudiencesSection: React.FC<AudiencesSectionProps> = ({ onSelectAudience }) => {
  return (
    <section className="py-16 lg:py-24 bg-stone-50 dark:bg-[#070e17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#a98840] dark:text-[#dfc27e] tracking-wider uppercase font-['Cairo']">
            الفئات المستفيدة
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mt-2 mb-3">
            صُممت لمن يحمل كلمة نافعة
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            تراعي المنصة خصوصية كل دور ومسؤولية؛ فحديث المنبر غير حوار الأسرة، ودرس الصغار غير محتوى الشبكات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {AUDIENCES_DATA.map((audience) => (
            <button
              key={audience.id}
              onClick={() => onSelectAudience(audience.title)}
              className="text-right p-4 rounded-xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 hover:border-[#c8a962]/70 dark:hover:border-[#c8a962]/60 hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0b1b2b] dark:bg-[#122438] text-[#dfc27e] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <IconRenderer name={audience.iconName} className="w-5 h-5" />
                </div>

                <h3 className="font-bold text-sm sm:text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-1.5 group-hover:text-[#a98840] dark:group-hover:text-[#dfc27e] transition-colors">
                  {audience.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {audience.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-[#a98840] dark:text-[#dfc27e] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>تصفح المواد ←</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
