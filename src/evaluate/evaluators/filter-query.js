/**
 * Filter query evaluator.
 *
 * Evaluates FilterQuery expressions which contain either:
 * - RelQuery (@.path) - relative to current node
 * - JsonPathQuery ($.path) - absolute from root
 *
 * Returns a nodelist (array of matched values).
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.2.1
 */

import visitSelector from '../visitors/selector.js';
import visitBracketedSelection from '../visitors/bracketed-selection.js';

/**
 * Apply a segment to a value and collect all results.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} segment - Segment AST node
 * @returns {unknown[]} - Array of matched values
 */
const applySegment = (ctx, value, segment) => {
  const results = [];

  const emit = (selectedValue) => {
    results.push(selectedValue);
  };

  const { selector } = segment;

  switch (selector.type) {
    case 'BracketedSelection':
      visitBracketedSelection(ctx, value, selector, emit);
      break;
    case 'NameSelector':
    case 'WildcardSelector':
    case 'IndexSelector':
    case 'SliceSelector':
    case 'FilterSelector':
      visitSelector(ctx, value, selector, emit);
      break;
    default:
      break;
  }

  return results;
};

/**
 * Apply segments to get nodelist, supporting descendant segments.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown[]} values - Current nodelist
 * @param {object[]} segments - Remaining segments
 * @returns {unknown[]} - Result nodelist
 */
const applySegments = (ctx, root, values, segments) => {
  let current = values;

  for (const segment of segments) {
    const next = [];

    if (segment.type === 'DescendantSegment') {
      // Descendant segment: apply to current and all descendants
      const collectDescendants = (value) => {
        const { realm } = ctx;
        // Apply selector at current level
        const results = applySegment(ctx, value, segment);
        next.push(...results);

        // Recurse into children
        for (const [, child] of realm.entries(value)) {
          collectDescendants(child);
        }
      };

      for (const value of current) {
        collectDescendants(value);
      }
    } else {
      // Child segment: apply to current values only
      for (const value of current) {
        const results = applySegment(ctx, value, segment);
        next.push(...results);
      }
    }

    current = next;
  }

  return current;
};

/**
 * Evaluate a RelQuery (@.path).
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} node - RelQuery AST node
 * @returns {unknown[]} - Nodelist of matched values
 */
const evaluateRelQuery = (ctx, root, current, node) => {
  const { segments } = node;

  if (segments.length === 0) {
    // @ with no segments returns current as single-element nodelist
    return [current];
  }

  return applySegments(ctx, root, [current], segments);
};

/**
 * Evaluate a JsonPathQuery ($.path).
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (unused)
 * @param {object} node - JsonPathQuery AST node
 * @returns {unknown[]} - Nodelist of matched values
 */
const evaluateJsonPathQuery = (ctx, root, current, node) => {
  const { segments } = node;

  if (segments.length === 0) {
    // $ with no segments returns root as single-element nodelist
    return [root];
  }

  return applySegments(ctx, root, [root], segments);
};

/**
 * Mark an array as a nodelist.
 * This helps functions distinguish nodelists from array values.
 *
 * @param {unknown[]} arr - Array to mark
 * @returns {unknown[]} - Marked array
 */
const markAsNodelist = (arr) => {
  Object.defineProperty(arr, '_isNodelist', {
    value: true,
    enumerable: false,
    writable: false,
  });
  return arr;
};

/**
 * Evaluate a FilterQuery.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} node - FilterQuery AST node
 * @returns {unknown[]} - Nodelist of matched values
 */
const evaluateFilterQuery = (ctx, root, current, node) => {
  const { query } = node;
  let result;

  switch (query.type) {
    case 'RelQuery':
      result = evaluateRelQuery(ctx, root, current, query);
      break;
    case 'JsonPathQuery':
      result = evaluateJsonPathQuery(ctx, root, current, query);
      break;
    default:
      result = [];
  }

  // Mark result as a nodelist so functions can handle type coercion
  return markAsNodelist(result);
};

export default evaluateFilterQuery;
export { evaluateRelQuery, evaluateJsonPathQuery };
