import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Archive,
  CheckCircle,
  FileEdit,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Content, AdminTab } from '../../types';
import {
  fetchAllAdminContents,
  deleteAdminContent,
  updateAdminContent,
} from '../../services/adminService';
import { CATEGORIES_LIST } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';

interface AdminContentListProps {
  onTabChange: (tab: AdminTab) => void;
  onEditContent: (contentId: string) => void;
}

export const AdminContentList: React.FC<AdminContentListProps> = ({
  onTabChange,
  onEditContent,
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Content[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadContents = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchAllAdminContents({
        search,
        category: selectedCategory,
        contentType: selectedType,
        status: selectedStatus,
        page: pageNum,
        limit: 10,
      });
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error('Failed to load admin content:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContents(1);
  }, [selectedCategory, selectedType, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadContents(1);
  };

  const handleStatusChange = async (
    item: Content,
    newStatus: 'draft' | 'under_review' | 'published' | 'archived'
  ) => {
    const res = await updateAdminContent(
      item.id,
      { status: newStatus },
      { id: profile?.id, name: profile?.full_name || 'المسؤول', role: profile?.role || 'admin' }
    );
    if (res.success) {
      setItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, status: newStatus } : c))
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAdminContent(deleteTarget.id, true, {
        id: profile?.id,
        name: profile?.full_name || 'المسؤول',
        role: profile?.role || 'admin',
      });
      setDeleteTarget(null);
      loadContents(page);
    } catch (e) {
      console.error('Error deleting content:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const contentTypes = [
    'خطبة جمعة',
    'خطبة عيد',
    'موعظة',
    'درس',
    'محاضرة',
    'كلمة قصيرة',
    'مادة تربوية',
    'مادة أسرية',
    'منشور دعوي',
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
            المواد الدعوية والتربوية ({total})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            إدارة النشر، التعديل، الأرشفة، والتحكم في مواد المكتبة الإسلامية
          </p>
        </div>

        <button
          onClick={() => onTabChange('content-new')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] font-bold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مادة جديدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث في العنوان أو النص..."
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer"
          >
            بحث
          </button>
          <button
            type="button"
            onClick={() => loadContents(page)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none"
            >
              <option value="all">كل المجالات والتصنيفات</option>
              {CATEGORIES_LIST.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none"
            >
              <option value="all">كل قوالب المواد</option>
              {contentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none"
            >
              <option value="all">كل الحالات (المنشور / المسودة / المؤرشف)</option>
              <option value="published">منشور (Published)</option>
              <option value="under_review">قيد المراجعة (Under Review)</option>
              <option value="draft">مسودة (Draft)</option>
              <option value="archived">مؤرشف (Archived)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Table & Mobile Cards */}
      <div className="bg-white dark:bg-[#0b1624] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
            <span className="text-xs">جاري تحميل المواد من قاعدة البيانات...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileEdit className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
            <div className="text-sm font-bold text-stone-700 dark:text-stone-300">
              لم يتم العثور على مواد مطابقة للبحث
            </div>
            <p className="text-xs text-stone-400">
              جرّب تغيير فلاتر البحث أو أضف مادة جديدة.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 dark:bg-[#0f1d2e] text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">العنوان</th>
                    <th className="py-3.5 px-4 font-bold">النوع</th>
                    <th className="py-3.5 px-4 font-bold">المجال</th>
                    <th className="py-3.5 px-4 font-bold">الكاتب</th>
                    <th className="py-3.5 px-4 font-bold">الحالة</th>
                    <th className="py-3.5 px-4 font-bold">المشاهدات</th>
                    <th className="py-3.5 px-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {items.map((item) => {
                    const st = item.status || 'published';
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-[#0b1b2b] dark:text-white max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                          {item.contentType}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500">
                          {item.author?.name || 'المنصة'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              st === 'published'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : st === 'under_review'
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                : st === 'draft'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {st === 'published'
                              ? 'منشور'
                              : st === 'under_review'
                              ? 'قيد المراجعة'
                              : st === 'draft'
                              ? 'مسودة'
                              : 'مؤرشف'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-600 dark:text-stone-400">
                          {item.views || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => onEditContent(item.id)}
                              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                              title="تعديل المادة"
                            >
                              <Edit className="w-4 h-4 text-[#94762e] dark:text-[#dfc27e]" />
                            </button>

                            {/* Status Quick Toggle */}
                            {st !== 'published' ? (
                              <button
                                onClick={() => handleStatusChange(item, 'published')}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                                title="نشر مباشر"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(item, 'draft')}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                                title="تحويل لمسودة"
                              >
                                <FileEdit className="w-4 h-4" />
                              </button>
                            )}

                            {/* Archive / Delete Button */}
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="أرشفة أو حذف المادة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
              {items.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-[#0b1b2b] dark:text-white leading-snug">
                      {item.title}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : item.status === 'draft'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600'
                      }`}
                    >
                      {item.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
                    <span>{item.contentType}</span>
                    <span>&bull;</span>
                    <span>{item.category}</span>
                    <span>&bull;</span>
                    <span>{item.views || 0} قراءة</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => onEditContent(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#94762e]" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-600 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>أرشفة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-stone-50 dark:bg-[#0f1d2e] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              الصفحة {page} من {totalPages} (إجمالي {total} مادة)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => loadContents(page - 1)}
                className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => loadContents(page + 1)}
                className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete / Archive Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-right animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base text-[#0b1b2b] dark:text-white">
                تأكيد أرشفة أو حذف المادة
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                هل أنت متأكد من رغبتك في أرشفة المادة:
                <br />
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  "{deleteTarget.title}"
                </span>
                ؟ لن تظهر المادة في المكتبة العامة للمستخدمين.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>نعم، قم بالأرشفة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
