/**
 * Comparison expression evaluator.
 *
 * Evaluates comparison expressions like @.price < 10, @.name == "foo", etc.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.2.3
 */

import evaluateComparable from './comparable.js';

/**
 * Evaluate a comparison expression.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} node - ComparisonExpr AST node
 * @param {object} node.left - Left comparable
 * @param {string} node.op - Comparison operator (==, !=, <, <=, >, >=)
 * @param {object} node.right - Right comparable
 * @returns {boolean} - Comparison result
 */
const evaluateComparisonExpr = (ctx, root, current, node) => {
  const { left, op, right } = node;

  const leftValue = evaluateComparable(ctx, root, current, left);
  const rightValue = evaluateComparable(ctx, root, current, right);

  return ctx.realm.compare(leftValue, op, rightValue);
};

export default evaluateComparisonExpr;
