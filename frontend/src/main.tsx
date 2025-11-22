import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App.tsx';
import './style.css';

const convex = new ConvexReactClient('https://impartial-orca-713.convex.cloud');

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
