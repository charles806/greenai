import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { validateFile } from '../utils/upload';
import type { FileValidationResult } from '../utils/upload';
import { useUploadQuota } from './useQuota';
export function useFileUploads() {
  const { user, isAuthenticated } = useAuth();
  const { quota, check, loading: quotaLoading } = useUploadQuota();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateBeforeUpload = useCallback(async (file: File): Promise<FileValidationResult | null> => {
    setError(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return validation;
    }

    if (isAuthenticated) {
      const quotaResult = await check();
      if (!quotaResult.allowed) {
        const msg: string = quotaResult.remaining === 0
          ? 'Upload limit reached. Please delete some files or upgrade your plan to upload more.'
          : 'You have reached your upload limit.';
        setError(msg);
        return { valid: false, error: msg };
      }
    }

    return { valid: true };
  }, [isAuthenticated, check]);

  const uploadFile = useCallback(async (
    file: File,
    storageBucket: string = 'uploads'
  ): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to upload files.');
      return null;
    }

    const validation = await validateBeforeUpload(file);
    if (!validation?.valid) return null;

    setUploading(true);
    setError(null);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? '';

      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const storageResponse = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${filePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': file.type,
          'x-upsert': 'false',
        },
        body: file,
      });

      if (!storageResponse.ok) {
        setError('Failed to upload file to storage');
        return null;
      }

      const dbResponse = await fetch(`${functionsUrl}/record-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'file_upload',
          metadata: {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: filePath,
          },
        }),
      });

      if (!dbResponse.ok) {
        setError('Failed to record file upload');
        return null;
      }

      return filePath;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [user, validateBeforeUpload]);

  const clearError = useCallback(() => setError(null), []);

  return {
    quota,
    uploading,
    error,
    quotaLoading,
    validateBeforeUpload,
    uploadFile,
    clearError,
  };
}
