/**
 * Wildcard selector visitor.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2
 *
 * A wildcard selector selects all children of a value:
 * - For arrays: all elements
 * - For objects: all member values
 */

/**
 * Visit a wildcard selector.
 *
 * @param {object} ctx - Evaluation context
 * @param {object} ctx.realm - Data realm
 * @param {unknown} value - Current value
 * @param {object} node - AST node (unused for wildcard)
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitWildcardSelector = (ctx, value, node, emit) => {
  const { realm } = ctx;

  for (const [key, child] of realm.entries(value)) {
    emit(child, key);
  }
};

export default visitWildcardSelector;
