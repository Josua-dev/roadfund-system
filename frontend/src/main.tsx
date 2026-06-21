import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff', color: '#1E2228', border: '1px solid #DCDAD3',
            borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 1px 2px rgba(30,34,40,0.06)',
          },
          success: { iconTheme: { primary: '#3C7A5C', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#963B3B', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
