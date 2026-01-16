import { assert } from 'chai';

import { compile, test, JSONPathCompileError } from '../src/index.js';

describe('compile', function () {
  context('given invalid input', function () {
    specify('should throw JSONPathCompileError for string input', function () {
      assert.throws(() => compile('foo'), JSONPathCompileError, 'Selectors must be an array, got: string');
    });

    specify('should throw JSONPathCompileError for number input', function () {
      assert.throws(() => compile(123), JSONPathCompileError, 'Selectors must be an array, got: number');
    });

    specify('should throw JSONPathCompileError for null', function () {
      assert.throws(() => compile(null), JSONPathCompileError, 'Selectors must be an array, got: object');
    });

    specify('should throw JSONPathCompileError for undefined', function () {
      assert.throws(() => compile(undefined), JSONPathCompileError, 'Selectors must be an array, got: undefined');
    });

    specify('should throw JSONPathCompileError for object', function () {
      assert.throws(() => compile({}), JSONPathCompileError, 'Selectors must be an array, got: object');
    });

    specify('should throw JSONPathCompileError for boolean selector', function () {
      assert.throws(() => compile([true]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for null selector', function () {
      assert.throws(() => compile([null]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for undefined selector', function () {
      assert.throws(() => compile([undefined]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for object selector', function () {
      assert.throws(() => compile([{}]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for array selector', function () {
      assert.throws(() => compile([[]]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for negative index', function () {
      assert.throws(() => compile([-1]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for negative index in mixed array', function () {
      assert.throws(() => compile(['a', -5, 'b']), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for non-integer number', function () {
      assert.throws(() => compile([1.5]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for NaN', function () {
      assert.throws(() => compile([NaN]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for Infinity', function () {
      assert.throws(() => compile([Infinity]), JSONPathCompileError);
    });

    specify('should throw JSONPathCompileError for -Infinity', function () {
      assert.throws(() => compile([-Infinity]), JSONPathCompileError);
    });
  });

  context('given empty array', function () {
    specify('should return root identifier only', function () {
      const result = compile([]);
      assert.strictEqual(result, '$');
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given index selectors', function () {
    specify('should compile index 0', function () {
      const result = compile([0]);
      assert.strictEqual(result, '$[0]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile index 1', function () {
      const result = compile([1]);
      assert.strictEqual(result, '$[1]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile large index', function () {
      const result = compile([999999]);
      assert.strictEqual(result, '$[999999]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile multiple indices', function () {
      const result = compile([0, 1, 2]);
      assert.strictEqual(result, '$[0][1][2]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile repeated index', function () {
      const result = compile([0, 0, 0]);
      assert.strictEqual(result, '$[0][0][0]');
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given simple name selectors', function () {
    specify('should compile single letter', function () {
      const result = compile(['a']);
      assert.strictEqual(result, "$['a']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile word', function () {
      const result = compile(['foo']);
      assert.strictEqual(result, "$['foo']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile multiple names', function () {
      const result = compile(['a', 'b', 'c']);
      assert.strictEqual(result, "$['a']['b']['c']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile empty string', function () {
      const result = compile(['']);
      assert.strictEqual(result, "$['']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile string with spaces', function () {
      const result = compile(['hello world']);
      assert.strictEqual(result, "$['hello world']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile string with numbers', function () {
      const result = compile(['item123']);
      assert.strictEqual(result, "$['item123']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given name selectors with special characters', function () {
    specify('should escape apostrophe', function () {
      const result = compile(["it's"]);
      assert.strictEqual(result, "$['it\\'s']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape backslash', function () {
      const result = compile(['back\\slash']);
      assert.strictEqual(result, "$['back\\\\slash']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape apostrophe and backslash together', function () {
      const result = compile(["it\\'s"]);
      assert.strictEqual(result, "$['it\\\\\\'s']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle double quotes unchanged', function () {
      const result = compile(['"quoted"']);
      assert.strictEqual(result, "$['\"quoted\"']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle brackets unchanged', function () {
      const result = compile(['[bracket]']);
      assert.strictEqual(result, "$['[bracket]']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle dots unchanged', function () {
      const result = compile(['a.b.c']);
      assert.strictEqual(result, "$['a.b.c']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle JSONPath-like string unchanged', function () {
      const result = compile(['$.store[*]']);
      assert.strictEqual(result, "$['$.store[*]']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given name selectors with control characters', function () {
    specify('should escape tab', function () {
      const result = compile(['\t']);
      assert.strictEqual(result, "$['\\t']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape newline', function () {
      const result = compile(['\n']);
      assert.strictEqual(result, "$['\\n']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape carriage return', function () {
      const result = compile(['\r']);
      assert.strictEqual(result, "$['\\r']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape backspace', function () {
      const result = compile(['\b']);
      assert.strictEqual(result, "$['\\b']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape form feed', function () {
      const result = compile(['\f']);
      assert.strictEqual(result, "$['\\f']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape null character', function () {
      const result = compile(['\x00']);
      assert.strictEqual(result, "$['\\u0000']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape vertical tab with lowercase hex', function () {
      // RFC 9535: $["\u000B"] normalizes to $['\u000b'] (lowercase)
      const result = compile(['\x0B']);
      assert.strictEqual(result, "$['\\u000b']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape mixed control characters', function () {
      const result = compile(['\t\n\r']);
      assert.strictEqual(result, "$['\\t\\n\\r']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given name selectors with unicode', function () {
    specify('should handle Japanese characters', function () {
      const result = compile(['日本語']);
      assert.strictEqual(result, "$['日本語']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle Chinese characters', function () {
      const result = compile(['中文']);
      assert.strictEqual(result, "$['中文']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle emoji', function () {
      const result = compile(['👋']);
      assert.strictEqual(result, "$['👋']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle mixed unicode and ascii', function () {
      const result = compile(['hello世界']);
      assert.strictEqual(result, "$['hello世界']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should use actual character not unicode escape for printable', function () {
      // RFC 9535: $["\u0061"] normalizes to $['a'] (actual char, not escape)
      const result = compile(['a']);
      assert.strictEqual(result, "$['a']");
      assert.notInclude(result, '\\u0061');
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given mixed selectors', function () {
    specify('should compile name then index', function () {
      const result = compile(['a', 0]);
      assert.strictEqual(result, "$['a'][0]");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile index then name', function () {
      const result = compile([0, 'a']);
      assert.strictEqual(result, "$[0]['a']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile complex mixed path', function () {
      const result = compile(['store', 'book', 0, 'title']);
      assert.strictEqual(result, "$['store']['book'][0]['title']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile alternating types', function () {
      const result = compile(['a', 0, 'b', 1, 'c', 2]);
      assert.strictEqual(result, "$['a'][0]['b'][1]['c'][2]");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile with escaped names and indices', function () {
      const result = compile(["it's", 0, 'back\\slash', 1]);
      assert.strictEqual(result, "$['it\\'s'][0]['back\\\\slash'][1]");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('comprehensive round-trip validation', function () {
    const testCases = [
      { selectors: [], expected: '$' },
      { selectors: ['a'], expected: "$['a']" },
      { selectors: [0], expected: '$[0]' },
      { selectors: ['a', 'b', 1], expected: "$['a']['b'][1]" },
      { selectors: ["it's"], expected: "$['it\\'s']" },
      { selectors: ['back\\slash'], expected: "$['back\\\\slash']" },
      { selectors: ['\t'], expected: "$['\\t']" },
      { selectors: ['\n'], expected: "$['\\n']" },
      { selectors: ['\x00'], expected: "$['\\u0000']" },
      { selectors: ['\x0B'], expected: "$['\\u000b']" },
      { selectors: [''], expected: "$['']" },
      { selectors: ['日本語'], expected: "$['日本語']" },
      { selectors: ['a.b.c'], expected: "$['a.b.c']" },
      { selectors: ['[0]'], expected: "$['[0]']" },
    ];

    testCases.forEach(({ selectors, expected }) => {
      specify(`compile(${JSON.stringify(selectors)}) should return valid normalized path`, function () {
        const result = compile(selectors);
        assert.strictEqual(result, expected);
        assert.isTrue(
          test(result, { normalized: true }),
          `${result} should be a valid normalized path`,
        );
      });
    });
  });

  context('edge cases', function () {
    specify('should handle very long selector names', function () {
      const longName = 'a'.repeat(1000);
      const result = compile([longName]);
      assert.strictEqual(result, `$['${longName}']`);
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle very deep paths', function () {
      const selectors = Array(100).fill('a');
      const result = compile(selectors);
      assert.strictEqual(result, "$" + "['a']".repeat(100));
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle selector that looks like a number', function () {
      const result = compile(['123']);
      assert.strictEqual(result, "$['123']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle selector with only apostrophe', function () {
      const result = compile(["'"]);
      assert.strictEqual(result, "$['\\'']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle selector with only backslash', function () {
      const result = compile(['\\']);
      assert.strictEqual(result, "$['\\\\']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });
});
