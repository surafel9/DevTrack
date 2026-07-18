import React from 'react';
import { getInitials } from '../../utils';

function cls(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
};

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cls(
        'rounded-full flex items-center justify-center font-medium flex-shrink-0 select-none',
        'bg-gray-100 text-gray-700 border border-gray-200',
        sizeMap[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── AvatarGroup ──────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ names, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const rest = names.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((name, i) => (
        <div key={`${name}-${i}`} className="ring-2 ring-white rounded-full">
          <Avatar name={name} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div
          className={cls(
            'ring-2 ring-white rounded-full flex items-center justify-center font-medium flex-shrink-0 select-none',
            'bg-gray-50 border border-gray-200 text-gray-500',
            sizeMap[size]
          )}
          title={`${rest} more`}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
