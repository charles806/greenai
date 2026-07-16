const friendlyMessages: Record<string, string> = {
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  'Email not confirmed': 'Please verify your email address before signing in.',
  'Invalid email': 'Please enter a valid email address.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password does not meet the minimum requirements.',
  'new_password should not be equal to the old password': 'New password must be different from your current password.',
  'Email link is invalid or has expired': 'This link is invalid or has expired. Please request a new one.',
  'Email not found': 'No account found with this email address.',
  'Rate limit exceeded': 'Too many attempts. Please try again later.',
};

const networkErrors = ['Failed to fetch', 'NetworkError', 'Network request failed', 'ERR_NETWORK'];

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = error instanceof Error ? error.message : String(error);

  if (networkErrors.some((n) => message.includes(n))) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  for (const [key, friendly] of Object.entries(friendlyMessages)) {
    if (message.includes(key)) return friendly;
  }

  return 'An unexpected error occurred. Please try again.';
}
