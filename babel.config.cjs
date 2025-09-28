const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'defaults',
        modules: false,
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
