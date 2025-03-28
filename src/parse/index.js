import { Parser, Stats, Trace } from 'apg-lite';

import Grammar from '../grammar.js';
import CSTTranslator from './translators/CSTTranslator.js';
import JSONPathParseError from '../errors/JSONPathParseError.js';

const grammar = new Grammar();

const parse = (
  jsonPath,
  { translator = new CSTTranslator(), stats = false, trace = false } = {},
) => {
  if (typeof jsonPath !== 'string') {
    throw new TypeError('JSONPath must be a string');
  }

  try {
    const parser = new Parser();

    if (translator) parser.ast = translator;
    if (stats) parser.stats = new Stats();
    if (trace) parser.trace = new Trace();

    const result = parser.parse(grammar, 'jsonpath-query', jsonPath);

    return {
      result,
      tree: parser.ast?.getTree(),
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

export default parse;
