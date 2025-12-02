import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, pipe } from "effect";
import { integer, parseInput, toArray } from "../../../utils/parser";
import { euclideanDiv, euclideanMod } from "../../../utils/utils";

const newline = Syntax.char("\n");

const rotationsRule = pipe(Syntax.letter, Syntax.zip(integer), Syntax.transform(([l, x]) => l === 'L' ? -x : x, (x) => [x < 0 ? 'L' : 'R', Math.abs(x)] as const)); 
export const grammer = pipe(rotationsRule, Syntax.repeatWithSeparator1(newline), toArray());

const range = 100; // 0 - 99
const start = 50;


export const part1 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      Array.reduce([start], (acc, rotate) => [...acc, acc[acc.length - 1] + rotate]),
      Array.map(euclideanMod(range)),
      Array.countBy(x => x === 0),
    ) 
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      Array.reduce([start, 0], ([next, count], rotation) => [
          euclideanMod(range)(next + rotation),
          count + (Math.abs(euclideanDiv(next + rotation, range)) + (next !== 0 && (next + rotation) <= 0 ? 1 : 0))
        ]
      ),
      ([, count]) => count
    )
  });
