import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluate } from '../../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the compliance test suite
const ctsPath = path.join(__dirname, '../jsonpath-compliance-test-suite/cts.json');
const cts = JSON.parse(fs.readFileSync(ctsPath, 'utf8'));

/**
 * Deep equality check that returns boolean instead of throwing.
 */
const deepEqual = (a, b) => {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if result matches any of the valid results for non-deterministic tests.
 */
const matchesAnyResult = (actual, validResults) => {
  return validResults.some((valid) => deepEqual(actual, valid));
};

describe('evaluate', function () {
  context('JSONPath Compliance Test Suite', function () {
    for (const test of cts.tests) {
      const testName = test.name;

      if (test.invalid_selector) {
        // Test that invalid selectors throw an error
        specify(`${testName} (invalid selector)`, function () {
          assert.throws(() => {
            evaluate(test.document ?? {}, test.selector);
          }, /Invalid JSONPath expression/);
        });
      } else {
        // Test that valid selectors return expected results
        specify(testName, function () {
          const paths = [];
          const result = evaluate(test.document, test.selector, {
            callback: (value, normalizedPath) => {
              paths.push(normalizedPath);
            },
          });

          // Handle non-deterministic tests (results vs result)
          if (test.results) {
            // Non-deterministic: result must match one of the valid orderings
            assert.ok(
              matchesAnyResult(result, test.results),
              `Result mismatch for ${testName}. Got: ${JSON.stringify(result)}, expected one of: ${JSON.stringify(test.results)}`
            );

            // Check paths if provided
            if (test.results_paths) {
              assert.ok(
                matchesAnyResult(paths, test.results_paths),
                `Path mismatch for ${testName}. Got: ${JSON.stringify(paths)}, expected one of: ${JSON.stringify(test.results_paths)}`
              );
            }
          } else {
            // Deterministic: exact match required
            assert.deepStrictEqual(result, test.result, `Result mismatch for ${testName}`);

            // Compare normalized paths if provided
            if (test.result_paths) {
              assert.deepStrictEqual(
                paths,
                test.result_paths,
                `Path mismatch for ${testName}`
              );
            }
          }
        });
      }
    }
  });
});
