import JSONPathError from './JSONPathError.js';

class JSONPathEvaluateError extends JSONPathError {}

Object.defineProperty(JSONPathEvaluateError, 'name', { value: 'JSONPathEvaluateError' });

export default JSONPathEvaluateError;
