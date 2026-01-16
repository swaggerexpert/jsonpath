import { assert } from 'chai';

import { parse, Trace } from '../../src/index.js';

describe('parse', function () {
  context('trace', function () {
    specify('should not produce trace by default', function () {
      const parseResult = parse('$');

      assert.isUndefined(parseResult.trace);
    });

    specify('should produce stats when requested', function () {
      const parseResult = parse('$', { trace: true });

      assert.instanceOf(parseResult.trace, Trace);
    });

    specify('should provide trace', function () {
      const parseResult = parse('$', { trace: true });
      const expected =
        '|-|[RNM(jsonpath-query)]$\n' +
        '.|-|[CAT]$\n' +
        '..|-|[RNM(root-identifier)]$\n' +
        '...|-|[TLS($)]$\n' +
        "...|M|[TLS($)]'$'\n" +
        "..|M|[RNM(root-identifier)]'$'\n" +
        '..|-|[RNM(segments)]\n' +
        '...|-|[REP(0,inf)]\n' +
        "...|E|[REP(0,inf)]''\n" +
        "..|E|[RNM(segments)]''\n" +
        ".|M|[CAT]'$'\n" +
        "|M|[RNM(jsonpath-query)]'$'\n";

      assert.strictEqual(parseResult.trace.displayTrace(), expected);
    });

    specify('should be able to create human-readable trace message', function () {
      const { result, trace } = parse('$fdfadfd', { trace: true });
      const errorMessage = `Syntax error at position ${result.maxMatched}, expected ${trace.inferExpectations()}`;

      assert.isFalse(result.success);
      assert.strictEqual(errorMessage, 'Syntax error at position 1, expected "[", ".", ".."');
    });
  });
});
