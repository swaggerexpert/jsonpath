import parse from '../parse/index.js';
import ASTTranslator from '../parse/translators/ASTTranslator/index.js';

const test = (jsonPath, { normalized = false, wellTyped = true } = {}) => {
  if (typeof jsonPath !== 'string') return false;

  try {
    const { result } = parse(jsonPath, {
      normalized,
      stats: false,
      trace: false,
      translator: wellTyped ? new ASTTranslator() : null,
    });

    return result.success;
  } catch {
    return false;
  }
};

export default test;
