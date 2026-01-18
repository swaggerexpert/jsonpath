/**
 * Function expression evaluator.
 *
 * Evaluates function calls like length(@.items), match(@.name, "pattern"), etc.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4
 */

import evaluateComparable from './comparable.js';
import evaluateFilterQuery from './filter-query.js';

/**
 * Evaluate a function argument.
 * Arguments can be:
 * - Literals
 * - Singular queries (@.path, $.path)
 * - Filter queries (for NodesType parameters)
 * - Function expressions (nested calls)
 * - Logical expressions (for LogicalType parameters)
 *
 * Special case: When a TestExpr contains only a FilterQuery,
 * we evaluate it as a nodelist (for functions like count() that expect NodesType).
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} arg - Argument AST node
 * @returns {unknown} - Evaluated argument value
 */
const evaluateArgument = (ctx, root, current, arg) => {
  switch (arg.type) {
    case 'Literal':
    case 'RelSingularQuery':
    case 'AbsSingularQuery':
    case 'FunctionExpr':
      return evaluateComparable(ctx, root, current, arg);

    case 'FilterQuery':
      // FilterQuery produces a nodelist (array of values)
      return evaluateFilterQuery(ctx, root, current, arg);

    case 'TestExpr':
      // TestExpr can contain FilterQuery (for NodesType/ValueType) or FunctionExpr
      if (arg.expression.type === 'FilterQuery') {
        // Always return the nodelist - functions handle type coercion internally
        // Per RFC 9535 Section 2.4.1: if a function expects ValueType and gets NodesType,
        // it auto-converts (single node -> value, otherwise -> Nothing)
        return evaluateFilterQuery(ctx, root, current, arg.expression);
      }
      if (arg.expression.type === 'FunctionExpr') {
        // FunctionExpr as argument - evaluate the nested function
        return evaluateComparable(ctx, root, current, arg.expression);
      }
      // Otherwise evaluate as logical expression
      // eslint-disable-next-line no-use-before-define
      return evaluateLogicalExpr(ctx, root, current, arg);

    case 'LogicalOrExpr':
    case 'LogicalAndExpr':
    case 'LogicalNotExpr':
    case 'ComparisonExpr':
      // Import dynamically to avoid circular dependency
      // eslint-disable-next-line no-use-before-define
      return evaluateLogicalExpr(ctx, root, current, arg);

    default:
      return undefined;
  }
};

// Lazy import to avoid circular dependency
let evaluateLogicalExpr;
export const setLogicalExprEvaluator = (fn) => {
  evaluateLogicalExpr = fn;
};

/**
 * Evaluate a function expression.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} node - AST node
 * @param {string} node.name - Function name
 * @param {object[]} node.arguments - Array of argument AST nodes
 * @returns {unknown} - Function result
 */
const evaluateFunctionExpr = (ctx, root, current, node) => {
  const { name, arguments: args } = node;

  const fn = ctx.functions[name];
  if (typeof fn !== 'function') {
    // Unknown function returns Nothing
    return undefined;
  }

  // Evaluate all arguments
  const evaluatedArgs = args.map((arg) => evaluateArgument(ctx, root, current, arg));

  // Call the function with realm and evaluated arguments
  return fn(ctx.realm, ...evaluatedArgs);
};

export default evaluateFunctionExpr;
