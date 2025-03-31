import parse from '../parse/index.js';

const test = (jsonPath, { normalized = false } = {}) => {
  if (typeof jsonPath !== 'string') return false;

  try {
    const { result } = parse(jsonPath, {
      normalized,
      stats: false,
      trace: false,
      translator: null,
    });

    return result.success;
  } catch {
    return false;
  }
};

export default test;
