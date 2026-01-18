/**
 * Slice selector visitor.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.4
 *
 * A slice selector [start:end:step] selects elements from an array.
 * - start: first index (default 0 for positive step, len-1 for negative)
 * - end: upper bound (default len for positive step, -len-1 for negative)
 * - step: step size (default 1, must not be 0)
 */

/**
 * Normalize a slice bound according to RFC 9535.
 * @param {number} index - The bound value
 * @param {number} length - Array length
 * @returns {number} - Normalized bound
 */
const normalizeBound = (index, length) => {
  if (index >= 0) {
    return Math.min(index, length);
  }
  return Math.max(length + index, 0);
};

/**
 * Get slice bounds and step according to RFC 9535 Section 2.3.4.2.
 *
 * @param {number | null} start
 * @param {number | null} end
 * @param {number | null} step
 * @param {number} length - Array length
 * @returns {{ lower: number, upper: number, step: number } | null}
 */
const getSliceBounds = (start, end, step, length) => {
  // Default step is 1
  const actualStep = step ?? 1;

  // Step of 0 is not allowed
  if (actualStep === 0) return null;

  let lower;
  let upper;

  if (actualStep > 0) {
    // Forward iteration
    const defaultStart = 0;
    const defaultEnd = length;

    const normalizedStart = start !== null ? normalizeBound(start, length) : defaultStart;
    const normalizedEnd = end !== null ? normalizeBound(end, length) : defaultEnd;

    lower = Math.max(normalizedStart, 0);
    upper = Math.min(normalizedEnd, length);
  } else {
    // Backward iteration
    const defaultStart = length - 1;
    const defaultEnd = -length - 1;

    const normalizedStart =
      start !== null
        ? start >= 0
          ? Math.min(start, length - 1)
          : Math.max(length + start, -1)
        : defaultStart;

    const normalizedEnd =
      end !== null
        ? end >= 0
          ? Math.min(end, length - 1)
          : Math.max(length + end, -1)
        : defaultEnd;

    upper = Math.min(normalizedStart, length - 1);
    lower = Math.max(normalizedEnd, -1);
  }

  return { lower, upper, step: actualStep };
};

/**
 * Visit a slice selector.
 *
 * @param {object} ctx - Evaluation context
 * @param {object} ctx.realm - Data realm
 * @param {unknown} value - Current value
 * @param {object} node - AST node
 * @param {number | null} node.start - Start index
 * @param {number | null} node.end - End index
 * @param {number | null} node.step - Step
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitSliceSelector = (ctx, value, node, emit) => {
  const { realm } = ctx;
  const { start, end, step } = node;

  if (!realm.isArray(value)) return;

  const length = realm.getLength(value);
  const bounds = getSliceBounds(start, end, step, length);

  if (bounds === null) return; // step was 0

  const { lower, upper, step: actualStep } = bounds;

  if (actualStep > 0) {
    // Forward iteration
    for (let i = lower; i < upper; i += actualStep) {
      const selected = realm.getElement(value, i);
      emit(selected, i);
    }
  } else {
    // Backward iteration
    for (let i = upper; i > lower; i += actualStep) {
      const selected = realm.getElement(value, i);
      emit(selected, i);
    }
  }
};

export default visitSliceSelector;
