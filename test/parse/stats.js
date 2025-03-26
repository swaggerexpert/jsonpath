import { assert } from 'chai';
import { Stats } from 'apg-lite';

import { parse } from '../../src/index.js';

describe('parse', function () {
  context('stats', function () {
    specify('should not produce stats by default', function () {
      const parseResult = parse('$.store.book[0].title');

      assert.isUndefined(parseResult.stats);
    });

    specify('should produce stats when requested', function () {
      const parseResult = parse('$.store.book[0].title', { stats: true });

      assert.instanceOf(parseResult.stats, Stats);
    });

    specify('should provide operator stats', function () {
      const parseResult = parse('$.store.book[0].title', { stats: true });
      const expected =
        '          OPERATOR STATS\n' +
        '      |   MATCH |   EMPTY | NOMATCH |   TOTAL |\n' +
        '  ALT |      53 |       0 |      15 |      68 |\n' +
        '  CAT |      13 |       0 |       7 |      20 |\n' +
        '  REP |       5 |       9 |       0 |      14 |\n' +
        '  RNM |      64 |       8 |      33 |     105 |\n' +
        '  TRG |      14 |       0 |      24 |      38 |\n' +
        '  TBS |       0 |       0 |      34 |      34 |\n' +
        '  TLS |       8 |       0 |      11 |      19 |\n' +
        '  UDT |       0 |       0 |       0 |       0 |\n' +
        '  AND |       0 |       0 |       0 |       0 |\n' +
        '  NOT |       0 |       0 |       0 |       0 |\n' +
        'TOTAL |     157 |      17 |     124 |     298 |\n';

      assert.strictEqual(parseResult.stats.displayStats(), expected);
    });

    specify('should provide rules grouped by hit count', function () {
      const parseResult = parse('$.store.book[0].title', { stats: true });
      const expected =
        '    RULES/UDTS BY HIT COUNT\n' +
        '|   MATCH |   EMPTY | NOMATCH |   TOTAL | NAME\n' +
        '|      14 |       0 |       2 |      16 | ALPHA\n' +
        '|      14 |       0 |       2 |      16 | name-first\n' +
        '|      11 |       0 |       2 |      13 | name-char\n' +
        '|       0 |       0 |       8 |       8 | B\n' +
        '|       0 |       8 |       0 |       8 | S\n' +
        '|       1 |       0 |       3 |       4 | bracketed-selection\n' +
        '|       4 |       0 |       0 |       4 | child-segment\n' +
        '|       1 |       0 |       3 |       4 | left-bracket\n' +
        '|       4 |       0 |       0 |       4 | segment\n' +
        '|       0 |       0 |       4 |       4 | wildcard-selector\n' +
        '|       3 |       0 |       0 |       3 | dot-prefix\n' +
        '|       3 |       0 |       0 |       3 | member-name-shorthand\n' +
        '|       0 |       0 |       2 |       2 | DIGIT\n' +
        '|       2 |       0 |       0 |       2 | int\n' +
        '|       0 |       0 |       1 |       1 | colon\n' +
        '|       0 |       0 |       1 |       1 | comma\n' +
        '|       0 |       0 |       1 |       1 | dquote\n' +
        '|       1 |       0 |       0 |       1 | index-selector\n' +
        '|       1 |       0 |       0 |       1 | jsonpath-query\n' +
        '|       0 |       0 |       1 |       1 | name-selector\n' +
        '|       1 |       0 |       0 |       1 | right-bracket\n' +
        '|       1 |       0 |       0 |       1 | root-identifier\n' +
        '|       1 |       0 |       0 |       1 | segments\n' +
        '|       1 |       0 |       0 |       1 | selector\n' +
        '|       0 |       0 |       1 |       1 | slice-selector\n' +
        '|       0 |       0 |       1 |       1 | squote\n' +
        '|       1 |       0 |       0 |       1 | start\n' +
        '|       0 |       0 |       1 |       1 | string-literal\n';

      assert.strictEqual(parseResult.stats.displayHits(), expected);
    });
  });
});
