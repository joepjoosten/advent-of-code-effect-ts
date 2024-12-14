import * as Syntax from "@effect/parser/Syntax";
import { Array, Console, Effect, Number, Option, pipe, Tuple } from "effect";
import { parseInput, toArray, toInteger } from "../../../utils/parser";
import { findAllIndexes, getXY } from "../../../utils/Array";

const newline = Syntax.char("\n");
const height = pipe(Syntax.digit, toInteger);
export const grammer = pipe(height, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());

type Position = readonly [number, number];
type Map = Array<Array<number>>;
type Trail = Array<Position>;

const findTrailheads = (map: Map) => findAllIndexes(map)((s) => s === 0);

const up = ([x, y]: Position) => [x - 1, y] as const;
const down = ([x, y]: Position) => [x + 1, y] as const;
const left = ([x, y]: Position) => [x, y - 1] as const;
const right = ([x, y]: Position) => [x, y + 1] as const;

const positionEq = Tuple.getEquivalence(Number.Equivalence, Number.Equivalence);

const findTrail = (currentPos: Position, map: Map, trail: Trail = [], trails: Array<Option.Option<Trail>> = []):  Array<Option.Option<Trail>> => {
  const currentValue = Option.getOrThrow(getXY(currentPos)(map));
  if(currentValue === 9) {
    return [...trails, Option.some(trail)];
  }
  
  const nextValues = pipe(
    [up(currentPos), down(currentPos), left(currentPos), right(currentPos)],
    Array.filter(pos => Array.containsWith(positionEq)(pos)(trail) === false),
    (nextPositions) => Array.zip(nextPositions, pipe(nextPositions, Array.map(pos => getXY(pos)(map)))),
    Array.filter(([_, value]) => Option.isSome(value)),
    Array.filter(([_, value]) => Option.getOrThrow(value) === currentValue + 1),
  );
  if(Array.length(nextValues) > 0) {
    
  } else {
    return Option.none();
  }
}

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const map = parseInput(grammer, input);
    const trailHeads = findTrailheads(parsed);
    yield* Console.log(trailHeads);

    return 0;
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
