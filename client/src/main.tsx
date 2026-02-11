import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'
import axios from 'axios'

// Set global axios defaults so API calls use the configured backend URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.timeout = 30000; // 30s default client-side timeout (allow backend cold-starts)

// Global error handler for debugging
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
