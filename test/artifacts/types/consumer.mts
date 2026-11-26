// ES module consumer: resolved through the "import" export conditions
import { parse, evaluate, test, JSONPathError, JSONEvaluationRealm } from '@swaggerexpert/jsonpath';

const { tree } = parse('$.a[*]');
const valid: boolean = test('$.a');
const values: unknown[] = evaluate({ a: [1, 2] }, '$.a[*]', { realm: new JSONEvaluationRealm() });
const error: Error = new JSONPathError('message');

export { tree, valid, values, error };

// Grammar is constructed with new, as documented
import { Grammar } from '@swaggerexpert/jsonpath';

const grammar: Grammar = new Grammar();
const abnf: string = grammar.toString();

export { abnf };

// Trace is constructed with new, e.g. for apg-lite parser
import { Trace } from '@swaggerexpert/jsonpath';

const trace: Trace = new Trace();
const expectations: string[] = trace.inferExpectations();

export { expectations };
