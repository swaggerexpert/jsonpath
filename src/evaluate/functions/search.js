/**
 * RFC 9535 search() function.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.2
 *
 * Parameters:
 *   ValueType (string), ValueType (I-Regexp pattern string)
 *
 * Returns:
 *   LogicalType (boolean)
 *
 * Result:
 *   true if any substring matches the I-Regexp pattern, false otherwise.
 *   The pattern is not anchored (can match anywhere in string).
 */

import { coerceToValueType } from '../utils/guards.js';
import { constructRegex } from '../utils/i-regexp.js';

/**
 * Test if any substring matches I-Regexp pattern.
 *
 * @param {object} realm - Evaluation realm
 * @param {unknown} value - The string to search (may be a nodelist)
 * @param {unknown} pattern - The I-Regexp pattern (may be a nodelist)
 * @returns {boolean} - true if any substring matches
 */
const search = (realm, value, pattern) => {
  // Coerce nodelists to single values
  const coercedValue = coerceToValueType(value);
  const coercedPattern = coerceToValueType(pattern);

  // Get raw string values from realm
  const strValue = realm.getString(coercedValue);
  const strPattern = realm.getString(coercedPattern);

  if (strValue === undefined || strPattern === undefined) {
    return false;
  }

  const regex = constructRegex(strPattern, false); // not anchored
  if (regex === null) {
    // Invalid I-Regexp pattern
    return false;
  }

  return regex.test(strValue);
};

export default search;
