import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Category, CategoryEnum } from '../../types';
import {
  fetchAllAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const AdminCategories: React.FC = () => {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('BookOpen');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Delete safety
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdminCategories();
      setCategories(data);
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setName('');
    setSlug('');
    setDescription('');
    setIcon('BookOpen');
    setStatus('active');
    setActiveCategory(null);
    setActionError(null);
    setModalMode('create');
  };

  const openEditModal = (cat: Category) => {
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'BookOpen');
    setStatus(cat.status || 'active');
    setActiveCategory(cat);
    setActionError(null);
    setModalMode('edit');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (modalMode === 'create') {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug || `cat-${Date.now()}`);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActionError('يرجى إدخال اسم المجال');
      return;
    }

    setActionError(null);
    const userMeta = {
      id: profile?.id,
      name: profile?.full_name || 'المسؤول',
      role: profile?.role || 'admin',
    };

    if (modalMode === 'create') {
      const res = await createAdminCategory(
        {
          name: name as CategoryEnum,
          slug: slug || `cat-${Date.now()}`,
          description,
          icon,
          status,
        },
        userMeta
      );
      if (!res.success) {
        setActionError(res.error || 'تعذر إضافة المجال');
        return;
      }
    } else if (modalMode === 'edit' && activeCategory) {
      const res = await updateAdminCategory(
        activeCategory.id,
        {
          name: name as CategoryEnum,
          slug,
          description,
          icon,
          status,
        },
        userMeta
      );
      if (!res.success) {
        setActionError(res.error || 'تعذر تحديث المجال');
        return;
      }
    }

    setModalMode(null);
    loadCategories();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);

    const res = await deleteAdminCategory(deleteTarget.id, {
      id: profile?.id,
      name: profile?.full_name || 'المسؤول',
      role: profile?.role || 'admin',
    });

    setIsDeleting(false);
    if (!res.success) {
      setActionError(res.error || 'فشل حذف المجال');
    } else {
      setDeleteTarget(null);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
            المجالات والتصنيفات الدعوية ({categories.length})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            هيكلة تصنيفات ومحاور المواد الدعوية والتربوية وربطها بالمكتبة
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مجال جديد</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
          {actionError}
        </div>
      )}

      {/* Grid of Categories */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
          <span className="text-xs">جاري تحميل المجالات من قاعدة البيانات...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#c8a962]/15 text-[#94762e] dark:text-[#dfc27e] flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.status === 'inactive'
                        ? 'bg-stone-200 dark:bg-stone-800 text-stone-600'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {cat.status === 'inactive' ? 'معطل' : 'نشط'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#0b1b2b] dark:text-white">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                    {cat.description || 'لا يوجد وصف للمجال'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-600 dark:text-stone-400">
                  {cat.contentCount || 0} مادة مرتبطة
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    title="تعديل المجال"
                  >
                    <Edit className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                  </button>
                  <button
                    onClick={() => {
                      setActionError(null);
                      setDeleteTarget(cat);
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="حذف المجال"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-right animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-[#0b1b2b] dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3">
              {modalMode === 'create' ? 'إضافة مجال دعوي جديد' : 'تعديل بيانات المجال'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  اسم المجال <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="مثال: فقه الأسرة"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">الرابط اللطيف (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  وصف المجال
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="ما يتناوله هذا المجال من موضوعات وأهداف..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">الحالة</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="inactive">معطل (Inactive)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">رمز الأيقونة (Icon)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold transition-colors cursor-pointer"
                >
                  حفظ المجال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-right animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base text-[#0b1b2b] dark:text-white">
                تأكيد حذف المجال
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                هل أنت متأكد من حذف المجال:{' '}
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  "{deleteTarget.name}"
                </span>
                ؟ لن يمكن حذفه إذا كان هناك محتوى مرتبط به.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>نعم، حذف المجال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
