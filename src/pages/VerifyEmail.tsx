import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/ui/Button.js';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const VerifyEmail: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { refreshUser } = useAuth();
  const { success, error } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your university email address...');

  useEffect(() => {
    if (!token) {
      setStatus('failed');
      setMessage('Missing verification token.');
      return;
    }

    const doVerify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage('Your email address has been verified successfully!');
          success('Email verified!');
          await refreshUser();
        } else {
          setStatus('failed');
          setMessage(data.error || 'Verification token is invalid or expired.');
          error(data.error || 'Verification failed');
        }
      } catch (err: any) {
        setStatus('failed');
        setMessage(err.message || 'Verification connection failed');
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        {status === 'verifying' && (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Verifying Email
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-outfit">
              Verification Successful
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">{message}</p>
            <Button
              className="w-full mt-4"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-outfit">
              Verification Failed
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">{message}</p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
