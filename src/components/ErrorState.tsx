import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({
  title = 'একটি ত্রুটি ঘটেছে (Error Occurred)',
  message,
  onRetry,
}) => {
  return (
    <div id="error-state-container" className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-200 my-4">
      <div className="p-3 bg-rose-100 rounded-full text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900">{title}</h3>
      <p className="mt-1 text-sm text-rose-700 max-w-sm">{message}</p>
      {onRetry && (
        <button
          id="error-retry-button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          আবার চেষ্টা করুন (Retry)
        </button>
      )}
    </div>
  );
};
