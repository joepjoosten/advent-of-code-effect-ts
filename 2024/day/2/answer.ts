import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, flow, pipe } from "effect";
import { aperture } from "../../../utils/Array.js";
import { integer, parseInput, toArray } from "../../../utils/parser.js";

const newline = Syntax.char("\n");
const line = pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(" ")), toArray());
export const grammer = pipe(line, Syntax.repeatWithSeparator1(Syntax.char("\n")), toArray());

const increasing = ([x, y]: [number, number]) => x < y;
const decreasing = ([x, y]: [number, number]) => x > y;
const skipLevel = (xs: Array<number>) => pipe(xs, Array.map((_, i) => [...xs.slice(0, i), ...xs.slice(i + 1)]));
const everyPair = <T>(predicate: ([x, y]: [T, T]) => boolean) => (xs: Array<T>) => pipe(xs, aperture(2), Array.every(predicate));
const isAlwaysIncreasing = flow(everyPair<number>(increasing));
const isAlwaysDecreasing = flow(everyPair<number>(decreasing));
const diffAtLeastOneAtMostThree = flow(everyPair<number>(([x, y]) => Math.abs(y - x) >= 1 && Math.abs(y - x) <= 3));

const valid = (xs: Array<number>) => (isAlwaysIncreasing(xs) || isAlwaysDecreasing(xs)) && diffAtLeastOneAtMostThree(xs);

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      Array.filter((report) => valid(report)),
      Array.length
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      Array.filter((report) => pipe([report, ...skipLevel(report)], Array.some((xs) => valid(xs)))),
      Array.length
    );
  });
