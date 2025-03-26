import { assert } from 'chai';
import { Trace } from 'apg-lite';

import { parse } from '../../src/index.js';

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
      function inferExpectations(traceText) {
        const lines = traceText.split('\n');
        const expectations = new Set();
        let collecting = false;
        let lastMatchedIndex = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // capture the max match line (first one that ends in a single character match)
          if (!collecting && line.includes('M|')) {
            const textMatch = line.match(/]'(.*)'$/);
            if (textMatch && textMatch[1]) {
              lastMatchedIndex = i;
            }
          }

          // begin collecting after the deepest successful match
          if (i > lastMatchedIndex) {
            const terminalFailMatch = line.match(/N\|\[TLS\(([^)]+)\)\]/);
            if (terminalFailMatch) {
              expectations.add(terminalFailMatch[1]);
            }
          }
        }

        return Array.from(expectations);
      }

      const { result, trace } = parse('$fdfadfd', { trace: true });
      const expectations = inferExpectations(trace.displayTrace())
        .map((c) => `"${c}"`)
        .join(', ');
      const errorMessage = `Syntax error at position ${result.maxMatched}, expected ${expectations}`;

      assert.isFalse(result.success);
      assert.strictEqual(errorMessage, 'Syntax error at position 1, expected "[", ".", ".."');
    });
  });
});
