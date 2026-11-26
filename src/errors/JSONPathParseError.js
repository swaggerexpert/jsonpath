import JSONPathError from './JSONPathError.js';

class JSONPathParseError extends JSONPathError {}

Object.defineProperty(JSONPathParseError, 'name', { value: 'JSONPathParseError' });

export default JSONPathParseError;
