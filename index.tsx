import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Exported for use in App.tsx update logic
export let swRegistration: ServiceWorkerRegistration | null = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(registration => {
      swRegistration = registration;
      
      // Check for updates every 30 minutes in the background
      setInterval(() => {
        registration.update();
      }, 1000 * 60 * 30);

    }).catch(err => {
      // SW registration failed
    });
  });

  // Reload the page when the new service worker takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);