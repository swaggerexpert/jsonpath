import { assert } from 'chai';

import { parse, JSONPathParseError } from '../../src/index.js';

describe('parse', function () {
  context('integers (RFC 9535 Section 2.1)', function () {
    context('given index selectors within safe integer range', function () {
      specify('should parse zero index', function () {
        const { result } = parse('$[0]');
        assert.isTrue(result.success);
      });

      specify('should parse positive index', function () {
        const { result } = parse('$[123]');
        assert.isTrue(result.success);
      });

      specify('should parse negative index', function () {
        const { result } = parse('$[-1]');
        assert.isTrue(result.success);
      });

      specify('should parse MAX_SAFE_INTEGER', function () {
        const { result } = parse(`$[${Number.MAX_SAFE_INTEGER}]`);
        assert.isTrue(result.success);
      });

      specify('should parse MIN_SAFE_INTEGER', function () {
        const { result } = parse(`$[${Number.MIN_SAFE_INTEGER}]`);
        assert.isTrue(result.success);
      });
    });

    context('given index selectors outside safe integer range', function () {
      specify('should throw for integer greater than MAX_SAFE_INTEGER', function () {
        const unsafeInt = '9007199254740992'; // MAX_SAFE_INTEGER + 1
        assert.throws(
          () => parse(`$[${unsafeInt}]`),
          JSONPathParseError,
        );
      });

      specify('should throw for integer less than MIN_SAFE_INTEGER', function () {
        const unsafeInt = '-9007199254740992'; // MIN_SAFE_INTEGER - 1
        assert.throws(
          () => parse(`$[${unsafeInt}]`),
          JSONPathParseError,
        );
      });

      specify('should throw for very large positive integer', function () {
        const unsafeInt = '99999999999999999999';
        assert.throws(
          () => parse(`$[${unsafeInt}]`),
          JSONPathParseError,
        );
      });

      specify('should throw for very large negative integer', function () {
        const unsafeInt = '-99999999999999999999';
        assert.throws(
          () => parse(`$[${unsafeInt}]`),
          JSONPathParseError,
        );
      });
    });

    context('given slice selectors within safe integer range', function () {
      specify('should parse slice with safe start', function () {
        const { result } = parse(`$[${Number.MAX_SAFE_INTEGER}:]`);
        assert.isTrue(result.success);
      });

      specify('should parse slice with safe end', function () {
        const { result } = parse(`$[:${Number.MAX_SAFE_INTEGER}]`);
        assert.isTrue(result.success);
      });

      specify('should parse slice with safe step', function () {
        const { result } = parse(`$[::${Number.MAX_SAFE_INTEGER}]`);
        assert.isTrue(result.success);
      });

      specify('should parse slice with negative safe integers', function () {
        const { result } = parse(`$[${Number.MIN_SAFE_INTEGER}:${Number.MIN_SAFE_INTEGER}:${Number.MIN_SAFE_INTEGER}]`);
        assert.isTrue(result.success);
      });
    });

    context('given slice selectors outside safe integer range', function () {
      specify('should throw for unsafe start', function () {
        const unsafeInt = '9007199254740992';
        assert.throws(
          () => parse(`$[${unsafeInt}:]`),
          JSONPathParseError,
        );
      });

      specify('should throw for unsafe end', function () {
        const unsafeInt = '9007199254740992';
        assert.throws(
          () => parse(`$[:${unsafeInt}]`),
          JSONPathParseError,
        );
      });

      specify('should throw for unsafe step', function () {
        const unsafeInt = '9007199254740992';
        assert.throws(
          () => parse(`$[::${unsafeInt}]`),
          JSONPathParseError,
        );
      });
    });

    context('given normalized path index selectors', function () {
      specify('should parse MAX_SAFE_INTEGER in normalized path', function () {
        const { result } = parse(`$[${Number.MAX_SAFE_INTEGER}]`, { normalized: true });
        assert.isTrue(result.success);
      });

      specify('should throw for unsafe integer in normalized path', function () {
        const unsafeInt = '9007199254740992';
        assert.throws(
          () => parse(`$[${unsafeInt}]`, { normalized: true }),
          JSONPathParseError,
        );
      });
    });
  });
});
