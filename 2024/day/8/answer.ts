import * as Regex from "@effect/parser/Regex";
import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, Number, Option, pipe, Predicate, Record, Tuple } from "effect";
import { findAllIndexes, getXY, height, width } from "../../../utils/Array";
import { parseInput, toArray } from "../../../utils/parser";

const newline = Syntax.char("\n");
const emptyChar = ".";
const antinodeChar = "#";
const antenna = Syntax.regexChar(pipe(Regex.anyAlphaNumeric, Regex.or(Regex.char(emptyChar)), Regex.or(Regex.char(antinodeChar))), new Error("Invalid antenna"));
export const grammer = pipe(antenna, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());

type Position = readonly [number, number];
const positionEq = Tuple.getEquivalence(Number.Equivalence, Number.Equivalence);
const positionTupleEq = ([lhs, rhs]: readonly [Position, Position]) => Tuple.getEquivalence(Number.Equivalence, Number.Equivalence)(lhs, rhs);

const antennas = (map: Array<Array<string>>) => findAllIndexes(map)((s) => s !== emptyChar);
const antinodes = (times: number) => (map: Array<Array<string>>) => {
  return pipe(
    antennas(map),
    Array.groupBy((pos) => Option.getOrThrow(getXY(pos)(map))),
    Record.toEntries,
    Array.flatMap(([_, antennas]) => pipe(
      antennas,
      Array.cartesian(antennas),
      Array.filter(Predicate.not(positionTupleEq)),
    )),
    Array.flatMap(([lhs, rhs]) => pipe(Array.range(1, times), Array.map(i => [rhs[0] + (i * (rhs[0] - lhs[0])), rhs[1] + (i * (rhs[1] - lhs[1]))] as const))),
    Array.filter(([x, y]) => x >= 0 && y >= 0 && x < height(map) && y < width(map)),
    Array.dedupeWith(positionEq)
  )
} 

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      antinodes(1),
      Array.length
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const map = parseInput(grammer, input);
    return pipe(
      map,
      antinodes(Math.ceil(Math.sqrt(height(map) ** 2 + width(map) ** 2))),
      Array.appendAll(antennas(map)),
      Array.dedupeWith(positionEq),
      Array.length
    )
  });
