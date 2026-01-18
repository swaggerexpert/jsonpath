/**
 * RFC 9535 match() function.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.1
 *
 * Parameters:
 *   ValueType (string), ValueType (I-Regexp pattern string)
 *
 * Returns:
 *   LogicalType (boolean)
 *
 * Result:
 *   true if the entire string matches the I-Regexp pattern, false otherwise.
 *   The pattern is implicitly anchored (^(?:pattern)$).
 */

import { coerceToValueType } from '../utils/guards.js';
import { constructRegex } from '../utils/i-regexp.js';

/**
 * Test if entire string matches I-Regexp pattern.
 *
 * @param {object} realm - Evaluation realm
 * @param {unknown} value - The string to test (may be a nodelist)
 * @param {unknown} pattern - The I-Regexp pattern (may be a nodelist)
 * @returns {boolean} - true if entire string matches
 */
const match = (realm, value, pattern) => {
  // Coerce nodelists to single values
  const coercedValue = coerceToValueType(value);
  const coercedPattern = coerceToValueType(pattern);

  // Get raw string values from realm
  const strValue = realm.getString(coercedValue);
  const strPattern = realm.getString(coercedPattern);

  if (strValue === undefined || strPattern === undefined) {
    return false;
  }

  const regex = constructRegex(strPattern, true); // anchored
  if (regex === null) {
    // Invalid I-Regexp pattern
    return false;
  }

  return regex.test(strValue);
};

export default match;
