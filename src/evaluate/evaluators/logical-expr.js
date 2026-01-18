/**
 * Logical expression evaluator.
 *
 * Evaluates logical expressions:
 * - LogicalOrExpr (||)
 * - LogicalAndExpr (&&)
 * - LogicalNotExpr (!)
 * - TestExpr (existence test or function result)
 * - ComparisonExpr (routed to comparison evaluator)
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.2
 */

import evaluateComparisonExpr from './comparison-expr.js';
import evaluateFunctionExpr, { setLogicalExprEvaluator } from './function-expr.js';
import evaluateFilterQuery from './filter-query.js';
import { isArray } from '../utils/guards.js';

/**
 * Evaluate a logical expression.
 *
 * @param {object} ctx - Evaluation context
 * @param {unknown} root - Root value ($)
 * @param {unknown} current - Current value (@)
 * @param {object} node - Logical expression AST node
 * @returns {boolean} - Logical result
 */
const evaluateLogicalExpr = (ctx, root, current, node) => {
  switch (node.type) {
    case 'LogicalOrExpr': {
      // Short-circuit OR
      const left = evaluateLogicalExpr(ctx, root, current, node.left);
      if (left) return true;
      return evaluateLogicalExpr(ctx, root, current, node.right);
    }

    case 'LogicalAndExpr': {
      // Short-circuit AND
      const left = evaluateLogicalExpr(ctx, root, current, node.left);
      if (!left) return false;
      return evaluateLogicalExpr(ctx, root, current, node.right);
    }

    case 'LogicalNotExpr': {
      return !evaluateLogicalExpr(ctx, root, current, node.expression);
    }

    case 'TestExpr': {
      // TestExpr wraps a FilterQuery or FunctionExpr
      const { expression } = node;

      if (expression.type === 'FilterQuery') {
        // Existence test: true if nodelist is non-empty
        const nodelist = evaluateFilterQuery(ctx, root, current, expression);
        return nodelist.length > 0;
      }

      if (expression.type === 'FunctionExpr') {
        // Function result converted to boolean
        const result = evaluateFunctionExpr(ctx, root, current, expression);
        // LogicalType functions return boolean directly
        // ValueType functions: undefined (Nothing) is false, truthy values are true
        if (typeof result === 'boolean') {
          return result;
        }
        // Nothing is false
        if (result === undefined) {
          return false;
        }
        // NodesType (array): non-empty is true
        if (isArray(result)) {
          return result.length > 0;
        }
        // Other ValueType: truthy check
        return Boolean(result);
      }

      return false;
    }

    case 'ComparisonExpr': {
      return evaluateComparisonExpr(ctx, root, current, node);
    }

    default:
      return false;
  }
};

// Register with function-expr to break circular dependency
setLogicalExprEvaluator(evaluateLogicalExpr);

export default evaluateLogicalExpr;
