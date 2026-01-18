/**
 * Name selector visitor.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1
 *
 * A name selector selects at most one member value from an object.
 * If the object has the specified member, yield its value.
 * If not, yield nothing.
 */

/**
 * Visit a name selector.
 *
 * @param {object} ctx - Evaluation context
 * @param {object} ctx.realm - Data realm
 * @param {unknown} value - Current value
 * @param {object} node - AST node
 * @param {string} node.value - Property name to select
 * @param {(value: unknown, segment: string | number) => void} emit - Callback to emit selected value
 */
const visitNameSelector = (ctx, value, node, emit) => {
  const { realm } = ctx;
  const { value: name } = node;

  if (realm.isObject(value) && realm.hasProperty(value, name)) {
    const selected = realm.getProperty(value, name);
    emit(selected, name);
  }
  // If not an object or property doesn't exist, yield nothing
};

export default visitNameSelector;
