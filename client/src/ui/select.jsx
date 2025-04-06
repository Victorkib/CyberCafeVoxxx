'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  children,
  value,
  onValueChange,
  name,
  className,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ''}`} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
            open,
            value,
          });
        }
        if (child.type === SelectContent) {
          return open
            ? React.cloneElement(child, {
                onValueChange: (newValue) => {
                  onValueChange(newValue);
                  setOpen(false);
                },
                value,
              })
            : null;
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({
  children,
  className,
  onClick,
  open,
  ...props
}) {
  return (
    <button
      type="button"
      className={`flex items-center justify-between w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${
        open ? 'ring-2 ring-blue-500 border-transparent' : ''
      } ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
      <ChevronDown
        size={16}
        className={`ml-2 transition-transform ${
          open ? 'transform rotate-180' : ''
        }`}
      />
    </button>
  );
}

export function SelectValue({ placeholder, children, ...props }) {
  return (
    <span className="truncate" {...props}>
      {children || placeholder}
    </span>
  );
}

export function SelectContent({
  children,
  onValueChange,
  value,
  className,
  ...props
}) {
  return (
    <div
      className={`absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg ${
        className || ''
      }`}
      {...props}
    >
      <div className="py-1 max-h-60 overflow-auto">
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect: () => onValueChange(child.props.value),
              isSelected: value === child.props.value,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({
  children,
  value,
  onSelect,
  isSelected,
  className,
  ...props
}) {
  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
      } ${className || ''}`}
      onClick={onSelect}
      {...props}
    >
      {children}
    </div>
  );
}
