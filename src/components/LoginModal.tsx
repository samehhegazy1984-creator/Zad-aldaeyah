import React, { useState } from 'react';
import { X, User, CheckCircle2, Shield, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onToggleLogin,
}) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-stone-50 dark:bg-[#0c1825] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 text-right">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#0b1b2b] dark:bg-[#122438] border border-[#c8a962]/40 text-[#dfc27e] flex items-center justify-center mb-4">
          <User className="w-6 h-6" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-stone-100 mb-2">
          {isLoggedIn ? 'حسابك في زاد الداعية' : 'تسجيل الدخول للمنصة'}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
          {isLoggedIn
            ? 'أنت مسجل حالياً كباحث وخطيب تجريبي. كافة المواد المحفوظة متاحة على جهازك.'
            : 'في المرحلة الأولى، يمكنك تصفح كافة المواد وحفظها في مفضلتك محلياً بحرية تامة دون تسجيل إلزامي.'}
        </p>

        {isLoggedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-[#0b1b2b] dark:text-stone-100">
                  د. عبد الله المنصور
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  خطيب جامع وباحث في الدراسات التربوية
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleLogin();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-sm font-semibold transition-colors cursor-pointer"
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onToggleLogin();
              onClose();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                البريد الإلكتروني:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white dark:bg-[#122438] text-stone-900 dark:text-white text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-[#dfc27e]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#c8a962]/10 border border-[#c8a962]/20 text-xs text-stone-700 dark:text-stone-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#a98840] dark:text-[#dfc27e]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ميزات الحساب في المرحلة القادمة:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-stone-500 dark:text-stone-400 pr-1">
                <li>المزامنة السحابية للمسودات والمحفوظات.</li>
                <li>تخصيص جدول خطب الجمعة السنوي.</li>
                <li>توليد غير محدود بالذكاء الاصطناعي الشرعي.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#0b1b2b] hover:bg-[#152e4a] text-white dark:bg-[#dfc27e] dark:hover:bg-[#edd497] dark:text-[#0b1b2b] font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>دخول تجريبي للمنصة</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
