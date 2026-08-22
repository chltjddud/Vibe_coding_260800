"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, Bookmark, Info, X } from 'lucide-react';

type ToastType = 'success' | 'bookmark' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  action?: {
    label: string;
    href: string;
  };
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions | string) => {
    const id = Date.now();
    const toastObj: ToastItem = typeof options === 'string'
      ? { id, message: options, type: 'info', duration: 3000 }
      : { id, type: 'info', duration: 3000, ...options };

    setToasts(prev => [...prev.slice(-2), toastObj]); // 최대 3개까지만 표시

    setTimeout(() => {
      removeToast(id);
    }, toastObj.duration || 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card toast-${toast.type || 'info'}`}>
            <div className="toast-icon">
              {toast.type === 'bookmark' ? (
                <Bookmark className="w-5 h-5 text-blue-400 fill-blue-400" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="toast-content">
              <p className="toast-message">{toast.message}</p>
              {toast.action && (
                <Link href={toast.action.href} className="toast-action" onClick={() => removeToast(toast.id)}>
                  {toast.action.label} →
                </Link>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // 안전한 폴백 제공 (컨텍스트 바깥에서 호출 시에도 죽지 않음)
    return {
      showToast: (opts: ToastOptions | string) => {
        console.log("Toast:", opts);
      }
    };
  }
  return context;
}
