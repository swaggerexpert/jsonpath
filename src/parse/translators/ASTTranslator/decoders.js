export const decodeString = (str) => {
  return JSON.parse(`"${str.replace(/"/g, '\\"')}"`);
};

export const decodeInteger = (str) => {
  const value = parseInt(str, 10);
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(
      `Integer value out of safe range [-(2^53)+1, (2^53)-1], got: ${str}`,
    );
  }
  return value;
};

export const decodeJSONValue = (str) => {
  return JSON.parse(str);
};
