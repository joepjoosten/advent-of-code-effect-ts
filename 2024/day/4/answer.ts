import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, pipe } from "effect";
import { getHorizontals, getVerticals, leftToRightDiagonals, rightToLeftDiagonals } from "../../../utils/Array";
import { parseInput, toArray } from "../../../utils/parser";
import { sumArray } from "../../../utils/utils";
import { indexesOf } from "../../../utils/String";

export const grammer = pipe(Syntax.charNotIn('\n'), Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(Syntax.char("\n")), toArray());

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      (xys) => [
        ...getHorizontals(xys),
        ...getVerticals(xys),
        ...leftToRightDiagonals(xys),
        ...rightToLeftDiagonals(xys),
      ],
      Array.map(xs => Array.join(xs, "")),
      Array.map(s => indexesOf("XMAS")(s).length + indexesOf("SAMX")(s).length),
      sumArray
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      (xys) => pipe(
        pipe(xys, Array.map((xs, i) => xs.map((_, j) => [i, j] as const))),
        (coords) => Array.zip([
        ...leftToRightDiagonals(xys),
        ...rightToLeftDiagonals(xys),
        ], [...leftToRightDiagonals(coords), ...rightToLeftDiagonals(coords)])
      ),
      Array.flatMap(([xs, coords]) => pipe(
        Array.join(xs, ""),
        s => [...indexesOf("MAS")(s).map((i) => coords[i + 1]), ...indexesOf("SAM")(s).map((i) => coords[i + 1])]
      )),
      (coords) => coords.length - Array.dedupe(coords).length
    )
  });
