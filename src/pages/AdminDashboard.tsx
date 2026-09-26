import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { AdminStats, User } from '../types/index.js';
import { StatCard } from '../components/ui/StatCard.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Modal } from '../components/ui/Modal.js';
import { Badge } from '../components/ui/Badge.js';
import { SearchBar } from '../components/ui/SearchBar.js';
import { Pagination } from '../components/ui/Pagination.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { AdminSubscriptionRequests } from '../components/admin/AdminSubscriptionRequests.js';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  FolderDown,
  Database,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Megaphone,
  UserPlus,
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalResources: 0,
    totalEnrollments: 0,
  });

  const [dbStatus, setDbStatus] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // User Action States
  const [deleteUserItem, setDeleteUserItem] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create Faculty / Admin Modal States
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'teacher' | 'admin'>('teacher');
  const [newUserSemester, setNewUserSemester] = useState(1);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      error('Please complete all required fields.');
      return;
    }
    if (newUserPassword.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          password: newUserPassword,
          role: newUserRole,
          semester: Number(newUserSemester),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to create user account');
      } else {
        success(`New ${newUserRole.toUpperCase()} account created successfully!`);
        setIsCreateUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('teacher');
        fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Creation failed');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

      const [statsRes, healthRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/health'),
        fetch(
          `/api/admin/users?role=${roleFilter}&search=${encodeURIComponent(
            searchQuery
          )}&page=${page}&limit=10`,
          { headers }
        ),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }

      if (healthRes.ok) {
        const hData = await healthRes.json();
        setDbStatus(hData.database);
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        setTotalPages(uData.pages || 1);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token, roleFilter, searchQuery, page]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to update role');
      } else {
        success(`User role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => ((u.id || u._id) === userId ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err: any) {
      error(err.message || 'Error updating role');
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    const userId = targetUser.id || targetUser._id;
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to update status');
      } else {
        success(`Account status changed to ${newStatus}`);
        setUsers((prev) =>
          prev.map((u) => ((u.id || u._id) === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err: any) {
      error(err.message || 'Error updating status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserItem) return;
    const userId = deleteUserItem.id || deleteUserItem._id;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success('User account removed permanently');
        setDeleteUserItem(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      error(err.message || 'Deletion error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Root System Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
            Academic Administration Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global governance over BCA student registries, faculty credentials, and curriculum integrity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/advertisements')} className="flex items-center gap-1.5">
            <Megaphone className="w-4 h-4" />
            <span>Ad Campaigns</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/announcements')}>
            Broadcast Notice
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>
            Curriculum
          </Button>
        </div>
      </div>

      {/* Database Diagnostics Alert */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              dbStatus?.isConnected
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Persistence Store:
              </span>
              <Badge variant={dbStatus?.isConnected ? 'emerald' : 'blue'} size="sm">
                {dbStatus?.isConnected ? 'MONGODB ATLAS (CONNECTED)' : 'IN-MEMORY STORE (ACTIVE)'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {dbStatus?.isConnected
                ? 'Primary database connected to live MongoDB Atlas cluster.'
                : 'Development store operational. Set MONGODB_URI in Settings for external cloud persistence.'}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-500 shrink-0">
          Server Health: <span className="text-emerald-500 font-bold">100% OK</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="BCA Scholars"
          value={stats.totalStudents}
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Faculty Teachers"
          value={stats.totalTeachers}
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          label="Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Resources"
          value={stats.totalResources}
          icon={<FolderDown className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          label="Enrollments"
          value={stats.totalEnrollments}
          icon={<Sparkles className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* User Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
              User Accounts & Role Governance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search, promote to faculty teacher, suspend, or delete user accounts
            </p>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateUserOpen(true)}
              className="flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Faculty / Admin</span>
            </Button>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRoleFilter(r);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          placeholder="Search users by full name or email address..."
        />

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Promote / Change Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const uid = u.id || u._id || '';
                  const isCurrent = uid === user?.id;
                  return (
                    <tr key={uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                u.name
                              )}`
                            }
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {u.name} {isCurrent && '(You)'}
                            </span>
                            {u.semester && (
                              <span className="text-[10px] text-slate-400">
                                Semester {u.semester}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {u.email}
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={
                            u.role === 'admin'
                              ? 'purple'
                              : u.role === 'teacher'
                              ? 'amber'
                              : 'blue'
                          }
                          size="sm"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={u.status === 'suspended' ? 'rose' : 'emerald'}
                          size="sm"
                        >
                          {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) => handleRoleChange(uid, e.target.value)}
                          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-40"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher / Faculty</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrent}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            title={u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          >
                            {u.status === 'suspended' ? (
                              <Unlock className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-amber-600" />
                            )}
                          </button>

                          <button
                            onClick={() => setDeleteUserItem(u)}
                            disabled={isCurrent}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            title="Delete User"
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
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Premium Subscription Request Management */}
      <AdminSubscriptionRequests />

      {/* Create Faculty / Admin Modal */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Provision Faculty or Administrator Account"
        description="Create authorized faculty (teacher) or system administrator credentials. Public users cannot self-register into these elevated roles."
      >
        <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
          <Input
            label="Full Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="e.g. Dr. Bikash Thapa"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="e.g. bikash.thapa@college.edu.np"
            required
          />

          <Input
            label="Initial Password"
            type="password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Assigned Role
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'teacher' | 'admin')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="teacher">Teacher / Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Primary Semester
              </label>
              <select
                value={newUserSemester}
                onChange={(e) => setNewUserSemester(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateUserOpen(false)}
              disabled={isCreatingUser}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreatingUser}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUserItem}
        onClose={() => setDeleteUserItem(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently remove ${deleteUserItem?.name} (${deleteUserItem?.email}) from the platform? This cannot be undone.`}
        confirmText="Remove Account"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
