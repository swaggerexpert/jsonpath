export const decodeDoubleQuotedString = (str) => {
  return decodeJSONValue(`"${str}"`);
};

export const decodeSingleQuotedString = (str) => {
  // Handle \\ and \' in one pass to correctly process \\' as backslash + quote
  // Other escapes (\n, \t, \uXXXX, etc.) pass through for JSON.parse
  const jsonCompatible = str
    .replace(/\\([\\'])/g, (match, char) => (char === '\\' ? '\\\\' : "'"))
    .replace(/"/g, '\\"');
  return decodeDoubleQuotedString(jsonCompatible);
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
