import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, XMLTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('XMLTranslator', function () {
      specify('should translate a JSONPath to a XML', function () {
        const parseResult = parse('$', { translator: new XMLTranslator() });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });
    });
  });
});
