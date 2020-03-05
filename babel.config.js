module.exports = (api) => {
  const esModules = api.env((envName) => envName.indexOf('es') !== -1);
  return {
    presets: [
      '@babel/preset-typescript',
      ['@babel/preset-env', {
        // TODO specify compatible browsers
        modules: esModules ? false : undefined,
      }],
    ],
  };
};
