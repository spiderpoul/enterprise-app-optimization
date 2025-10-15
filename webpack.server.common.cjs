const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { createRequire } = require('module');

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

const readPackageJson = (pkgPath) => {
  try {
    const contents = fs.readFileSync(pkgPath, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

const getDependencyCopyPatterns = (projectRoot) => {
  const pkgPath = path.resolve(projectRoot, 'package.json');
  const pkg = readPackageJson(pkgPath);

  if (!pkg) {
    return [];
  }

  const projectRequire = createRequire(pkgPath);
  const visited = new Set();
  const patterns = [];

  const queue = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ];

  const enqueueDependency = (dependency) => {
    if (!dependency) {
      return;
    }

    let dependencyPackageJsonPath;

    try {
      dependencyPackageJsonPath = projectRequire.resolve(`${dependency}/package.json`);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        return;
      }

      throw error;
    }

    if (visited.has(dependencyPackageJsonPath)) {
      return;
    }

    visited.add(dependencyPackageJsonPath);

    patterns.push({
      from: path.dirname(dependencyPackageJsonPath),
      to: path.resolve(projectRoot, 'dist', 'node_modules', dependency),
      noErrorOnMissing: true,
    });

    const dependencyPackageJson = readPackageJson(dependencyPackageJsonPath);

    if (!dependencyPackageJson) {
      return;
    }

    const childDependencies = [
      ...Object.keys(dependencyPackageJson.dependencies || {}),
      ...Object.keys(dependencyPackageJson.optionalDependencies || {}),
      ...Object.keys(dependencyPackageJson.peerDependencies || {}),
    ];

    childDependencies.forEach((child) => queue.push(child));
  };

  while (queue.length > 0) {
    const dependency = queue.shift();

    if (!dependency) {
      continue;
    }

    enqueueDependency(dependency);
  }

  return patterns;
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
  const baseCopyPatterns = [
    {
      from: path.resolve(resolvedProjectRoot, 'package.json'),
      to: path.resolve(resolvedProjectRoot, 'dist', 'package.json'),
      noErrorOnMissing: true,
    },
    {
      from: path.resolve(resolvedProjectRoot, 'package-lock.json'),
      to: path.resolve(resolvedProjectRoot, 'dist', 'package-lock.json'),
      noErrorOnMissing: true,
    },
    {
      from: path.resolve(resolvedProjectRoot, 'node_modules'),
      to: path.resolve(resolvedProjectRoot, 'dist', 'node_modules'),
      noErrorOnMissing: true,
    },
  ];

  const dependencyCopyPatterns = getDependencyCopyPatterns(resolvedProjectRoot);

  const normalizedCopyPatterns = normalizeCopyPatterns({
    projectRoot: resolvedProjectRoot,
    patterns: copyPatterns,
  });

  const pluginCopyPatterns = [
    ...baseCopyPatterns,
    ...dependencyCopyPatterns,
    ...normalizedCopyPatterns,
  ];

  if (pluginCopyPatterns.length > 0) {
    plugins.push(
      new CopyWebpackPlugin({
        patterns: pluginCopyPatterns,
      }),
    );
  }

  return {
    mode: 'production',
    target: 'node',
    entry: resolvedEntry,
    output: {
      path: path.resolve(resolvedProjectRoot, 'dist'),
      filename: outputFilename,
      libraryTarget: 'commonjs2',
      clean: true,
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
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
