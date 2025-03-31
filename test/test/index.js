import { assert } from 'chai';

import { test } from '../../src/index.js';
import validJSONPaths from '../fixtures/json-paths-valid.js';
import invalidJSONPaths from '../fixtures/json-paths-invalid.js';
import validNormalizedPaths from '../fixtures/normalized-paths-valid.js';
import invalidNormalizedPaths from '../fixtures/normalized-paths-invalid.js';

describe('test', function () {
  context('given valid JSONPaths', function () {
    validJSONPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        assert.isTrue(test(jsonPath));
      });
    });
  });

  context('given invalid JSONPaths', function () {
    invalidJSONPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        assert.isFalse(test(jsonPath));
      });
    });
  });

  context('given valid normalized paths', function () {
    validNormalizedPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        assert.isTrue(test(jsonPath, { normalized: true }));
      });
    });
  });

  context('given invalid normalized paths', function () {
    invalidNormalizedPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        assert.isFalse(test(jsonPath, { normalized: true }));
      });
    });
  });
});
