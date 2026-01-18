/**
 * I-Regexp (RFC 9485) utilities for JSONPath match() and search() functions.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9485 - I-Regexp specification
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.1 - match() function
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4.2 - search() function
 */

const regexpCache = new Map();

/**
 * Validate and transform I-Regexp pattern to ECMAScript regex pattern.
 * Returns null if pattern contains non-I-Regexp features:
 * - Backreferences (\1, \2, etc.)
 * - Lookahead/lookbehind assertions
 * - Named capture groups
 * - Word boundaries outside character classes
 *
 * Transforms `.` to `[^\n\r]` outside character classes (I-Regexp semantics).
 *
 * @param {string} pattern
 * @returns {string | null} - Transformed pattern or null if invalid
 */
const transformIRegexp = (pattern) => {
  let result = '';
  let inCharClass = false;
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    // Handle escape sequences
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1];

      // Reject backreferences (\1-\9)
      if (next >= '1' && next <= '9') return null;

      // Reject word boundaries outside character classes
      if (!inCharClass && (next === 'b' || next === 'B')) return null;

      result += ch + next;
      i += 2;
      continue;
    }

    // Track character class boundaries
    if (ch === '[' && !inCharClass) {
      inCharClass = true;
      result += ch;
      i += 1;
      continue;
    }

    if (ch === ']' && inCharClass) {
      inCharClass = false;
      result += ch;
      i += 1;
      continue;
    }

    // Check for lookahead/lookbehind/named groups: (?=, (?!, (?<=, (?<!, (?<name>
    if (ch === '(' && i + 2 < pattern.length && pattern[i + 1] === '?') {
      const next2 = pattern[i + 2];
      // Reject lookahead (?= (?!
      if (next2 === '=' || next2 === '!') return null;
      // Check for lookbehind or named groups
      if (next2 === '<' && i + 3 < pattern.length) {
        const next3 = pattern[i + 3];
        // Reject lookbehind (?<= (?<!
        if (next3 === '=' || next3 === '!') return null;
        // Reject named capture groups (?<name>
        if (/[a-zA-Z]/.test(next3)) return null;
      }
    }

    // Transform `.` to `[^\n\r]` outside character classes
    if (ch === '.' && !inCharClass) {
      result += '[^\\n\\r]';
      i += 1;
      continue;
    }

    result += ch;
    i += 1;
  }

  return result;
};

/**
 * Construct a RegExp from I-Regexp pattern.
 * Validates the pattern, transforms it, and caches the result.
 *
 * @param {string} pattern - I-Regexp pattern
 * @param {boolean} [anchor=false] - If true, anchor pattern with ^(?:...)$
 * @returns {RegExp | null} - Compiled regex or null if invalid
 */
export const constructRegex = (pattern, anchor = false) => {
  const cacheKey = anchor ? `anchored:${pattern}` : `unanchored:${pattern}`;

  if (regexpCache.has(cacheKey)) {
    return regexpCache.get(cacheKey);
  }

  const transformed = transformIRegexp(pattern);
  if (transformed === null) {
    regexpCache.set(cacheKey, null);
    return null;
  }

  try {
    const finalPattern = anchor ? `^(?:${transformed})$` : transformed;
    const regex = new RegExp(finalPattern, 'u');
    regexpCache.set(cacheKey, regex);
    return regex;
  } catch {
    regexpCache.set(cacheKey, null);
    return null;
  }
};
