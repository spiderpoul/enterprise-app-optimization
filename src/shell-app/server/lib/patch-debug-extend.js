let patched = false;

const ensureDebugExtend = () => {
  if (patched) {
    return;
  }

  const debugModuleId = require.resolve('debug');
  const originalDebug = require('debug');

  try {
    const probe = originalDebug('http-proxy-middleware:probe');

    if (typeof probe.extend === 'function') {
      patched = true;
      return;
    }
  } catch (_error) {
    // If debug cannot be instantiated, fall through to patching so the
    // downstream require call can surface the real error message.
  }

  const patchInstance = (instance) => {
    if (typeof instance.extend === 'function') {
      return;
    }

    instance.extend = function extend(namespace, delimiter) {
      const baseNamespace = typeof this.namespace === 'string' ? this.namespace : '';
      const separator = delimiter === undefined ? ':' : delimiter;
      const child = patchedDebug(`${baseNamespace}${separator}${namespace}`);

      if (this.log) {
        child.log = this.log;
      }

      return child;
    };
  };

  function patchedDebug(...args) {
    const instance = originalDebug(...args);
    patchInstance(instance);
    return instance;
  }

  Object.assign(patchedDebug, originalDebug);
  patchedDebug.default = patchedDebug;
  patchInstance(patchedDebug);

  const cacheEntry = require.cache[debugModuleId];

  if (cacheEntry) {
    cacheEntry.exports = patchedDebug;
  }

  patched = true;
};

module.exports = { ensureDebugExtend };

