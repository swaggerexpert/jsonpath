/**
 * JSONPath evaluation module.
 *
 * Provides the evaluate() function to execute JSONPath expressions against a value.
 * Uses an explicit stack for tree traversal to avoid call stack overflow
 * on deeply nested documents.
 *
 * @module evaluate
 * @see https://www.rfc-editor.org/rfc/rfc9535
 */

import parse from '../parse/index.js';
import * as NormalizedPath from '../normalized-path.js';
import visitSegment from './visitors/segment.js';
import JSONEvaluationRealm from './realms/json/index.js';
import JSONPathEvaluateError from '../errors/JSONPathEvaluateError.js';
import * as defaultFunctions from './functions/index.js';

/**
 * @typedef {Object} EvaluateOptions
 * @property {Function} [callback] - Optional callback (value, normalizedPath) => void
 *   Called for each match. Allows streaming results and collecting paths.
 * @property {Object} [realm] - Optional custom evaluation realm.
 *   Default is JSONEvaluationRealm for plain objects/arrays.
 * @property {Object} [functions] - Optional custom function registry.
 *   Can extend or override built-in functions (length, count, match, search, value).
 */

/**
 * Evaluate a JSONPath expression against a value.
 *
 * @param {unknown} value - JSON value to query
 * @param {string} expression - JSONPath expression
 * @param {EvaluateOptions} [options] - Evaluation options
 * @returns {unknown[]} - Array of matched values
 * @throws {JSONPathEvaluateError} If the expression is invalid
 *
 * @example
 * // Simple query
 * evaluate({ a: 1, b: 2 }, '$.a');
 * // => [1]
 *
 * @example
 * // Wildcard
 * evaluate({ store: { book: [{ title: 'A' }, { title: 'B' }] } }, '$.store.book[*].title');
 * // => ['A', 'B']
 *
 * @example
 * // With callback to collect paths
 * const paths = [];
 * evaluate(value, '$.store.book[*]', {
 *   callback: (v, path) => paths.push(path)
 * });
 */
const evaluate = (
  value,
  expression,
  { callback, realm = new JSONEvaluationRealm(), functions = defaultFunctions } = {},
) => {
  // Parse the expression
  const parseResult = parse(expression);

  if (!parseResult.result.success) {
    throw new JSONPathEvaluateError(`Invalid JSONPath expression: ${expression}`, {
      expression,
    });
  }

  try {
    // The tree is the AST root directly (JsonPathQuery node)
    const ast = parseResult.tree;
    const { segments } = ast;
    const results = [];

    // Handle empty query ($ with no segments)
    if (segments.length === 0) {
      results.push(value);
      if (typeof callback === 'function') {
        callback(value, '$');
      }
      return results;
    }

    // Evaluation context with root for filter expressions
    const ctx = { realm, root: value, functions };

    const stack = [];

    // Start with root value
    stack.push({
      value,
      path: [],
      segmentIndex: 0,
    });

    while (stack.length > 0) {
      const item = stack.pop();
      const { value, path, segmentIndex } = item;

      // If all segments processed, emit result
      if (segmentIndex >= segments.length) {
        const normalizedPath = NormalizedPath.from(path);
        results.push(value);
        if (typeof callback === 'function') {
          callback(value, normalizedPath);
        }
        continue;
      }

      const segment = segments[segmentIndex];

      // Collect results from this segment
      const segmentResults = [];
      const emit = (selectedValue, pathSegment) => {
        segmentResults.push({
          value: selectedValue,
          pathSegment,
        });
      };

      // Apply segment
      visitSegment(ctx, value, segment, emit);

      // For descendant segments, also push children for recursive descent
      // Push descendants FIRST so they're processed AFTER current level results (LIFO)
      if (segment.type === 'DescendantSegment') {
        const descendants = [];

        for (const [key, child] of realm.entries(value)) {
          descendants.push({
            value: child,
            pathSegment: key,
          });
        }

        // Push descendants (in reverse for correct order)
        // They stay at same segment index to continue recursive descent
        for (let i = descendants.length - 1; i >= 0; i -= 1) {
          const { value: descendantValue, pathSegment } = descendants[i];
          stack.push({
            value: descendantValue,
            path: [...path, pathSegment],
            segmentIndex, // Same segment for recursive descent
          });
        }
      }

      // Push results for next segment (in reverse order for correct output order)
      // Push these AFTER descendants so they're processed FIRST (LIFO = document order)
      for (let i = segmentResults.length - 1; i >= 0; i -= 1) {
        const { value: selectedValue, pathSegment } = segmentResults[i];
        stack.push({
          value: selectedValue,
          path: [...path, pathSegment],
          segmentIndex: segmentIndex + 1,
        });
      }
    }

    return results;
  } catch (error) {
    throw new JSONPathEvaluateError('Unexpected error during JSONPath evaluation', {
      cause: error,
      expression,
    });
  }
};

export default evaluate;
