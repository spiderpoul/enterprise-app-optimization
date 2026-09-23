const DEFAULT_ACK_INTERVAL = 30000;

const ensureLeadingSlash = (value) => {
  if (typeof value !== 'string') {
    return '/';
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const normalizeProxyPrefix = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed) {
    return null;
  }

  const withLeadingSlash = ensureLeadingSlash(trimmed);
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  if (withoutTrailingSlash === '' || withoutTrailingSlash === '/') {
    return null;
  }

  return withoutTrailingSlash;
};

const normalizeProxyTarget = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed) {
    return '/api';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return ensureLeadingSlash(trimmed);
};

const createApiProxyDescriptor = ({ manifest, apiBaseUrl }) => {
  const manifestApi = manifest.api;

  if (!manifestApi || typeof manifestApi !== 'object') {
    return null;
  }

  const prefix = normalizeProxyPrefix(manifestApi.prefix);

  if (!prefix) {
    return null;
  }

  const targetValue = normalizeProxyTarget(manifestApi.target);

  try {
    const targetUrl = new URL(targetValue, apiBaseUrl);
    const pathRewrite = targetUrl.pathname.replace(/\/+$/, '') || '/';

    return {
      prefix,
      target: targetUrl.origin,
      pathRewrite,
    };
  } catch (_error) {
    return null;
  }
};

/**
 * @typedef {Object} Manifest
 * @property {string} id
 * @property {string} name
 * @property {string} menuLabel
 * @property {string} routePath
 * @property {string} entryPath
 * @property {string} [description]
 * @property {{ prefix?: string; target?: string }} [api]
 */

/**
 * Builds the descriptor that will be registered in the shell registry.
 *
 * @param {{
 *   manifest: Manifest;
 *   port?: number;
 *   publicUrl?: string;
 *   apiBaseUrl?: string;
 * }} params
 */
function buildMicrofrontendDescriptor({ manifest, port, publicUrl, apiBaseUrl }) {
  if (!manifest) {
    throw new Error('Manifest is required to build microfrontend descriptor.');
  }

  const assetsBaseUrl = new URL('/', publicUrl || `http://localhost:${port ?? 0}`);
  const apiBase = new URL('/', apiBaseUrl || `http://localhost:${port ?? 0}`);
  const assetPath = ensureLeadingSlash(manifest.entryPath || '/');

  return {
    id: manifest.id,
    name: manifest.name,
    menuLabel: manifest.menuLabel,
    routePath: manifest.routePath,
    description: manifest.description || '',
    entryUrl: new URL(manifest.entryPath, assetsBaseUrl).href,
    assetPath,
    manifestUrl: new URL('manifest.json', assetsBaseUrl).href,
    apiProxy: createApiProxyDescriptor({ manifest, apiBaseUrl: apiBase }),
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
  const registrationEndpoint = new URL(
    `/api/microfrontends/${encodeURIComponent(descriptor.id)}`,
    shellUrl,
  ).href;

  let timer = null;
  let isAcknowledged = false;

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  // The acknowledgement doubles as a heartbeat: the shell drops entries that stop acknowledging, and a
  // restarted shell with an empty registry gets the product back within one interval.
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

      if (!isAcknowledged) {
        console.log(`Microfrontend "${descriptor.id}" acknowledged by shell.`);
      }
      isAcknowledged = true;
    } catch (error) {
      if (isAcknowledged) {
        console.error('Lost connection to shell:', error.message || error);
      } else {
        console.error('Unable to acknowledge shell:', error.message || error);
      }
      isAcknowledged = false;
    }
  };

  const unregister = async () => {
    try {
      await fetch(registrationEndpoint, { method: 'DELETE', signal: AbortSignal.timeout(1000) });
    } catch (_error) {
      // The shell drops the entry by TTL when it cannot be reached now.
    }
  };

  const stop = async () => {
    stopTimer();
    await unregister();
  };

  const start = ({ unregisterOnExit = true } = {}) => {
    void sendAcknowledgement();
    stopTimer();
    timer = setInterval(() => {
      void sendAcknowledgement();
    }, intervalMs);
    timer.unref?.();

    if (unregisterOnExit) {
      for (const signal of ['SIGINT', 'SIGTERM']) {
        process.once(signal, () => {
          void stop().finally(() => process.exit(0));
        });
      }
    }

    return () => {
      stopTimer();
    };
  };

  return {
    descriptor,
    sendAcknowledgement,
    start,
    stop,
  };
}

module.exports = {
  buildMicrofrontendDescriptor,
  createMicrofrontendAcknowledger,
};
