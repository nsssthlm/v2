
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Skapa en ny cache för att undvika konflikter
const cache = createCache({
  key: 'valvx',
  prepend: true // Viktigt för att säkerställa att våra stilar har högre prioritet
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  </React.StrictMode>,
);
