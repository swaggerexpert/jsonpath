/**
 * RFC 9535 built-in functions.
 *
 * All functions defined in RFC 9535 Section 2.4.
 * Can be extended or overridden via the `functions` option in evaluate().
 *
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4
 */

export { default as length } from './length.js';
export { default as count } from './count.js';
export { default as value } from './value.js';
export { default as match } from './match.js';
export { default as search } from './search.js';
