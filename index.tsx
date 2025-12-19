
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register service worker with a relative path for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(registration => {
      console.log('FocusFlow SW registered: ', registration.scope);
    }).catch(err => {
      console.log('FocusFlow SW registration failed: ', err);
    });
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
