import * as Syntax from "@effect/parser/Syntax";
import { Effect, pipe, Array, Option, Console } from "effect";
import { integer, parseInput, toArray } from "../../../utils/parser";

export const grammer = pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(" ")), toArray());

type Stone = number;
type Stones = Array.NonEmptyArray<Stone>;

const sliceNumber = (x: number) => (start: number, end: number) => parseInt(x.toString(10).slice(start, end));

const rule1 = (x: number): Option.Option<Stones> => x === 0 ? Option.some([1]) : Option.none();
const rule2 = (x: number): Option.Option<Stones> => {
  const length = x.toString(10).length;
  return length % 2 === 0 
    ? Option.some([sliceNumber(x)(0, length / 2), sliceNumber(x)(length / 2, length)]) 
    : Option.none();
}
const rule3 = (x: number): Option.Option<Stones> => Option.some([x * 2024]);

const applyRules = (stones: Stones) => pipe(
  stones,
  Array.flatMap((x) => pipe(
    [rule1, rule2, rule3],
    Array.map((rule) => rule(x)),
    Array.findFirst(Option.isSome),
    Option.flatten,
    Option.getOrThrow,
  ))
)

export const part1 = (input: string) =>
  Effect.gen(function* () {
    let stones = parseInput(grammer, input);
    let blinks = 25;
    while (blinks > 0) {
      stones = applyRules(stones);
      blinks--;
    }
    return Array.length(stones);
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    let stones = parseInput(grammer, input);
    let blinks = 75;
    while (blinks > 0) {
      stones = applyRules(stones);
      yield* Console.log(`${75 - blinks + 1}: ${Array.length(stones)}`);
      blinks--;
    }
    return Array.length(stones);
  });
