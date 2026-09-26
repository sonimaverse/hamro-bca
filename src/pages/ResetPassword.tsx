import React, { useState } from 'react';
import { useToast } from '../context/ToastContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ResetPassword: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { success, error } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const initialToken = urlParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        success('Password updated successfully! Please sign in with your new credentials.');
        navigate('/login');
      } else {
        error(data.error || 'Password reset failed');
      }
    } catch (err: any) {
      error(err.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-outfit">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your reset security token and choose a strong password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Reset Security Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste security token here"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters with 1 number"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
