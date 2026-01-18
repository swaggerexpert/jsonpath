/**
 * Filter selector visitor.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5
 *
 * A filter selector [?expr] selects all children where the expression is true.
 * For arrays: tests each element
 * For objects: tests each member value
 */

import evaluateLogicalExpr from '../evaluators/logical-expr.js';

/**
 * Visit a filter selector.
 *
 * @param {object} ctx - Evaluation context
 * @param {object} ctx.realm - Data realm
 * @param {object} ctx.root - Root value ($)
 * @param {unknown} value - Current value
 * @param {object} node - AST node
 * @param {object} node.expression - Logical expression to evaluate
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitFilterSelector = (ctx, value, node, emit) => {
  const { realm, root } = ctx;
  const { expression } = node;

  for (const [key, child] of realm.entries(value)) {
    const result = evaluateLogicalExpr(ctx, root, child, expression);
    if (result) {
      emit(child, key);
    }
  }
};

export default visitFilterSelector;
