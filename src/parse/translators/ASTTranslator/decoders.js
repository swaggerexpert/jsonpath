export const decodeString = (str) => {
  return JSON.parse(`"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
};
