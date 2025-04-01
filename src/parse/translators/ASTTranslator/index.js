import CSTOptimizedTranslator from '../CSTOptimizedTranslator.js';
import { transformCSTtoAST, default as transformers } from './transformers.js';

class ASTTranslator extends CSTOptimizedTranslator {
  getTree() {
    const cst = super.getTree();
    return transformCSTtoAST(cst.root, transformers);
  }
}

export default ASTTranslator;
