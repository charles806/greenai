import { REJECTED_FILE_TYPES, REJECTED_EXTENSIONS, MAX_FILE_SIZE } from '../types';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileType(file: File): FileValidationResult {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (REJECTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Sorry, ${extension} files are not supported. Please upload PDF, TXT, images, or CSV files instead.`,
    };
  }

  if (REJECTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Sorry, ${file.type} files are not supported. Please upload a different file type.`,
    };
  }

  return { valid: true };
}

export function validateFileSize(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the ${maxSizeMB} MB limit. Please upload a smaller file.`,
    };
  }

  return { valid: true };
}

export function validateFile(file: File): FileValidationResult {
  const typeCheck = validateFileType(file);
  if (!typeCheck.valid) return typeCheck;

  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
