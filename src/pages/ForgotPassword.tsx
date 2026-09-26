import React, { useState } from 'react';
import { useToast } from '../context/ToastContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSubmitted(true);
        if (data.resetToken) setResetToken(data.resetToken);
        success('Password reset instructions generated.');
      } else {
        error(data.error || 'Request failed');
      }
    } catch (err: any) {
      error(err.message || 'Request failed');
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
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered university email to receive password recovery instructions.
          </p>

          {isSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Instructions Dispatched</span>
              </div>
              <p>
                If an account exists with <span className="font-bold">{email}</span>, password reset instructions have been generated.
              </p>
              {resetToken && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-mono">
                    Direct Reset Token: {resetToken}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                  >
                    Proceed to Reset Page
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@student.edu.np"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Send Recovery Instructions
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
