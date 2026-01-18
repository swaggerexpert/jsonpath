/**
 * Index selector visitor.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.3
 *
 * An index selector selects at most one element from an array.
 * Supports negative indices (count from end).
 */

/**
 * Normalize an array index.
 * Negative indices count from the end.
 *
 * @param {number} index - The index (may be negative)
 * @param {number} length - Array length
 * @returns {number} - Normalized index (non-negative or out of bounds)
 */
const normalizeIndex = (index, length) => {
  if (index >= 0) return index;
  return length + index;
};

/**
 * Visit an index selector.
 *
 * @param {object} ctx - Evaluation context
 * @param {object} ctx.realm - Data realm
 * @param {unknown} value - Current value
 * @param {object} node - AST node
 * @param {number} node.value - Index to select
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitIndexSelector = (ctx, value, node, emit) => {
  const { realm } = ctx;
  const { value: index } = node;

  if (!realm.isArray(value)) return;

  const length = realm.getLength(value);
  const normalizedIndex = normalizeIndex(index, length);

  // Check bounds
  if (normalizedIndex >= 0 && normalizedIndex < length) {
    const selected = realm.getElement(value, normalizedIndex);
    emit(selected, normalizedIndex);
  }
  // If out of bounds, yield nothing
};

export default visitIndexSelector;
