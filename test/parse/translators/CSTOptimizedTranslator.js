import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, CSTOptimizedTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('CSTOptimizedTranslator', function () {
      specify('should translate a JSONPath to a CST and optimize single-quoted', function () {
        const parseResult = parse("$[?match(@.timezone, 'Europe/.*')]", {
          translator: new CSTOptimizedTranslator(),
        });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });

      specify('should translate a JSONPath to a CST and optimize double-quoted', function () {
        const parseResult = parse('$[?match(@.timezone, "Europe/.*")]', {
          translator: new CSTOptimizedTranslator(),
        });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });

      specify(
        'should translate a JSONPath to a CST and optimize normal-single-quoted',
        function () {
          const parseResult = parse("$['abc']", {
            normalized: true,
            translator: new CSTOptimizedTranslator(),
          });

          assert.isTrue(parseResult.result.success);
          expect(parseResult.tree).toMatchSnapshot();
        },
      );

      specify(
        'should translate a JSONPath to a CST and avoid double-quoted optimization',
        function () {
          const parseResult = parse('$[?match(@.timezone, "Europe/.*")]', {
            translator: new CSTOptimizedTranslator({ collapsibleTypes: ['single-quoted'] }),
          });

          assert.isTrue(parseResult.result.success);
          expect(parseResult.tree).toMatchSnapshot();
        },
      );
    });
  });
});
