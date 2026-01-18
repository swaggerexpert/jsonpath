/**
 * Literal evaluator.
 *
 * Evaluates a literal value (string, number, boolean, null).
 * Literals appear in comparisons and function arguments.
 */

/**
 * Evaluate a literal AST node.
 *
 * @param {object} ctx - Evaluation context (unused for literals)
 * @param {unknown} root - Root value (unused for literals)
 * @param {unknown} current - Current value (unused for literals)
 * @param {object} node - AST node
 * @param {unknown} node.value - The literal value
 * @returns {unknown} - The literal value
 */
const evaluateLiteral = (ctx, root, current, node) => {
  return node.value;
};

export default evaluateLiteral;
