const translateEvaluator = (ast, { result }) => {
  if (!result.success) return null;

  const parts = {};

  ast.translate(parts);

  return parts;
};

export default translateEvaluator;
