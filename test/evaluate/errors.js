import { strict as assert } from 'node:assert';

import { evaluate, JSONPathEvaluateError, JSONPathError } from '../../src/index.js';

describe('evaluate', function () {
  context('errors', function () {
    context('given invalid JSONPath expression', function () {
      specify('should throw JSONPathEvaluateError', function () {
        assert.throws(
          () => evaluate({}, '$$'),
          JSONPathEvaluateError
        );
      });

      specify('should include expression in error', function () {
        try {
          evaluate({}, '$$');
          assert.fail('Expected error to be thrown');
        } catch (error) {
          assert.ok(error instanceof JSONPathEvaluateError);
          assert.strictEqual(error.expression, '$$');
        }
      });

      specify('should have descriptive message', function () {
        assert.throws(
          () => evaluate({}, '$$'),
          /Invalid JSONPath expression/
        );
      });
    });

    context('inheritance', function () {
      specify('JSONPathEvaluateError should extend JSONPathError', function () {
        try {
          evaluate({}, '$$');
          assert.fail('Expected error to be thrown');
        } catch (error) {
          assert.ok(error instanceof JSONPathError);
        }
      });
    });
  });
});
