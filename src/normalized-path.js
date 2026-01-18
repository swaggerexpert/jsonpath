import parse from './parse/index.js';
import testFn from './test/index.js';
import JSONNormalizedPathError from './errors/JSONNormalizedPathError.js';

/**
 * Tests if a string is a valid normalized JSONPath.
 *
 * @param {string} normalizedPath - The string to test
 * @returns {boolean} True if valid normalized path, false otherwise
 */
export const test = (normalizedPath) => testFn(normalizedPath, { normalized: true });

/**
 * Escapes a string for use in a normalized JSONPath name selector.
 * Follows RFC 9535 Section 2.7 escaping rules for single-quoted strings.
 *
 * @param {string} selector - The string to escape
 * @returns {string} The escaped string (without surrounding quotes)
 */
export const escape = (selector) => {
  if (typeof selector !== 'string') {
    throw new TypeError('Selector must be a string');
  }

  let escaped = '';

  for (const char of selector) {
    const codePoint = char.codePointAt(0);

    switch (codePoint) {
      case 0x08: // backspace
        escaped += '\\b';
        break;
      case 0x09: // horizontal tab
        escaped += '\\t';
        break;
      case 0x0a: // line feed
        escaped += '\\n';
        break;
      case 0x0c: // form feed
        escaped += '\\f';
        break;
      case 0x0d: // carriage return
        escaped += '\\r';
        break;
      case 0x27: // apostrophe '
        escaped += "\\'";
        break;
      case 0x5c: // backslash \
        escaped += '\\\\';
        break;
      default:
        // Other control characters (U+0000-U+001F except those handled above)
        if (codePoint <= 0x1f) {
          escaped += `\\u${codePoint.toString(16).padStart(4, '0')}`;
        } else {
          escaped += char;
        }
    }
  }

  return escaped;
};

/**
 * Creates a normalized path string from a list of selectors.
 * Name selectors are automatically escaped.
 *
 * @param {Array<string|number>} selectors - Array of name selectors (strings) or index selectors (numbers)
 * @returns {string} A normalized JSONPath string
 * @throws {JSONNormalizedPathError} If selectors is not an array or contains invalid selector types
 */
export const from = (selectors) => {
  if (!Array.isArray(selectors)) {
    throw new JSONNormalizedPathError(`Selectors must be an array, got: ${typeof selectors}`, {
      selectors,
    });
  }

  try {
    const segments = selectors.map((selector) => {
      if (typeof selector === 'string') {
        // Name selector: escape and wrap in single quotes
        return `['${escape(selector)}']`;
      }
      if (typeof selector === 'number') {
        // Index selector: must be a non-negative safe integer (RFC 9535 Section 2.1)
        if (!Number.isSafeInteger(selector) || selector < 0) {
          throw new TypeError(
            `Index selector must be a non-negative safe integer, got: ${selector}`,
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
    throw new JSONNormalizedPathError('Failed to compile normalized JSONPath', {
      cause: error,
      selectors,
    });
  }
};

/**
 * Parses a normalized path string and returns a list of selectors.
 *
 * @param {string} normalizedPath - A normalized JSONPath string
 * @returns {Array<string|number>} Array of name selectors (strings) or index selectors (numbers)
 * @throws {JSONNormalizedPathError} If the normalized path is invalid
 */
export const to = (normalizedPath) => {
  if (typeof normalizedPath !== 'string') {
    throw new JSONNormalizedPathError(
      `Normalized path must be a string, got: ${typeof normalizedPath}`,
      { normalizedPath },
    );
  }

  const parseResult = parse(normalizedPath, { normalized: true });

  if (!parseResult.result.success) {
    throw new JSONNormalizedPathError('Invalid normalized path', { normalizedPath });
  }

  const { tree } = parseResult;

  // Extract selectors from AST segments
  // Normalized path grammar only allows NameSelector and IndexSelector
  // For normalized paths, segment.selector is directly the selector (not BracketedSelection)
  return tree.segments.map((segment) => segment.selector.value);
};
