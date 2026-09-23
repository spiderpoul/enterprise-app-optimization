const BLOCKING_INITIALIZATION_STEP_IDS = ['services-bootstrap', 'permissions'];

const BACKGROUND_INITIALIZATION_STEP_IDS = [
  'user-settings',
  'catalog-sync',
  'final-handshake',
];

const runInitializationStep = async (stepId: string): Promise<void> => {
  const response = await fetch(
    `/api/initialization/steps/${encodeURIComponent(stepId)}`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Initialization step "${stepId}" failed with status ${response.status}.`,
    );
  }
};

export {
  BACKGROUND_INITIALIZATION_STEP_IDS,
  BLOCKING_INITIALIZATION_STEP_IDS,
  runInitializationStep,
};
