import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check, Settings } from 'lucide-react';
import { useTheme, ThemePreference } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
  align?: 'left' | 'right';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  align = 'left',
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const options: { id: ThemePreference; label: string; icon: React.ReactNode; hint: string }[] = [
    {
      id: 'light',
      label: 'الوضع الفاتح',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      hint: 'ألوان عاجية مريحة للمطالعة',
    },
    {
      id: 'dark',
      label: 'الوضع الليلي',
      icon: <Moon className="w-4 h-4 text-[#c8a962]" />,
      hint: 'كحلي داكن عميق وسكينة',
    },
    {
      id: 'system',
      label: 'حسب إعداد الجهاز',
      icon: <Laptop className="w-4 h-4 text-stone-500 dark:text-stone-400" />,
      hint: 'يتوافق تلقائياً مع نظامك',
    },
  ];

  const handleSelect = (selectedTheme: ThemePreference) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  // Determine current active trigger icon
  const renderTriggerIcon = () => {
    if (theme === 'system') {
      return (
        <div className="relative">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-[#dfc27e]" />
          ) : (
            <Sun className="w-4 h-4 text-[#a98840]" />
          )}
          <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[#c8a962] ring-1 ring-white dark:ring-[#070e17]" title="تلقائي حسب الجهاز" />
        </div>
      );
    }
    if (theme === 'dark') {
      return <Moon className="w-4 h-4 text-[#dfc27e]" />;
    }
    return <Sun className="w-4 h-4 text-[#a98840]" />;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="تغيير المظهر"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a962] ${
          isOpen
            ? 'bg-stone-200 dark:bg-stone-800 text-[#0b1b2b] dark:text-[#dfc27e]'
            : 'text-stone-600 dark:text-stone-300 hover:text-[#0b1b2b] dark:hover:text-[#dfc27e] hover:bg-stone-100 dark:hover:bg-stone-800/80'
        }`}
        title="تغيير المظهر (فاتح / ليلي / تلقائي)"
      >
        {renderTriggerIcon()}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute top-full mt-2 w-64 bg-white dark:bg-[#0c1825] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-50 p-2 text-right transition-all duration-150 animate-in fade-in zoom-in-95 origin-top-left ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {/* Header Title */}
          <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span className="font-['Cairo'] text-[#0b1b2b] dark:text-stone-200 font-bold">المظهر</span>
            <span className="text-[11px] text-stone-400">
              {theme === 'system' ? 'تلقائي' : theme === 'dark' ? 'ليلي' : 'فاتح'}
            </span>
          </div>

          {/* Options List */}
          <div className="py-1 space-y-1">
            {options.map((option) => {
              const isSelected = theme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer group text-right ${
                    isSelected
                      ? 'bg-stone-100 dark:bg-[#122438] text-[#0b1b2b] dark:text-[#dfc27e] font-bold shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0 p-1 rounded-lg bg-stone-100 dark:bg-stone-800/80 group-hover:scale-105 transition-transform">
                      {option.icon}
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="font-['Cairo']">{option.label}</span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                        {option.hint}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#a98840] dark:text-[#dfc27e] shrink-0 mr-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
