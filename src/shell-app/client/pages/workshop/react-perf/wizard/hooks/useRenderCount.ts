import { useEffect, useRef } from 'react';

export const useRenderCount = (label: string) => {
  const renderCountRef = useRef(0);

  renderCountRef.current += 1;

  useEffect(() => {
    console.log(`[${label}] render #${renderCountRef.current}`);
  });

  return renderCountRef.current;
};
