import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateHome,
  onLoginSuccess,
}) => {
  const { signIn, resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (isResetMode) {
      if (!email.trim()) {
        setErrorMsg('يرجى إدخال البريد الإلكتروني لإرسال رابط الاستعادة.');
        setLoading(false);
        return;
      }
      const res = await resetPassword(email.trim());
      if (res.error) {
        setErrorMsg(res.error.message || 'تعذر إرسال رابط الاستعادة. تأكد من صحة البريد.');
      } else {
        setResetSuccess(true);
      }
      setLoading(false);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة.');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMsg(
        error.message?.includes('Invalid login')
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
          : error.message || 'حدث خطأ أثناء تسجيل الدخول.'
      );
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#0c1825] p-8 sm:p-10 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl text-right">
        {/* Header */}
        <div className="text-center space-y-2">
          {/* Logo Mark */}
          <div className="w-12 h-12 rounded-2xl bg-[#0b1b2b] dark:bg-[#122438] border border-[#c8a962]/40 flex items-center justify-center text-[#c8a962] mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-['Cairo'] text-[#0b1b2b] dark:text-white mt-3">
            مرحبًا بك في زاد الداعية
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            سجّل دخولك لحفظ موادك ومتابعة ما أنشأته.
          </p>
        </div>

        {/* Supabase status notice if offline / guest */}
        {!isConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            💡 التطبيق يعمل في وضع المعاينة الآمن. يمكنك الدخول ببريدك الإلكتروني مباشرة للتجربة.
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Reset Password Success message */}
        {resetSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 font-['Cairo']">
              البريد الإلكتروني:
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 pr-10 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a962]"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {!isResetMode && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 font-['Cairo']">
                  كلمة المرور:
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-xs text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-stone-50 dark:bg-[#08121d] border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a962]"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0b1b2b] text-white dark:bg-[#dfc27e] dark:text-[#0b1b2b] font-bold text-sm shadow-md hover:scale-[1.01] transition-transform disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? 'جارٍ التحقق...'
                : isResetMode
                ? 'إرسال رابط الاستعادة'
                : 'دخول'}
            </button>
          </div>

          {isResetMode && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setResetSuccess(false);
                }}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white"
              >
                ← العودة إلى تسجيل الدخول
              </button>
            </div>
          )}
        </form>

        {/* Toggle to Register */}
        <div className="text-center pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
          <span>ليس لديك حساب بعد؟ </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-bold text-[#94762e] dark:text-[#dfc27e] hover:underline cursor-pointer"
          >
            إنشاء حساب
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            تصفح كزائر
          </button>
        </div>
      </div>
    </div>
  );
};
