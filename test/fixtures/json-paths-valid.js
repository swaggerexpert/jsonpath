import validNormalizedPaths from './normalized-paths-valid.js';

export default [
  // https://www.rfc-editor.org/rfc/rfc9535#section-1.4.2
  "$['store']['book'][0]['title']",
  '$.store.book[0].title',
  // https://www.rfc-editor.org/rfc/rfc9535#section-1.4.3
  '$.store.book[?@.price < 10].title',
  // https://www.rfc-editor.org/rfc/rfc9535#section-1.5
  '$.store.book[*].author',
  '$..author',
  '$.store.*',
  '$.store..price',
  '$..book[2]',
  '$..book[2].author',
  '$..book[2].publisher',
  '$..book[-1]',
  '$..book[0,1]',
  '$..book[:2]',
  '$..book[?@.isbn]',
  '$..book[?@.price<10]',
  '$..*',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.2.3
  '$',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1.3
  "$.o['j j']",
  "$.o['j j']['k.k']",
  '$.o["j j"]["k.k"]',
  `$["'"]["@"]`,
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2.3
  '$[*]',
  '$.o[*]',
  '$.o[*]',
  '$.o[*, *]',
  '$.a[*]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.3.3
  '$[1]',
  '$[-2]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.4.3
  '$[1:3]',
  '$[5:]',
  '$[1:5:2]',
  '$[5:1:-2]',
  '$[::-1]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.3
  "$.a[?@.b == 'kilo']",
  "$.a[?(@.b == 'kilo')]",
  '$.a[?@>3.5]',
  '$.a[?@.b]',
  '$[?@.*]',
  '$[?@[?@.b]]',
  '$.o[?@<3, ?@<3]',
  '$.a[?@<2 || @.b == "k"]',
  '$.a[?match(@.b, "[jk]")]',
  '$.a[?search(@.b, "[jk]")]',
  '$.o[?@>1 && @<4]',
  '$.o[?@>1 && @<4]',
  '$.o[?@.u || @.x]',
  '$.a[?@.b == $.x]',
  '$.a[?@ == @]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.4.4
  '$[?length(@.authors) >= 5]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.4.5
  '$[?count(@.*.author) >= 5]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.4.6
  '$[?match(@.date, "1974-05-..")]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.4.7
  '$[?search(@.author, "[BR]ob")]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.4.8
  '$[?value(@..color) == "red"]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.4.9
  '$[?length(@) < 3]',
  '$[?length(@.*) < 3]',
  '$[?count(@.*) == 1]',
  '$[?count(1) == 1]',
  '$[?count(foo(@.*)) == 1]',
  "$[?match(@.timezone, 'Europe/.*')]",
  "$[?match(@.timezone, 'Europe/.*') == true]",
  '$[?value(@..color) == "red"]',
  '$[?value(@..color)]',
  '$[?bar(@.a)]',
  '$[?bnl(@.*)]',
  '$[?blt(1==1)]', // https://www.rfc-editor.org/errata/eid8343
  '$[?blt(1)]',
  '$[?bal(1)]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.5.1.3
  '$[0, 3]',
  '$[0:2, 5]',
  '$[0, 0]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.5.2.3
  '$..j',
  '$..[0]',
  '$..[*]',
  '$..*',
  '$..o',
  '$.o..[*, *]',
  '$.a..[0, 1]',
  // https://www.rfc-editor.org/rfc/rfc9535#section-2.6.1
  '$.a',
  '$.a[0]',
  '$.a.d',
  '$.b[0]',
  '$.b[*]',
  '$.b[?@]',
  '$.b[?@==null]',
  '$.c[?@.d==null]',
  '$.null',
  ...validNormalizedPaths,
  // https://www.rfc-editor.org/errata/eid8343
  '$[?foo(1==2)]',
  '$[?true(1)==0]',
  '$[?true(1)==false(0)]',
];
