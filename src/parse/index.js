import { Parser, Stats, Trace } from 'apg-lite';

import Grammar from '../grammar.js';
import translateEvaluator from './evaluators/translate.js';
import JSONPathQueryCST from './ast/JSONPathQueryCST.js';
import JSONPathParseError from '../errors/JSONPathParseError.js';

const grammar = new Grammar();

const parse = (
  jsonPath,
  {
    ast = new JSONPathQueryCST(),
    stats = false,
    trace = false,
    evaluator = translateEvaluator,
  } = {},
) => {
  if (typeof jsonPath !== 'string') {
    throw new TypeError('JSONPath must be a string');
  }

  try {
    const parser = new Parser();
    parser.ast = ast;
    if (stats) parser.stats = new Stats();
    if (trace) parser.trace = new Trace();

    const result = parser.parse(grammar, 'jsonpath-query', jsonPath);
    const computed = evaluator(ast, { result });

    return { result, ast, stats: parser.stats, trace: parser.trace, computed };
  } catch (error) {
    throw new JSONPathParseError('Unexpected error during JSONPath parsing', {
      cause: error,
      jsonPath,
    });
  }
};

export default parse;
