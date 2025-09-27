const DEFAULT_ACK_INTERVAL = 30000;

/**
 * @typedef {Object} Manifest
 * @property {string} id
 * @property {string} name
 * @property {string} menuLabel
 * @property {string} routePath
 * @property {string} entryPath
 * @property {string} [description]
 */

/**
 * Builds the descriptor that will be registered in the shell registry.
 *
 * @param {{ manifest: Manifest; port?: number; publicUrl?: string }} params
 */
function buildMicrofrontendDescriptor({ manifest, port, publicUrl }) {
  if (!manifest) {
    throw new Error('Manifest is required to build microfrontend descriptor.');
  }

  const baseUrl = new URL('/', publicUrl || `http://localhost:${port ?? 0}`);

  return {
    id: manifest.id,
    name: manifest.name,
    menuLabel: manifest.menuLabel,
    routePath: manifest.routePath,
    description: manifest.description || '',
    entryUrl: new URL(manifest.entryPath, baseUrl).href,
    manifestUrl: new URL('manifest.json', baseUrl).href,
  };
}

/**
 * Creates acknowledgement utilities bound to a descriptor.
 *
 * @param {{ descriptor: ReturnType<typeof buildMicrofrontendDescriptor>; shellUrl: string; intervalMs?: number }} params
 */
function createMicrofrontendAcknowledger({ descriptor, shellUrl, intervalMs = DEFAULT_ACK_INTERVAL }) {
  if (!descriptor) {
    throw new Error('Descriptor is required to create microfrontend acknowledger.');
  }

  if (!shellUrl) {
    throw new Error('shellUrl is required to create microfrontend acknowledger.');
  }

  const acknowledgementEndpoint = new URL('/api/microfrontends/ack', shellUrl).href;

  let timer = null;
  let hasAcknowledged = false;

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const sendAcknowledgement = async () => {
    try {
      const response = await fetch(acknowledgementEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(descriptor),
      });

      if (!response.ok) {
        throw new Error(`Shell acknowledgement failed with status ${response.status}`);
      }

      console.log(`Microfrontend "${descriptor.id}" acknowledged by shell.`);
      hasAcknowledged = true;
      stopTimer();
    } catch (error) {
      console.error('Unable to acknowledge shell:', error.message || error);
    }
  };

  const start = () => {
    void sendAcknowledgement();

    if (!hasAcknowledged) {
      timer = setInterval(() => {
        void sendAcknowledgement();
      }, intervalMs);
    }

    return () => {
      stopTimer();
    };
  };

  return {
    descriptor,
    sendAcknowledgement,
    start,
  };
}

module.exports = {
  buildMicrofrontendDescriptor,
  createMicrofrontendAcknowledger,
};
