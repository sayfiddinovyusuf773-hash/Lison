import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Universal API Base URL Resolver for Static Site Deployments
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const isSeparateStatic = window.location.hostname.includes('static') ||
                            (window.location.hostname.endsWith('onrender.com') && !window.location.hostname.startsWith('lison.'));
    if (isSeparateStatic) {
      input = `https://lison.onrender.com${input}`;
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
