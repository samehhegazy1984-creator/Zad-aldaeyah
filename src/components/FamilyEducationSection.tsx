import React from 'react';
import { FAMILY_EDUCATION_CARDS } from '../data/mockData';
import { Home, School, Landmark, Users, Share2 } from 'lucide-react';

interface FamilyEducationSectionProps {
  onExploreChannel: (place: string) => void;
}

export const FamilyEducationSection: React.FC<FamilyEducationSectionProps> = ({ onExploreChannel }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'mosque':
        return <Landmark className="w-5 h-5" />;
      case 'school':
        return <School className="w-5 h-5" />;
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'family-circle':
        return <Users className="w-5 h-5" />;
      case 'social-media':
        return <Share2 className="w-5 h-5" />;
      default:
        return <Landmark className="w-5 h-5" />;
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-stone-50 dark:bg-[#070e17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#a98840] dark:text-[#dfc27e] tracking-wider uppercase font-['Cairo']">
            شريان التأثير المتعدد
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mt-2 mb-3">
            الكلمة النافعة لا تقف عند المنبر
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            صُممت مواد زاد الداعية لتمتد إلى كل ميدان يحتاج إلى تذكير وتربية؛ من محراب المسجد إلى مائدة العائلة وشاشات التواصل.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {FAMILY_EDUCATION_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => onExploreChannel(card.place)}
              className="p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 hover:border-[#c8a962]/70 dark:hover:border-[#c8a962]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#c8a962]/10 text-[#a98840] dark:text-[#dfc27e] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {getIcon(card.id)}
                </div>

                <div className="text-[11px] font-semibold text-[#a98840] dark:text-[#dfc27e] mb-1">
                  {card.badge}
                </div>

                <h3 className="font-bold text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-2">
                  {card.place}
                </h3>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>تصفح المواد</span>
                <span className="group-hover:translate-x-[-3px] transition-transform text-[#a98840] dark:text-[#dfc27e]">←</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
