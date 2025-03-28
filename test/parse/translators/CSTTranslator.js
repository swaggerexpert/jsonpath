import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, CSTTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('CSTTranslator', function () {
      specify('should translate a JSONPath to a CST', function () {
        const parseResult = parse('$', { translator: new CSTTranslator() });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });
    });
  });
});
