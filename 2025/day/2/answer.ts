import * as Syntax from "@effect/parser/Syntax";
import { Array, Chunk, Effect, pipe } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { sumArray } from "../../../utils/utils";

const rangeSeperator = Syntax.char("-");
const idSeperator = Syntax.char(",");
const charNumbers = Syntax.repeat(Syntax.charIn("0123456789"))

const id = pipe(charNumbers, Syntax.zip(rangeSeperator), Syntax.zip(charNumbers), Syntax.transform(
    ([[lhs, _], rhs]) => ({lhs: parseInt(Chunk.join(lhs, '')), rhs: parseInt(Chunk.join(rhs, ''))}), 
    ({lhs, rhs}) => ([[Chunk.of(lhs.toString(10)), void 0], Chunk.of(rhs.toString(10))] as const))
); 
export const grammer = pipe(id, Syntax.repeatWithSeparator1(idSeperator), toArray());

const isRepeated = (num: number) => {
  const s = num.toString(10)
  const len = s.length;
  return len % 2 === 0 && s.substring(0, len / 2) === s.substring(len / 2);
}

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      Array.map(({ lhs, rhs }) => Array.range(lhs, rhs)),
      Array.flatten,
      Array.filter(isRepeated),
      sumArray
    );
  });

const divisors = pipe(
  Array.range(2, 64),
  Array.map(x => pipe(Array.range(1, Math.floor(x / 2)), Array.filter(y => x % y === 0)))
)

const isRepeatedDivisors = (num: number) => {
  const s = num.toString(10);
  const len = s.length;
  if (len < 2) return false;
  return divisors[len - 2].some(divisor => {
    const repeated = pipe(Array.replicate(s.substring(0, divisor), len / divisor), Array.join(''));
    return s === repeated;
  });
}

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      Array.map(({ lhs, rhs }) => Array.range(lhs, rhs)),
      Array.flatten,
      Array.filter(isRepeatedDivisors),
      sumArray
    );
  });
