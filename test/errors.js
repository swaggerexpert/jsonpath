import { assert } from 'chai';

import {
  JSONPathError,
  JSONPathParseError,
  JSONNormalizedPathError,
  JSONPathEvaluateError,
} from '../src/index.js';

describe('errors', function () {
  const errorClasses = {
    JSONPathError,
    JSONPathParseError,
    JSONNormalizedPathError,
    JSONPathEvaluateError,
  };

  Object.entries(errorClasses).forEach(([name, ErrorClass]) => {
    specify(`${name} should have explicit name`, function () {
      assert.strictEqual(ErrorClass.name, name);
      assert.strictEqual(new ErrorClass('message').name, name);
    });
  });

  specify('should name instances of subclasses after the subclass', function () {
    class CustomError extends JSONPathParseError {}

    assert.strictEqual(new CustomError('message').name, 'CustomError');
  });
});
