import * as Syntax from "@effect/parser/Syntax";
import { Array, Chunk, Effect, Either, flow, pipe, Predicate } from "effect";
import { aperture } from "../../../utils/Array.js";
import { integer } from "../../../utils/parser.js";

const newline = Syntax.char("\n");
const line = pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(" ")));
export const grammer = pipe(line, Syntax.repeatWithSeparator1(Syntax.char("\n")));

const increasing = ([x, y]: [number, number]) => x < y;
const decreasing = ([x, y]: [number, number]) => x > y;
const filterByPair = <T>(predicate: ([x, y]: [T, T]) => boolean) => (chunk: Chunk.NonEmptyChunk<T>) => pipe(chunk, Chunk.toArray, aperture(2), Array.filter(predicate), Chunk.unsafeFromArray);
export const isAlwaysIncreasing = (leniency: number) => flow(filterByPair<number>(Predicate.not(increasing)), Chunk.size, (x) => x <= leniency);
export const isAlwaysDecreasing = (leniency: number) => flow(filterByPair<number>(Predicate.not(decreasing)), Chunk.size, (x) => x <= leniency);
const diffAtLeastOneAtMostThree = flow(filterByPair<number>(Predicate.not(([x, y]) => Math.abs(y - x) >= 1 && Math.abs(y - x) <= 3)), Chunk.size, (x) => x === 0);

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      Syntax.parseString(grammer, input),
      Either.getOrThrow,
      Chunk.filter((report) => (isAlwaysIncreasing(0)(report) || isAlwaysDecreasing(0)(report)) && diffAtLeastOneAtMostThree(report)),
      Chunk.size
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      Syntax.parseString(grammer, input),
      Either.getOrThrow,
      Chunk.filter((report) => (isAlwaysIncreasing(1)(report) || isAlwaysDecreasing(1)(report)) && diffAtLeastOneAtMostThree(report)),
      Chunk.size
    );
  });
