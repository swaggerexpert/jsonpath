import CSTTranslator from './CSTTranslator.js';

class CSTOptimizedTranslator extends CSTTranslator {
  collapsibleTypes = ['single-quoted', 'double-quoted'];

  constructor({ collapsibleTypes } = {}) {
    super();

    if (Array.isArray(collapsibleTypes)) {
      this.collapsibleTypes = collapsibleTypes;
    }
  }

  getTree() {
    const options = { optimize: true, collapsibleTypes: this.collapsibleTypes };
    const data = { stack: [], root: null, options };

    this.translate(data);

    delete data.stack;
    delete data.options;

    return data;
  }
}

export default CSTOptimizedTranslator;
