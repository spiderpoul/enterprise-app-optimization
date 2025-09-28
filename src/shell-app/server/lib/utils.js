const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

module.exports = {
  cloneDeep,
  delay,
};
