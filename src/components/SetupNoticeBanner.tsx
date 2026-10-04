import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Key, Database, X } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase/client';

export const SetupNoticeBanner: React.FC = () => {
  const [serverConfig, setServerConfig] = useState<{
    hasGeminiKey: boolean;
    hasSupabase: boolean;
    hasSupabaseUrl?: boolean;
    hasSupabaseAnonKey?: boolean;
    supabaseUrl?: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setServerConfig({
          hasGeminiKey: Boolean(data.hasGeminiKey),
          hasSupabase: Boolean(data.hasSupabase || isSupabaseConfigured),
          hasSupabaseUrl: Boolean(data.hasSupabaseUrl),
          hasSupabaseAnonKey: Boolean(data.hasSupabaseAnonKey),
          supabaseUrl: data.supabaseUrl,
        });
      })
      .catch(() => {
        setServerConfig({
          hasGeminiKey: false,
          hasSupabase: isSupabaseConfigured,
        });
      });
  }, []);

  if (isDismissed || !serverConfig) return null;

  const hasAll = serverConfig.hasGeminiKey && serverConfig.hasSupabase;
  if (hasAll) return null; // Fully configured, no banner needed!

  return (
    <aside aria-label="حالة تهيئة البيئة البرمجية" className="bg-amber-500/15 border-b border-amber-500/30 text-[#0b1b2b] dark:text-amber-200 text-xs py-2.5 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold">حالة تهيئة البيئة البرمجية (المرحلة 3):</span>
          <span className="text-stone-600 dark:text-stone-300">
            {!serverConfig.hasGeminiKey && !serverConfig.hasSupabase
              ? 'مفتاح GEMINI_API_KEY وبيانات SUPABASE بحاجة إلى الضبط في ملف البيئة.'
              : !serverConfig.hasGeminiKey
              ? 'مساعد الذكاء الاصطناعي يتطلب إضافة GEMINI_API_KEY في البيئة.'
              : 'قاعدة بيانات Supabase تعمل حالياً في نمط المعاينة المحلي (Local Storage).'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 font-bold text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer"
          >
            <span>{isOpen ? 'إخفاء التفاصيل' : 'عرض المتغيرات المطلوبة'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-white"
            title="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-500/20 text-xs space-y-2">
          <p className="leading-relaxed">
            لتفعيل التكامل السحابي الحقيقي للذكاء الاصطناعي وقاعدة البيانات، قم بإضافة المتغيرات التالية في ملف <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.env</code> أو في لوحة الإعدادات:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] dir-ltr text-left">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1825] border border-amber-500/20 flex items-center justify-between">
              <span>GEMINI_API_KEY</span>
              {serverConfig.hasGeminiKey ? (
                <span className="text-emerald-600 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> مهيأ
                </span>
              ) : (
                <span className="text-rose-500 font-sans font-bold">مفقود (مطلوب للذكاء الاصطناعي)</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1825] border border-amber-500/20 flex items-center justify-between">
              <span>SUPABASE_URL</span>
              {serverConfig.hasSupabaseUrl ? (
                <span className="text-emerald-600 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> تم الربط ({serverConfig.supabaseUrl?.slice(8, 26)}...)
                </span>
              ) : (
                <span className="text-amber-600 font-sans font-bold">اختياري</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c1825] border border-amber-500/20 flex items-center justify-between">
              <span>SUPABASE_ANON_KEY</span>
              {serverConfig.hasSupabaseAnonKey ? (
                <span className="text-emerald-600 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> مهيأ
                </span>
              ) : (
                <span className="text-amber-600 font-sans font-bold">بانتظار المفتاح (Anon Public Key)</span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            * تم بناء كافة مسارات المعالجة والـ Schema والـ RLS ونماذج البيانات بنجاح، ولن يتعطل التطبيق في حال عدم توفرها.
          </p>
        </div>
      )}
    </aside>
  );
};
