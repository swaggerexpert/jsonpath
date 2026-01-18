/**
 * RFC 9535 value() function.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.7
 *
 * Parameters:
 *   NodesType (nodelist)
 *
 * Returns:
 *   ValueType (the single value or Nothing)
 *
 * Result:
 *   - If nodelist has exactly one node: that node's value
 *   - Otherwise: Nothing (undefined)
 */

import { isArray } from '../utils/guards.js';

/**
 * Extract the single value from a nodelist.
 *
 * @param {object} realm - Evaluation realm (unused, for consistent signature)
 * @param {unknown} nodelist - A nodelist (array of values)
 * @returns {unknown} - The single value or Nothing (undefined)
 */
const value = (realm, nodelist) => {
  if (isArray(nodelist) && nodelist.length === 1) {
    return nodelist[0];
  }
  // Nothing for empty nodelist, multiple values, or non-nodelist
  return undefined;
};

export default value;
