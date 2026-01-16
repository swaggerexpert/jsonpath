import escape from './escape.js';
import JSONPathCompileError from './errors/JSONPathCompileError.js';

/**
 * Compiles an array of selectors into a normalized JSONPath.
 * Follows RFC 9535 Section 2.7 normalized path format.
 *
 * @param {Array<string|number>} selectors - Array of name selectors (strings) or index selectors (numbers)
 * @returns {string} A normalized JSONPath string
 * @throws {JSONPathCompileError} If selectors is not an array or contains invalid selector types
 *
 * @example
 * compile(['a', 'b', 1]) // returns "$['a']['b'][1]"
 * compile([]) // returns "$"
 * compile(['foo', 0, 'bar']) // returns "$['foo'][0]['bar']"
 */
const compile = (selectors) => {
  if (!Array.isArray(selectors)) {
    throw new JSONPathCompileError(`Selectors must be an array, got: ${typeof selectors}`, { selectors });
  }

  try {
    const segments = selectors.map((selector) => {
      if (typeof selector === 'string') {
        // Name selector: escape and wrap in single quotes
        return `['${escape(selector)}']`;
      }
      if (typeof selector === 'number') {
        // Index selector: must be a non-negative integer
        if (!Number.isInteger(selector) || selector < 0) {
          throw new TypeError(
            `Index selector must be a non-negative integer, got: ${selector}`,
          );
        }
        return `[${selector}]`;
      }
      throw new TypeError(
        `Selector must be a string or non-negative integer, got: ${typeof selector}`,
      );
    });

    return `$${segments.join('')}`;
  } catch (error) {
    throw new JSONPathCompileError('Failed to compile normalized JSONPath', {
      cause: error,
      selectors,
    });
  }
};

export default compile;
