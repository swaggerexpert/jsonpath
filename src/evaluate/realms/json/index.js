/**
 * JSON Evaluation Realm for plain JavaScript objects and arrays.
 */

import EvaluationRealm from '../EvaluationRealm.js';
import {
  isPlainObject,
  isArray,
  isNothing,
  isString,
  isNumber,
  isBoolean,
  isNull,
} from '../../utils/guards.js';

/**
 * JSON Evaluation Realm implementation.
 */
class JSONEvaluationRealm extends EvaluationRealm {
  name = 'json';

  /**
   * Check if value is object (plain object with named properties).
   * @param {unknown} value
   * @returns {boolean}
   */
  isObject(value) {
    return isPlainObject(value);
  }

  /**
   * Check if value is array.
   * @param {unknown} value
   * @returns {boolean}
   */
  isArray(value) {
    return isArray(value);
  }

  /**
   * Check if value is string.
   * @param {unknown} value
   * @returns {boolean}
   */
  isString(value) {
    return isString(value);
  }

  /**
   * Check if value is number.
   * @param {unknown} value
   * @returns {boolean}
   */
  isNumber(value) {
    return isNumber(value);
  }

  /**
   * Check if value is boolean.
   * @param {unknown} value
   * @returns {boolean}
   */
  isBoolean(value) {
    return isBoolean(value);
  }

  /**
   * Check if value is null.
   * @param {unknown} value
   * @returns {boolean}
   */
  isNull(value) {
    return isNull(value);
  }

  /**
   * Get raw string value for regex operations.
   * @param {unknown} value
   * @returns {string | undefined}
   */
  getString(value) {
    return isString(value) ? value : undefined;
  }

  /**
   * Get property by name from object value.
   * Returns undefined if property doesn't exist (Nothing).
   * @param {unknown} value
   * @param {string} key
   * @returns {unknown}
   */
  getProperty(value, key) {
    if (!isPlainObject(value)) return undefined;
    return Object.hasOwn(value, key) ? value[key] : undefined;
  }

  /**
   * Check if object value has property.
   * @param {unknown} value
   * @param {string} key
   * @returns {boolean}
   */
  hasProperty(value, key) {
    if (!isPlainObject(value)) return false;
    return Object.hasOwn(value, key);
  }

  /**
   * Get element by index from array value.
   * Returns undefined if index out of bounds (Nothing).
   * @param {unknown} value
   * @param {number} index
   * @returns {unknown}
   */
  getElement(value, index) {
    if (!isArray(value)) return undefined;
    if (index < 0 || index >= value.length) return undefined;
    return value[index];
  }

  /**
   * Get all keys of object value.
   * @param {unknown} value
   * @returns {string[]}
   */
  getKeys(value) {
    if (!isPlainObject(value)) return [];
    return Object.keys(value);
  }

  /**
   * Get length of value.
   * Per RFC 9535 Section 2.4.5:
   * - String: number of Unicode scalar values (not UTF-16 code units)
   * - Array: number of elements
   * - Object: number of members
   * @param {unknown} value
   * @returns {number}
   */
  getLength(value) {
    if (isString(value)) return [...value].length;
    if (isArray(value)) return value.length;
    if (isPlainObject(value)) return Object.keys(value).length;
    return 0;
  }

  /**
   * Iterate over entries as [key/index, value] pairs.
   * For objects: yields [key, value] for each member.
   * For arrays: yields [index, value] for each element.
   * For other types: yields nothing.
   * @param {unknown} value
   * @returns {Iterable<[string | number, unknown]>}
   */
  *entries(value) {
    if (this.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [i, value[i]];
      }
    } else if (this.isObject(value)) {
      for (const key of Object.keys(value)) {
        yield [key, value[key]];
      }
    }
  }

  /**
   * Deep equality check for JSON values.
   * @param {unknown} a
   * @param {unknown} b
   * @returns {boolean}
   */
  #deepEqual(a, b) {
    // Primitive comparison
    if (a === b) return true;

    // Nothing comparison
    if (isNothing(a) && isNothing(b)) return true;
    if (isNothing(a) || isNothing(b)) return false;

    // Null comparison
    if (isNull(a) && isNull(b)) return true;
    if (isNull(a) || isNull(b)) return false;

    // Type must match for complex types
    if (typeof a !== typeof b) return false;

    // Array comparison
    if (isArray(a) && isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) {
        if (!this.#deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    // Object comparison
    if (isPlainObject(a) && isPlainObject(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!Object.hasOwn(b, key)) return false;
        if (!this.#deepEqual(a[key], b[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Compare two values using the specified operator.
   * Per RFC 9535 Section 2.3.5.2.3.
   * @param {unknown} left
   * @param {string} operator - One of: ==, !=, <, <=, >, >=
   * @param {unknown} right
   * @returns {boolean}
   */
  compare(left, operator, right) {
    switch (operator) {
      case '==':
        return this.#deepEqual(left, right);
      case '!=':
        return !this.#deepEqual(left, right);
      case '<':
        if (isNothing(left) || isNothing(right)) return false;
        if (isNumber(left) && isNumber(right)) return left < right;
        if (isString(left) && isString(right)) return left < right;
        return false;
      case '<=':
        if (isNothing(left) || isNothing(right)) return false;
        if (isNumber(left) && isNumber(right)) return left <= right;
        if (isString(left) && isString(right)) return left <= right;
        return this.#deepEqual(left, right);
      case '>':
        if (isNothing(left) || isNothing(right)) return false;
        if (isNumber(left) && isNumber(right)) return left > right;
        if (isString(left) && isString(right)) return left > right;
        return false;
      case '>=':
        if (isNothing(left) || isNothing(right)) return false;
        if (isNumber(left) && isNumber(right)) return left >= right;
        if (isString(left) && isString(right)) return left >= right;
        return this.#deepEqual(left, right);
      default:
        return false;
    }
  }
}

export default JSONEvaluationRealm;
