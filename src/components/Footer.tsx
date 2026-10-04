import React from 'react';
import { ActivePage } from '../types';

interface FooterProps {
  onNavigate: (page: ActivePage, sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#f0ebe1] dark:bg-[#050b12] text-stone-700 dark:text-stone-300 border-t border-stone-300/80 dark:border-stone-800/80 pt-16 pb-24 lg:pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 mb-12">
          {/* Col 1: Brand & Logo */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#0b1b2b] dark:bg-[#122438] border border-[#c8a962]/40 flex items-center justify-center text-[#c8a962]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" transform="rotate(45 12 12)" stroke="currentColor" fill="rgba(200, 169, 98, 0.15)" />
                  <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-[#0b1b2b] dark:text-white font-['Cairo']">
                  زاد الداعية
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  من الفكرة إلى الكلمة النافعة
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4 max-w-sm">
              منصة معرفية إسلامية حديثة تعين الخطباء والدعاة والمربين والآباء وصناع المحتوى على صياغة المحتوى النافع بإتقان وسكينة وأصالة.
            </p>
            <div className="text-xs text-[#94762e] dark:text-[#dfc27e] font-semibold">
              «بَلِّغُوا عَنِّي وَلَوْ آيَةً»
            </div>
          </div>

          {/* Col 2: المكتبة */}
          <div>
            <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-white font-['Cairo'] mb-4">المكتبة</h4>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('library')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  خطب الجمعة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('library')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  المواعظ والرقائق
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('library')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  الدروس العلمية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('library')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  المواد التربوية
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: المساعد الذكي */}
          <div>
            <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-white font-['Cairo'] mb-4">المساعد الذكي</h4>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('home', 'assistant-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  توليد هيكل الخطبة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'assistant-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  المجالس التربوية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'assistant-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  خواطر سريعة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'assistant-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  سيناريوهات مرئية
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: المجالات */}
          <div>
            <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-white font-['Cairo'] mb-4">المجالات</h4>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('home', 'categories-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  الإيمان والعقيدة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'categories-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  القرآن الكريم
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'categories-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  الأسرة والتربية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'categories-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  تزكية النفس
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: عن المنصة */}
          <div>
            <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-white font-['Cairo'] mb-4">عن المنصة</h4>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  الرسالة والرؤية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'how-it-works-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  كيف تعمل المنصة؟
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  الضوابط الشرعية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  سياسة المحتوى
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right font-bold text-[#94762e] dark:text-[#dfc27e]"
                >
                  لوحة التحكم الإدارية (Admin)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 6: الأسئلة الشائعة وتواصل معنا */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-white font-['Cairo'] mb-4">الأسئلة والدعم</h4>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('home', 'faq-section')}
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors cursor-pointer text-right"
                >
                  الأسئلة الشائعة
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@zadaldaia.com"
                  className="hover:text-[#a98840] dark:hover:text-[#dfc27e] transition-colors block"
                >
                  تواصل معنا
                </a>
              </li>
              <li>
                <span className="text-[11px] text-stone-500">
                  نسخة تجريبية أولى - 1448 هـ
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-300/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div>
            جميع الحقوق محفوظة © زاد الداعية {new Date().getFullYear()} م
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>منصة معرفية مخصصة للتحضير والإعداد</span>
            <span aria-hidden="true">·</span>
            <span>ليست جهة إفتاء رسمي</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
