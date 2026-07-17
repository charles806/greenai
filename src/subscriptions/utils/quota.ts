import type { Plan } from '../types';

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function hasChatQuota(plan: Plan, currentUsage: number): boolean {
  if (isUnlimited(plan.daily_chat_limit)) return true;
  return currentUsage < plan.daily_chat_limit;
}

export function getRemainingChats(plan: Plan, currentUsage: number): number {
  if (isUnlimited(plan.daily_chat_limit)) return -1;
  return Math.max(0, plan.daily_chat_limit - currentUsage);
}

export function hasUploadQuota(plan: Plan, currentUploads: number): boolean {
  if (isUnlimited(plan.upload_limit)) return true;
  return currentUploads < plan.upload_limit;
}

export function getRemainingUploads(plan: Plan, currentUploads: number): number {
  if (isUnlimited(plan.upload_limit)) return -1;
  return Math.max(0, plan.upload_limit - currentUploads);
}

export function isPremiumPlan(plan: Plan): boolean {
  return plan.slug !== 'free';
}

export function getPlanBySlug(plans: Plan[], slug: string): Plan | undefined {
  return plans.find(p => p.slug === slug);
}

export function formatPrice(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}
