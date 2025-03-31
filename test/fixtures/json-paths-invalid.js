export default [
  '',
  '$$',
  '$[?(@.price > 10)', // missing closing bracket
  "$['unclosed]", // unclosed string literal
  "$['key']extra", // trailing junk
  '$[1 2]', // missing comma
  '$[1,,2]', // double comma
  '$[?]', // empty filter
  '$[?(@.price >)]', // incomplete filter
  "$['\u0001']", // invalid control char
  '$[??(@.price)]', // invalid filter syntax
  '$[?(@.price => 10)]', // invalid comparison operator
  "$.store.book[1]['title]", // unclosed quote
  "$[?match(@.a, 'b')", // missing bracket
  "$[?(@.a == 'b')", // unclosed filter
  "$['key'][?]", // empty filter after key
  "$['unterminated]", // another broken string
  '$[', // just an open bracket
  '$.store[.book]', // invalid selector inside brackets
  '$[0,]', // trailing comma in selector
];
