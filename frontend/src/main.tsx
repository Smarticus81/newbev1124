import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App.tsx';
import './style.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://impartial-orca-713.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
