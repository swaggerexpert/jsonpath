export const decodeString = (str) => {
  return JSON.parse(`"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
};

export const decodeInteger = (str) => {
  return parseInt(str, 10);
};
