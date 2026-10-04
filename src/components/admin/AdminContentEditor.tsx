import React, { useState, useEffect } from 'react';
import {
  Save,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Globe,
  Tag,
  Clock,
  User,
  FolderTree,
  FileText,
  CheckCircle,
  Eye,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from 'lucide-react';
import { Content, CategoryEnum, ContentTypeEnum, AudienceEnum, Category } from '../../types';
import {
  createAdminContent,
  updateAdminContent,
  fetchAdminContentById,
  fetchAllAdminCategories,
  requestAdminAIAssist,
} from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

interface AdminContentEditorProps {
  contentId?: string; // If provided, we are editing; otherwise creating new
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const AdminContentEditor: React.FC<AdminContentEditorProps> = ({
  contentId,
  onBack,
  onSaveSuccess,
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(Boolean(contentId));
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentTypeEnum>('مادة تربوية');
  const [category, setCategory] = useState<CategoryEnum>('الإيمان والعقيدة');
  const [audience, setAudience] = useState<AudienceEnum>('الجميع');
  const [readingTime, setReadingTime] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'under_review' | 'published' | 'archived'>('published');
  const [paragraphs, setParagraphs] = useState<string[]>(['']);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['دعوة', 'تربية']);

  // SEO Fields
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');

  // AI Assistant in Editor
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate slug automatically from title if slug not manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!contentId) {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug || `article-${Date.now()}`);
    }
  };

  useEffect(() => {
    async function init() {
      // 1. Load categories
      const cats = await fetchAllAdminCategories();
      setCategories(cats);

      // 2. If editing, load content
      if (contentId) {
        setLoading(true);
        const item = await fetchAdminContentById(contentId);
        if (item) {
          setTitle(item.title);
          setSlug(item.slug);
          setDescription(item.description || '');
          setContentType(item.contentType);
          setCategory(item.category);
          setAudience(item.audience);
          setReadingTime(item.readingTime || 5);
          setFeatured(Boolean(item.featured));
          setStatus(item.status || 'published');
          setParagraphs(item.content && item.content.length > 0 ? item.content : ['']);
          setTags(item.tags || []);
          setSeoTitle(item.seoTitle || item.title);
          setSeoDescription(item.seoDescription || item.description || '');
          setCanonicalUrl(item.canonicalUrl || '');
          setOgTitle(item.ogTitle || item.title);
          setOgDescription(item.ogDescription || item.description || '');
          setOgImage(item.ogImage || '');
        }
        setLoading(false);
      }
    }
    init();
  }, [contentId]);

  const handleAddParagraph = () => {
    setParagraphs([...paragraphs, '']);
  };

  const handleParagraphChange = (index: number, val: string) => {
    const updated = [...paragraphs];
    updated[index] = val;
    setParagraphs(updated);
  };

  const handleRemoveParagraph = (index: number) => {
    if (paragraphs.length <= 1) return;
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  // AI Assistant triggers
  const handleAIAssist = async (
    action: 'improve_wording' | 'suggest_title' | 'suggest_intro' | 'suggest_conclusion' | 'expand' | 'shorten'
  ) => {
    setIsAiLoading(true);
    setAiOutput(null);
    setErrorMessage(null);

    const activeText = paragraphs.join('\n\n') || description || title;
    const res = await requestAdminAIAssist(action, activeText, title);

    if (res.success && res.result) {
      setAiOutput(res.result);
    } else {
      setErrorMessage(res.error || 'تعذر استدعاء المساعد الذكي');
    }
    setIsAiLoading(false);
  };

  // Save content
  const handleSave = async (targetStatus?: 'draft' | 'under_review' | 'published' | 'archived') => {
    if (!title.trim()) {
      setErrorMessage('يرجى إدخال عنوان المادة الدعوية');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const chosenStatus = targetStatus || status;

    const payload: Partial<Content> = {
      title: title.trim(),
      slug: slug.trim() || `article-${Date.now()}`,
      description: description.trim(),
      content: paragraphs.filter((p) => p.trim() !== ''),
      contentType,
      category,
      audience,
      readingTime: Number(readingTime) || 5,
      featured,
      status: chosenStatus,
      tags,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || description,
      canonicalUrl,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogImage,
    };

    const userMeta = {
      id: profile?.id,
      name: profile?.full_name || 'مسؤول التحرير',
      role: profile?.role || 'admin',
    };

    let result;
    if (contentId) {
      result = await updateAdminContent(contentId, payload, userMeta);
    } else {
      result = await createAdminContent(payload, userMeta);
    }

    setSaving(false);
    if (result.success) {
      onSaveSuccess();
    } else {
      setErrorMessage(result.error || 'فشل حفظ المادة في قاعدة البيانات');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
        <span className="text-xs">جاري تجهيز محرر المادة...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="رجوع للقائمة"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#0b1b2b] dark:text-white">
              {contentId ? 'تعديل مادة دعوية' : 'إضافة مادة دعوية جديدة'}
            </h2>
            <div className="text-[11px] text-stone-400">
              {contentId ? `المعرف: ${contentId}` : 'إنشاء ونشر محتوى جديد في مكتبة زاد'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>نشر المادة</span>
          </button>
        </div>
      </div>

      {/* Islamic Review Disclaimer Notice */}
      <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-4 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-amber-950 dark:text-amber-200 space-y-1">
          <p className="font-bold">تنبيه تحريري شرعي واجب المراعاة:</p>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            يجب مراجعة النصوص الشرعية والآيات القرآنية والأحاديث النبوية وتخريجها بدقة قبل اعتماد النشر. أدوات الذكاء الاصطناعي للمساعدة الصياغية فقط ولا يجوز اعتمادها في توثيق الأحاديث أو الفتاوى.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Main Grid: Form Left, AI Assistant & Metadata Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Title, Content, Paragraphs (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white mb-1.5">
                عنوان المادة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="مثال: من معالم الرحمة في التربية النبوية"
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
                الرابط الدائم (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-of-the-article"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:border-[#c8a962]"
              />
            </div>

            {/* Excerpt / Description */}
            <div>
              <label className="block text-xs font-bold text-[#0b1b2b] dark:text-white mb-1.5">
                المختصر أو المقتطف التقديمي
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="نبذة موجزة تُظهر جوهر المادة وتجذب القارئ في بطاقات العرض..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
              />
            </div>
          </div>

          {/* AI Writing Assistant Toolbar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#c8a962]/10 via-[#c8a962]/5 to-transparent border border-[#c8a962]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                <span className="text-xs font-bold text-[#0b1b2b] dark:text-white">
                  المساعد الذكي للتحرير والصياغة (Gemini AI)
                </span>
              </div>
              {isAiLoading && (
                <div className="flex items-center gap-1.5 text-xs text-[#94762e]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري المعالجة...</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleAIAssist('improve_wording')}
                disabled={isAiLoading}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-700 hover:border-[#c8a962] text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
              >
                تحسين الفصاحة والبلاغة
              </button>
              <button
                type="button"
                onClick={() => handleAIAssist('suggest_title')}
                disabled={isAiLoading}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-700 hover:border-[#c8a962] text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
              >
                اقتراح عناوين جاذبة
              </button>
              <button
                type="button"
                onClick={() => handleAIAssist('suggest_intro')}
                disabled={isAiLoading}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-700 hover:border-[#c8a962] text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
              >
                صياغة مقدمة مؤثرة
              </button>
              <button
                type="button"
                onClick={() => handleAIAssist('suggest_conclusion')}
                disabled={isAiLoading}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-700 hover:border-[#c8a962] text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
              >
                صياغة خاتمة ودعاء
              </button>
              <button
                type="button"
                onClick={() => handleAIAssist('expand')}
                disabled={isAiLoading}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-700 hover:border-[#c8a962] text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
              >
                إثراء وتوسيع الفكرة
              </button>
              <button
                type="button"
                onClick={() => handleAIAssist('shorten')}
                disabled={isAiLoading}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-700 hover:border-[#c8a962] text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
              >
                تلخيص واختصار
              </button>
            </div>

            {aiOutput && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0b1624] border border-[#c8a962]/40 space-y-2 mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#94762e] dark:text-[#dfc27e]">
                  <span>مقترح المساعد الذكي:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutput);
                      alert('تم نسخ المقترح إلى الحافظة');
                    }}
                    className="inline-flex items-center gap-1 hover:underline text-stone-500 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>نسخ</span>
                  </button>
                </div>
                <div className="text-xs text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                  {aiOutput}
                </div>
              </div>
            )}
          </div>

          {/* Paragraphs Editor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0b1b2b] dark:text-white">
                فقرات المادة الكاملة ({paragraphs.length})
              </label>
              <button
                type="button"
                onClick={handleAddParagraph}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة فقرة</span>
              </button>
            </div>

            <div className="space-y-3">
              {paragraphs.map((p, idx) => (
                <div key={idx} className="relative group">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span>الفقرة {idx + 1}</span>
                    {paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="حذف هذه الفقرة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={p}
                    onChange={(e) => handleParagraphChange(idx, e.target.value)}
                    rows={4}
                    placeholder={`اكتب نص الفقرة ${idx + 1}...`}
                    className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SEO Accordion */}
          <div className="rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setIsSeoOpen(!isSeoOpen)}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-[#0b1b2b] dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                <span>بيانات محركات البحث والتواصل الاجتماعي (SEO & OpenGraph)</span>
              </div>
              {isSeoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isSeoOpen && (
              <div className="p-5 border-t border-stone-100 dark:border-stone-800 space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-500 mb-1">عنوان الميتا (Meta Title)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="يُترك فارغاً لاستخدام عنوان المادة"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">وصف الميتا (Meta Description)</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    placeholder="وصف مختصر ومحسن لمحركات البحث..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 mb-1">عنوان OpenGraph</label>
                    <input
                      type="text"
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">صورة المشاركة (OG Image URL)</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Taxonomy, Status, Audience (1 Col) */}
        <div className="space-y-5">
          {/* Status & Publishing Workflow */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <h3 className="font-bold text-xs text-[#0b1b2b] dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              مسار النشر والحالة
            </h3>

            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1.5 font-semibold">
                حالة المادة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none"
              >
                <option value="published">منشور مباشر (Published)</option>
                <option value="under_review">قيد المراجعة والتدقيق (Under Review)</option>
                <option value="draft">مسودة عمل (Draft)</option>
                <option value="archived">مؤرشف (Archived)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="featuredToggle"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-stone-300 text-[#c8a962] focus:ring-[#c8a962]"
              />
              <label htmlFor="featuredToggle" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                تمييز المادة في الواجهة الرئيسية (Featured)
              </label>
            </div>
          </div>

          {/* Taxonomy & Metadata */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <h3 className="font-bold text-xs text-[#0b1b2b] dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2">
              التصنيف والمستهدفون
            </h3>

            {/* Category */}
            <div>
              <label className="block text-xs text-stone-500 mb-1 font-semibold">المجال / التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-xs text-stone-500 mb-1 font-semibold">قالب المادة</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white"
              >
                <option value="خطبة جمعة">خطبة جمعة</option>
                <option value="خطبة عيد">خطبة عيد</option>
                <option value="موعظة">موعظة</option>
                <option value="درس">درس</option>
                <option value="محاضرة">محاضرة</option>
                <option value="كلمة قصيرة">كلمة قصيرة</option>
                <option value="مادة تربوية">مادة تربوية</option>
                <option value="مادة أسرية">مادة أسرية</option>
                <option value="منشور دعوي">منشور دعوي</option>
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs text-stone-500 mb-1 font-semibold">الجمهور المستهدف</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white"
              >
                <option value="الجميع">الجميع</option>
                <option value="عامة المسلمين">عامة المسلمين</option>
                <option value="الشباب">الشباب</option>
                <option value="الأطفال">الأطفال</option>
                <option value="الآباء والأمهات">الآباء والأمهات</option>
                <option value="المعلمون">المعلمون</option>
                <option value="الدعاة">الدعاة</option>
                <option value="الخطيب">الخطيب</option>
                <option value="طلاب العلم">طلاب العلم</option>
              </select>
            </div>

            {/* Reading Time */}
            <div>
              <label className="block text-xs text-stone-500 mb-1 font-semibold">زمن القراءة (بالدقائق)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-stone-500 mb-1 font-semibold">الوسوم والكلمات المفتاحية</label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="أضف وسماً..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300"
                >
                  إضافة
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-700 dark:text-stone-300"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500 text-stone-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
