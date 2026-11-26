// ES module consumer: resolved through the "import" export conditions
import { parse, evaluate, test, JSONPathError, JSONEvaluationRealm } from '@swaggerexpert/jsonpath';

const { tree } = parse('$.a[*]');
const valid: boolean = test('$.a');
const values: unknown[] = evaluate({ a: [1, 2] }, '$.a[*]', { realm: new JSONEvaluationRealm() });
const error: Error = new JSONPathError('message');

export { tree, valid, values, error };
