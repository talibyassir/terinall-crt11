import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('index.tsx loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found, mounting React app...');

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
  rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">Error: ${error instanceof Error ? error.message : String(error)}</div>`;
}