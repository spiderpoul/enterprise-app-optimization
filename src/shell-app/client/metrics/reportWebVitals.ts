import { Metric, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

export type WebVitalsReporter = (metric: Metric) => void;

const reportWebVitals = (onReport?: WebVitalsReporter) => {
  if (typeof onReport !== 'function') {
    return;
  }

  onCLS(onReport);
  onFID(onReport);
  onFCP(onReport);
  onINP(onReport);
  onLCP(onReport);
  onTTFB(onReport);
};

export default reportWebVitals;
