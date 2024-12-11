import * as Syntax from "@effect/parser/Syntax";
import * as Regex from "@effect/parser/Regex";
import { Array, Effect, Equal, Equivalence, Number, Option, pipe, Predicate, Record, Tuple } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { findAllIndexes, getXY } from "../../../utils/Array";

const newline = Syntax.char("\n");
const emptyChar = ".";
const antenna = Syntax.regexChar(pipe(Regex.anyAlphaNumeric, Regex.or(Regex.char("."))), new Error("Invalid antenna"));
export const grammer = pipe(antenna, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());
type Position = readonly [number, number];
const positionEq = Tuple.getEquivalence(Number.Equivalence, Number.Equivalence);
const positionTupleEq = ([lhs, rhs]: readonly [Position, Position]) => Tuple.getEquivalence(Number.Equivalence, Number.Equivalence)(lhs, rhs);

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      (map) => findAllIndexes(map)((s) => s !== emptyChar),
      Array.groupBy((pos) => Option.getOrThrow(getXY(pos)(parsed))),
      Record.toEntries,
      Array.flatMap(([_, antennas]) => pipe(
        antennas,
        Array.cartesian(antennas),
        Array.filter(Predicate.not(positionTupleEq)),
      )),
      Array.map(([lhs, rhs]) => [rhs[0] * 2 - lhs[0], rhs[1] * 2 - lhs[1]] as const),
      Array.filter(([x, y]) => x >= 0 && y >= 0 && x < parsed.length && y < parsed[0].length),
      Array.dedupeWith(positionEq),
      Array.length
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
