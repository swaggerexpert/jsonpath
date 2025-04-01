import { Parser, Stats, Trace } from 'apg-lite';

import Grammar from '../grammar.js';
import CSTTranslator from './translators/CSTTranslator.js';
import JSONPathParseError from '../errors/JSONPathParseError.js';

const grammar = new Grammar();

const parse = (
  jsonPath,
  { normalized = false, stats = false, trace = false, translator = new CSTTranslator() } = {},
) => {
  if (typeof jsonPath !== 'string') {
    throw new TypeError('JSONPath must be a string');
  }

  try {
    const parser = new Parser();

    if (translator) parser.ast = translator;
    if (stats) parser.stats = new Stats();
    if (trace) parser.trace = new Trace();

    const startRule = normalized ? 'normalized-path' : 'jsonpath-query';
    const result = parser.parse(grammar, startRule, jsonPath);

    return {
      result,
      tree: result.success && translator ? parser.ast.getTree() : undefined,
      stats: parser.stats,
      trace: parser.trace,
    };
  } catch (error) {
    throw new JSONPathParseError('Unexpected error during JSONPath parsing', {
      cause: error,
      jsonPath,
    });
  }
};

console.dir(parse('$[?(!(@.price < 10))]'), { depth: null });

export default parse;
