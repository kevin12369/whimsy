import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,  // No React.StrictMode — Phaser 3 doesn't tolerate double-mount.
);
