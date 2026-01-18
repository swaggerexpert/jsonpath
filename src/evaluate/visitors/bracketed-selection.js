/**
 * Bracketed selection visitor.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.5.1
 *
 * A bracketed selection contains one or more selectors.
 * Each selector's results are concatenated.
 */

import visitSelector from './selector.js';

/**
 * Visit a bracketed selection.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} value - Current value
 * @param {object} node - AST node
 * @param {object[]} node.selectors - Array of selector AST nodes
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitBracketedSelection = (ctx, value, node, emit) => {
  const { selectors } = node;

  // Visit each selector and emit its results
  for (const selector of selectors) {
    visitSelector(ctx, value, selector, emit);
  }
};

export default visitBracketedSelection;
