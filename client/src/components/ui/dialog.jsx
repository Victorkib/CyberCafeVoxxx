'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => onOpenChange(false)}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div className={`p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div className={`mb-4 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2
      className={`text-xl font-semibold text-gray-900 ${className || ''}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <div className={`mt-2 text-sm text-gray-500 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div className={`mt-6 flex justify-end space-x-3 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTrigger({ asChild, children, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
      {...props}
    >
      {children}
    </button>
  );
}
