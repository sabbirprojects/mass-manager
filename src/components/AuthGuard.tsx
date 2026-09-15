import React from 'react';
import { useApp } from '../context/AppContext';
import { LoginPage } from './LoginPage';
import { LoadingState } from './LoadingState';

interface Props {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<Props> = ({ children }) => {
  const { session, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="স্মার্ট মিল ম্যানেজার চালু হচ্ছে..." />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
