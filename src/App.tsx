import React from 'react';
import { AppProvider } from './context/AppContext';
import { AuthGuard } from './components/AuthGuard';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <AppProvider>
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    </AppProvider>
  );
}
