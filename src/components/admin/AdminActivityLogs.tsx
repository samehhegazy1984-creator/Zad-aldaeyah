import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  User,
  Clock,
  Shield,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { AdminActivityLog } from '../../types';
import { fetchAdminLogs } from '../../services/adminService';

export const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminLogs(100);
      setLogs(data);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'PUBLISH':
      case 'CREATE':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
      case 'UPDATE':
      case 'SETTINGS_UPDATE':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300';
      case 'ROLE_CHANGE':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300';
      case 'DELETE':
      case 'ARCHIVE':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
            سجل العمليات والنشاط الإداري ({logs.length})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            توثيق كامل لكافة الإجراءات التحريرية والإدارية والتغييرات الحاصلة على المحتوى والصلاحيات
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في تفاصيل العملية، اسم المسؤول..."
            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none"
        >
          <option value="all">كل أنواع العمليات</option>
          <option value="CREATE">إنشاء مادة/مجال (CREATE)</option>
          <option value="PUBLISH">نشر (PUBLISH)</option>
          <option value="UPDATE">تعديل (UPDATE)</option>
          <option value="DELETE">حذف (DELETE)</option>
          <option value="ROLE_CHANGE">تغيير دور (ROLE_CHANGE)</option>
          <option value="SETTINGS_UPDATE">تحديث إعدادات (SETTINGS_UPDATE)</option>
          <option value="LOGIN">تسجيل دخول (LOGIN)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#0b1624] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
            <span className="text-xs">جاري تحميل سجل العمليات...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-stone-400 text-xs">
            لم يتم العثور على عمليات مطابقة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 dark:bg-[#0f1d2e] text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">المسؤول</th>
                  <th className="py-3.5 px-4 font-bold">نوع العملية</th>
                  <th className="py-3.5 px-4 font-bold">الكيان</th>
                  <th className="py-3.5 px-4 font-bold">التفاصيل</th>
                  <th className="py-3.5 px-4 font-bold">التوقيت والتاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                    <td className="py-3.5 px-4 font-bold text-[#0b1b2b] dark:text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{log.user_name}</span>
                        <span className="text-[10px] text-stone-400">({log.user_role})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300 max-w-md">
                      {log.details || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
