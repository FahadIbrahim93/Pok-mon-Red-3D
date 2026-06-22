// Patch window.fetch and globalThis.fetch to support setters in iframe/sandbox environments where fetch is a nested getter-only property
(function() {
  try {
    const originalFetch = window.fetch || (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined);
    if (originalFetch) {
      let currentFetch = originalFetch;
      const patchDescriptor = {
        configurable: true,
        enumerable: true,
        get() {
          return currentFetch;
        },
        set(val) {
          currentFetch = val;
        }
      };
      // Apply setter patch to window and globalThis
      Object.defineProperty(window, 'fetch', patchDescriptor);
      if (typeof globalThis !== 'undefined' && globalThis !== window) {
        try {
          Object.defineProperty(globalThis, 'fetch', patchDescriptor);
        } catch (err) {
          // ignore if globalThis has separate restrictions
        }
      }
    }
  } catch (e) {
    console.warn('Sandbox fetch setter polyfill failed:', e);
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
