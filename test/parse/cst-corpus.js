import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, JSONPathQueryCST } from '../../src/index.js';

describe('parse', function () {
  context('cst-corpus', function () {
    const jsonPaths = [
      "$['store']['book'][0]['title']",
      '$.store.book[0].title',
      '$.store.book[?@.price < 10].title',
      '$.store.book[*].author',
      '$..author',
      '$.store.*',
      '$.store..price',
      '$..book[2]',
    ];

    jsonPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        const parseResult = parse(jsonPath, { ast: new JSONPathQueryCST() });

        assert.isTrue(parseResult.result.success);
        expect(JSON.stringify(parseResult.computed, null, 2)).toMatchSnapshot();
      });
    });
  });
});
