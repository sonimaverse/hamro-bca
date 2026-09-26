import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from '../context/ToastContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Lock, Sun, Moon, Shield, Database } from 'lucide-react';

export const Settings: React.FC<{ navigate: (path: string) => void }> = () => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      error('New password must be at least 8 characters long');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to update password');
      } else {
        success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      error(err.message || 'Error updating password');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
          Account & Security Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure security, preferences, and system preferences
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          Interface Theme
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select between light and dark modes according to your studying preference.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant={theme === 'light' ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleTheme}
            leftIcon={<Sun className="w-4 h-4" />}
          >
            Light Mode
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'outline'}
            size="sm"
            onClick={toggleTheme}
            leftIcon={<Moon className="w-4 h-4" />}
          >
            Dark Mode
          </Button>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-500" />
          Update Security Password
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ensure your password contains at least 8 characters including letters and numbers.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" isLoading={isChangingPass}>
              Save New Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
