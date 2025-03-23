const translateEvaluator = (ast) => {
  const parts = {};

  ast.translate(parts);

  return parts;
};

export default translateEvaluator;
