import { strict as assert } from 'node:assert';

import { evaluate, JSONPathParseError, JSONPathError } from '../../src/index.js';

describe('evaluate', function () {
  context('errors', function () {
    context('given invalid JSONPath expression', function () {
      specify('should throw JSONPathParseError', function () {
        assert.throws(
          () => evaluate({}, '$$'),
          JSONPathParseError
        );
      });

      specify('should include jsonPath in error', function () {
        try {
          evaluate({}, '$$');
          assert.fail('Expected error to be thrown');
        } catch (error) {
          assert.ok(error instanceof JSONPathParseError);
          assert.strictEqual(error.jsonPath, '$$');
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
      specify('JSONPathParseError should extend JSONPathError', function () {
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
