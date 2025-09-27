import { Metric, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

export type WebVitalsReporter = (metric: Metric) => void;

const reportWebVitals = (onReport?: WebVitalsReporter) => {
  if (typeof onReport !== 'function') {
    return;
  }

  type MetricRunner = (report: WebVitalsReporter) => void;
  const metricRunners: MetricRunner[] = [onCLS, onFID, onFCP, onINP, onLCP, onTTFB];

  metricRunners.forEach((runner) => {
    runner(onReport);
  });
};

export default reportWebVitals;
