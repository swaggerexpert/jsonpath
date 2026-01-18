/**
 * Comparable evaluator.
 *
 * Evaluates comparables which can be:
 * - Literal (string, number, boolean, null)
 * - RelSingularQuery (@.path)
 * - AbsSingularQuery ($.path)
 * - FunctionExpr (function call)
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.2.2
 */

import evaluateLiteral from './literal.js';
import { evaluateRelSingularQuery, evaluateAbsSingularQuery } from './singular-query.js';
import evaluateFunctionExpr from './function-expr.js';

/**
 * Evaluate a comparable expression.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} node - Comparable AST node
 * @returns {unknown} - Evaluated value
 */
const evaluateComparable = (ctx, root, current, node) => {
  switch (node.type) {
    case 'Literal':
      return evaluateLiteral(ctx, root, current, node);
    case 'RelSingularQuery':
      return evaluateRelSingularQuery(ctx, root, current, node);
    case 'AbsSingularQuery':
      return evaluateAbsSingularQuery(ctx, root, current, node);
    case 'FunctionExpr':
      return evaluateFunctionExpr(ctx, root, current, node);
    default:
      return undefined;
  }
};

export default evaluateComparable;
