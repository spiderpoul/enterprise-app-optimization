const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const normalizeCopyPatterns = ({ projectRoot, patterns }) => {
  if (!patterns || patterns.length === 0) {
    return [];
  }

  return patterns.map((pattern) => {
    if (typeof pattern === 'string') {
      return {
        from: path.resolve(projectRoot, pattern),
        to: path.resolve(projectRoot, 'dist', pattern),
        noErrorOnMissing: true,
      };
    }

    if (!pattern || typeof pattern !== 'object') {
      throw new Error('Copy pattern must be a string or an object describing the source and destination.');
    }

    const from = pattern.from || pattern.source;

    if (!from) {
      throw new Error('Copy pattern object must include a "from" property.');
    }

    const to = pattern.to || pattern.destination || path.basename(from);

    return {
      from: path.resolve(projectRoot, from),
      to: path.resolve(projectRoot, 'dist', to),
      noErrorOnMissing: true,
      globOptions: pattern.globOptions,
    };
  });
};

const resolveBuildMode = () => {
  const envMode = (process.env.BUILD_MODE || process.env.NODE_ENV || '').toLowerCase();

  if (envMode === 'development') {
    return 'development';
  }

  if (envMode === 'production') {
    return 'production';
  }

  return 'production';
};

const createServerWebpackConfig = ({
  projectRoot,
  entry = './server.js',
  outputFilename = 'server.js',
  copyPatterns = [],
} = {}) => {
  if (!projectRoot) {
    throw new Error('A project root must be provided to build the server bundle.');
  }

  const resolvedProjectRoot = path.resolve(projectRoot);
  const resolvedEntry = path.isAbsolute(entry)
    ? entry
    : path.resolve(resolvedProjectRoot, entry);

  const plugins = [];
  const normalizedCopyPatterns = normalizeCopyPatterns({
    projectRoot: resolvedProjectRoot,
    patterns: copyPatterns,
  });

  const pluginCopyPatterns = [
    ...normalizedCopyPatterns,
  ];

  if (pluginCopyPatterns.length > 0) {
    plugins.push(
      new CopyWebpackPlugin({
        patterns: pluginCopyPatterns,
      }),
    );
  }

  const mode = resolveBuildMode();

  return {
    mode,
    target: 'node',
    entry: resolvedEntry,
    output: {
      path: path.resolve(resolvedProjectRoot, 'dist'),
      filename: outputFilename,
      libraryTarget: 'commonjs2',
      clean: true,
    },
    externalsPresets: { node: true },
    externals: [],
    resolve: {
      extensions: ['.js', '.json'],
    },
    devtool: 'source-map',
    module: {
      rules: [],
      parser: {
        javascript: {
          exprContextCritical: false,
          unknownContextCritical: false,
          wrappedContextCritical: false,
        },
      },
    },
    plugins,
    node: {
      __dirname: false,
      __filename: false,
    },
    optimization: {
      minimize: false,
    },
    performance: {
      hints: false,
    },
    ignoreWarnings: [
      {
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ],
    stats: 'minimal',
  };
};

module.exports = {
  createServerWebpackConfig,
};
