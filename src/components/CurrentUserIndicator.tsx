import React from 'react';
import { UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CurrentUserIndicator: React.FC = () => {
  const { session } = useApp();
  if (!session) return null;

  return (
    <div
      id="current-user-indicator"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-xs text-teal-800 font-medium"
      title={`Logged in as ${session.displayName} (@${session.username})`}
    >
      <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span className="max-w-[120px] truncate">{session.displayName || session.username}</span>
    </div>
  );
};
