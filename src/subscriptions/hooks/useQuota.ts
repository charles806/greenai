import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { checkQuota, recordUsage } from '../services/api';
import type { QuotaResult } from '../types';

export function useChatQuota() {
  const { isAuthenticated } = useAuth();
  const [quota, setQuota] = useState<QuotaResult | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async (): Promise<QuotaResult> => {
    if (!isAuthenticated) {
      const result: QuotaResult = { allowed: true, remaining: -1, limit: -1, plan_slug: 'free' };
      setQuota(result);
      return result;
    }

    setLoading(true);
    try {
      const result = await checkQuota('chat');
      setQuota(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const record = useCallback(async (metadata?: Record<string, unknown>) => {
    if (!isAuthenticated) return;
    try {
      const result = await recordUsage('chat_message', metadata);
      if (quota && result.remaining >= 0) {
        setQuota(prev => prev ? { ...prev, remaining: result.remaining, current_usage: (prev.current_usage ?? 0) + 1 } : prev);
      }
    } catch {
      // Silent fail — don't block the user if usage tracking fails
    }
  }, [isAuthenticated, quota]);

  return { quota, loading, check, record };
}

export function useUploadQuota() {
  const { isAuthenticated } = useAuth();
  const [quota, setQuota] = useState<QuotaResult | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async (): Promise<QuotaResult> => {
    if (!isAuthenticated) {
      const result: QuotaResult = { allowed: true, remaining: -1, limit: -1, plan_slug: 'free' };
      setQuota(result);
      return result;
    }

    setLoading(true);
    try {
      const result = await checkQuota('upload');
      setQuota(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const record = useCallback(async (metadata?: Record<string, unknown>) => {
    if (!isAuthenticated) return;
    try {
      const result = await recordUsage('file_upload', metadata);
      if (quota && result.remaining >= 0) {
        setQuota(prev => prev ? { ...prev, remaining: result.remaining, current_usage: (prev.current_usage ?? 0) + 1 } : prev);
      }
    } catch {
      // Silent fail
    }
  }, [isAuthenticated, quota]);

  return { quota, loading, check, record };
}
