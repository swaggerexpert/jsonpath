/**
 * Abstract base class for Evaluation Realms.
 *
 * Evaluation Realms provide an abstraction for accessing different data structures,
 * allowing JSONPath evaluation to work with various data types.
 *
 * Subclasses must implement all abstract methods.
 */

import JSONPathError from '../../errors/JSONPathError.js';

class EvaluationRealm {
  name = '';

  /**
   * Check if value is object (has named properties).
   * @param {unknown} value
   * @returns {boolean}
   */
  isObject(value) {
    throw new JSONPathError('Realm.isObject(value) must be implemented in a subclass');
  }

  /**
   * Check if value is array (has indexed elements).
   * @param {unknown} value
   * @returns {boolean}
   */
  isArray(value) {
    throw new JSONPathError('Realm.isArray(value) must be implemented in a subclass');
  }

  /**
   * Check if value is string.
   * @param {unknown} value
   * @returns {boolean}
   */
  isString(value) {
    throw new JSONPathError('Realm.isString(value) must be implemented in a subclass');
  }

  /**
   * Check if value is number.
   * @param {unknown} value
   * @returns {boolean}
   */
  isNumber(value) {
    throw new JSONPathError('Realm.isNumber(value) must be implemented in a subclass');
  }

  /**
   * Check if value is boolean.
   * @param {unknown} value
   * @returns {boolean}
   */
  isBoolean(value) {
    throw new JSONPathError('Realm.isBoolean(value) must be implemented in a subclass');
  }

  /**
   * Check if value is null.
   * @param {unknown} value
   * @returns {boolean}
   */
  isNull(value) {
    throw new JSONPathError('Realm.isNull(value) must be implemented in a subclass');
  }

  /**
   * Get raw string value for regex operations.
   * @param {unknown} value
   * @returns {string | undefined}
   */
  getString(value) {
    throw new JSONPathError('Realm.getString(value) must be implemented in a subclass');
  }

  /**
   * Get property by name from object value.
   * @param {unknown} value
   * @param {string} key
   * @returns {unknown}
   */
  getProperty(value, key) {
    throw new JSONPathError('Realm.getProperty(value, key) must be implemented in a subclass');
  }

  /**
   * Check if object value has property.
   * @param {unknown} value
   * @param {string} key
   * @returns {boolean}
   */
  hasProperty(value, key) {
    throw new JSONPathError('Realm.hasProperty(value, key) must be implemented in a subclass');
  }

  /**
   * Get element by index from array value.
   * @param {unknown} value
   * @param {number} index
   * @returns {unknown}
   */
  getElement(value, index) {
    throw new JSONPathError('Realm.getElement(value, index) must be implemented in a subclass');
  }

  /**
   * Get all keys of object value.
   * @param {unknown} value
   * @returns {string[]}
   */
  getKeys(value) {
    throw new JSONPathError('Realm.getKeys(value) must be implemented in a subclass');
  }

  /**
   * Get length of array or object value.
   * @param {unknown} value
   * @returns {number}
   */
  getLength(value) {
    throw new JSONPathError('Realm.getLength(value) must be implemented in a subclass');
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
    throw new JSONPathError('Realm.entries(value) must be implemented in a subclass');
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
    throw new JSONPathError('Realm.compare(left, operator, right) must be implemented in a subclass');
  }
}

export default EvaluationRealm;
