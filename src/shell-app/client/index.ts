import './initialization/blockingInitialization';

const shouldEnableReactScan = process.env.REACT_SCAN === '1';

const enableReactScan = async () => {
  try {
    const reactScanModule: typeof import('react-scan') = await import('react-scan');

    reactScanModule.scan({
      enabled: true,
      dangerouslyForceRunInProduction: true,
    });
  } catch (error) {
    console.warn('Failed to initialize React Scan', error);
  }
};

const bootstrap = async () => {
  if (shouldEnableReactScan) {
    await enableReactScan();
  }

  await import('./main');
};

void bootstrap();
