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

  if (!withoutTrailingSlash || withoutTrailingSlash === '/') {
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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');

const stripQuery = (value) => {
  if (typeof value !== 'string') {
    return { pathname: '', search: '' };
  }

  const queryStart = value.indexOf('?');

  if (queryStart === -1) {
    return { pathname: value, search: '' };
  }

  return {
    pathname: value.slice(0, queryStart),
    search: value.slice(queryStart),
  };
};

const createPathRewriter = (prefix, rewriteBase) => {
  const escapedPrefix = escapeRegex(prefix);
  const matcher = new RegExp(`^${escapedPrefix}`);
  const normalizedBase = rewriteBase === '/' ? '/' : normalizeProxyRewrite(rewriteBase);

  const rewritePathname = (pathname) => {
    const stripped = pathname.replace(matcher, '');

    if (!stripped || stripped === '/') {
      return normalizedBase;
    }

    const suffix = stripped.startsWith('/') ? stripped : `/${stripped}`;

    if (normalizedBase === '/') {
      return suffix === '/' ? '/' : suffix;
    }

    return suffix === '/' ? normalizedBase : `${normalizedBase}${suffix}`;
  };

  return (path) => {
    const { pathname, search } = stripQuery(path);
    const rewrittenPath = rewritePathname(pathname);

    return `${rewrittenPath}${search}`;
  };
};

module.exports = {
  createPathRewriter,
  ensureLeadingSlash,
  normalizeProxyPrefix,
  normalizeProxyRewrite,
};
