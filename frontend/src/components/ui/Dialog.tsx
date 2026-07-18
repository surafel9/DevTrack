import React, { Fragment, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

function cls(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Dialog ───────────────────────────────────────────────────────────────────
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Dialog({ open, onClose, title, description, children, className, size = 'md' }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-[2px]"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      />
      {/* Panel */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cls(
            'pointer-events-auto relative w-full rounded-xl border border-gray-200 bg-white shadow-xl',
            sizeMap[size],
            className
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-3 mt-2">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
