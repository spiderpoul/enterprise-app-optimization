import React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactJSXDevRuntime from 'react/jsx-dev-runtime';
import type { Metric } from 'web-vitals';
import App from './App';
import reportWebVitals from './metrics/reportWebVitals';
import './styles.css';

declare global {
  interface Window {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    ReactDOMClient: typeof ReactDOMClient;
    ReactJSXRuntime: typeof ReactJSXRuntime;
    ReactJSXDevRuntime: typeof ReactJSXDevRuntime;
  }
}

if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.ReactDOMClient = ReactDOMClient;
  window.ReactJSXRuntime = ReactJSXRuntime;
  window.ReactJSXDevRuntime = ReactJSXDevRuntime;
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element with id="root" was not found in the document.');
}

const root = ReactDOMClient.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

type WebVitalPayload = Pick<
  Metric,
  'name' | 'id' | 'value' | 'delta' | 'rating' | 'navigationType'
> & {
  page: string;
  timestamp: number;
};

const sendWebVital = (metric: Metric) => {
  const { name, id, value, delta, rating, navigationType } = metric;

  const payload: WebVitalPayload = {
    name,
    id,
    value,
    delta,
    rating,
    navigationType,
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
