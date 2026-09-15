import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

export const LoadingState: React.FC<Props> = ({ message = 'লোড হচ্ছে (Loading data)...' }) => {
  return (
    <div id="loading-state-container" className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
