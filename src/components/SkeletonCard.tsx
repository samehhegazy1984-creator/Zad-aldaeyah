import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1825] border border-stone-200/80 dark:border-stone-800/80 animate-pulse space-y-4 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-4 w-14 bg-stone-200 dark:bg-stone-800 rounded-md" />
        </div>
        <div className="h-6 w-6 bg-stone-200 dark:bg-stone-800 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-4 w-full bg-stone-100 dark:bg-stone-800/60 rounded-md" />
        <div className="h-4 w-5/6 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
      </div>

      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <div className="h-4 w-28 bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded-md" />
      </div>
    </div>
  );
};
