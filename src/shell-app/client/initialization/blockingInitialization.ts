import {
  BLOCKING_INITIALIZATION_STEP_IDS,
  runInitializationStep,
} from './initializationSteps';

let blockingInitializationStatus: 'pending' | 'fulfilled' | 'rejected' = 'pending';
let blockingInitializationValue: void[] | undefined;
let blockingInitializationReason: unknown;

const blockingInitializationPromise = Promise.all(
  BLOCKING_INITIALIZATION_STEP_IDS.map((stepId) => runInitializationStep(stepId)),
).then(
  (result) => {
    blockingInitializationStatus = 'fulfilled';
    blockingInitializationValue = result;

    return result;
  },
  (error: unknown) => {
    blockingInitializationStatus = 'rejected';
    blockingInitializationReason = error;

    throw error;
  },
);

void blockingInitializationPromise.catch(() => {
  // Prevent unhandled rejection warnings while allowing consumers to handle failures.
});

export const waitForBlockingInitialization = (): Promise<void[]> => {
  if (blockingInitializationStatus === 'fulfilled') {
    return Promise.resolve(blockingInitializationValue ?? []);
  }

  if (blockingInitializationStatus === 'rejected') {
    return Promise.reject(blockingInitializationReason);
  }

  return blockingInitializationPromise;
};
