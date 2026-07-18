import React from 'react';

function cls(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'active' | 'pending' | 'completed' | 'neutral';

const variantMap: Record<BadgeVariant, { bg: string; text: string; dot?: string }> = {
  default:   { bg: 'bg-gray-100',   text: 'text-gray-700' },
  neutral:   { bg: 'bg-gray-100',   text: 'text-gray-600' },
  active:    { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  completed: { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  pending:   { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400' },
  success:   { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  warning:   { bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
  danger:    { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400' },
  info:      { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot, children, ...props }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <span
      className={cls(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        v.bg, v.text, className
      )}
      {...props}
    >
      {dot && v.dot && <span className={cls('w-1.5 h-1.5 rounded-full flex-shrink-0', v.dot)} />}
      {children}
    </span>
  );
}

export function PhaseStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeVariant; label: string }> = {
    completed: { v: 'completed', label: 'Completed' },
    active:    { v: 'active',    label: 'Active' },
    pending:   { v: 'pending',   label: 'Pending' },
  };
  const cfg = map[status] ?? { v: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={cfg.v} dot>{cfg.label}</Badge>;
}
