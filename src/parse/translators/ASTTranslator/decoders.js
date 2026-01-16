export const decodeDoubleQuotedString = (str) => {
  return decodeJSONValue(`"${str}"`);
};

export const decodeSingleQuotedString = (str) => {
  // Decode single-quoted string escape sequences into raw text, then let JSON.stringify
  // produce a correctly escaped double-quoted JSON string.
  let decoded = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\') {
      i++;
      if (i >= str.length) {
        // Trailing backslash, treat it as a literal backslash
        decoded += '\\';
        break;
      }
      const esc = str[i];
      switch (esc) {
        case 'n':
          decoded += '\n';
          break;
        case 'r':
          decoded += '\r';
          break;
        case 't':
          decoded += '\t';
          break;
        case 'b':
          decoded += '\b';
          break;
        case 'f':
          decoded += '\f';
          break;
        case '/':
          decoded += '/';
          break;
        case '\\':
          decoded += '\\';
          break;
        case "'":
          decoded += "'";
          break;
        case '"':
          decoded += '"';
          break;
        case 'u': {
          // Unicode escape \uXXXX (RFC 9535 requires exactly 4 hex digits)
          if (i + 5 > str.length) {
            throw new SyntaxError(`Incomplete unicode escape sequence at position ${i - 1}`);
          }
          const hex = str.slice(i + 1, i + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            throw new SyntaxError(`Invalid unicode escape sequence \\u${hex} at position ${i - 1}`);
          }
          decoded += String.fromCharCode(parseInt(hex, 16));
          i += 4;
          break;
        }
        default:
          // Unrecognized escape, keep the escaped character literally
          decoded += esc;
          break;
      }
    } else {
      decoded += ch;
    }
  }
  // Use JSON.stringify to produce a valid JSON string literal
  return decodeJSONValue(JSON.stringify(decoded));
};

export const decodeInteger = (str) => {
  const value = parseInt(str, 10);
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Integer value out of safe range [-(2^53)+1, (2^53)-1], got: ${str}`);
  }
  return value;
};

export const decodeJSONValue = (str) => {
  return JSON.parse(str);
};
