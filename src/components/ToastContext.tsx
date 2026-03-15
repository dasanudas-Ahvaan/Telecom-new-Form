import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define the available types for the toast
type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

// Define the shape of the context value
type ToastContextType = (message: string, type?: ToastType, duration?: number) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({ message, type });
    
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      
      {/* Toast UI */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-xl text-white font-semibold transition-all animate-in fade-in slide-in-from-bottom-4
            ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Custom hook with a check to ensure it's used within a Provider
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};