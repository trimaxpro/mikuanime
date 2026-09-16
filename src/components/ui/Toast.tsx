import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const AUTO_DISMISS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
  warning: 0,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    const delay = AUTO_DISMISS[type];
    if (delay > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'glass-card rounded-card px-4 py-3 flex items-center gap-3 pointer-events-auto',
                  {
                    'border-green-500/20': toast.type === 'success',
                    'border-accent-rose/20': toast.type === 'error',
                    'border-accent-primary/20': toast.type === 'info',
                    'border-accent-amber/20': toast.type === 'warning',
                  },
                )}
              >
                <Icon
                  className={cn('w-4 h-4 flex-shrink-0 stroke-[1.5]', {
                    'text-green-400': toast.type === 'success',
                    'text-accent-rose': toast.type === 'error',
                    'text-accent-glow': toast.type === 'info',
                    'text-accent-amber': toast.type === 'warning',
                  })}
                />
                <p className="text-sm text-text-primary flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-text-muted hover:text-text-primary transition-colors p-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
