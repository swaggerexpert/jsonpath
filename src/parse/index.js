import { Parser, Stats } from 'apg-lite';

import Trace from './trace/Trace.js';

import Grammar from '../grammar.js';
import ASTTranslator from './translators/ASTTranslator/index.js';
import JSONPathParseError from '../errors/JSONPathParseError.js';

const grammar = new Grammar();

const parse = (
  jsonPath,
  { normalized = false, stats = false, trace = false, translator = new ASTTranslator() } = {},
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
    // Provide specific error message for semantic validation errors
    const message =
      error instanceof RangeError
        ? `Invalid JSONPath expression: ${error.message}`
        : 'Unexpected error during JSONPath parsing';
    throw new JSONPathParseError(message, {
      cause: error,
      jsonPath,
    });
  }
};

export default parse;
