import { Ast as AST } from 'apg-lite';

import cstCallback from '../callbacks/cst.js';

class JSONPathQueryCST extends AST {
  constructor() {
    super();

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.1.1
    this.callbacks['jsonpath-query'] = cstCallback('jsonpath-query');
    this.callbacks['segments'] = cstCallback('segments');
    this.callbacks['B'] = cstCallback('text');
    this.callbacks['S'] = cstCallback('text');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.2.1
    this.callbacks['root-identifier'] = cstCallback('root-identifier');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.3
    this.callbacks['selector'] = cstCallback('selector');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1.1
    this.callbacks['name-selector'] = cstCallback('name-selector');
    this.callbacks['string-literal'] = cstCallback('string-literal');
    this.callbacks['double-quoted'] = cstCallback('double-quoted');
    this.callbacks['single-quoted'] = cstCallback('single-quoted');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2.1
    this.callbacks['wildcard-selector'] = cstCallback('wildcard-selector');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.3.1
    this.callbacks['index-selector'] = cstCallback('index-selector');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.4.1
    this.callbacks['slice-selector'] = cstCallback('slice-selector');
    this.callbacks['start'] = cstCallback('start');
    this.callbacks['end'] = cstCallback('end');
    this.callbacks['step'] = cstCallback('step');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.1
    this.callbacks['filter-selector'] = cstCallback('filter-selector');
    this.callbacks['logical-expr'] = cstCallback('logical-expr');
    this.callbacks['logical-or-expr'] = cstCallback('logical-or-expr');
    this.callbacks['logical-and-expr'] = cstCallback('logical-and-expr');
    this.callbacks['basic-expr'] = cstCallback('basic-expr');
    this.callbacks['paren-expr'] = cstCallback('paren-expr');
    this.callbacks['logical-not-op'] = cstCallback('logical-not-op');
    this.callbacks['test-expr'] = cstCallback('test-expr');
    this.callbacks['filter-query'] = cstCallback('filter-query');
    this.callbacks['rel-query'] = cstCallback('rel-query');
    this.callbacks['current-node-identifier'] = cstCallback('current-node-identifier');
    this.callbacks['comparison-expr'] = cstCallback('comparison-expr');
    this.callbacks['literal'] = cstCallback('literal');
    this.callbacks['comparable'] = cstCallback('comparable');
    this.callbacks['comparison-op'] = cstCallback('comparison-op');
    this.callbacks['singular-query'] = cstCallback('singular-query');
    this.callbacks['rel-singular-query'] = cstCallback('rel-singular-query');
    this.callbacks['abs-singular-query'] = cstCallback('abs-singular-query');
    this.callbacks['singular-query-segments'] = cstCallback('singular-query-segments');
    this.callbacks['name-segment'] = cstCallback('name-segment');
    this.callbacks['index-segment'] = cstCallback('index-segment');
    this.callbacks['number'] = cstCallback('number');
    this.callbacks['true'] = cstCallback('true');
    this.callbacks['false'] = cstCallback('false');
    this.callbacks['null'] = cstCallback('null');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.4
    this.callbacks['function-name'] = cstCallback('function-name');
    this.callbacks['function-expr'] = cstCallback('function-expr');
    this.callbacks['function-argument'] = cstCallback('function-argument');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.5
    this.callbacks['segment'] = cstCallback('segment');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.5.1.1
    this.callbacks['child-segment'] = cstCallback('child-segment');
    this.callbacks['bracketed-selection'] = cstCallback('bracketed-selection');
    this.callbacks['member-name-shorthand'] = cstCallback('member-name-shorthand');

    // https://www.rfc-editor.org/rfc/rfc9535#section-2.5.2.1
    this.callbacks['descendant-segment'] = cstCallback('descendant-segment');

    // Surrogate named rules
    this.callbacks['dot-prefix'] = cstCallback('text');
    this.callbacks['double-dot-prefix'] = cstCallback('text');
    this.callbacks['left-bracket'] = cstCallback('text');
    this.callbacks['right-bracket'] = cstCallback('text');
    this.callbacks['comma'] = cstCallback('text');
    this.callbacks['colon'] = cstCallback('text');
    this.callbacks['dquote'] = cstCallback('text');
    this.callbacks['squote'] = cstCallback('text');
    this.callbacks['questionmark'] = cstCallback('text');
    this.callbacks['disjunction'] = cstCallback('text');
    this.callbacks['conjunction'] = cstCallback('text');
    this.callbacks['left-paren'] = cstCallback('text');
    this.callbacks['right-paren'] = cstCallback('text');
  }
}

export default JSONPathQueryCST;
