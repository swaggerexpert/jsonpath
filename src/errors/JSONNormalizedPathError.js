import JSONPathError from './JSONPathError.js';

class JSONNormalizedPathError extends JSONPathError {}

Object.defineProperty(JSONNormalizedPathError, 'name', { value: 'JSONNormalizedPathError' });

export default JSONNormalizedPathError;
