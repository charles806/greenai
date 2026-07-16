import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { signUpSchema, type SignUpInput } from '../utils/validation';
import { getAuthErrorMessage } from '../utils/errors';

export function RegisterPage() {
  const { signUp } = useAuth();
  const [form, setForm] = useState<SignUpInput>({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof SignUpInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const result = signUpSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignUpInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await signUp(form.email, form.password);
      setSuccess(true);
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Almost there!">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-800">
            <p className="text-emerald-400 text-sm">
              We've sent a verification email to <strong className="text-emerald-300">{form.email}</strong>.
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-block py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join GREEN AI and start exploring">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
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
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
        </div>

        <div className="p-3 rounded-lg bg-gray-700/50 border border-gray-600">
          <p className="text-xs text-gray-400 mb-1">Password must contain:</p>
          <ul className="text-xs text-gray-500 space-y-0.5">
            <li className={form.password.length >= 8 ? 'text-emerald-400' : ''}>✓ At least 8 characters</li>
            <li className={/[A-Z]/.test(form.password) ? 'text-emerald-400' : ''}>✓ One uppercase letter</li>
            <li className={/[a-z]/.test(form.password) ? 'text-emerald-400' : ''}>✓ One lowercase letter</li>
            <li className={/[0-9]/.test(form.password) ? 'text-emerald-400' : ''}>✓ One number</li>
            <li className={/[^A-Za-z0-9]/.test(form.password) ? 'text-emerald-400' : ''}>✓ One special character</li>
          </ul>
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
