import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordInput } from '../utils/validation';
import { getAuthErrorMessage } from '../utils/errors';
import { supabase } from '../../lib/supabase';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState<ResetPasswordInput>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
      setChecking(false);
    });
  }, []);

  const handleChange = (field: keyof ResetPasswordInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const result = resetPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ResetPasswordInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await resetPassword(form.password);
      setSuccess(true);
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!validSession) {
    return (
      <AuthLayout title="Invalid or expired link" subtitle="This password reset link is no longer valid">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-800">
            <p className="text-red-400 text-sm">
              This link is invalid or has expired. Please request a new password reset link.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-block py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            Request new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="Your password has been changed successfully">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-800">
            <p className="text-emerald-400 text-sm">Your password has been updated successfully.</p>
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="inline-block py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            Sign in with new password
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="Repeat your new password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
        </div>

        {serverError && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-800">
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
