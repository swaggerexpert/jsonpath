/**
 * RFC 9535 count() function.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.4
 *
 * Parameters:
 *   NodesType (nodelist)
 *
 * Returns:
 *   ValueType (number)
 *
 * Result:
 *   The number of nodes in the nodelist.
 */

import { isNodelist } from '../utils/guards.js';

/**
 * Count the number of nodes in a nodelist.
 *
 * @param {object} realm - Evaluation realm (unused, for consistent signature)
 * @param {unknown} nodelist - A nodelist (array of values)
 * @returns {number} - Number of nodes
 */
const count = (realm, nodelist) => {
  if (isNodelist(nodelist)) {
    return nodelist.length;
  }
  // Not a nodelist (NodesType): return Nothing per RFC 9535
  return undefined;
};

export default count;
