/**
 * RFC 9535 length() function.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.5
 *
 * Parameters:
 *   ValueType (single value)
 *
 * Returns:
 *   ValueType (number or Nothing)
 *
 * Result:
 *   - String: number of Unicode scalar values (not UTF-16 code units)
 *   - Array: number of elements
 *   - Object: number of members (key-value pairs)
 *   - Other: Nothing (undefined)
 */

import { coerceToValueType, isNothing } from '../utils/guards.js';

/**
 * Get the length of a value.
 *
 * @param {object} realm - Evaluation realm
 * @param {unknown} value - The value to measure (may be a nodelist)
 * @returns {number | undefined} - Length or Nothing (undefined)
 */
const length = (realm, value) => {
  // Coerce nodelist to single value if needed
  const coerced = coerceToValueType(value);

  // Nothing returns Nothing
  if (isNothing(coerced)) return undefined;

  // Use realm to get length (handles strings, arrays, objects)
  const len = realm.getLength(coerced);
  return len > 0 || realm.isString(coerced) || realm.isArray(coerced) || realm.isObject(coerced)
    ? len
    : undefined;
};

export default length;
