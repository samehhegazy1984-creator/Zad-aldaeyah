import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  Shield,
  Sparkles,
  Mail,
  Sliders,
  Loader2,
} from 'lucide-react';
import { PlatformSettings } from '../../types';
import { fetchPlatformSettings, updatePlatformSettings } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form State
  const [siteName, setSiteName] = useState('زاد الداعية');
  const [tagline, setTagline] = useState('من الفكرة إلى الكلمة النافعة');
  const [description, setDescription] = useState(
    'منصة رقمية متخصصة وموسوعة دعوية وتربوية شاملة لإعداد وتطوير المحتوى الإسلامي والخطب والمواعظ'
  );
  const [adminEmail, setAdminEmail] = useState('admin@zad-aldaiah.org');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [enableAiGeneration, setEnableAiGeneration] = useState(true);
  const [aiDailyLimit, setAiDailyLimit] = useState(10);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await fetchPlatformSettings();
        setSiteName(s.site_name || 'زاد الداعية');
        setTagline(s.tagline || 'من الفكرة إلى الكلمة النافعة');
        setDescription(s.site_description || '');
        setAdminEmail(s.admin_email || 'admin@zad-aldaiah.org');
        setAllowRegistration(s.allow_registration ?? true);
        setEnableAiGeneration(s.enable_ai_generation ?? true);
        setAiDailyLimit(s.ai_daily_limit || 10);
      } catch (e) {
        console.error('Settings load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    try {
      await updatePlatformSettings(
        {
          site_name: siteName,
          tagline,
          site_description: description,
          admin_email: adminEmail,
          allow_registration: allowRegistration,
          enable_ai_generation: enableAiGeneration,
          ai_daily_limit: Number(aiDailyLimit) || 10,
        },
        {
          id: profile?.id,
          name: profile?.full_name || 'المدير',
          role: 'admin',
        }
      );

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (e) {
      console.error('Settings save error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
        <span className="text-xs">جاري تحميل إعدادات المنصة...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
          إعدادات المنصة العامة (Platform Settings)
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          التحكم في هوية المنصة، سياسات التسجيل، وحدود التوليد بالذكاء الاصطناعي
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>تم حفظ وتطبيق إعدادات المنصة بنجاح في قاعدة البيانات</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Identity Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Sliders className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
            <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
              هوية الموقع والبيانات التعريفية
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                اسم المنصة
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                الشعار اللفظي (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
              الوصف العام للمنصة
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
            />
          </div>

          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
              بريد الاتصال الإداري
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
            />
          </div>
        </div>

        {/* AI & Registration Policies */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Sparkles className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
            <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
              سياسات التسجيل ومساعد الذكاء الاصطناعي
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-800 cursor-pointer">
              <div>
                <span className="font-bold block text-[#0b1b2b] dark:text-white">
                  السماح بتسجيل مستخدمين جدد
                </span>
                <span className="text-[11px] text-stone-400">
                  فتح التسجيل العام لإنشاء حسابات دعاة ومستخدمين جدد
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                className="w-4 h-4 text-[#c8a962] rounded focus:ring-[#c8a962]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-800 cursor-pointer">
              <div>
                <span className="font-bold block text-[#0b1b2b] dark:text-white">
                  تفعيل مساعد الذكاء الاصطناعي للعموم
                </span>
                <span className="text-[11px] text-stone-400">
                  تمكين المستخدمين من استخدام معالج صياغة الخطب والمواعظ
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableAiGeneration}
                onChange={(e) => setEnableAiGeneration(e.target.checked)}
                className="w-4 h-4 text-[#c8a962] rounded focus:ring-[#c8a962]"
              />
            </label>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                الحد اليومي لعمليات التوليد المجانية للمستخدم
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={aiDailyLimit}
                onChange={(e) => setAiDailyLimit(Number(e.target.value))}
                className="w-32 px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
