const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '61',
          firefox: '52',
          safari: '10.1',
          edge: '16',
          ios: '10.3',
        },
        modules: false
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
