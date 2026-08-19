"use client";

import { useState, useRef, useEffect } from 'react';

interface Option {
  code: string;
  name: string;
}

interface RegionSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RegionSelect({ options, value, onChange, className }: RegionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.code === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className={className || "form-select w-full"}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: 'var(--text-primary)' }}>{selectedOption?.name}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>▼</span>
      </button>

      {isOpen && (
        <div 
          className="glass-card"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            width: '100%', 
            marginTop: '4px',
            maxHeight: '220px', 
            overflowY: 'auto',
            zIndex: 9999,
            padding: '4px 0',
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {options.map((option) => (
            <div
              key={option.code}
              onClick={() => {
                onChange(option.code);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                backgroundColor: value === option.code ? 'var(--glass-bg)' : 'transparent',
                color: value === option.code ? 'var(--accent-color)' : 'var(--text-primary)',
                transition: 'background-color 0.2s',
                fontSize: '14px',
                fontWeight: value === option.code ? '600' : '400'
              }}
              onMouseEnter={(e) => {
                if (value !== option.code) {
                  e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
