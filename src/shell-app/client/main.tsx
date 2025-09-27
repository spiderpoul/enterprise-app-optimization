import React from 'react';
import type { Metric } from 'web-vitals';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './metrics/reportWebVitals';
import './styles.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element with id="root" was not found in the document.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

const sendWebVital = (metric: Metric) => {
  const payload = {
    name: metric.name,
    id: metric.id,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    page: window.location.pathname,
    timestamp: Date.now(),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[web-vitals]', payload);
  }

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/metrics/web-vitals', blob);
    return;
  }

  void fetch('/api/metrics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Swallow network errors to avoid impacting the UX during initialization.
  });
};

reportWebVitals(sendWebVital);
