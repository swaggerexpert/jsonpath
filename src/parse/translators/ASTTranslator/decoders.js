export const decodeString = (str) => {
  return JSON.parse(`"${str.replace(/"/g, '\\"')}"`);
};

export const decodeInteger = (str) => {
  return parseInt(str, 10);
};

export const decodeJSONValue = (str) => {
  return JSON.parse(str);
};
