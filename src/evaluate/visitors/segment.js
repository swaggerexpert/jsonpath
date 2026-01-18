/**
 * Segment visitor dispatcher.
 *
 * Handles ChildSegment and DescendantSegment types.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.5
 */

import visitSelector from './selector.js';
import visitBracketedSelection from './bracketed-selection.js';

/**
 * Visit a segment's selector.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} selector - Selector AST node
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitSegmentSelector = (ctx, value, selector, emit) => {
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
};

/**
 * Visit a child segment.
 * Applies selector to current value.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} node - ChildSegment AST node
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
export const visitChildSegment = (ctx, value, node, emit) => {
  const { selector } = node;
  visitSegmentSelector(ctx, value, selector, emit);
};

/**
 * Visit a descendant segment.
 * Applies selector to current value and all descendants.
 *
 * Note: This is used by exec.js which handles the recursive descent
 * by pushing descendants onto the stack. This function only applies
 * the selector at the current level.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} node - DescendantSegment AST node
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
export const visitDescendantSegment = (ctx, value, node, emit) => {
  const { selector } = node;
  visitSegmentSelector(ctx, value, selector, emit);
};

/**
 * Visit a segment and emit selected values.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} node - Segment AST node
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitSegment = (ctx, value, node, emit) => {
  switch (node.type) {
    case 'ChildSegment':
      visitChildSegment(ctx, value, node, emit);
      break;
    case 'DescendantSegment':
      visitDescendantSegment(ctx, value, node, emit);
      break;
    default:
      break;
  }
};

export default visitSegment;
