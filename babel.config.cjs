const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'ie 11',
        useBuiltIns: 'usage',
        modules: 'cjs',
        corejs: '3.38',
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'babel-plugin-styled-components',
      {
        displayName: !isProduction,
        fileName: !isProduction,
        minify: isProduction,
        pure: true,
      },
    ],
  ],
};
