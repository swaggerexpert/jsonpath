/**
 * Type guards for JSON value types.
 */

const objectTag = '[object Object]';

/**
 * Check if value is an array.
 * @param {unknown} value
 * @returns {value is unknown[]}
 */
export const isArray = (value) => Array.isArray(value);

/**
 * Check if value is an object (not null, not array).
 * @param {unknown} value
 * @returns {value is object}
 */
export const isObject = (value) =>
  typeof value === 'object' && value !== null && !isArray(value);

/**
 * Check if value is a plain object (created by Object constructor or object literal).
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export const isPlainObject = (value) => {
  if (!isObject(value)) return false;

  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;

  return (
    proto.constructor === Object &&
    Object.prototype.toString.call(value) === objectTag
  );
};

/**
 * Check if value is a string.
 * @param {unknown} value
 * @returns {value is string}
 */
export const isString = (value) => typeof value === 'string';

/**
 * Check if value is a number.
 * @param {unknown} value
 * @returns {value is number}
 */
export const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

/**
 * Check if value is a boolean.
 * @param {unknown} value
 * @returns {value is boolean}
 */
export const isBoolean = (value) => typeof value === 'boolean';

/**
 * Check if value is null.
 * @param {unknown} value
 * @returns {value is null}
 */
export const isNull = (value) => value === null;

/**
 * Check if value represents Nothing (undefined).
 * Per RFC 9535, Nothing is used when a query returns no value.
 * We use undefined since JSON has no undefined value.
 * @param {unknown} value
 * @returns {value is undefined}
 */
export const isNothing = (value) => value === undefined;

/**
 * Check if value is a valid JSON value.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isJsonValue = (value) => {
  if (isNull(value) || isBoolean(value) || isString(value) || isNumber(value)) {
    return true;
  }
  if (isArray(value)) {
    return value.every(isJsonValue);
  }
  if (isPlainObject(value)) {
    return Object.values(value).every(isJsonValue);
  }
  return false;
};

/**
 * Check if value is a nodelist (marked array from filter query).
 * @param {unknown} value
 * @returns {boolean}
 */
export const isNodelist = (value) => isArray(value) && value._isNodelist === true;

/**
 * Coerce a nodelist to a single value (ValueType).
 * Per RFC 9535 Section 2.4.1: if function expects ValueType and receives NodesType,
 * auto-convert: single node -> that node's value, otherwise -> Nothing.
 *
 * @param {unknown} value - Input value (may be a nodelist)
 * @returns {unknown} - Coerced value or Nothing (undefined)
 */
export const coerceToValueType = (value) => {
  if (isNodelist(value)) {
    // Single node: unwrap and return value
    if (value.length === 1) {
      return value[0];
    }
    // Empty or multiple nodes: return Nothing
    return undefined;
  }
  // Not a nodelist, return as-is
  return value;
};
