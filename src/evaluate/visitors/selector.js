/**
 * Selector visitor dispatcher.
 *
 * Routes to the appropriate selector visitor based on AST node type.
 */

import visitNameSelector from './name-selector.js';
import visitIndexSelector from './index-selector.js';
import visitWildcardSelector from './wildcard-selector.js';
import visitSliceSelector from './slice-selector.js';
import visitFilterSelector from './filter-selector.js';

/**
 * Visit a selector and emit selected values.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} node - Selector AST node
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitSelector = (ctx, value, node, emit) => {
  switch (node.type) {
    case 'NameSelector':
      visitNameSelector(ctx, value, node, emit);
      break;
    case 'IndexSelector':
      visitIndexSelector(ctx, value, node, emit);
      break;
    case 'WildcardSelector':
      visitWildcardSelector(ctx, value, node, emit);
      break;
    case 'SliceSelector':
      visitSliceSelector(ctx, value, node, emit);
      break;
    case 'FilterSelector':
      visitFilterSelector(ctx, value, node, emit);
      break;
    default:
      // Unknown selector type, yield nothing
      break;
  }
};

export default visitSelector;
