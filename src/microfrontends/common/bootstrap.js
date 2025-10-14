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

const normalizeProxyRewrite = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const withLeadingSlash = ensureLeadingSlash(trimmed);
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return withoutTrailingSlash || '/';
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

const resolveAssetsBaseUrl = ({ publicUrl, port }) => {
  const trimmed = typeof publicUrl === 'string' ? publicUrl.trim() : '';

  if (trimmed) {
    try {
      const normalized = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
      return new URL(normalized);
    } catch (_error) {
      // fall through to default
    }
  }

  const fallbackPort = Number.isFinite(port) ? port : Number.parseInt(`${port ?? ''}`, 10);
  const normalizedPort = Number.isFinite(fallbackPort) ? fallbackPort : 0;

  return new URL(`http://localhost:${normalizedPort}/`);
};

const resolveEntryUrl = ({ assetsBaseUrl, entryPath }) => {
  const normalizedEntryPath = typeof entryPath === 'string' ? entryPath.trim() : '';

  if (!normalizedEntryPath) {
    return assetsBaseUrl.href;
  }

  if (/^https?:\/\//i.test(normalizedEntryPath)) {
    return normalizedEntryPath;
  }

  const relativePath = normalizedEntryPath.startsWith('/')
    ? normalizedEntryPath.slice(1)
    : normalizedEntryPath;

  return new URL(relativePath, assetsBaseUrl).href;
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

const createAssetProxyDescriptor = ({ publicUrl, assetBaseUrl }) => {
  const trimmedPublicUrl = typeof publicUrl === 'string' ? publicUrl.trim() : '';
  const trimmedAssetBaseUrl = typeof assetBaseUrl === 'string' ? assetBaseUrl.trim() : '';

  if (!trimmedPublicUrl || !trimmedAssetBaseUrl) {
    return null;
  }

  try {
    const publicUrlObject = new URL(trimmedPublicUrl);
    const assetBaseObject = new URL(trimmedAssetBaseUrl);
    const prefix = normalizeProxyPrefix(publicUrlObject.pathname);

    if (!prefix) {
      return null;
    }

    return {
      pathRewrite: normalizeProxyRewrite(assetBaseObject.pathname),
      prefix,
      target: assetBaseObject.origin,
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
 *   assetBaseUrl?: string;
 *   apiBaseUrl?: string;
 * }} params
 */
function buildMicrofrontendDescriptor({
  manifest,
  port,
  publicUrl,
  assetBaseUrl,
  apiBaseUrl,
}) {
  if (!manifest) {
    throw new Error('Manifest is required to build microfrontend descriptor.');
  }

  const assetsBaseUrl = resolveAssetsBaseUrl({ publicUrl, port });
  const apiBase = new URL('/', apiBaseUrl || `http://localhost:${port ?? 0}`);
  const entryUrl = resolveEntryUrl({ assetsBaseUrl, entryPath: manifest.entryPath });
  const manifestUrl = new URL('manifest.json', assetsBaseUrl).href;

  return {
    assetProxy: createAssetProxyDescriptor({ publicUrl: assetsBaseUrl.href, assetBaseUrl }),
    id: manifest.id,
    name: manifest.name,
    menuLabel: manifest.menuLabel,
    routePath: manifest.routePath,
    description: manifest.description || '',
    entryUrl,
    manifestUrl,
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
  createAssetProxyDescriptor,
  createMicrofrontendAcknowledger,
};
