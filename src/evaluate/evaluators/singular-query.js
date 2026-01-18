/**
 * Singular query evaluator.
 *
 * Evaluates RelSingularQuery (@.path) and AbsSingularQuery ($.path) expressions.
 * These appear in comparison expressions within filters.
 *
 * A singular query can only contain name selectors and index selectors,
 * ensuring it produces at most one value.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.2.2
 */

/**
 * Apply a singular query segment (name or index selector).
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} segment - Segment AST node
 * @returns {unknown} - Selected value or undefined (Nothing)
 */
const applySingularSegment = (ctx, value, segment) => {
  const { realm } = ctx;
  const { selector } = segment;

  switch (selector.type) {
    case 'NameSelector': {
      const { value: name } = selector;
      if (realm.isObject(value) && realm.hasProperty(value, name)) {
        return realm.getProperty(value, name);
      }
      return undefined; // Nothing
    }
    case 'IndexSelector': {
      const { value: index } = selector;
      if (!realm.isArray(value)) return undefined;

      const length = realm.getLength(value);
      const normalizedIndex = index >= 0 ? index : length + index;

      if (normalizedIndex >= 0 && normalizedIndex < length) {
        return realm.getElement(value, normalizedIndex);
      }
      return undefined; // Nothing
    }
    default:
      return undefined;
  }
};

/**
 * Evaluate a RelSingularQuery (@.path).
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value (unused)
 * @param {unknown} current - Current value (@)
 * @param {object} node - AST node
 * @param {object[]} node.segments - Array of singular query segments
 * @returns {unknown} - Result value or undefined (Nothing)
 */
export const evaluateRelSingularQuery = (ctx, root, current, node) => {
  let value = current;

  for (const segment of node.segments) {
    value = applySingularSegment(ctx, value, segment);
    if (value === undefined) {
      return undefined; // Nothing - short circuit
    }
  }

  return value;
};

/**
 * Evaluate an AbsSingularQuery ($.path).
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (unused)
 * @param {object} node - AST node
 * @param {object[]} node.segments - Array of singular query segments
 * @returns {unknown} - Result value or undefined (Nothing)
 */
export const evaluateAbsSingularQuery = (ctx, root, current, node) => {
  let value = root;

  for (const segment of node.segments) {
    value = applySingularSegment(ctx, value, segment);
    if (value === undefined) {
      return undefined; // Nothing - short circuit
    }
  }

  return value;
};
