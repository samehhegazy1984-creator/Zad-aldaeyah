import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Search,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth, UserProfile } from '../../context/AuthContext';
import { logAdminActivity } from '../../services/adminService';

export const AdminUsers: React.FC = () => {
  const { profile, fetchAllProfiles, updateUserRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Change Role Modal
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('editor');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProfiles();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openRoleModal = (u: UserProfile) => {
    setTargetUser(u);
    setSelectedNewRole(u.role === 'admin' ? 'editor' : 'admin');
    setFeedback(null);
  };

  const handleConfirmRoleChange = async () => {
    if (!targetUser) return;
    setIsUpdating(true);
    setFeedback(null);

    const res = await updateUserRole(targetUser.id, selectedNewRole);
    setIsUpdating(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'فشل تحديث الدور' });
    } else {
      await logAdminActivity({
        user_id: profile?.id,
        user_name: profile?.full_name || 'المدير',
        user_role: 'admin',
        action: 'ROLE_CHANGE',
        entity_type: 'role',
        entity_id: targetUser.id,
        details: `تم تغيير دور المستخدم (${targetUser.full_name}) من (${targetUser.role}) إلى (${selectedNewRole})`,
      });

      setFeedback({ type: 'success', message: 'تم تحديث صلاحية المستخدم بنجاح' });
      setTimeout(() => {
        setTargetUser(null);
        loadUsers();
      }, 1200);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0b1b2b] dark:text-white">
          إدارة المستخدمين والصلاحيات ({users.length})
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          التحكم في أدوار المستخدمين وتعيين المحررين والمديرين وفق ضوابط الأمان ومنع الإغلاق
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المستخدم أو البريد..."
            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none focus:border-[#c8a962]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#0f1d2e] border border-stone-200 dark:border-stone-700 text-[#0b1b2b] dark:text-white focus:outline-none"
        >
          <option value="all">كل الأدوار</option>
          <option value="admin">مدير (Admin)</option>
          <option value="editor">محرر (Editor)</option>
          <option value="user">مستخدم عادي (User)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0b1624] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#c8a962]" />
            <span className="text-xs">جاري تحميل المستخدمين...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-stone-400 text-xs">
            لم يتم العثور على مستخدمين مطابقين
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 dark:bg-[#0f1d2e] text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">المستخدم</th>
                  <th className="py-3.5 px-4 font-bold">الدور الحالي</th>
                  <th className="py-3.5 px-4 font-bold">تاريخ التسجيل</th>
                  <th className="py-3.5 px-4 font-bold text-center">تعديل الصلاحيات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === profile?.id;
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#c8a962]/20 text-[#94762e] font-bold flex items-center justify-center text-xs">
                            {u.full_name?.charAt(0) || 'م'}
                          </div>
                          <div>
                            <div className="font-bold text-[#0b1b2b] dark:text-white flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                                  أنت
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono">
                              {u.email || u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : u.role === 'editor'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role === 'editor' && <ShieldCheck className="w-3 h-3" />}
                          {u.role === 'user' && <UserCheck className="w-3 h-3" />}
                          <span>
                            {u.role === 'admin'
                              ? 'مدير (Admin)'
                              : u.role === 'editor'
                              ? 'محرر (Editor)'
                              : 'مستخدم (User)'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('ar-SA')
                          : 'مسجل حديثاً'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openRoleModal(u)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold transition-colors cursor-pointer"
                        >
                          تغيير الصلاحية
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {targetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1624] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="p-2 rounded-xl bg-[#c8a962]/15 text-[#94762e]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0b1b2b] dark:text-white">
                  تعديل صلاحيات المستخدم
                </h3>
                <p className="text-xs text-stone-400">{targetUser.full_name}</p>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  feedback.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <label className="block text-stone-700 dark:text-stone-300 font-bold">
                اختر الدور الجديد:
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <input
                    type="radio"
                    name="newRole"
                    value="user"
                    checked={selectedNewRole === 'user'}
                    onChange={() => setSelectedNewRole('user')}
                    className="text-[#c8a962] focus:ring-[#c8a962]"
                  />
                  <div>
                    <span className="font-bold block text-[#0b1b2b] dark:text-white">مستخدم عادي (User)</span>
                    <span className="text-[11px] text-stone-400">تصفح المواد، المفضلة، وسجل القراءة فقط</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <input
                    type="radio"
                    name="newRole"
                    value="editor"
                    checked={selectedNewRole === 'editor'}
                    onChange={() => setSelectedNewRole('editor')}
                    className="text-[#c8a962] focus:ring-[#c8a962]"
                  />
                  <div>
                    <span className="font-bold block text-[#0b1b2b] dark:text-white">محرر محتوى (Editor)</span>
                    <span className="text-[11px] text-stone-400">إضافة وتعديل المواد والمجالات والتصنيفات</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <input
                    type="radio"
                    name="newRole"
                    value="admin"
                    checked={selectedNewRole === 'admin'}
                    onChange={() => setSelectedNewRole('admin')}
                    className="text-[#c8a962] focus:ring-[#c8a962]"
                  />
                  <div>
                    <span className="font-bold block text-[#0b1b2b] dark:text-white">مدير نظام كامل (Admin)</span>
                    <span className="text-[11px] text-stone-400">صلاحيات كاملة تشمل إدارة المستخدمين والإعدادات وسجل العمليات</span>
                  </div>
                </label>
              </div>

              {selectedNewRole === 'admin' && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>تنبيه: منح صلاحية المدير يتيح للمستخدم التحكم الكامل في قاعدة البيانات والمنصة.</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setTargetUser(null)}
                disabled={isUpdating}
                className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isUpdating}
                className="flex-1 py-2 rounded-xl bg-[#c8a962] hover:bg-[#b5954e] text-[#0b1b2b] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>تأكيد الصلاحية</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
