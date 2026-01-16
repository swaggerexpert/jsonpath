/**
 * Escapes a string for use in a normalized JSONPath name selector.
 * Follows RFC 9535 Section 2.7 escaping rules for single-quoted strings.
 *
 * @param {string} selector - The string to escape
 * @returns {string} The escaped string (without surrounding quotes)
 */
const escape = (selector) => {
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

export default escape;
