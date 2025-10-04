import { useEffect, useRef, useState } from 'react';

type LifecycleMetrics = {
  mounts: number;
  unmounts: number;
};

const lifecycleMetricsStore = new Map<string, LifecycleMetrics>();

const getMetrics = (label: string): LifecycleMetrics => {
  const existing = lifecycleMetricsStore.get(label);

  if (existing) {
    return existing;
  }

  const initial: LifecycleMetrics = {
    mounts: 0,
    unmounts: 0,
  };

  lifecycleMetricsStore.set(label, initial);

  return initial;
};

export const useLifecycleLog = (label: string) => {
  const [, forceUpdate] = useState(0);
  const metricsRef = useRef<LifecycleMetrics>(getMetrics(label));

  useEffect(() => {
    metricsRef.current = getMetrics(label);
  }, [label]);

  useEffect(() => {
    const metrics = metricsRef.current;
    metrics.mounts += 1;
    console.log(`[${label}] mount #${metrics.mounts}`);
    forceUpdate((value) => value + 1);

    return () => {
      metrics.unmounts += 1;
      console.log(`[${label}] unmount #${metrics.unmounts}`);
    };
  }, [forceUpdate, label]);

  return metricsRef.current;
};
