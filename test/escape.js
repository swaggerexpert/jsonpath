import { assert } from 'chai';

import { escape, test } from '../src/index.js';

describe('escape', function () {
  context('given invalid input', function () {
    specify('should throw TypeError for non-string input', function () {
      assert.throws(() => escape(123), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for null', function () {
      assert.throws(() => escape(null), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for undefined', function () {
      assert.throws(() => escape(undefined), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for array', function () {
      assert.throws(() => escape([]), TypeError, 'Selector must be a string');
    });

    specify('should throw TypeError for object', function () {
      assert.throws(() => escape({}), TypeError, 'Selector must be a string');
    });
  });

  context('given strings without special characters', function () {
    specify('should return empty string unchanged', function () {
      assert.strictEqual(escape(''), '');
    });

    specify('should return simple strings unchanged', function () {
      assert.strictEqual(escape('foo'), 'foo');
    });

    specify('should return alphanumeric strings unchanged', function () {
      assert.strictEqual(escape('abc123XYZ'), 'abc123XYZ');
    });

    specify('should handle spaces unchanged', function () {
      assert.strictEqual(escape('hello world'), 'hello world');
    });

    specify('should handle unicode characters unchanged', function () {
      assert.strictEqual(escape('日本語'), '日本語');
    });

    specify('should handle emoji unchanged', function () {
      assert.strictEqual(escape('hello 👋 world'), 'hello 👋 world');
    });

    specify('should handle double quotes unchanged', function () {
      assert.strictEqual(escape('"quoted"'), '"quoted"');
    });

    specify('should handle special JSONPath characters unchanged', function () {
      assert.strictEqual(escape('$.store[*]..book'), '$.store[*]..book');
    });
  });

  context('given apostrophe', function () {
    specify('should escape single apostrophe', function () {
      assert.strictEqual(escape("'"), "\\'");
    });

    specify('should escape apostrophe at start', function () {
      assert.strictEqual(escape("'hello"), "\\'hello");
    });

    specify('should escape apostrophe at end', function () {
      assert.strictEqual(escape("hello'"), "hello\\'");
    });

    specify('should escape apostrophe in middle', function () {
      assert.strictEqual(escape("it's"), "it\\'s");
    });

    specify('should escape multiple apostrophes', function () {
      assert.strictEqual(escape("it's a 'test'"), "it\\'s a \\'test\\'");
    });

    specify('should escape consecutive apostrophes', function () {
      assert.strictEqual(escape("''"), "\\'\\'");
    });
  });

  context('given backslash', function () {
    specify('should escape single backslash', function () {
      assert.strictEqual(escape('\\'), '\\\\');
    });

    specify('should escape backslash at start', function () {
      assert.strictEqual(escape('\\hello'), '\\\\hello');
    });

    specify('should escape backslash at end', function () {
      assert.strictEqual(escape('hello\\'), 'hello\\\\');
    });

    specify('should escape backslash in middle', function () {
      assert.strictEqual(escape('back\\slash'), 'back\\\\slash');
    });

    specify('should escape multiple backslashes', function () {
      assert.strictEqual(escape('a\\b\\c'), 'a\\\\b\\\\c');
    });

    specify('should escape consecutive backslashes', function () {
      assert.strictEqual(escape('\\\\'), '\\\\\\\\');
    });
  });

  context('given control characters with named escapes', function () {
    specify('should escape backspace (U+0008)', function () {
      assert.strictEqual(escape('\b'), '\\b');
      assert.strictEqual(escape('a\bb'), 'a\\bb');
    });

    specify('should escape horizontal tab (U+0009)', function () {
      assert.strictEqual(escape('\t'), '\\t');
      assert.strictEqual(escape('a\tb'), 'a\\tb');
    });

    specify('should escape line feed (U+000A)', function () {
      assert.strictEqual(escape('\n'), '\\n');
      assert.strictEqual(escape('a\nb'), 'a\\nb');
    });

    specify('should escape form feed (U+000C)', function () {
      assert.strictEqual(escape('\f'), '\\f');
      assert.strictEqual(escape('a\fb'), 'a\\fb');
    });

    specify('should escape carriage return (U+000D)', function () {
      assert.strictEqual(escape('\r'), '\\r');
      assert.strictEqual(escape('a\rb'), 'a\\rb');
    });
  });

  context('given control characters with unicode escapes', function () {
    specify('should escape null (U+0000)', function () {
      assert.strictEqual(escape('\x00'), '\\u0000');
    });

    specify('should escape U+0001', function () {
      assert.strictEqual(escape('\x01'), '\\u0001');
    });

    specify('should escape U+0002', function () {
      assert.strictEqual(escape('\x02'), '\\u0002');
    });

    specify('should escape U+0003', function () {
      assert.strictEqual(escape('\x03'), '\\u0003');
    });

    specify('should escape U+0004', function () {
      assert.strictEqual(escape('\x04'), '\\u0004');
    });

    specify('should escape U+0005', function () {
      assert.strictEqual(escape('\x05'), '\\u0005');
    });

    specify('should escape U+0006', function () {
      assert.strictEqual(escape('\x06'), '\\u0006');
    });

    specify('should escape U+0007 (bell)', function () {
      assert.strictEqual(escape('\x07'), '\\u0007');
    });

    specify('should escape U+000B (vertical tab)', function () {
      assert.strictEqual(escape('\x0B'), '\\u000b');
    });

    specify('should escape U+000E', function () {
      assert.strictEqual(escape('\x0E'), '\\u000e');
    });

    specify('should escape U+000F', function () {
      assert.strictEqual(escape('\x0F'), '\\u000f');
    });

    specify('should escape U+0010', function () {
      assert.strictEqual(escape('\x10'), '\\u0010');
    });

    specify('should escape U+001F', function () {
      assert.strictEqual(escape('\x1F'), '\\u001f');
    });
  });

  context('given mixed escape sequences', function () {
    specify('should handle apostrophe and backslash together', function () {
      assert.strictEqual(escape("it\\'s"), "it\\\\\\'s");
    });

    specify('should handle all named control characters together', function () {
      assert.strictEqual(escape('\b\t\n\f\r'), '\\b\\t\\n\\f\\r');
    });

    specify('should handle complex mixed string', function () {
      assert.strictEqual(escape("it's\ta\\test\nwith\rlines"), "it\\'s\\ta\\\\test\\nwith\\rlines");
    });

    specify('should handle control chars with apostrophes', function () {
      assert.strictEqual(escape("'\n'"), "\\'\\n\\'");
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
        const escaped = escape(input);
        const normalizedPath = `$['${escaped}']`;
        assert.isTrue(
          test(normalizedPath, { normalized: true }),
          `${normalizedPath} should be a valid normalized path`,
        );
      });
    });
  });
});
