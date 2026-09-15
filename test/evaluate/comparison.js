import { strict as assert } from 'node:assert';

import { evaluate } from '../../src/index.js';

describe('evaluate', function () {
  context('comparison expressions', function () {
    context('given Nothing on both sides', function () {
      // https://github.com/swaggerexpert/jsonpath/issues/144
      const document = [{}];

      specify('should select with == operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a == @.b]'), [{}]);
      });

      specify('should not select with != operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a != @.b]'), []);
      });

      specify('should select with <= operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a <= @.b]'), [{}]);
      });

      specify('should select with >= operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a >= @.b]'), [{}]);
      });

      specify('should not select with < operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a < @.b]'), []);
      });

      specify('should not select with > operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a > @.b]'), []);
      });
    });

    context('given Nothing on one side only', function () {
      const document = [{ a: 1 }];

      specify('should not select with == operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a == @.b]'), []);
      });

      specify('should select with != operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a != @.b]'), [{ a: 1 }]);
      });

      specify('should not select with <= operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a <= @.b]'), []);
        assert.deepEqual(evaluate(document, '$[?@.b <= @.a]'), []);
      });

      specify('should not select with >= operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a >= @.b]'), []);
        assert.deepEqual(evaluate(document, '$[?@.b >= @.a]'), []);
      });

      specify('should not select with < operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a < @.b]'), []);
        assert.deepEqual(evaluate(document, '$[?@.b < @.a]'), []);
      });

      specify('should not select with > operator', function () {
        assert.deepEqual(evaluate(document, '$[?@.a > @.b]'), []);
        assert.deepEqual(evaluate(document, '$[?@.b > @.a]'), []);
      });
    });
  });
});
