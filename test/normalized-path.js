import { assert } from 'chai';

import { NormalizedPath, test, JSONNormalizedPathError } from '../src/index.js';

describe('NormalizedPath.from', function () {
  context('given invalid input', function () {
    specify('should throw JSONNormalizedPathError for string input', function () {
      assert.throws(() => NormalizedPath.from('foo'), JSONNormalizedPathError, 'Selectors must be an array, got: string');
    });

    specify('should throw JSONNormalizedPathError for number input', function () {
      assert.throws(() => NormalizedPath.from(123), JSONNormalizedPathError, 'Selectors must be an array, got: number');
    });

    specify('should throw JSONNormalizedPathError for null', function () {
      assert.throws(() => NormalizedPath.from(null), JSONNormalizedPathError, 'Selectors must be an array, got: object');
    });

    specify('should throw JSONNormalizedPathError for undefined', function () {
      assert.throws(() => NormalizedPath.from(undefined), JSONNormalizedPathError, 'Selectors must be an array, got: undefined');
    });

    specify('should throw JSONNormalizedPathError for object', function () {
      assert.throws(() => NormalizedPath.from({}), JSONNormalizedPathError, 'Selectors must be an array, got: object');
    });

    specify('should throw JSONNormalizedPathError for boolean selector', function () {
      assert.throws(() => NormalizedPath.from([true]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for null selector', function () {
      assert.throws(() => NormalizedPath.from([null]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for undefined selector', function () {
      assert.throws(() => NormalizedPath.from([undefined]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for object selector', function () {
      assert.throws(() => NormalizedPath.from([{}]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for array selector', function () {
      assert.throws(() => NormalizedPath.from([[]]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for negative index', function () {
      assert.throws(() => NormalizedPath.from([-1]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for negative index in mixed array', function () {
      assert.throws(() => NormalizedPath.from(['a', -5, 'b']), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for non-integer number', function () {
      assert.throws(() => NormalizedPath.from([1.5]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for NaN', function () {
      assert.throws(() => NormalizedPath.from([NaN]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for Infinity', function () {
      assert.throws(() => NormalizedPath.from([Infinity]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for -Infinity', function () {
      assert.throws(() => NormalizedPath.from([-Infinity]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for integer greater than MAX_SAFE_INTEGER', function () {
      assert.throws(() => NormalizedPath.from([Number.MAX_SAFE_INTEGER + 1]), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for integer less than MIN_SAFE_INTEGER', function () {
      assert.throws(() => NormalizedPath.from([Number.MIN_SAFE_INTEGER - 1]), JSONNormalizedPathError);
    });
  });

  context('given empty array', function () {
    specify('should return root identifier only', function () {
      const result = NormalizedPath.from([]);
      assert.strictEqual(result, '$');
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given index selectors', function () {
    specify('should compile index 0', function () {
      const result = NormalizedPath.from([0]);
      assert.strictEqual(result, '$[0]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile index 1', function () {
      const result = NormalizedPath.from([1]);
      assert.strictEqual(result, '$[1]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile large index', function () {
      const result = NormalizedPath.from([999999]);
      assert.strictEqual(result, '$[999999]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile MAX_SAFE_INTEGER', function () {
      const result = NormalizedPath.from([Number.MAX_SAFE_INTEGER]);
      assert.strictEqual(result, `$[${Number.MAX_SAFE_INTEGER}]`);
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile multiple indices', function () {
      const result = NormalizedPath.from([0, 1, 2]);
      assert.strictEqual(result, '$[0][1][2]');
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile repeated index', function () {
      const result = NormalizedPath.from([0, 0, 0]);
      assert.strictEqual(result, '$[0][0][0]');
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given simple name selectors', function () {
    specify('should compile single letter', function () {
      const result = NormalizedPath.from(['a']);
      assert.strictEqual(result, "$['a']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile word', function () {
      const result = NormalizedPath.from(['foo']);
      assert.strictEqual(result, "$['foo']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile multiple names', function () {
      const result = NormalizedPath.from(['a', 'b', 'c']);
      assert.strictEqual(result, "$['a']['b']['c']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile empty string', function () {
      const result = NormalizedPath.from(['']);
      assert.strictEqual(result, "$['']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile string with spaces', function () {
      const result = NormalizedPath.from(['hello world']);
      assert.strictEqual(result, "$['hello world']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile string with numbers', function () {
      const result = NormalizedPath.from(['item123']);
      assert.strictEqual(result, "$['item123']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given name selectors with special characters', function () {
    specify('should escape apostrophe', function () {
      const result = NormalizedPath.from(["it's"]);
      assert.strictEqual(result, "$['it\\'s']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape backslash', function () {
      const result = NormalizedPath.from(['back\\slash']);
      assert.strictEqual(result, "$['back\\\\slash']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape apostrophe and backslash together', function () {
      const result = NormalizedPath.from(["it\\'s"]);
      assert.strictEqual(result, "$['it\\\\\\'s']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle double quotes unchanged', function () {
      const result = NormalizedPath.from(['"quoted"']);
      assert.strictEqual(result, "$['\"quoted\"']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle brackets unchanged', function () {
      const result = NormalizedPath.from(['[bracket]']);
      assert.strictEqual(result, "$['[bracket]']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle dots unchanged', function () {
      const result = NormalizedPath.from(['a.b.c']);
      assert.strictEqual(result, "$['a.b.c']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle JSONPath-like string unchanged', function () {
      const result = NormalizedPath.from(['$.store[*]']);
      assert.strictEqual(result, "$['$.store[*]']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given name selectors with control characters', function () {
    specify('should escape tab', function () {
      const result = NormalizedPath.from(['\t']);
      assert.strictEqual(result, "$['\\t']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape newline', function () {
      const result = NormalizedPath.from(['\n']);
      assert.strictEqual(result, "$['\\n']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape carriage return', function () {
      const result = NormalizedPath.from(['\r']);
      assert.strictEqual(result, "$['\\r']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape backspace', function () {
      const result = NormalizedPath.from(['\b']);
      assert.strictEqual(result, "$['\\b']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape form feed', function () {
      const result = NormalizedPath.from(['\f']);
      assert.strictEqual(result, "$['\\f']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape null character', function () {
      const result = NormalizedPath.from(['\x00']);
      assert.strictEqual(result, "$['\\u0000']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape vertical tab with lowercase hex', function () {
      // RFC 9535: $["\u000B"] normalizes to $['\u000b'] (lowercase)
      const result = NormalizedPath.from(['\x0B']);
      assert.strictEqual(result, "$['\\u000b']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should escape mixed control characters', function () {
      const result = NormalizedPath.from(['\t\n\r']);
      assert.strictEqual(result, "$['\\t\\n\\r']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given name selectors with unicode', function () {
    specify('should handle Japanese characters', function () {
      const result = NormalizedPath.from(['日本語']);
      assert.strictEqual(result, "$['日本語']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle Chinese characters', function () {
      const result = NormalizedPath.from(['中文']);
      assert.strictEqual(result, "$['中文']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle emoji', function () {
      const result = NormalizedPath.from(['👋']);
      assert.strictEqual(result, "$['👋']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle mixed unicode and ascii', function () {
      const result = NormalizedPath.from(['hello世界']);
      assert.strictEqual(result, "$['hello世界']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should use actual character not unicode escape for printable', function () {
      // RFC 9535: $["\u0061"] normalizes to $['a'] (actual char, not escape)
      const result = NormalizedPath.from(['a']);
      assert.strictEqual(result, "$['a']");
      assert.notInclude(result, '\\u0061');
      assert.isTrue(test(result, { normalized: true }));
    });
  });

  context('given mixed selectors', function () {
    specify('should compile name then index', function () {
      const result = NormalizedPath.from(['a', 0]);
      assert.strictEqual(result, "$['a'][0]");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile index then name', function () {
      const result = NormalizedPath.from([0, 'a']);
      assert.strictEqual(result, "$[0]['a']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile complex mixed path', function () {
      const result = NormalizedPath.from(['store', 'book', 0, 'title']);
      assert.strictEqual(result, "$['store']['book'][0]['title']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile alternating types', function () {
      const result = NormalizedPath.from(['a', 0, 'b', 1, 'c', 2]);
      assert.strictEqual(result, "$['a'][0]['b'][1]['c'][2]");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should compile with escaped names and indices', function () {
      const result = NormalizedPath.from(["it's", 0, 'back\\slash', 1]);
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
      specify(`NormalizedPath.from(${JSON.stringify(selectors)}) should return valid normalized path`, function () {
        const result = NormalizedPath.from(selectors);
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
      const result = NormalizedPath.from([longName]);
      assert.strictEqual(result, `$['${longName}']`);
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle very deep paths', function () {
      const selectors = Array(100).fill('a');
      const result = NormalizedPath.from(selectors);
      assert.strictEqual(result, "$" + "['a']".repeat(100));
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle selector that looks like a number', function () {
      const result = NormalizedPath.from(['123']);
      assert.strictEqual(result, "$['123']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle selector with only apostrophe', function () {
      const result = NormalizedPath.from(["'"]);
      assert.strictEqual(result, "$['\\'']");
      assert.isTrue(test(result, { normalized: true }));
    });

    specify('should handle selector with only backslash', function () {
      const result = NormalizedPath.from(['\\']);
      assert.strictEqual(result, "$['\\\\']");
      assert.isTrue(test(result, { normalized: true }));
    });
  });
});

describe('NormalizedPath.escape', function () {
  context('given invalid input', function () {
    specify('should throw TypeError for non-string input', function () {
      assert.throws(() => NormalizedPath.escape(123), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for null', function () {
      assert.throws(() => NormalizedPath.escape(null), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for undefined', function () {
      assert.throws(() => NormalizedPath.escape(undefined), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for array', function () {
      assert.throws(() => NormalizedPath.escape([]), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for object', function () {
      assert.throws(() => NormalizedPath.escape({}), TypeError, 'Selector must be a string');
    });
  });

  context('given strings without special characters', function () {
    specify('should return empty string unchanged', function () {
      assert.strictEqual(NormalizedPath.escape(''), '');
    });

    specify('should return simple strings unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('foo'), 'foo');
    });

    specify('should return alphanumeric strings unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('abc123XYZ'), 'abc123XYZ');
    });

    specify('should handle spaces unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('hello world'), 'hello world');
    });

    specify('should handle unicode characters unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('日本語'), '日本語');
    });

    specify('should handle emoji unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('hello 👋 world'), 'hello 👋 world');
    });

    specify('should handle double quotes unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('"quoted"'), '"quoted"');
    });

    specify('should handle special JSONPath characters unchanged', function () {
      assert.strictEqual(NormalizedPath.escape('$.store[*]..book'), '$.store[*]..book');
    });
  });

  context('given apostrophe', function () {
    specify('should escape single apostrophe', function () {
      assert.strictEqual(NormalizedPath.escape("'"), "\\'");
    });

    specify('should escape apostrophe at start', function () {
      assert.strictEqual(NormalizedPath.escape("'hello"), "\\'hello");
    });

    specify('should escape apostrophe at end', function () {
      assert.strictEqual(NormalizedPath.escape("hello'"), "hello\\'");
    });

    specify('should escape apostrophe in middle', function () {
      assert.strictEqual(NormalizedPath.escape("it's"), "it\\'s");
    });

    specify('should escape multiple apostrophes', function () {
      assert.strictEqual(NormalizedPath.escape("it's a 'test'"), "it\\'s a \\'test\\'");
    });

    specify('should escape consecutive apostrophes', function () {
      assert.strictEqual(NormalizedPath.escape("''"), "\\'\\'");
    });
  });

  context('given backslash', function () {
    specify('should escape single backslash', function () {
      assert.strictEqual(NormalizedPath.escape('\\'), '\\\\');
    });

    specify('should escape backslash at start', function () {
      assert.strictEqual(NormalizedPath.escape('\\hello'), '\\\\hello');
    });

    specify('should escape backslash at end', function () {
      assert.strictEqual(NormalizedPath.escape('hello\\'), 'hello\\\\');
    });

    specify('should escape backslash in middle', function () {
      assert.strictEqual(NormalizedPath.escape('back\\slash'), 'back\\\\slash');
    });

    specify('should escape multiple backslashes', function () {
      assert.strictEqual(NormalizedPath.escape('a\\b\\c'), 'a\\\\b\\\\c');
    });

    specify('should escape consecutive backslashes', function () {
      assert.strictEqual(NormalizedPath.escape('\\\\'), '\\\\\\\\');
    });
  });

  context('given control characters with named escapes', function () {
    specify('should escape backspace (U+0008)', function () {
      assert.strictEqual(NormalizedPath.escape('\b'), '\\b');
      assert.strictEqual(NormalizedPath.escape('a\bb'), 'a\\bb');
    });

    specify('should escape horizontal tab (U+0009)', function () {
      assert.strictEqual(NormalizedPath.escape('\t'), '\\t');
      assert.strictEqual(NormalizedPath.escape('a\tb'), 'a\\tb');
    });

    specify('should escape line feed (U+000A)', function () {
      assert.strictEqual(NormalizedPath.escape('\n'), '\\n');
      assert.strictEqual(NormalizedPath.escape('a\nb'), 'a\\nb');
    });

    specify('should escape form feed (U+000C)', function () {
      assert.strictEqual(NormalizedPath.escape('\f'), '\\f');
      assert.strictEqual(NormalizedPath.escape('a\fb'), 'a\\fb');
    });

    specify('should escape carriage return (U+000D)', function () {
      assert.strictEqual(NormalizedPath.escape('\r'), '\\r');
      assert.strictEqual(NormalizedPath.escape('a\rb'), 'a\\rb');
    });
  });

  context('given control characters with unicode escapes', function () {
    specify('should escape null (U+0000)', function () {
      assert.strictEqual(NormalizedPath.escape('\x00'), '\\u0000');
    });

    specify('should escape U+0001', function () {
      assert.strictEqual(NormalizedPath.escape('\x01'), '\\u0001');
    });

    specify('should escape U+0002', function () {
      assert.strictEqual(NormalizedPath.escape('\x02'), '\\u0002');
    });

    specify('should escape U+0003', function () {
      assert.strictEqual(NormalizedPath.escape('\x03'), '\\u0003');
    });

    specify('should escape U+0004', function () {
      assert.strictEqual(NormalizedPath.escape('\x04'), '\\u0004');
    });

    specify('should escape U+0005', function () {
      assert.strictEqual(NormalizedPath.escape('\x05'), '\\u0005');
    });

    specify('should escape U+0006', function () {
      assert.strictEqual(NormalizedPath.escape('\x06'), '\\u0006');
    });

    specify('should escape U+0007 (bell)', function () {
      assert.strictEqual(NormalizedPath.escape('\x07'), '\\u0007');
    });

    specify('should escape U+000B (vertical tab)', function () {
      assert.strictEqual(NormalizedPath.escape('\x0B'), '\\u000b');
    });

    specify('should escape U+000E', function () {
      assert.strictEqual(NormalizedPath.escape('\x0E'), '\\u000e');
    });

    specify('should escape U+000F', function () {
      assert.strictEqual(NormalizedPath.escape('\x0F'), '\\u000f');
    });

    specify('should escape U+0010', function () {
      assert.strictEqual(NormalizedPath.escape('\x10'), '\\u0010');
    });

    specify('should escape U+001F', function () {
      assert.strictEqual(NormalizedPath.escape('\x1F'), '\\u001f');
    });
  });

  context('given mixed escape sequences', function () {
    specify('should handle apostrophe and backslash together', function () {
      assert.strictEqual(NormalizedPath.escape("it\\'s"), "it\\\\\\'s");
    });

    specify('should handle all named control characters together', function () {
      assert.strictEqual(NormalizedPath.escape('\b\t\n\f\r'), '\\b\\t\\n\\f\\r');
    });

    specify('should handle complex mixed string', function () {
      assert.strictEqual(NormalizedPath.escape("it's\ta\\test\nwith\rlines"), "it\\'s\\ta\\\\test\\nwith\\rlines");
    });

    specify('should handle control chars with apostrophes', function () {
      assert.strictEqual(NormalizedPath.escape("'\n'"), "\\'\\n\\'");
    });
  });

  context('round-trip validation with normalized paths', function () {
    const testCases = [
      '',
      'simple',
      "it's",
      'back\\slash',
      '\t',
      '\n',
      '\r',
      '\b',
      '\f',
      '\x00',
      '\x0B',
      '\x1F',
      "complex'string\\with\tmixed\nchars",
      '日本語',
      'hello 👋 world',
      '"double quotes"',
      '$.store[*]',
    ];

    testCases.forEach((input) => {
      specify(`escaped "${input.replace(/[\x00-\x1F]/g, (c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`).replace(/\\/g, '\\\\')}" should produce valid normalized path`, function () {
        const escaped = NormalizedPath.escape(input);
        const normalizedPath = `$['${escaped}']`;
        assert.isTrue(
          test(normalizedPath, { normalized: true }),
          `${normalizedPath} should be a valid normalized path`,
        );
      });
    });
  });
});

describe('NormalizedPath.to', function () {
  context('given invalid input', function () {
    specify('should throw JSONNormalizedPathError for number input', function () {
      assert.throws(() => NormalizedPath.to(123), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for null', function () {
      assert.throws(() => NormalizedPath.to(null), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for undefined', function () {
      assert.throws(() => NormalizedPath.to(undefined), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for object', function () {
      assert.throws(() => NormalizedPath.to({}), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for array', function () {
      assert.throws(() => NormalizedPath.to([]), JSONNormalizedPathError);
    });
  });

  context('given invalid normalized paths', function () {
    specify('should throw JSONNormalizedPathError for dot notation', function () {
      assert.throws(() => NormalizedPath.to('$.a'), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for negative index', function () {
      assert.throws(() => NormalizedPath.to('$[-3]'), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for slice', function () {
      assert.throws(() => NormalizedPath.to('$[1:2]'), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for wildcard', function () {
      assert.throws(() => NormalizedPath.to('$[*]'), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for filter', function () {
      assert.throws(() => NormalizedPath.to('$[?@.a]'), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for double-quoted string', function () {
      assert.throws(() => NormalizedPath.to('$["a"]'), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for uppercase unicode escape', function () {
      assert.throws(() => NormalizedPath.to("$['\\u000B']"), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for missing root', function () {
      assert.throws(() => NormalizedPath.to("['a']"), JSONNormalizedPathError);
    });

    specify('should throw JSONNormalizedPathError for empty string', function () {
      assert.throws(() => NormalizedPath.to(''), JSONNormalizedPathError);
    });
  });

  context('given empty path', function () {
    specify('should return empty array for $', function () {
      const result = NormalizedPath.to('$');
      assert.deepStrictEqual(result, []);
    });
  });

  context('given index selectors', function () {
    specify('should parse index 0', function () {
      const result = NormalizedPath.to('$[0]');
      assert.deepStrictEqual(result, [0]);
    });

    specify('should parse index 1', function () {
      const result = NormalizedPath.to('$[1]');
      assert.deepStrictEqual(result, [1]);
    });

    specify('should parse large index', function () {
      const result = NormalizedPath.to('$[999999]');
      assert.deepStrictEqual(result, [999999]);
    });

    specify('should parse multiple indices', function () {
      const result = NormalizedPath.to('$[0][1][2]');
      assert.deepStrictEqual(result, [0, 1, 2]);
    });
  });

  context('given name selectors', function () {
    specify('should parse single letter', function () {
      const result = NormalizedPath.to("$['a']");
      assert.deepStrictEqual(result, ['a']);
    });

    specify('should parse word', function () {
      const result = NormalizedPath.to("$['foo']");
      assert.deepStrictEqual(result, ['foo']);
    });

    specify('should parse multiple names', function () {
      const result = NormalizedPath.to("$['a']['b']['c']");
      assert.deepStrictEqual(result, ['a', 'b', 'c']);
    });

    specify('should parse empty string', function () {
      const result = NormalizedPath.to("$['']");
      assert.deepStrictEqual(result, ['']);
    });

    specify('should parse string with spaces', function () {
      const result = NormalizedPath.to("$['hello world']");
      assert.deepStrictEqual(result, ['hello world']);
    });
  });

  context('given escaped characters', function () {
    specify('should unescape apostrophe', function () {
      const result = NormalizedPath.to("$['it\\'s']");
      assert.deepStrictEqual(result, ["it's"]);
    });

    specify('should unescape backslash', function () {
      const result = NormalizedPath.to("$['back\\\\slash']");
      assert.deepStrictEqual(result, ['back\\slash']);
    });

    specify('should unescape tab', function () {
      const result = NormalizedPath.to("$['\\t']");
      assert.deepStrictEqual(result, ['\t']);
    });

    specify('should unescape newline', function () {
      const result = NormalizedPath.to("$['\\n']");
      assert.deepStrictEqual(result, ['\n']);
    });

    specify('should unescape carriage return', function () {
      const result = NormalizedPath.to("$['\\r']");
      assert.deepStrictEqual(result, ['\r']);
    });

    specify('should unescape backspace', function () {
      const result = NormalizedPath.to("$['\\b']");
      assert.deepStrictEqual(result, ['\b']);
    });

    specify('should unescape form feed', function () {
      const result = NormalizedPath.to("$['\\f']");
      assert.deepStrictEqual(result, ['\f']);
    });

    specify('should unescape unicode escape', function () {
      const result = NormalizedPath.to("$['\\u0000']");
      assert.deepStrictEqual(result, ['\x00']);
    });

    specify('should unescape vertical tab unicode escape', function () {
      const result = NormalizedPath.to("$['\\u000b']");
      assert.deepStrictEqual(result, ['\x0B']);
    });
  });

  context('given mixed selectors', function () {
    specify('should parse name then index', function () {
      const result = NormalizedPath.to("$['a'][0]");
      assert.deepStrictEqual(result, ['a', 0]);
    });

    specify('should parse index then name', function () {
      const result = NormalizedPath.to("$[0]['a']");
      assert.deepStrictEqual(result, [0, 'a']);
    });

    specify('should parse complex mixed path', function () {
      const result = NormalizedPath.to("$['store']['book'][0]['title']");
      assert.deepStrictEqual(result, ['store', 'book', 0, 'title']);
    });
  });

  context('given unicode', function () {
    specify('should parse Japanese characters', function () {
      const result = NormalizedPath.to("$['日本語']");
      assert.deepStrictEqual(result, ['日本語']);
    });

    specify('should parse emoji', function () {
      const result = NormalizedPath.to("$['👋']");
      assert.deepStrictEqual(result, ['👋']);
    });
  });

  context('round-trip with NormalizedPath.from', function () {
    const testCases = [
      [],
      ['a'],
      [0],
      ['a', 'b', 1],
      ["it's"],
      ['back\\slash'],
      ['\t'],
      ['\n'],
      ['\x00'],
      ['\x0B'],
      [''],
      ['日本語'],
      ['a.b.c'],
      ['[0]'],
      ['store', 'book', 0, 'title'],
    ];

    testCases.forEach((selectors) => {
      specify(`to(from(${JSON.stringify(selectors)})) should return original selectors`, function () {
        const normalizedPath = NormalizedPath.from(selectors);
        const result = NormalizedPath.to(normalizedPath);
        assert.deepStrictEqual(result, selectors);
      });
    });
  });
});

describe('NormalizedPath.test', function () {
  context('given valid normalized paths', function () {
    specify('should return true for root only', function () {
      assert.isTrue(NormalizedPath.test('$'));
    });

    specify('should return true for single name selector', function () {
      assert.isTrue(NormalizedPath.test("$['a']"));
    });

    specify('should return true for single index selector', function () {
      assert.isTrue(NormalizedPath.test('$[0]'));
    });

    specify('should return true for multiple segments', function () {
      assert.isTrue(NormalizedPath.test("$['store']['book'][0]['title']"));
    });

    specify('should return true for empty string name selector', function () {
      assert.isTrue(NormalizedPath.test("$['']"));
    });

    specify('should return true for escaped characters', function () {
      assert.isTrue(NormalizedPath.test("$['it\\'s']"));
      assert.isTrue(NormalizedPath.test("$['back\\\\slash']"));
      assert.isTrue(NormalizedPath.test("$['\\t']"));
      assert.isTrue(NormalizedPath.test("$['\\n']"));
    });

    specify('should return true for unicode characters', function () {
      assert.isTrue(NormalizedPath.test("$['日本語']"));
      assert.isTrue(NormalizedPath.test("$['👋']"));
    });
  });

  context('given invalid normalized paths', function () {
    specify('should return false for non-string input', function () {
      assert.isFalse(NormalizedPath.test(null));
      assert.isFalse(NormalizedPath.test(undefined));
      assert.isFalse(NormalizedPath.test(123));
      assert.isFalse(NormalizedPath.test([]));
      assert.isFalse(NormalizedPath.test({}));
    });

    specify('should return false for empty string', function () {
      assert.isFalse(NormalizedPath.test(''));
    });

    specify('should return false for dot notation', function () {
      assert.isFalse(NormalizedPath.test('$.a'));
      assert.isFalse(NormalizedPath.test('$.store.book'));
    });

    specify('should return false for double-quoted strings', function () {
      assert.isFalse(NormalizedPath.test('$["a"]'));
    });

    specify('should return false for negative index', function () {
      assert.isFalse(NormalizedPath.test('$[-1]'));
    });

    specify('should return false for slice selector', function () {
      assert.isFalse(NormalizedPath.test('$[0:1]'));
    });

    specify('should return false for wildcard', function () {
      assert.isFalse(NormalizedPath.test('$[*]'));
      assert.isFalse(NormalizedPath.test('$.*'));
    });

    specify('should return false for filter', function () {
      assert.isFalse(NormalizedPath.test('$[?@.price>10]'));
    });

    specify('should return false for descendant', function () {
      assert.isFalse(NormalizedPath.test('$..a'));
    });

    specify('should return false for uppercase Unicode escape', function () {
      assert.isFalse(NormalizedPath.test("$['\\u000B']"));
    });
  });

  context('consistency with test(path, { normalized: true })', function () {
    const validPaths = [
      '$',
      "$['a']",
      '$[0]',
      "$['store']['book'][0]['title']",
      "$['']",
      "$['it\\'s']",
    ];

    const invalidPaths = [
      '',
      '$.a',
      '$["a"]',
      '$[-1]',
      '$[*]',
      '$[0:1]',
    ];

    validPaths.forEach((path) => {
      specify(`should match test() for valid path: ${path}`, function () {
        assert.strictEqual(NormalizedPath.test(path), test(path, { normalized: true }));
      });
    });

    invalidPaths.forEach((path) => {
      specify(`should match test() for invalid path: ${path}`, function () {
        assert.strictEqual(NormalizedPath.test(path), test(path, { normalized: true }));
      });
    });
  });
});
