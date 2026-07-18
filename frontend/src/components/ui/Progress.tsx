import React from 'react';

function cls(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Progress ─────────────────────────────────────────────────────────────────
interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2',
};

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cls('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-xs font-medium text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-900">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cls('w-full rounded-full bg-gray-200 overflow-hidden', sizeMap[size])}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gray-900 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
