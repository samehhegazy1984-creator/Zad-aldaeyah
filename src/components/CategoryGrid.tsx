import React from 'react';
import { CATEGORIES_DATA } from '../data/mockData';
import { IconRenderer } from './IconRenderer';

interface CategoryGridProps {
  onSelectCategory: (categoryName: string, categorySlug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  return (
    <section id="categories-section" className="py-16 lg:py-24 bg-stone-100/50 dark:bg-[#09131e] border-y border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#94762e] dark:text-[#dfc27e] tracking-wider uppercase font-['Cairo']">
            المسارات الموضوعية
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mt-2 mb-3">
            مجالات المعرفة الدعوية
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            تصفح المحتوى المصنف بدقة حسب الموضوع الشرعي والتربوي لتجد ما يثري خطبتك أو درسك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES_DATA.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name, cat.slug || cat.id)}
              className="group text-right p-4 rounded-xl bg-white dark:bg-[#0c1825] border border-stone-200/90 dark:border-stone-800/90 hover:border-[#c8a962]/70 dark:hover:border-[#c8a962]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-[#122438] text-[#94762e] dark:text-[#dfc27e] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconRenderer name={cat.iconName} className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium tabular-nums">
                    {cat.materialsCount} مادة
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-1.5 group-hover:text-[#94762e] dark:group-hover:text-[#dfc27e] transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-[#94762e] dark:text-[#dfc27e] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>تصفح المجال</span>
                <span>←</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
