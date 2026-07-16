import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../utils/validation';
import { getAuthErrorMessage } from '../utils/errors';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [form, setForm] = useState<ForgotPasswordInput>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (value: string) => {
    setForm({ email: value });
    if (errors.email) setErrors({});
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const result = forgotPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ForgotPasswordInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await forgotPassword(form.email);
      setSuccess(true);
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Password reset link sent">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-800">
            <p className="text-emerald-400 text-sm">
              If an account exists with <strong className="text-emerald-300">{form.email}</strong>, you'll receive a
              password reset link shortly.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
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
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>

        <p className="text-center text-sm text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
