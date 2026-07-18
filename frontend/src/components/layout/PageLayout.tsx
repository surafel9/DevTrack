import React from 'react';

// ─── PageContainer ────────────────────────────────────────────────────────────
// Wraps every page's inner content with consistent max-width + padding.
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8">
      {children}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
// Standard top section of every page: title, optional description, optional actions.
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
// A consistent section block with optional title + content.
interface SectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, actions, children, className = '' }: SectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────
// A horizontal strip for search / filter / actions — always on one line.
export function Toolbar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {left}
      </div>
      {right && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {right}
        </div>
      )}
    </div>
  );
}

// ─── FormCard ─────────────────────────────────────────────────────────────────
// A centered card container for forms.
export function FormCard({ children, maxWidth = '720px' }: { children: React.ReactNode; maxWidth?: string }) {
  return (
    <div className="w-full" style={{ maxWidth }}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-gray-200 ${className}`} />;
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
// Small uppercase label for grouping content in detail pages.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
      {children}
    </span>
  );
}
