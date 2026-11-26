import { Parser, Trace as BaseTrace, identifiers } from 'apg-lite';

import Expectations from './Expectations.js';

const terminalOperators = [identifiers.TLS, identifiers.TBS, identifiers.TRG];

/**
 * Character never matched by the JSONPath grammar. Appending it to the source makes the parser
 * attempt terminals at the end of the source, which it otherwise skips
 * (e.g. repetitions stop at the end of the source without trying their children).
 */
const SENTINEL = 0x00;

const recorders = new WeakMap();

/**
 * Printable ASCII characters are shown as they are, except for `"` and `\`, which would be
 * ambiguous in quoted expectations (see Expectations.toString). Other characters are shown
 * as `\xHH` (up to 0xFF) or `\u{H...}`.
 */
const describeCharacter = (code) => {
  if (code >= 0x21 && code <= 0x7e && code !== 0x22 && code !== 0x5c) {
    return String.fromCharCode(code);
  }
  if (code <= 0xff) return `\\x${code.toString(16).toUpperCase().padStart(2, '0')}`;
  return `\\u{${code.toString(16).toUpperCase()}}`;
};

const describeTerminal = (operator, matchedLength) => {
  if (operator.type === identifiers.TRG) {
    return `${describeCharacter(operator.min)}-${describeCharacter(operator.max)}`;
  }

  return operator.string.slice(matchedLength).map(describeCharacter).join('');
};

const toLowerCase = (code) => (code >= 0x41 && code <= 0x5a ? code + 0x20 : code);

/**
 * Length of the prefix of a literal string (case-insensitive) or binary string (case-sensitive)
 * matched at the offset, before the terminal failed.
 */
const matchedPrefixLength = (operator, chars, offset) => {
  if (operator.type === identifiers.TRG) return 0;

  const normalize = operator.type === identifiers.TLS ? toLowerCase : (code) => code;
  let length = 0;

  while (
    length < operator.string.length &&
    offset + length < chars.length &&
    normalize(chars[offset + length]) === operator.string[length]
  ) {
    length += 1;
  }

  return length;
};

/**
 * Records, in the shape of an apg-lite trace, what is needed to infer expectations:
 * the furthest offset any operator matched up to, terminals (literal strings, binary strings,
 * ranges) that failed to match from that offset on, and the result of the start rule.
 * Unlike apg-lite trace, it does not build the textual trace.
 */
const createRecorder = () => {
  const recorder = {
    rules: [],
    udts: [],
    chars: [],
    startRule: undefined,
    furthestMatchEnd: 0,
    failures: [],
    lastState: undefined,
    lastPhraseLength: 0,
    expectations: undefined,

    init(rules, udts, chars) {
      recorder.rules = rules;
      recorder.udts = udts;
      recorder.chars = chars;
      recorder.startRule = undefined;
      recorder.furthestMatchEnd = 0;
      recorder.failures = [];
      recorder.lastState = undefined;
      recorder.lastPhraseLength = 0;
      recorder.expectations = undefined;
    },

    down(operator) {
      // the first operator executed is the start rule
      if (recorder.startRule === undefined) {
        recorder.startRule = recorder.rules[operator.index].name;
      }
    },

    up(operator, state, offset, phraseLength) {
      if (state === identifiers.NOMATCH && terminalOperators.includes(operator.type)) {
        const matchedLength = matchedPrefixLength(operator, recorder.chars, offset);
        const failureOffset = offset + matchedLength;

        // failures before the furthest matched offset can never be reported
        if (failureOffset >= recorder.furthestMatchEnd) {
          recorder.failures.push({ operator, matchedLength, offset: failureOffset });
        }
      } else if (state === identifiers.MATCH) {
        recorder.furthestMatchEnd = Math.max(recorder.furthestMatchEnd, offset + phraseLength);
      }

      recorder.lastState = state;
      recorder.lastPhraseLength = phraseLength;
    },
  };

  return recorder;
};

const succeeded = (recorder) =>
  recorder.lastState !== undefined &&
  recorder.lastState !== identifiers.NOMATCH &&
  recorder.lastPhraseLength === recorder.chars.length;

const failuresAt = (recorder, offset) =>
  recorder.failures.filter((failure) => failure.offset === offset);

/**
 * Re-parses the source with the sentinel appended and returns terminals that failed
 * at the end of the source.
 */
const failuresAtEnd = (recorder) => {
  const { rules, udts, chars, startRule } = recorder;
  const sentinelRecorder = createRecorder();
  const parser = new Parser();
  let source = '';

  for (let i = 0; i < chars.length; i += 1) source += String.fromCodePoint(chars[i]);
  source += String.fromCodePoint(SENTINEL);

  parser.trace = sentinelRecorder;
  parser.parse({ rules, udts }, startRule, source);

  return failuresAt(sentinelRecorder, chars.length);
};

class Trace extends BaseTrace {
  constructor() {
    super();

    const recorder = createRecorder();
    const { init, down, up } = this;

    recorders.set(this, recorder);

    this.init = (rules, udts, chars) => {
      recorder.init(rules, udts, chars);
      init(rules, udts, chars);
    };
    this.down = (operator, offset) => {
      recorder.down(operator, offset);
      down(operator, offset);
    };
    this.up = (operator, state, offset, phraseLength) => {
      recorder.up(operator, state, offset, phraseLength);
      up(operator, state, offset, phraseLength);
    };
  }

  /**
   * Infers what the parser expected at the furthest offset it reached (the position of
   * the syntax error, `result.maxMatched`): terminals that failed to match at that offset,
   * including remainders of partially matched literals.
   *
   * Nothing is expected after a successful parse.
   */
  inferExpectations() {
    const recorder = recorders.get(this);

    if (recorder.expectations === undefined) {
      recorder.expectations = [];

      if (recorder.startRule !== undefined && !succeeded(recorder)) {
        const { furthestMatchEnd, chars } = recorder;
        let failures = failuresAt(recorder, furthestMatchEnd);

        // terminals at the end of the source may have been skipped
        if (furthestMatchEnd === chars.length) {
          try {
            failures = failuresAtEnd(recorder);
          } catch {
            // e.g. exceeded call stack; keep failures of the traced parsing
          }
        }

        recorder.expectations = Array.from(
          new Set(
            failures.map(({ operator, matchedLength }) =>
              describeTerminal(operator, matchedLength),
            ),
          ),
        );
      }
    }

    return Expectations.from(recorder.expectations);
  }
}

export default Trace;
