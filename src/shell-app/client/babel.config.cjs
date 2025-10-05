const babelConfig = require('../../../babel.config.cjs');

const moduleConfig = JSON.parse(JSON.stringify(babelConfig));

moduleConfig.presets = moduleConfig.presets.map(preset => {
  if (Array.isArray(preset) && preset[0] === '@babel/preset-env') {
    return [
      '@babel/preset-env',
      {
        ...preset[1],
        modules: false
      }
    ];
  }
  return preset;
});

module.exports = moduleConfig;