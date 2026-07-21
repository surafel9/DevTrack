import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Phase } from '../types/models';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Collect all leaf phases (phases with no children) from a nested tree.
 * Leaf phases are used for progress calculation to avoid double-counting.
 */
function collectLeaves(phases: Phase[]): Phase[] {
  const leaves: Phase[] = [];
  const walk = (list: Phase[]) => {
    list.forEach(phase => {
      const children = phase.children ?? [];
      if (children.length === 0) {
        leaves.push(phase);
      } else {
        walk(children);
      }
    });
  };
  walk(phases);
  return leaves;
}

/**
 * Calculate progress from a nested phase tree.
 * Only leaf phases (no children) contribute to progress to avoid double-counting.
 */
export function calculateProgress(phases: Phase[]): number {
  if (!phases || phases.length === 0) return 0;
  const leaves = collectLeaves(phases);
  if (leaves.length === 0) return 0;
  const completed = leaves.filter(p => p.status === 'completed').length;
  return Math.round((completed / leaves.length) * 100);
}

/**
 * Derive project status from its phases.
 */
export function deriveProjectStatus(phases: Phase[]): 'pending' | 'in_progress' | 'completed' {
  if (!phases || phases.length === 0) return 'pending';
  const leaves = collectLeaves(phases);
  if (leaves.length === 0) return 'pending';
  const total     = leaves.length;
  const completed = leaves.filter(p => p.status === 'completed').length;
  const active    = leaves.filter(p => p.status === 'active').length;
  if (completed === total) return 'completed';
  if (active > 0 || completed > 0) return 'in_progress';
  return 'pending';
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getLinkIcon(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('github') || lower.includes('git')) return 'github';
  if (lower.includes('live') || lower.includes('production') || lower.includes('deploy')) return 'globe';
  if (lower.includes('doc') || lower.includes('wiki')) return 'file-text';
  if (lower.includes('figma') || lower.includes('design')) return 'figma';
  return 'link';
}

export function getStackColor(_name: string): string {
  return '#4b5563'; // gray-600
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const data = axiosError.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      return Object.values(data.errors).flat().join(', ');
    }
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
