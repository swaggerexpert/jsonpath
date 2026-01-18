import CSTTranslator from './CSTTranslator.js';

class CSTOptimizedTranslator extends CSTTranslator {
  collapsibleTypes = ['single-quoted', 'double-quoted', 'normal-single-quoted'];
  droppableTypes = ['text', 'segments', 'singular-query-segments'];

  constructor({ collapsibleTypes, droppableTypes } = {}) {
    super();

    if (Array.isArray(collapsibleTypes)) {
      this.collapsibleTypes = collapsibleTypes;
    }
    if (Array.isArray(droppableTypes)) {
      this.droppableTypes = droppableTypes;
    }
  }

  getTree() {
    const options = {
      optimize: true,
      collapsibleTypes: this.collapsibleTypes,
      droppableTypes: this.droppableTypes,
    };
    const data = { stack: [], root: null, options };

    this.translate(data);

    return data.root;
  }
}

export default CSTOptimizedTranslator;
