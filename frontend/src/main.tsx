import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Importera våra anpassade stilar

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
