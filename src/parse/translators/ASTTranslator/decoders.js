export const decodeDoubleQuotedString = (str) => {
  return decodeJSONValue(`"${str}"`);
};

export const decodeSingleQuotedString = (str) => {
  const jsonCompatible = str
    .replace(/\\'/g, "'") // Convert \' to '
    .replace(/"/g, '\\"'); // Escape literal " for JSON
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
