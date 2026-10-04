import React from 'react';

export const StatisticsStrip: React.FC = () => {
  const stats = [
    { value: '+1,500', label: 'مادة علمية موثقة' },
    { value: '+500', label: 'موضوع وفكرة تربوية' },
    { value: '+20', label: 'مجالاً تخصصياً ودعوياً' },
    { value: '+10,000', label: 'مستفيد مستهدف بالمرحلة الأولى' },
  ];

  return (
    <section className="bg-stone-100/80 dark:bg-[#0b1b2b]/60 border-y border-stone-200/90 dark:border-stone-800/90 py-8 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-200 dark:divide-stone-800">
          {stats.map((stat, idx) => (
            <div key={idx} className={`flex flex-col items-center justify-center ${idx > 0 ? 'pt-4 md:pt-0' : ''}`}>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-[#dfc27e] tabular-nums tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            * إحصاءات تجريبية مستهدفة لمرحلة الإطلاق الأولي للمنصة
          </span>
        </div>
      </div>
    </section>
  );
};
