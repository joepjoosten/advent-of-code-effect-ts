import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, Number, Option, pipe, Tuple } from "effect";
import { findAllIndexes, getXY } from "../../../utils/Array";
import { parseInput, toArray, toInteger } from "../../../utils/parser";

const newline = Syntax.char("\n");
const height = pipe(Syntax.digit, toInteger);
export const grammer = pipe(height, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());

type Position = readonly [number, number];
type Map = Array<Array<number>>;
type Trail = Array.NonEmptyArray<Position>;

const directoins = ([x, y]: Position) =>
  [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ] as const;
const positionEq = Tuple.getEquivalence(Number.Equivalence, Number.Equivalence);
const positionTupleEq = Tuple.getEquivalence(positionEq, positionEq);

const findTrail = (currentPos: Position, map: Map, trail: Trail): Array<Trail> => {
  const currentValue = Option.getOrThrow(getXY(currentPos)(map));
  if (currentValue === 9) {
    return [trail];
  }

  const nextSteps = pipe(
    directoins(currentPos),
    Array.filter((pos) => Array.containsWith(positionEq)(pos)(trail) === false),
    (nextPositions) =>
      Array.zip(
        nextPositions,
        pipe(
          nextPositions,
          Array.map((pos) => getXY(pos)(map))
        )
      ),
    Array.filter(([_, value]) => Option.isSome(value)),
    Array.filter(([_, value]) => Option.getOrThrow(value) === currentValue + 1)
  );
  return Array.flatMap(nextSteps, ([pos]) => findTrail(pos, map, [...trail, pos]));
};

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const map = parseInput(grammer, input);
    return pipe(
      findAllIndexes(map)((s) => s === 0),
      Array.flatMap((head) => findTrail(head, map, [head])),
      Array.map((trail) => [Array.headNonEmpty(trail), Array.lastNonEmpty(trail)] as const),
      Array.dedupeWith(positionTupleEq),
      Array.length
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const map = parseInput(grammer, input);
    return pipe(
      findAllIndexes(map)((s) => s === 0),
      Array.flatMap((head) => findTrail(head, map, [head])),
      Array.map((trail) => [Array.headNonEmpty(trail), Array.lastNonEmpty(trail)] as const),
      Array.length
    );
  });
