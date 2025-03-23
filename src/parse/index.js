import { Parser } from 'apg-lite';

import Grammar from '../grammar.js';
import translateEvaluator from './evaluators/translate.js';
import JSONPathQueryCST from './ast/JSONPathQueryCST.js';
import JSONPathParseError from '../errors/JSONPathParseError.js';

const grammar = new Grammar();

const parse = (jsonPath, { evaluator = translateEvaluator } = {}) => {
  if (typeof jsonPath !== 'string') {
    throw new TypeError('JSONPath must be a string');
  }

  try {
    const parser = new Parser();
    const ast = new JSONPathQueryCST();

    parser.ast = ast;

    const result = parser.parse(grammar, 'jsonpath-query', jsonPath);

    if (!result.success) {
      return { result, ast, computed: null };
    }

    const computed = evaluator(ast, { result });

    return { result, ast, computed };
  } catch (error) {
    throw new JSONPathParseError('Unexpected error during JSONPath parsing', {
      cause: error,
      jsonPath,
    });
  }
};

console.dir(parse('$.store.books[?(@.price < 10)].title'), { depth: null });

export default parse;
